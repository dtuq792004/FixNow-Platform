import { useCallback, useEffect, useMemo, useState } from "react";
import {
  cancelRequestApi,
  fetchMyRequestsApi,
} from "../services/request.service";
import {
  ACTIVE_STATUSES,
  type RequestFilterOption,
  type ServiceRequestDetail,
} from "../types";

export const useRequestsList = () => {
  const [requests, setRequests] = useState<ServiceRequestDetail[]>([]);
  const [filter, setFilter] = useState<RequestFilterOption>("all");
  const [refreshing, setRefreshing] = useState(false);

  const loadRequests = useCallback(async () => {
    const data = await fetchMyRequestsApi();
    setRequests(data);
  }, []);

  useEffect(() => {
    loadRequests().catch(() => {
      setRequests([]);
    });
  }, [loadRequests]);

  const filtered = useMemo(() => {
    switch (filter) {
      case "active":
        return requests.filter((r) => ACTIVE_STATUSES.includes(r.status));
      case "completed":
        return requests.filter((r) => r.status === "completed");
      case "cancelled":
        return requests.filter((r) => r.status === "cancelled");
      default:
        return requests;
    }
  }, [filter, requests]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadRequests();
    } finally {
      setRefreshing(false);
    }
  };

  const cancelRequest = useCallback(async (id: string) => {
    const updated = await cancelRequestApi(id);
    setRequests((prev) =>
      prev.map((request) => (request.id === id ? updated : request)),
    );
    return updated;
  }, []);

  const activeCount = useMemo(
    () => requests.filter((r) => ACTIVE_STATUSES.includes(r.status)).length,
    [requests],
  );

  const completedCount = useMemo(
    () => requests.filter((r) => r.status === "completed").length,
    [requests],
  );

  const cancelledCount = useMemo(
    () => requests.filter((r) => r.status === "cancelled").length,
    [requests],
  );

  const counts = useMemo(
    () => ({
      all: requests.length,
      active: activeCount,
      completed: completedCount,
      cancelled: cancelledCount,
    }),
    [requests.length, activeCount, completedCount, cancelledCount],
  );

  return {
    filter,
    setFilter,
    filtered,
    refreshing,
    onRefresh,
    counts,
    loadRequests,
    cancelRequest,
  };
};
