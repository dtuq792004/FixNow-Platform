import { useCallback, useEffect, useMemo, useState } from 'react';
import { getRequestByIdApi } from '../services/request.service';
import type { RequestStatus, RequestTimelineEvent, ServiceRequestDetail } from '../types';

const TIMELINE_STEPS: { status: RequestStatus | 'created'; label: string; description: string }[] =
  [
    { status: 'created', label: 'Tiếp nhận yêu cầu', description: 'Hệ thống đã ghi nhận yêu cầu' },
    { status: 'assigned', label: 'Đã giao thợ', description: 'Thợ đang trên đường đến' },
    { status: 'in_progress', label: 'Đang thực hiện', description: 'Thợ đang xử lý công việc' },
    { status: 'completed', label: 'Hoàn thành', description: 'Công việc đã hoàn tất' },
  ];

const STATUS_ORDER: Record<string, number> = {
  created: 0,
  pending: 0,
  assigned: 1,
  in_progress: 2,
  completed: 3,
  cancelled: -1,
};

const buildTimeline = (request: ServiceRequestDetail): RequestTimelineEvent[] => {
  const currentOrder = STATUS_ORDER[request.status] ?? 0;

  return TIMELINE_STEPS.map((step, index) => {
    const isReached = index <= currentOrder;
    let timestamp: string | null = null;

    if (isReached) {
      if (index === 0) {
        timestamp = request.created_at;
      } else if (index === TIMELINE_STEPS.length - 1 && request.updated_at) {
        timestamp = request.updated_at;
      } else if (request.updated_at) {
        const created = new Date(request.created_at).getTime();
        const updated = new Date(request.updated_at).getTime();
        const ratio = index / (TIMELINE_STEPS.length - 1);
        timestamp = new Date(created + (updated - created) * ratio).toISOString();
      } else {
        timestamp = request.created_at;
      }
    }

    return { ...step, timestamp, isReached };
  });
};

interface UseRequestDetailReturn {
  request: ServiceRequestDetail | null;
  timeline: RequestTimelineEvent[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useRequestDetail = (id: string): UseRequestDetailReturn => {
  const [request, setRequest] = useState<ServiceRequestDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await getRequestByIdApi(id);
      setRequest(data);
    } catch (err: any) {
      setError(err?.message ?? 'Không thể tải chi tiết yêu cầu');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const timeline = useMemo(
    () => (request ? buildTimeline(request) : []),
    [request],
  );

  return { request, timeline, isLoading, error, refetch: fetchData };
};
