import { useCallback, useEffect, useMemo, useState } from 'react';
import { getMyRequestsApi } from '../services/request.service';
import { ACTIVE_STATUSES, type RequestFilterOption, type ServiceRequestDetail } from '../types';

export const useRequestsList = () => {
  const [requests, setRequests] = useState<ServiceRequestDetail[]>([]);
  const [filter, setFilter] = useState<RequestFilterOption>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    try {
      setError(null);
      const data = await getMyRequestsApi();
      setRequests(data);
    } catch (err: any) {
      setError(err?.message ?? 'Không thể tải danh sách yêu cầu');
    }
  }, []);

  useEffect(() => {
    fetchRequests().finally(() => setLoading(false));
  }, [fetchRequests]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRequests();
    setRefreshing(false);
  }, [fetchRequests]);

  const filtered = useMemo(() => {
    switch (filter) {
      case 'active':
        return requests.filter((r) => ACTIVE_STATUSES.includes(r.status));
      case 'completed':
        return requests.filter((r) => r.status === 'completed');
      case 'cancelled':
        return requests.filter((r) => r.status === 'cancelled');
      default:
        return requests;
    }
  }, [filter, requests]);

  const counts = useMemo(
    () => ({
      all: requests.length,
      active: requests.filter((r) => ACTIVE_STATUSES.includes(r.status)).length,
      completed: requests.filter((r) => r.status === 'completed').length,
      cancelled: requests.filter((r) => r.status === 'cancelled').length,
    }),
    [requests],
  );

  return { filter, setFilter, filtered, refreshing, onRefresh, counts, loading, error };
};
