import { useCallback, useState } from 'react';
import { MOCK_PROVIDER_JOBS, type ProviderJob, type ProviderJobStatus } from '~/features/provider/data/mock-provider-jobs';

export type JobFilter = 'available' | 'active' | 'completed';
export type JobCounts = Record<JobFilter, number>;

const FILTER_STATUSES: Record<JobFilter, ProviderJobStatus[]> = {
  available: ['PENDING'],
  active: ['ASSIGNED', 'IN_PROGRESS'],
  completed: ['COMPLETED', 'CANCELLED'],
};

// Module-level mock store — persists across renders
let _jobs: ProviderJob[] = [...MOCK_PROVIDER_JOBS];

export function useProviderJobs() {
  const [jobs, setJobs] = useState<ProviderJob[]>(_jobs);
  const [filter, setFilter] = useState<JobFilter>('available');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = jobs.filter((j) => FILTER_STATUSES[filter].includes(j.status));

  const counts: Record<JobFilter, number> = {
    available: jobs.filter((j) => FILTER_STATUSES.available.includes(j.status)).length,
    active: jobs.filter((j) => FILTER_STATUSES.active.includes(j.status)).length,
    completed: jobs.filter((j) => FILTER_STATUSES.completed.includes(j.status)).length,
  };

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  }, []);

  const updateStatus = useCallback((id: string, status: ProviderJobStatus) => {
    _jobs = _jobs.map((j) => (j.id === id ? { ...j, status } : j));
    setJobs([..._jobs]);
  }, []);

  const acceptJob = useCallback((id: string) => updateStatus(id, 'ASSIGNED'), [updateStatus]);
  const declineJob = useCallback((id: string) => updateStatus(id, 'CANCELLED'), [updateStatus]);
  const startJob = useCallback((id: string) => updateStatus(id, 'IN_PROGRESS'), [updateStatus]);
  const completeJob = useCallback((id: string) => updateStatus(id, 'COMPLETED'), [updateStatus]);

  const getById = useCallback((id: string) => jobs.find((j) => j.id === id), [jobs]);

  return {
    jobs,
    filtered,
    filter,
    setFilter,
    counts,
    refreshing,
    refresh,
    acceptJob,
    declineJob,
    startJob,
    completeJob,
    getById,
  };
}
