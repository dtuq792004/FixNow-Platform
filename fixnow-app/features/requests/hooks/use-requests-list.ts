import { useMemo, useState } from 'react';
import { MOCK_ALL_REQUESTS } from '../data/mock-requests-data';
import { ACTIVE_STATUSES, type RequestFilterOption } from '../types';

export const useRequestsList = () => {
  const [filter, setFilter] = useState<RequestFilterOption>('all');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = useMemo(() => {
    switch (filter) {
      case 'active':
        return MOCK_ALL_REQUESTS.filter((r) => ACTIVE_STATUSES.includes(r.status));
      case 'completed':
        return MOCK_ALL_REQUESTS.filter((r) => r.status === 'completed');
      case 'cancelled':
        return MOCK_ALL_REQUESTS.filter((r) => r.status === 'cancelled');
      default:
        return MOCK_ALL_REQUESTS;
    }
  }, [filter]);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: call real API
    await new Promise((r) => setTimeout(r, 800));
    setRefreshing(false);
  };

  const counts = useMemo(
    () => ({
      all: MOCK_ALL_REQUESTS.length,
      active: MOCK_ALL_REQUESTS.filter((r) => ACTIVE_STATUSES.includes(r.status)).length,
      completed: MOCK_ALL_REQUESTS.filter((r) => r.status === 'completed').length,
      cancelled: MOCK_ALL_REQUESTS.filter((r) => r.status === 'cancelled').length,
    }),
    []
  );

  return { filter, setFilter, filtered, refreshing, onRefresh, counts };
};
