import { useMemo } from 'react';
import { useMyRequests } from '~/features/requests/hooks/use-my-requests';
import { ACTIVE_STATUSES } from '~/features/requests/types';
import type { ServiceRequestDetail } from '~/features/requests/types';
import type { HomeStats } from '../types';

interface UseHomeDataReturn {
  stats: HomeStats;
  recentRequests: ServiceRequestDetail[];
  isLoading: boolean;
  refetch: () => void;
}

export const useHomeData = (): UseHomeDataReturn => {
  const { requests, isLoading, refetch } = useMyRequests();

  const stats = useMemo<HomeStats>(
    () => ({
      active:    requests.filter((r) => ACTIVE_STATUSES.includes(r.status)).length,
      completed: requests.filter((r) => r.status === 'completed').length,
      total:     requests.length,
    }),
    [requests],
  );

  // 3 most recent — API already returns sorted desc, but slice for safety
  const recentRequests = useMemo(
    () =>
      [...requests]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3),
    [requests],
  );

  return { stats, recentRequests, isLoading, refetch };
};
