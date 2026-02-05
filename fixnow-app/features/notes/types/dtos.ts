// Data Transfer Objects - for API operations

// Create operations
export interface CreateNoteDto {
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  is_favorite?: boolean;
  color?: string;
}

// Update operations  
export interface UpdateNoteDto {
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
  is_favorite?: boolean;
  color?: string;
}

// Query operations
export interface NoteFiltersDto {
  search?: string;
  category?: string;
  tags?: string[];
  is_favorite?: boolean;
  limit?: number;
  offset?: number;
}

// Response DTOs
export interface NoteResponseDto {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  is_favorite: boolean;
  color: string;
  created_at: string;
  updated_at: string;
}