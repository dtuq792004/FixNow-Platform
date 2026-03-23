import { useCallback, useEffect, useState } from 'react';
import type { ProviderJobDetail } from '../types/job.types';
import {
  getJobDetailApi,
  acceptJobApi,
  declineJobApi,
  startJobApi,
  completeJobApi,
} from '../services/job.service';

export function useProviderJobDetail(id: string) {
  const [job, setJob] = useState<ProviderJobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJob = useCallback(async () => {
    try {
      setError(null);
      const data = await getJobDetailApi(id);
      setJob(data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err?.message ?? 'Không thể tải công việc');
    }
  }, [id]);

  useEffect(() => {
    fetchJob().finally(() => setLoading(false));
  }, [fetchJob]);

  const refetch = useCallback(async () => {
    setLoading(true);
    await fetchJob();
    setLoading(false);
  }, [fetchJob]);

  // Wrap each mutation: set actionLoading, call API, then refresh detail
  const withAction = useCallback(
    async (fn: () => Promise<void>) => {
      setActionLoading(true);
      try {
        await fn();
        await fetchJob();
      } finally {
        setActionLoading(false);
      }
    },
    [fetchJob],
  );

  const accept = useCallback(() => withAction(() => acceptJobApi(id)), [id, withAction]);
  const decline = useCallback(() => withAction(() => declineJobApi(id)), [id, withAction]);
  const start = useCallback(() => withAction(() => startJobApi(id)), [id, withAction]);
  const complete = useCallback(
    (note?: string) => withAction(() => completeJobApi(id, note)),
    [id, withAction],
  );

  return { job, loading, actionLoading, error, refetch, accept, decline, start, complete };
}
