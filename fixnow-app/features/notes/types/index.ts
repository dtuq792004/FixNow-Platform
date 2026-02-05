// Centralized exports for notes types
export * from './entities';
export * from './dtos';
export * from './enums';

// Legacy aliases for backward compatibility
export type { 
  CreateNoteDto as CreateNoteData,
  UpdateNoteDto as UpdateNoteData,
  NoteFiltersDto as NoteFilters
} from './dtos';