import { useCallback, useEffect, useMemo, useState } from 'react';
import { getMyRequestsApi } from '~/features/requests/services/request.service';
import type { ServiceRequestDetail } from '~/features/requests/types';
import type { HomeStats } from '../types';

interface UseHomeDataReturn {
  stats: HomeStats;
  recentRequests: ServiceRequestDetail[];
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export const useHomeData = (): UseHomeDataReturn => {
  const [requests, setRequests] = useState<ServiceRequestDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getMyRequestsApi();
      setRequests(data);
    } catch {
      // silent — home screen shows empty state on failure
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derive stats from real data
  const stats = useMemo<HomeStats>(
    () => ({
      pending: requests.filter((r) => r.status === 'pending').length,
      in_progress: requests.filter((r) => r.status === 'in_progress').length,
      completed: requests.filter((r) => r.status === 'completed').length,
      total: requests.length,
    }),
    [requests],
  );

  // 3 most recent by created_at
  const recentRequests = useMemo(
    () =>
      [...requests]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3),
    [requests],
  );

  return { stats, recentRequests, isLoading, refetch: fetchData };
};
