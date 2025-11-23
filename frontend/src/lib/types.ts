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
}