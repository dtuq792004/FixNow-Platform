// Enums and constants for notes domain

export enum NoteCategory {
  GENERAL = 'general',
  WORK = 'work', 
  PERSONAL = 'personal',
  IDEAS = 'ideas',
  STUDY = 'study',
  TRAVEL = 'travel',
  RECIPES = 'recipes',
  HEALTH = 'health',
}

export enum NoteSortOrder {
  CREATED_ASC = 'created_asc',
  CREATED_DESC = 'created_desc',
  UPDATED_ASC = 'updated_asc', 
  UPDATED_DESC = 'updated_desc',
  TITLE_ASC = 'title_asc',
  TITLE_DESC = 'title_desc',
}

// Constants
export const NOTE_LIMITS = {
  TITLE_MAX_LENGTH: 100,
  CONTENT_MAX_LENGTH: 10000,
  TAGS_MAX_COUNT: 10,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

export const DEFAULT_NOTE_COLOR = '#ffffff';
export const DEFAULT_CATEGORY = NoteCategory.GENERAL;