import type { ServiceCategoryType, RequestStatus } from '~/features/home/types';

export type { ServiceCategoryType, RequestStatus };

export interface CreateRequestFormData {
  category: ServiceCategoryType;
  title: string;
  description: string;
  address: string;
  note?: string;
}

export type CreateRequestStep = 1 | 2 | 3;

export interface CreateRequestResponse {
  id: string;
  status: RequestStatus;
  created_at: string;
}

// ── Request Detail ────────────────────────────────────────────────────────────

export interface RequestTimelineEvent {
  status: RequestStatus | 'created';
  label: string;
  description: string;
  timestamp: string | null; // null = not yet reached
  isReached: boolean;
}

export interface ServiceRequestDetail {
  id: string;
  title: string;
  description: string;
  category: ServiceCategoryType;
  status: RequestStatus;
  address: string;
  note?: string;
  created_at: string;
  updated_at?: string;
  provider?: {
    id: string;
    name: string;
    avatar?: string;
    rating?: number;
    phone?: string;
  };
}

// ── Filter ────────────────────────────────────────────────────────────────────

export type RequestFilterOption = 'all' | 'active' | 'completed' | 'cancelled';

export const FILTER_LABELS: Record<RequestFilterOption, string> = {
  all: 'Tất cả',
  active: 'Đang xử lý',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

export const ACTIVE_STATUSES: RequestStatus[] = ['pending', 'assigned', 'in_progress'];
