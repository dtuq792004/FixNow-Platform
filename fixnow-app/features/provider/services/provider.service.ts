import apiClient from '~/lib/api-client';
import type { ProviderStatus } from '~/features/provider/types/provider.types';
import type { ProviderApplication } from '../types';
import type { RegisterProviderFormData } from '../validations/schemas';

// ── Backend response shape ────────────────────────────────────────────────────
interface ProviderStatusApiResponse {
  success: boolean;
  data: {
    _id: string;
    userId: string;
    activeStatus: 'ONLINE' | 'OFFLINE';
    workingAreas: string[];
    createdAt: string;
    updatedAt: string;
  };
  message: string;
}

interface ProviderApplicationApiResponse {
  success: boolean;
  data: {
    _id: string;
    userId: string;
    fullName: string;
    phone: string;
    experience: string;
    serviceCategories: string[];
    serviceArea: string;
    idCard: string;
    motivation?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    reviewedBy?: string;
    reviewedAt?: string;
    rejectionReason?: string;
    createdAt: string;
    updatedAt: string;
  };
  message: string;
}

// ── Mapper ────────────────────────────────────────────────────────────────────
const mapProviderStatus = (raw: ProviderStatusApiResponse['data']): ProviderStatus => ({
  id: raw._id,
  userId: raw.userId,
  activeStatus: raw.activeStatus,
  workingAreas: raw.workingAreas,
});

const mapProviderApplication = (raw: ProviderApplicationApiResponse['data']): ProviderApplication => ({
  id: raw._id,
  status: raw.status.toLowerCase() as ProviderApplication['status'],
  submitted_at: raw.createdAt,
  reviewed_at: raw.reviewedAt,
  fullName: raw.fullName,
  phone: raw.phone,
  specialties: (raw.serviceCategories || (raw as any).specialties) as any, // Handle both names during transition
  experience: raw.experience,
  serviceArea: raw.serviceArea,
  idCard: raw.idCard,
  motivation: raw.motivation,
  rejectionReason: raw.rejectionReason,
});

// ── API calls ─────────────────────────────────────────────────────────────────

/** GET /providers/me — lấy thông tin provider hiện tại */
export const fetchProviderStatus = async (): Promise<ProviderStatus> => {
  const res = await apiClient.get<ProviderStatusApiResponse>('/providers/me');
  return mapProviderStatus(res.data.data);
};

/** PATCH /providers/status — cập nhật trạng thái provider */
export const updateProviderStatus = async (
  activeStatus: 'ONLINE' | 'OFFLINE',
): Promise<ProviderStatus> => {
  const res = await apiClient.patch<ProviderStatusApiResponse>('/providers/status', {
    activeStatus,
  });
  return mapProviderStatus(res.data.data);
};

/** PATCH /providers/working-area — cập nhật khu vực làm việc */
export const updateProviderWorkingAreas = async (
  workingAreas: string[],
): Promise<ProviderStatus> => {
  const res = await apiClient.patch<ProviderStatusApiResponse>('/providers/working-area', {
    workingAreas,
  });
  return mapProviderStatus(res.data.data);
};

// ── Provider Application API calls ─────────────────────────────────────────────

/** POST /provider-requests — submit provider application */
export const submitProviderApplication = async (data: RegisterProviderFormData) => {
  const res = await apiClient.post<ProviderApplicationApiResponse>('/provider-requests', data);
  return mapProviderApplication(res.data.data);
};

/** GET /provider-requests/my — get my provider application */
export const getMyProviderApplication = async (): Promise<ProviderApplication | null> => {
  try {
    const res = await apiClient.get<ProviderApplicationApiResponse>('/provider-requests/my');
    return mapProviderApplication(res.data.data);
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null; // No application found
    }
    throw error;
  }
};