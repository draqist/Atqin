# Backend API Documentation

Base URL: `/v1`

## Authentication

### Register User

Create a new user account.

- **URL**: `/users/register`
- **Method**: `POST`
- **Auth Required**: No

**Request Body**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secretpassword"
}
```

**Response Body**

```json
{
  "token": "eyJhbGciOiJIUzI1Ni...",
  "user_id": "uuid-string",
  "name": "John Doe"
}
```

### Login User

Authenticate an existing user and receive a JWT token.

- **URL**: `/users/login`
- **Method**: `POST`
- **Auth Required**: No

**Request Body**

```json
{
  "email": "john@example.com",
  "password": "secretpassword"
}
```

**Response Body**

```json
{
  "token": "eyJhbGciOiJIUzI1Ni...",
  "user_id": "uuid-string",
  "name": "John Doe",
  "role": "user"
}
```

### Get Current User

Get details of the currently authenticated user.

- **URL**: `/users/me`
- **Method**: `GET`
- **Auth Required**: Yes

**Response Body**

```json
{
  "id": "uuid-string",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "created_at": "2023-10-27T10:00:00Z"
}
```

---

## Books

### List Books

Get a list of all books in the library.

- **URL**: `/books`
- **Method**: `GET`
- **Auth Required**: No

**Response Body**

```json
[
  {
    "id": "uuid-string",
    "title": "Book Title",
    "original_author": "Author Name",
    "description": "Book description...",
    "cover_image_url": "https://example.com/image.jpg",
    "metadata": {},
    "is_public": true,
    "created_at": "2023-10-27T10:00:00Z",
    "version": 1
  }
]
```

### Get Book

Get details of a specific book.

- **URL**: `/books/{id}`
- **Method**: `GET`
- **Auth Required**: No

**Response Body**

```json
{
  "id": "uuid-string",
  "title": "Book Title",
  "original_author": "Author Name",
  "description": "Book description...",
  "cover_image_url": "https://example.com/image.jpg",
  "metadata": {},
  "is_public": true,
  "created_at": "2023-10-27T10:00:00Z",
  "version": 1
}
```

### Create Book

Create a new book (Admin only).

- **URL**: `/books`
- **Method**: `POST`
- **Auth Required**: Yes (Admin)

**Request Body**

```json
{
  "title": "New Book",
  "original_author": "Author Name",
  "description": "Description...",
  "cover_image_url": "https://example.com/cover.jpg"
}
```

**Response Body**
Returns the created Book object.

### Update Book

Update an existing book (Admin only).

- **URL**: `/books/{id}`
- **Method**: `PUT`
- **Auth Required**: Yes (Admin)

**Request Body** (Partial updates allowed)

```json
{
  "title": "Updated Title",
  "description": "Updated description..."
}
```

**Response Body**
Returns the updated Book object.

### Delete Book

Delete a book (Admin only).

- **URL**: `/books/{id}`
- **Method**: `DELETE`
- **Auth Required**: Yes (Admin)

**Response Body**

```json
{
  "message": "book deleted successfully"
}
```

---

## Book Nodes (Chapters/Verses)

### List Book Nodes

Get the content tree (chapters, verses) for a book.

- **URL**: `/books/{id}/nodes`
- **Method**: `GET`
- **Auth Required**: No

**Response Body**

```json
[
  {
    "id": "uuid-string",
    "book_id": "uuid-string",
    "parent_id": "uuid-string-or-null",
    "node_type": "chapter",
    "content_text": "Chapter Title or Content",
    "sequence_index": 1,
    "version": 1
  }
]
```

### Create Node

Add a chapter or verse to a book.

- **URL**: `/books/{id}/nodes`
- **Method**: `POST`
- **Auth Required**: No (Should be protected in future)

**Request Body**

```json
{
  "parent_id": "uuid-string-or-null",
  "node_type": "chapter",
  "content_text": "Chapter 1",
  "sequence_index": 1
}
```

**Response Body**
Returns the created Node object.

---

## Notes

### Get Draft Note

Get the authenticated user's draft note for a specific book.

- **URL**: `/books/{id}/note`
- **Method**: `GET`
- **Auth Required**: Yes

**Response Body**
Returns the Note object or `null` if no draft exists.

```json
{
  "id": "uuid-string",
  "book_id": "uuid-string",
  "user_id": "uuid-string",
  "title": "My Note",
  "content": {},
  "description": "Note description",
  "is_published": false,
  "created_at": "...",
  "updated_at": "..."
}
```

### Save Draft Note

Create or update the user's draft note for a book.

- **URL**: `/books/{id}/note`
- **Method**: `PUT`
- **Auth Required**: Yes

**Request Body**

```json
{
  "id": "optional-uuid",
  "title": "My Note",
  "description": "Description",
  "content": {},
  "is_published": false
}
```

**Response Body**
Returns the saved Note object.

### List Public Notes (Book)

Get published community notes for a specific book.

- **URL**: `/books/{id}/notes/public`
- **Method**: `GET`
- **Auth Required**: No

**Response Body**

```json
[
  {
    "id": "uuid-string",
    "title": "Community Note",
    "description": "Description...",
    "author_name": "Jane Doe",
    "created_at": "..."
  }
]
```

### Global Feed

Get all published notes across the platform.

- **URL**: `/notes/public`
- **Method**: `GET`
- **Auth Required**: No
- **Query Params**:
  - `category`: Filter by book category
  - `q`: Search term (Book title or Author name)

**Response Body**

```json
[
  {
    "id": "uuid-string",
    "title": "Note Title",
    "description": "...",
    "author_name": "Jane Doe",
    "book_title": "Book Title",
    "book_id": "uuid-string",
    "created_at": "..."
  }
]
```

### Get Public Note

Get a specific published note.

- **URL**: `/notes/public/{id}`
- **Method**: `GET`
- **Auth Required**: No

**Response Body**
Returns the GlobalNote object including content.

---

## Resources

### List Book Resources

Get resources (videos, playlists) for a specific book.

- **URL**: `/books/{id}/resources`
- **Method**: `GET`
- **Auth Required**: No

**Response Body**

```json
[
  {
    "id": "uuid-string",
    "type": "youtube_video",
    "title": "Lesson 1",
    "url": "https://youtube.com/...",
    "is_official": true,
    "sequence_index": 1,
    "parent_id": "uuid-or-null"
  }
]
```

### Get Resource

Get a single resource.

- **URL**: `/resources/{id}`
- **Method**: `GET`
- **Auth Required**: Yes (Auth wrapper exists, but logic might allow public)

**Response Body**
Returns the Resource object.

### List All Resources (Admin)

Get all resources for admin management.

- **URL**: `/resources`
- **Method**: `GET`
- **Auth Required**: Yes (Admin)

**Response Body**
List of resources with `book_title`.

### Create Resource (Admin)

Create a new resource or playlist.

- **URL**: `/resources`
- **Method**: `POST`
- **Auth Required**: Yes (Admin)

**Request Body**

```json
{
  "book_id": "uuid",
  "type": "playlist",
  "title": "Series 1",
  "url": "...",
  "is_official": true,
  "children": [{ "title": "Ep 1", "url": "..." }]
}
```

### Update Resource (Admin)

Update a resource.

- **URL**: `/resources/{id}`
- **Method**: `PUT`
- **Auth Required**: Yes (Admin)

### Delete Resource (Admin)

Delete a resource.

- **URL**: `/resources/{id}`
- **Method**: `DELETE`
- **Auth Required**: Yes (Admin)

---

## Roadmaps

### List Roadmaps

Get all public roadmaps.

- **URL**: `/roadmaps`
- **Method**: `GET`
- **Auth Required**: No

**Response Body**

```json
[
  {
    "id": "uuid",
    "title": "Islamic Studies Path",
    "slug": "islamic-studies",
    "description": "...",
    "cover_image_url": "..."
  }
]
```

### Get Roadmap

Get a roadmap by slug, including nodes and user progress.

- **URL**: `/roadmaps/{slug}`
- **Method**: `GET`
- **Auth Required**: Optional (If Auth header present, returns user progress)

**Response Body**

```json
{
  "id": "uuid",
  "title": "...",
  "nodes": [
    {
      "id": "uuid",
      "book_title": "Book Name",
      "user_status": "completed" // or "not_started", "in_progress"
    }
  ]
}
```

### Update Progress

Update user progress for a roadmap node.

- **URL**: `/roadmaps/nodes/{node_id}/progress`
- **Method**: `POST`
- **Auth Required**: Yes

**Request Body**

```json
{
  "status": "completed"
}
```

---

## Bookmarks

### List Bookmarks

Get the authenticated user's bookmarked books.

- **URL**: `/bookmarks`
- **Method**: `GET`
- **Auth Required**: Yes

**Response Body**
Returns a list of Book objects.

### Toggle Bookmark

Add or remove a book from bookmarks.

- **URL**: `/books/{id}/bookmark`
- **Method**: `POST`
- **Auth Required**: Yes

**Response Body**

```json
{
  "bookmarked": true
}
```

---

## Uploads

### Generate Upload URL

Generate a signed URL for uploading files to storage (Admin only).

- **URL**: `/uploads/sign`
- **Method**: `POST`
- **Auth Required**: Yes (Admin)

**Request Body**

```json
{
  "filename": "image.jpg",
  "type": "image/jpeg"
}
```

**Response Body**

```json
{
  "signed_url": "https://...",
  "public_url": "https://...",
  "path": "uploads/..."
}
```

---

## System

### Health Check

Check if the API is running.

- **URL**: `/health`
- **Method**: `GET`
- **Auth Required**: No

**Response Body**

```json
{
  "status": "available",
  "system_info": {
    "environment": "development",
    "version": "1.0.0"
  }
}
```
