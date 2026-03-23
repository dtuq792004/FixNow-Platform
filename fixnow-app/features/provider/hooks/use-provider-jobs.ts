import { useCallback, useEffect, useState } from 'react';
import type { ProviderJob, ProviderJobStatus } from '../types/job.types';
import {
  getAvailableJobsApi,
  getMyProviderJobsApi,
  acceptJobApi,
  declineJobApi,
  startJobApi,
  completeJobApi,
} from '../services/job.service';

export type JobFilter = 'available' | 'active' | 'completed';
export type JobCounts = Record<JobFilter, number>;

const FILTER_STATUSES: Record<JobFilter, ProviderJobStatus[]> = {
  available: ['PENDING'],
  active: ['ASSIGNED', 'IN_PROGRESS'],
  completed: ['COMPLETED', 'CANCELLED'],
};

export function useProviderJobs() {
  const [jobs, setJobs] = useState<ProviderJob[]>([]);
  const [filter, setFilter] = useState<JobFilter>('available');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch available (PENDING) + my assigned/active/completed jobs in parallel
  const fetchJobs = useCallback(async () => {
    try {
      const [available, myJobs] = await Promise.all([
        getAvailableJobsApi(),
        getMyProviderJobsApi(),
      ]);
      setJobs([...available, ...myJobs]);
    } catch (err) {
      console.error('Failed to fetch provider jobs:', err);
    }
  }, []);

  useEffect(() => {
    fetchJobs().finally(() => setLoading(false));
  }, [fetchJobs]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchJobs();
    setRefreshing(false);
  }, [fetchJobs]);

  const filtered = jobs.filter((j) => FILTER_STATUSES[filter].includes(j.status));

  const counts: JobCounts = {
    available: jobs.filter((j) => FILTER_STATUSES.available.includes(j.status)).length,
    active: jobs.filter((j) => FILTER_STATUSES.active.includes(j.status)).length,
    completed: jobs.filter((j) => FILTER_STATUSES.completed.includes(j.status)).length,
  };

  // After each mutation, refresh from server so local state stays in sync
  const acceptJob = useCallback(async (id: string) => {
    await acceptJobApi(id);
    await fetchJobs();
  }, [fetchJobs]);

  const declineJob = useCallback(async (id: string) => {
    await declineJobApi(id);
    await fetchJobs();
  }, [fetchJobs]);

  const startJob = useCallback(async (id: string) => {
    await startJobApi(id);
    await fetchJobs();
  }, [fetchJobs]);

  const completeJob = useCallback(async (id: string) => {
    await completeJobApi(id);
    await fetchJobs();
  }, [fetchJobs]);

  const getById = useCallback((id: string) => jobs.find((j) => j.id === id), [jobs]);

  return {
    jobs,
    filtered,
    filter,
    setFilter,
    counts,
    loading,
    refreshing,
    refresh,
    acceptJob,
    declineJob,
    startJob,
    completeJob,
    getById,
  };
}
