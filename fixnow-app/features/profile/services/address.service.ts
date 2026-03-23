import apiClient from '~/lib/api-client';
import type { SavedAddress } from '~/features/profile/types';
import type { AddressFormData } from '~/features/profile/validations/schemas';

// ── Backend response shape ────────────────────────────────────────────────────
interface AddressApiItem {
  _id: string;
  label: 'home' | 'work' | 'other';
  addressLine: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface AddressListResponse {
  success: boolean;
  data: AddressApiItem[];
  message: string;
}

interface AddressSingleResponse {
  success: boolean;
  data: AddressApiItem;
  message: string;
}

// ── Mapper ────────────────────────────────────────────────────────────────────
const mapAddress = (raw: AddressApiItem): SavedAddress => ({
  id: raw._id,
  label: raw.label,
  addressLine: raw.addressLine,
  ward: raw.ward,
  district: raw.district,
  city: raw.city,
  isDefault: raw.isDefault,
});

// ── API calls ─────────────────────────────────────────────────────────────────

/** GET /addresses — lấy danh sách địa chỉ của user hiện tại */
export const fetchAddresses = async (): Promise<SavedAddress[]> => {
  const res = await apiClient.get<AddressListResponse>('/addresses');
  return res.data.data.map(mapAddress);
};

/** POST /addresses — tạo địa chỉ mới */
export const createAddress = async (data: AddressFormData): Promise<SavedAddress> => {
  const res = await apiClient.post<AddressSingleResponse>('/addresses', data);
  return mapAddress(res.data.data);
};

/** PUT /addresses/:id — cập nhật địa chỉ */
export const updateAddress = async (
  id: string,
  data: AddressFormData,
): Promise<SavedAddress> => {
  const res = await apiClient.put<AddressSingleResponse>(`/addresses/${id}`, data);
  return mapAddress(res.data.data);
};

/** DELETE /addresses/:id — xoá địa chỉ */
export const deleteAddress = async (id: string): Promise<void> => {
  await apiClient.delete(`/addresses/${id}`);
};

/**
 * Đặt địa chỉ mặc định — backend xử lý bằng PUT /:id với isDefault: true,
 * service tự unset các địa chỉ khác.
 */
export const setDefaultAddress = async (id: string): Promise<SavedAddress> => {
  const res = await apiClient.put<AddressSingleResponse>(`/addresses/${id}`, {
    isDefault: true,
  });
  return mapAddress(res.data.data);
};
