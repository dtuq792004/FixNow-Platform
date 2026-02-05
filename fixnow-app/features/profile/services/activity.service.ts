// import { supabase } from '~/lib/supabase';
import type { ApiListResponse } from "~/types/api";
import type { Activity, CreateActivityDto } from "../types";

/**
 * ActivityService - Supabase has been removed
 * TODO: Implement your own backend API calls for each method below
 */
export class ActivityService {
  private static tableName = "activities";

  // Get recent activities for the current user
  static async getRecentActivities(
    limit: number = 10,
  ): Promise<ApiListResponse<Activity>> {
    try {
      // TODO: Implement your own API call here
      console.warn(
        "getRecentActivities: Supabase has been removed. Implement your own backend.",
      );
      return { data: [], error: "Backend not implemented" };
    } catch (error) {
      console.error("Get activities error:", error);
      return { data: [], error: "Failed to fetch activities" };
    }
  }

  // Create a new activity
  static async createActivity(data: CreateActivityDto): Promise<void> {
    try {
      // TODO: Implement your own API call here
      console.warn(
        "createActivity: Supabase has been removed. Implement your own backend.",
      );
    } catch (error) {
      console.error("Create activity error:", error);
    }
  }
}
