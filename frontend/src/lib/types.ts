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