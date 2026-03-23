export type ServiceCategoryType =
  | 'electrical'
  | 'plumbing'
  | 'hvac'
  | 'appliance'
  | 'security'
  | 'painting'
  | 'other';

export type RequestStatus =
  | 'pending'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface RequestProvider {
  id: string;
  name: string;
  avatar?: string;
  rating?: number;
}

export interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  category: ServiceCategoryType;
  status: RequestStatus;
  address?: string;
  created_at: string;
  updated_at?: string;
  provider?: RequestProvider;
}

export interface HomeStats {
  pending: number;
  in_progress: number;
  completed: number;
  total: number;
}

export interface ServiceCategoryConfig {
  _id: string;       // MongoDB ObjectId từ DB (dùng khi tạo request)
  type: ServiceCategoryType;
  label: string;
  description: string;
  icon: string;
  bgClass: string;
  iconColor: string;
}
