import { useCallback, useState, useEffect } from "react";
import apiClient from "~/lib/api-client";
import type {
  ProviderJob,
  ProviderJobStatus,
} from "~/features/provider/data/mock-provider-jobs";

export type JobFilter = "available" | "active" | "completed";
export type JobCounts = Record<JobFilter, number>;

// Map backend status to filter
const FILTER_STATUSES: Record<JobFilter, string[]> = {
  available: ["PENDING"],
  active: ["ACCEPTED", "IN_PROGRESS"],
  completed: ["COMPLETED", "CANCELLED"],
};

export function useProviderJobs() {
  const [jobs, setJobs] = useState<ProviderJob[]>([]);
  const [filter, setFilter] = useState<JobFilter>("available");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch jobs from API
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get("/requests/provider");
      const jobs = response.data?.data || [];
      setJobs(jobs);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || err.message || "Failed to load jobs";
      setError(errorMsg);
      console.error("❌ fetchJobs error:", errorMsg, err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load jobs on mount
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const filtered = jobs.filter((j) =>
    FILTER_STATUSES[filter].includes(j.status),
  );

  const counts: JobCounts = {
    available: jobs.filter((j) => FILTER_STATUSES.available.includes(j.status))
      .length,
    active: jobs.filter((j) => FILTER_STATUSES.active.includes(j.status))
      .length,
    completed: jobs.filter((j) => FILTER_STATUSES.completed.includes(j.status))
      .length,
  };

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchJobs();
    } finally {
      setRefreshing(false);
    }
  }, [fetchJobs]);

  const respondJob = useCallback(
    async (id: string, action: "ACCEPT" | "REJECT") => {
      try {
        setError(null);
        const response = await apiClient.patch(`/requests/${id}/respond`, {
          action,
        });
        // Update local list
        await fetchJobs();
      } catch (err: any) {
        console.error(`❌ respondJob error:`, err);
        const errorMsg =
          err.response?.data?.message || "Failed to respond to job";
        setError(errorMsg);
        throw err;
      }
    },
    [fetchJobs],
  );

  const startJob = useCallback(
    async (id: string) => {
      try {
        setError(null);
        await apiClient.patch(`/requests/${id}/start`);
        await fetchJobs();
      } catch (err: any) {
        const errorMsg = err.response?.data?.message || "Failed to start job";
        setError(errorMsg);
        throw err;
      }
    },
    [fetchJobs],
  );

  const completeJob = useCallback(
    async (id: string, completionMedia?: string[], completionNote?: string) => {
      try {
        setError(null);
        await apiClient.patch(`/requests/${id}/complete`, {
          completionMedia: completionMedia || [],
          completionNote: completionNote || "",
        });
        await fetchJobs();
      } catch (err: any) {
        const errorMsg =
          err.response?.data?.message || "Failed to complete job";
        setError(errorMsg);
        throw err;
      }
    },
    [fetchJobs],
  );

  const acceptJob = useCallback(
    (id: string) => respondJob(id, "ACCEPT"),
    [respondJob],
  );
  const declineJob = useCallback(
    (id: string) => respondJob(id, "REJECT"),
    [respondJob],
  );

  const getById = useCallback(
    (id: string) => jobs.find((j) => j._id === id || j.id === id),
    [jobs],
  );

  return {
    jobs,
    filtered,
    filter,
    setFilter,
    counts,
    refreshing,
    loading,
    error,
    refresh,
    acceptJob,
    declineJob,
    startJob,
    completeJob,
    getById,
  };
}
