export type BookCategory = 'tajweed' | 'aqeedah' | 'hadith' | 'grammar' | string;
export type BookLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert' | string;

/**
 * Metadata associated with a book, including category and difficulty level.
 */
export interface BookMetadata {
  category: BookCategory;
  level?: BookLevel;
  [key: string]: any;
}

/**
 * Represents a book in the library.
 */
export interface Book {
  id: string;
  title: string;
  original_author: string;
  description: string;
  cover_image_url: string;
  metadata: BookMetadata;
  is_public: boolean;
  created_at: string;
  version: number;
  resource_count?: number;
  title_ar?: string;
  author_ar?: string;
}

/**
 * Represents a content node within a book (e.g., chapter, section, verse).
 */
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

/**
 * Represents an external resource linked to a book.
 */
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
  children?: Resource[];
  book_title?: string
}

/**
 * Payload for creating a new resource.
 */
export interface CreateResourcePayload {
  title: string;
  type: ResourceType;
  book_id: string;
  is_official: boolean;
  url?: string;
  children?: { title: string; url: string }[];
}

/**
 * Represents a user's note or reflection on a book.
 */
export interface Note {
  id: string;
  book_id: string;
  user_id: string;
  title: string;
  description: string;
  content: any;
  is_published?: boolean;
  updated_at: string;
}

/**
 * Represents a public reflection visible in the community feed.
 */
export interface PublicReflection {
  id: string;
  title: string;
  description: string;
  author_name: string;
  created_at: string;
}

/**
 * Represents a reflection in the global feed.
 */
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

/**
 * Represents a learning roadmap or curriculum.
 */
export interface Roadmap {
  id: string;
  title: string;
  slug: string;
  description: string;
  cover_image_url?: string;
  is_public: boolean;
  created_at: string;
  nodes: RoadmapNode[];
  nodes_count?: number;
}

/**
 * Represents a node (book) within a roadmap.
 */
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
  description: string;
  status: "completed" | "active" | "locked";
  sequence: number;
}

/**
 * Represents a user in the system.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

/**
 * Data structure for the admin dashboard.
 */
export interface AdminDashboardData {
  stats: {
    total_books: number;
    total_resources: number;
    total_students: number;
    books_this_week: number;
    resources_this_week: number;
    students_growth_pct: number;
  };
  recent_resources: Resource[];
  recent_users: User[];
}

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * Book structure used for AI processing (Gemini).
 */
export interface GeminiBook {
  id: string;
  title_en: string;
  title_ar?: string;
  nodes: {
    id: string;
    content_text: string;
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

/**
 * Statistics for a student's activity.
 */
export interface StudentStats {
  total_minutes: number;
  current_streak: number;
  books_opened: number;
  activity_chart: DailyActivity[];
  last_book_opened?: Book;
  last_book_progress?: BookProgress;
  longest_streak: number;
  total_xp: number;
  current_level: number;
  next_level_progress: number; // 0-100
}

export interface Discussion {
  id: string;
  user_id: string;
  user_name: string;
  user_role?: string; // 'admin' | 'student'
  context_type: string;
  context_id: string;
  title?: string;
  body: string;
  reply_count: number;
  last_reply_at: string;
  created_at: string;
}

export interface Reply {
  id: string;
  discussion_id: string;
  user_id: string;
  user_name: string;
  user_role?: string;
  body: string;
  created_at: string;
}

export interface CreateDiscussionPayload {
  context_type: "roadmap" | "book" | "node";
  context_id: string;
  title?: string;
  body: string;
}

export interface CreateReplyPayload {
  discussion_id: string;
  body: string;
}