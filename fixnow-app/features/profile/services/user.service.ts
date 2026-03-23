import apiClient from '~/lib/api-client';
import type { AuthUser } from '~/features/auth/types/auth.types';

export interface UpdateProfileInput {
  fullName?: string;
  phone?: string;
  avatar?: string;
}

interface UserProfileResponse {
  message: string;
  user: AuthUser;
}

interface UpdateProfileResponse {
  message: string;
  data: AuthUser;
}

/** GET /users/me — lấy full profile từ DB */
export const getProfileApi = async (): Promise<AuthUser> => {
  const { data } = await apiClient.get<UserProfileResponse>('/users/me');
  return data.user;
};

/** PUT /users/profile — cập nhật fullName, phone, avatar */
export const updateProfileApi = async (input: UpdateProfileInput): Promise<AuthUser> => {
  const { data } = await apiClient.put<UpdateProfileResponse>('/users/profile', input);
  return data.data;
};
