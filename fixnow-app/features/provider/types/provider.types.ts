export interface ProviderStatus {
  id: string;
  userId: string;
  activeStatus: 'ONLINE' | 'OFFLINE';
  workingAreas: string[];
}

export interface ProviderStats {
  totalJobs: number;
  completedJobs: number;
  pendingJobs: number;
  earnings: number;
}

export interface ProviderJob {
  id: string;
  requestId: string;
  customerName: string;
  serviceName: string;
  status: 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  address: string;
  scheduledDate: string;
  price: number;
}