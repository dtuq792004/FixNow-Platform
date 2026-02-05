// Database entities - exact representation of database tables
export interface NoteEntity {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  is_favorite: boolean;
  color: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

// Domain model - what we use in the application (can be different from DB)
export interface Note extends NoteEntity {
  // Add computed properties or transformed data here if needed
  // e.g., formattedDate?: string;
  // e.g., isRecent?: boolean;
}