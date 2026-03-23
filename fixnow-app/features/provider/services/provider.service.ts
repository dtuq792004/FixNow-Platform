import apiClient from '~/lib/api-client';
import type { ProviderStatus } from '~/features/provider/types/provider.types';

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

// ── Mapper ────────────────────────────────────────────────────────────────────
const mapProviderStatus = (raw: ProviderStatusApiResponse['data']): ProviderStatus => ({
  id: raw._id,
  userId: raw.userId,
  activeStatus: raw.activeStatus,
  workingAreas: raw.workingAreas,
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