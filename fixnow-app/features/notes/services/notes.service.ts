// import { supabase } from '~/lib/supabase';
import type { ApiListResponse, ApiResponse } from "~/types/api";
import type {
  CreateNoteDto,
  Note,
  NoteFiltersDto,
  UpdateNoteDto,
} from "../types";

/**
 * NotesService - Supabase has been removed
 * TODO: Implement your own backend API calls for each method below
 */
export class NotesService {
  private static tableName = "notes";

  // Create a new note
  static async createNote(data: CreateNoteDto): Promise<ApiResponse<Note>> {
    try {
      // TODO: Implement your own API call here
      console.warn(
        "createNote: Supabase has been removed. Implement your own backend.",
      );
      return { data: null, error: "Backend not implemented" };
    } catch (error) {
      console.error("Create note error:", error);
      return { data: null, error: "Failed to create note" };
    }
  }

  // Get all notes for the current user
  static async getNotes(
    filters: NoteFiltersDto = {},
  ): Promise<ApiListResponse<Note>> {
    try {
      // TODO: Implement your own API call here
      console.warn(
        "getNotes: Supabase has been removed. Implement your own backend.",
      );
      return { data: [], error: "Backend not implemented" };
    } catch (error) {
      console.error("Get notes error:", error);
      return { data: [], error: "Failed to fetch notes" };
    }
  }

  // Get a single note by ID
  static async getNoteById(id: string): Promise<ApiResponse<Note>> {
    try {
      // TODO: Implement your own API call here
      console.warn(
        "getNoteById: Supabase has been removed. Implement your own backend.",
      );
      return { data: null, error: "Backend not implemented" };
    } catch (error) {
      console.error("Get note error:", error);
      return { data: null, error: "Failed to fetch note" };
    }
  }

  // Update a note
  static async updateNote(
    id: string,
    data: UpdateNoteDto,
  ): Promise<ApiResponse<Note>> {
    try {
      // TODO: Implement your own API call here
      console.warn(
        "updateNote: Supabase has been removed. Implement your own backend.",
      );
      return { data: null, error: "Backend not implemented" };
    } catch (error) {
      console.error("Update note error:", error);
      return { data: null, error: "Failed to update note" };
    }
  }

  // Delete a note
  static async deleteNote(id: string): Promise<ApiResponse<boolean>> {
    try {
      // TODO: Implement your own API call here
      console.warn(
        "deleteNote: Supabase has been removed. Implement your own backend.",
      );
      return { data: null, error: "Backend not implemented" };
    } catch (error) {
      console.error("Delete note error:", error);
      return { data: null, error: "Failed to delete note" };
    }
  }

  // Get notes count for pagination
  static async getNotesCount(search?: string): Promise<ApiResponse<number>> {
    try {
      // TODO: Implement your own API call here
      console.warn(
        "getNotesCount: Supabase has been removed. Implement your own backend.",
      );
      return { data: null, error: "Backend not implemented" };
    } catch (error) {
      console.error("Get notes count error:", error);
      return { data: null, error: "Failed to get notes count" };
    }
  }

  // Get user statistics
  static async getUserStats(): Promise<
    ApiResponse<{
      notes_count: number;
      favorite_notes_count: number;
      categories: string[];
      recent_activities_count: number;
    }>
  > {
    try {
      // TODO: Implement your own API call here
      console.warn(
        "getUserStats: Supabase has been removed. Implement your own backend.",
      );
      return { data: null, error: "Backend not implemented" };
    } catch (error) {
      console.error("Get user stats error:", error);
      return { data: null, error: "Failed to get user statistics" };
    }
  }
}
