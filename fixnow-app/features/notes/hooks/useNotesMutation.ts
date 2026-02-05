import { useMutation, useQueryClient } from '@tanstack/react-query';
import { NotesService } from '../services/notes.service';
import type { CreateNoteData } from '../types';

const NOTES_QUERY_KEY = 'notes';

export function useCreateNoteMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateNoteData) => 
      NotesService.createNote(data),
    onSuccess: () => {
      // Invalidate and refetch notes
      queryClient.invalidateQueries({ queryKey: [NOTES_QUERY_KEY] });
    },
  });
}

export function useUpdateNoteMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      NotesService.updateNote(id, data),
    
    // Optimistic update
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [NOTES_QUERY_KEY] });
      
      // Snapshot the previous values
      const previousNotes = queryClient.getQueriesData({ queryKey: [NOTES_QUERY_KEY] });
      
      // Optimistically update the cache
      queryClient.setQueriesData({ queryKey: [NOTES_QUERY_KEY] }, (old: any) => {
        if (!old?.data) return old;
        
        return {
          ...old,
          data: old.data.map((note: any) => 
            note.id === id 
              ? { ...note, ...data, updated_at: new Date().toISOString() }
              : note
          )
        };
      });
      
      // Return a context with the previous and new data
      return { previousNotes, id, data };
    },
    
    onError: (_, __, context) => {
      // Revert the optimistic update on error
      if (context?.previousNotes) {
        context.previousNotes.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: [NOTES_QUERY_KEY] });
    },
  });
}


export function useDeleteNoteMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => NotesService.deleteNote(id),
    onSuccess: (_, id) => {
      // Remove the note from cache
      queryClient.removeQueries({ queryKey: [NOTES_QUERY_KEY, id] });
      // Invalidate notes list to refetch
      queryClient.invalidateQueries({ queryKey: [NOTES_QUERY_KEY] });
    },
  });
}