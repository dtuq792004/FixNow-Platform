export type ServiceCategoryType =
  | "electrical"
  | "plumbing"
  | "hvac"
  | "appliance"
  | "security"
  | "painting"
  | "other";

export type RequestStatus =
  | "pending"
  | "assigned"
  | "in_progress"
  | "completed"
  | "cancelled";

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
  type: ServiceCategoryType;
  label: string;
  icon: string;
  bgClass: string;
  iconColor: string;
}
