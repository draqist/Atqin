package main

import (
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/draqist/iqraa/backend/internal/auth"
	"github.com/draqist/iqraa/backend/internal/data"
	"github.com/gorilla/websocket"
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 512
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	// Create a custom CheckOrigin function to allow cross-origin requests
	CheckOrigin: func(r *http.Request) bool {
		return true // In production, replace this with a proper check!
	},
}

// Client is a middleman between the websocket connection and the hub.
type Client struct {
	hub *Hub

	// The websocket connection.
	conn *websocket.Conn

	// Buffered channel of outbound messages.
	send chan []byte

	// The specific chat room (discussion ID) this client belongs to
	roomID string
	
	// User info
	userID   string
	userName string
	userRole string
}

// Hub maintains the set of active clients and broadcasts messages to the
// clients.
type Hub struct {
	// Registered clients.
	clients map[*Client]bool

	// Inbound messages from the clients.
	broadcast chan *data.Reply

	// Register requests from the clients.
	register chan *Client

	// Unregister requests from clients.
	unregister chan *Client
	
	app *application
	
	// Rooms maps roomID -> Set of Clients
	rooms map[string]map[*Client]bool
	
	mu sync.RWMutex
}

func newHub(app *application) *Hub {
	return &Hub{
		broadcast:  make(chan *data.Reply),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[*Client]bool),
		rooms:      make(map[string]map[*Client]bool),
		app:        app,
	}
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			if _, ok := h.rooms[client.roomID]; !ok {
				h.rooms[client.roomID] = make(map[*Client]bool)
			}
			h.rooms[client.roomID][client] = true
			h.mu.Unlock()

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
				
				if room, ok := h.rooms[client.roomID]; ok {
					delete(room, client)
					if len(room) == 0 {
						delete(h.rooms, client.roomID)
					}
				}
			}
			h.mu.Unlock()

		case reply := <-h.broadcast:
			h.mu.RLock()
			// Broadcast only to clients in the same room
			if room, ok := h.rooms[reply.DiscussionID]; ok {
				for client := range room {
					select {
					case client.send <- []byte(reply.Body): // Ideally send JSON Structure
						// TODO: Send full payload
						// For now we just signal strict update
					default:
						close(client.send)
						delete(h.clients, client)
						delete(room, client)
					}
				}
			}
			h.mu.RUnlock()
		}
	}
}

// serveWs handles websocket requests from the peer.
func (app *application) serveWs(hub *Hub, w http.ResponseWriter, r *http.Request) {
	// 1. Authentication (WebSockets cannot set headers easily, so we use Query Params)
	token := r.URL.Query().Get("token")
	if token == "" {
		// Fallback to Header if present (e.g. from non-browser clients)
		authHeader := r.Header.Get("Authorization")
		if strings.HasPrefix(authHeader, "Bearer ") {
			token = strings.TrimPrefix(authHeader, "Bearer ")
		}
	}

	if token == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	claims, err := auth.ValidateToken(token)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// 2. Fetch User Details
	user, err := app.models.Users.GetByID(claims.UserID)
	if err != nil {
		http.Error(w, "User not found", http.StatusUnauthorized)
		return
	}

	// 3. Upgrade Connection
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}
	
	roomID := r.PathValue("id")
	if roomID == "" {
		log.Println("No room ID provided")
		conn.Close()
		return
	}

	client := &Client{
		hub:      hub,
		conn:     conn,
		send:     make(chan []byte, 256),
		roomID:   roomID,
		userID:   user.ID,
		userName: user.Name,
		userRole: user.Role,
	}
	
	client.hub.register <- client

	// Allow collection of memory referenced by the caller by doing all work in
	// new goroutines.
	go client.writePump()
	go client.readPump()
}

// readPump pumps messages from the websocket connection to the hub.
//
// The application runs readPump in a per-connection goroutine. The application
// ensures that there is at most one reader on a connection by executing all
// reads from this goroutine.
func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()
	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error { c.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}
		
		// Handle Incoming Message
		// 1. Save to DB
		reply := &data.Reply{
			DiscussionID: c.roomID,
			UserID:       c.userID,
			Body:         string(message),
		}
		
		err = c.hub.app.models.Community.CreateReply(reply)
		if err != nil {
			log.Printf("Failed to save message: %v", err)
			continue
		}
		
		// 2. Broadcast to Hub (Room)
		// Ideally we broadcast the FULL `reply` object with created_at, user details etc. 
		// But channels pass references.
		// For MVP, let's just trigger a "fetch" signal or send the raw body. 
		// Actually, let's just broadcast this newly created Reply object.
		
		// This part needs the Hub to handle *data.Reply broadcast, which I updated in `Hub` struct.
		c.hub.broadcast <- reply
	}
}

// writePump pumps messages from the hub to the websocket connection.
func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()
	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The hub closed the channel.
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Add queued chat messages to the current websocket message.
			n := len(c.send)
			for i := 0; i < n; i++ {
				w.Write(<-c.send)
			}

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
