import { useState, useCallback } from 'react';
import { MOCK_HOME_STATS, MOCK_RECENT_REQUESTS } from '../data/mock-home-data';
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
  const [recentRequests] = useState<ServiceRequest[]>(MOCK_RECENT_REQUESTS);
  const [isLoading] = useState(false);

  // Replace this with real API calls when backend is ready
  const refetch = useCallback(async () => {
    // TODO: fetch stats and recent requests from API
  }, []);

  return { stats, recentRequests, isLoading, refetch };
};
