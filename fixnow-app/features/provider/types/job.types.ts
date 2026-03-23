export type ProviderJobStatus =
  | 'PENDING'     // available — not yet claimed
  | 'ASSIGNED'    // accepted by this provider (backend: ACCEPTED)
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type ProviderJob = {
  id: string;
  customerName: string;
  customerAvatar?: string;
  serviceCategory: string;   // category type slug: 'plumbing' | 'electrical' | ...
  serviceName: string;       // category display name or request title
  description: string;
  address: string;
  district: string;
  status: ProviderJobStatus;
  requestType: 'NORMAL' | 'URGENT';
  estimatedPrice?: number;
  createdAt: string;
  scheduledAt?: string;
  completedAt?: string;
};

/** Extended type for the detail screen — includes fields only needed on detail view */
export interface ProviderJobDetail extends ProviderJob {
  customerPhone?: string;
  note?: string;           // customer note on the request
  completionNote?: string; // provider note when completing
}
