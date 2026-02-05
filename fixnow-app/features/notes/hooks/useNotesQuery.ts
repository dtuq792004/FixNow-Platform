import { useQuery } from '@tanstack/react-query';
import { NotesService } from '../services/notes.service';
import type { NoteFilters } from '../types';

const NOTES_QUERY_KEY = 'notes';

export function useNotesQuery(filters: NoteFilters = {}) {
  return useQuery({
    queryKey: [NOTES_QUERY_KEY, filters],
    queryFn: () => NotesService.getNotes(filters),
    select: (data) => data.data || [],
    staleTime: 30000, // 30 seconds
  });
}

export function useNoteQuery(id: string) {
  return useQuery({
    queryKey: [NOTES_QUERY_KEY, id],
    queryFn: () => NotesService.getNoteById(id),
    select: (data) => data.data,
    enabled: !!id,
  });
}