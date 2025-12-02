export type BookCategory = 'tajweed' | 'aqeedah' | 'hadith' | 'grammar' | string;
export type BookLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert' | string;

export interface BookMetadata {
  category: BookCategory;
  level?: BookLevel;
  // Add future metadata fields here (e.g., "translator", "page_count")
  [key: string]: any;
}

export interface Book {
  id: string;
  title: string;
  original_author: string;
  description: string;
  cover_image_url: string;

  // We strictly type this now instead of 'any'
  metadata: BookMetadata;

  is_public: boolean;
  created_at: string; // ISO Date string coming from Go
  version: number;
  resource_count?: number; // Added
}

// Optional: Type for the Tree Nodes (Chapters/Verses) if you need it again
export interface ContentNode {
  id: string;
  book_id: string;
  parent_id: string | null;
  node_type: 'chapter' | 'section' | 'bayt';
  content_text: string;
  sequence_index: number;
  version: number;
}
export type ResourceType = 'pdf' | 'youtube_video' | 'audio' | 'web_link' | 'playlist';

export interface Resource {
  id: string;
  book_id: string;
  type: ResourceType;
  title: string;
  url: string;
  is_official: boolean;
  media_start_seconds?: number;
  media_end_seconds?: number;
  parent_id: string | null;
  sequence_index: number;
  children?: Resource[]; // We will add this manually in the frontend
  book_title?: string
}

export interface CreateResourcePayload {
  title: string;
  type: ResourceType;
  book_id: string;
  is_official: boolean;
  url?: string;
  children?: { title: string; url: string }[];
}

export interface Note {
  id: string;
  book_id: string;
  user_id: string;
  title: string;
  description: string;
  content: any; // JSON object from Tiptap
  is_published?: boolean;
  updated_at: string;
}

export interface PublicReflection {
  id: string;
  title: string;
  description: string; // The short subtitle
  author_name: string;
  created_at: string;
}

export interface GlobalReflection {
  id: string;
  title: string;
  description: string;
  author_name: string;
  book_title: string;
  book_id: string;
  created_at: string;
  content?: any;
}

export interface BookmarkResponse {
  bookmarked: boolean;
}

export interface Roadmap {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image_url?: string;
  is_public: boolean;
  created_at: string;
  nodes: RoadmapNode[];
  // Optional: count of nodes if your backend sends it
  nodes_count?: number;
}

export interface RoadmapNode {
  id: string;
  roadmap_id: string;
  book_id: string;
  book_title: string;
  book_author: string;
  book_cover: string;
  sequence_index: number;
  level: string;
  description?: string;
  user_status?: string;
}

export interface RoadmapNodeInput {
  book_id: string;
  level: string;
  sequence_index: number;
  description?: string;
}

export interface StudentNode {
  id: string;
  bookId: string;
  title: string;
  author: string;
  level: string;
  description: string; // Specific instruction for this step
  status: "completed" | "active" | "locked";
  sequence: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface AdminDashboardData {
  stats: {
    total_books: number;
    total_resources: number;
    total_students: number;
  };
  recent_resources: Resource[];
  recent_users: User[];
}

// ... existing types ...

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

// Ensure your Book type supports the nodes structure needed for the prompt
export interface GeminiBook {
  id: string;
  title_en: string;
  title_ar?: string;
  // The AI needs the raw text to check against
  nodes: {
    id: string;
    content_text: string; // This is the Arabic text
    sequence_index: number;
  }[];
}

export interface DailyActivity {
  date: string;
  minutes: number;
}

export interface BookProgress {
  current_page: number;
  total_pages: number;
  percentage: number;
}

export interface StudentStats {
  total_minutes: number;
  current_streak: number;
  books_opened: number;
  activity_chart: DailyActivity[];
  last_book_opened?: Book;
  last_book_progress?: BookProgress;
}