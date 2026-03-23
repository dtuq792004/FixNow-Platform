import apiClient from '~/lib/api-client';
import type { ProviderJob, ProviderJobDetail, ProviderJobStatus } from '../types/job.types';

// ── Backend response shape ────────────────────────────────────────────────────
interface BackendJobItem {
  _id: string;
  customerId: { _id: string; fullName: string; avatar?: string; phone?: string } | null;
  categoryId: { _id: string; name: string; type?: string } | null;
  addressId: {
    addressLine?: string;
    ward?: string;
    district?: string;
    city?: string;
  } | null;
  addressText?: string;
  title?: string;
  description?: string;
  note?: string;
  requestType: 'NORMAL' | 'URGENT' | 'RECURRING';
  totalPrice: number;
  finalPrice: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
  providerCompletedAt?: string;
  completionNote?: string;
}

interface JobListResponse {
  data: BackendJobItem[];
}

interface JobDetailResponse {
  data: BackendJobItem;
}

// Backend status → frontend ProviderJobStatus
// ACCEPTED in DB = ASSIGNED from provider's POV
const STATUS_MAP: Record<string, ProviderJobStatus> = {
  PENDING: 'PENDING',
  ACCEPTED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

const mapJob = (item: BackendJobItem): ProviderJob => {
  const addressLine = item.addressId?.addressLine ?? item.addressText ?? '';
  const district = item.addressId?.district
    ? `${item.addressId.district}${item.addressId.city ? `, ${item.addressId.city}` : ''}`
    : '';

  return {
    id: item._id,
    customerName: item.customerId?.fullName ?? 'N/A',
    customerAvatar: item.customerId?.avatar,
    serviceCategory: item.categoryId?.type ?? 'other',
    serviceName: item.categoryId?.name ?? item.title ?? 'Yêu cầu dịch vụ',
    description: item.description ?? '',
    address: addressLine,
    district,
    status: STATUS_MAP[item.status] ?? 'PENDING',
    requestType: item.requestType === 'URGENT' ? 'URGENT' : 'NORMAL',
    estimatedPrice: item.finalPrice || item.totalPrice || undefined,
    createdAt: item.createdAt,
    completedAt: item.providerCompletedAt,
  };
};

const mapJobDetail = (item: BackendJobItem): ProviderJobDetail => ({
  ...mapJob(item),
  customerPhone: item.customerId?.phone,
  note: item.note,
  completionNote: item.completionNote,
});

// ── API calls ─────────────────────────────────────────────────────────────────

/** GET /requests/provider — PENDING jobs available for any provider to accept */
export const getAvailableJobsApi = async (): Promise<ProviderJob[]> => {
  const { data } = await apiClient.get<JobListResponse>('/requests/provider');
  return (data.data ?? []).map(mapJob);
};

/** GET /requests/provider/my-jobs — jobs already assigned to this provider */
export const getMyProviderJobsApi = async (): Promise<ProviderJob[]> => {
  const { data } = await apiClient.get<JobListResponse>('/requests/provider/my-jobs');
  return (data.data ?? []).map(mapJob);
};

/** GET /requests/provider/:id — single job detail */
export const getJobDetailApi = async (id: string): Promise<ProviderJobDetail> => {
  const { data } = await apiClient.get<JobDetailResponse>(`/requests/provider/${id}`);
  return mapJobDetail(data.data);
};

/** PATCH /requests/:id/respond { action: "ACCEPT" } */
export const acceptJobApi = async (id: string): Promise<void> => {
  await apiClient.patch(`/requests/${id}/respond`, { action: 'ACCEPT' });
};

/** PATCH /requests/:id/respond { action: "REJECT" } */
export const declineJobApi = async (id: string): Promise<void> => {
  await apiClient.patch(`/requests/${id}/respond`, { action: 'REJECT' });
};

/** PATCH /requests/:id/start */
export const startJobApi = async (id: string): Promise<void> => {
  await apiClient.patch(`/requests/${id}/start`);
};

/** PATCH /requests/:id/complete — optional completion note from provider */
export const completeJobApi = async (id: string, note?: string): Promise<void> => {
  await apiClient.patch(`/requests/${id}/complete`, {
    completionMedia: [],
    ...(note ? { completionNote: note } : {}),
  });
};
