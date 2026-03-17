import { useState, useCallback, useMemo } from 'react';
import { MOCK_HOME_STATS } from '../data/mock-home-data';
import { MOCK_ALL_REQUESTS } from '~/features/requests/data/mock-requests-data';
import type { HomeStats, ServiceRequest } from '../types';

interface UseHomeDataReturn {
  stats: HomeStats;
  recentRequests: ServiceRequest[];
  isLoading: boolean;
  refetch: () => Promise<void>;
}

/**
 * Provides home screen data.
 * Currently returns mock data — swap `fetchStats` / `fetchRecentRequests`
 * with real API calls once the backend is ready.
 */
export const useHomeData = (): UseHomeDataReturn => {
  const [stats] = useState<HomeStats>(MOCK_HOME_STATS);
  const [isLoading] = useState(false);

  // Pull from the single source of truth so IDs match the detail page
  const recentRequests = useMemo<ServiceRequest[]>(
    () =>
      [...MOCK_ALL_REQUESTS]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3) as ServiceRequest[],
    []
  );

  // Replace this with real API calls when backend is ready
  const refetch = useCallback(async () => {
    // TODO: fetch stats and recent requests from API
  }, []);

  return { stats, recentRequests, isLoading, refetch };
};
