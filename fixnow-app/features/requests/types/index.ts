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
