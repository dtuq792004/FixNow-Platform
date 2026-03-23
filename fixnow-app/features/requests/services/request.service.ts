import apiClient from '~/lib/api-client';
import { SERVICE_CATEGORIES, OTHER_CATEGORY, getCategoryById } from '~/features/home/data/service-categories';
import type { RequestStatus, ServiceCategoryType } from '~/features/home/types';
import type { CreateRequestResponse, ServiceRequestDetail } from '../types';
import type { CreateRequestSchema } from '../validations/create-request.schema';

// ── Status mapper: backend UPPERCASE → frontend lowercase ─────────────────────
const BACKEND_TO_FRONTEND_STATUS: Record<string, RequestStatus> = {
  AWAITING_PAYMENT: 'pending',
  PENDING: 'pending',
  ACCEPTED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

const mapStatus = (s: string): RequestStatus =>
  BACKEND_TO_FRONTEND_STATUS[s] ?? 'pending';

// ── Category resolver ─────────────────────────────────────────────────────────
const ALL_CATEGORIES = [...SERVICE_CATEGORIES, OTHER_CATEGORY];

const getCategoryId = (type: ServiceCategoryType): string =>
  ALL_CATEGORIES.find((c) => c.type === type)?._id ?? '';

// ── Backend response shape ────────────────────────────────────────────────────
interface BackendRequest {
  _id: string;
  title?: string;
  description?: string;
  note?: string;
  addressText?: string;
  status: string;
  requestType: string;
  categoryId?: { _id: string; name: string } | null;
  providerId?: { _id: string; fullName: string; avatar?: string; phone?: string } | null;
  createdAt: string;
  updatedAt?: string;
}

const mapToServiceRequestDetail = (r: BackendRequest): ServiceRequestDetail => {
  const categoryConfig = r.categoryId ? getCategoryById(r.categoryId._id) : undefined;
  const category: ServiceCategoryType = categoryConfig?.type ?? 'other';

  return {
    id: r._id,
    title: r.title ?? '',
    description: r.description ?? '',
    category,
    status: mapStatus(r.status),
    address: r.addressText ?? '',
    note: r.note,
    created_at: r.createdAt,
    updated_at: r.updatedAt,
    provider: r.providerId
      ? {
          id: r.providerId._id,
          name: r.providerId.fullName,
          avatar: r.providerId.avatar,
          phone: r.providerId.phone,
        }
      : undefined,
  };
};

// ── API calls ─────────────────────────────────────────────────────────────────

/** POST /requests — submit a new service request */
export const createRequestApi = async (
  data: CreateRequestSchema,
): Promise<CreateRequestResponse> => {
  const dto = {
    categoryId: getCategoryId(data.category),
    title: data.title,
    description: data.description,
    addressText: data.address,
    addressId: data.addressId || undefined,
    note: data.note || undefined,
  };

  const { data: res } = await apiClient.post<{
    message: string;
    data: BackendRequest;
    checkoutUrl?: string;
  }>('/requests', dto);

  return {
    id: res.data._id,
    status: mapStatus(res.data.status),
    created_at: res.data.createdAt,
    checkoutUrl: res.checkoutUrl,
  };
};

/** GET /requests/customer — get all requests for current customer */
export const getMyRequestsApi = async (): Promise<ServiceRequestDetail[]> => {
  const { data: res } = await apiClient.get<{ data: BackendRequest[] }>('/requests/customer');
  return res.data.map(mapToServiceRequestDetail);
};

/** GET /requests/:id — get single request detail */
export const getRequestByIdApi = async (id: string): Promise<ServiceRequestDetail> => {
  const { data: res } = await apiClient.get<{ data: BackendRequest }>(`/requests/${id}`);
  return mapToServiceRequestDetail(res.data);
};

/** PATCH /requests/:id/cancel — cancel a pending request */
export const cancelRequestApi = async (id: string): Promise<void> => {
  await apiClient.patch(`/requests/${id}/cancel`);
};
