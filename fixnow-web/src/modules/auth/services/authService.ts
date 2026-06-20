import { ApiError, apiRequest } from '../../../shared/services/apiClient'
import {
  clearAuthSession,
  getAccessToken,
  setRefreshedAccessToken,
} from '../store/authStore'
import type {
  AuthUser,
  LoginPayload,
  LoginResponse,
  ProfileResponse,
  RegisterPayload,
} from '../types/authTypes'

type MessageResponse = { message: string }
type RefreshResponse = MessageResponse & { accessToken: string }
type VerifyOtpResponse = MessageResponse & { resetToken: string }

let refreshPromise: Promise<string> | null = null

function normalizeUser(user: AuthUser) {
  return { ...user, id: user.id || user._id || '' }
}

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = apiRequest<RefreshResponse>('/auth/refresh', { method: 'POST' })
      .then((response) => {
        setRefreshedAccessToken(response.accessToken)
        return response.accessToken
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

export async function authenticatedRequest<T>(path: string, init?: RequestInit) {
  let accessToken = getAccessToken()

  try {
    return await apiRequest<T>(path, init, accessToken)
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error
  }

  try {
    accessToken = await refreshAccessToken()
    return await apiRequest<T>(path, init, accessToken)
  } catch (error) {
    clearAuthSession()
    throw error
  }
}

export const authService = {
  login: (payload: LoginPayload) =>
    apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  register: (payload: RegisterPayload) =>
    apiRequest<{ message: string; user: AuthUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  verifyEmail: (email: string, otp: string) =>
    apiRequest<MessageResponse>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    }),

  resendVerificationOtp: (email: string) =>
    apiRequest<MessageResponse>('/auth/resend-verification-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  forgotPassword: (email: string) =>
    apiRequest<MessageResponse>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  verifyOtp: (otp: string) =>
    apiRequest<VerifyOtpResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ otp }),
    }),

  resetPassword: (resetToken: string, newPassword: string, confirmPassword: string) =>
    apiRequest<MessageResponse>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ resetToken, newPassword, confirmPassword }),
    }),

  getProfile: async () => {
    const response = await authenticatedRequest<ProfileResponse>('/users/me')
    return { ...response, user: normalizeUser(response.user) }
  },

  updateProfile: async (payload: Pick<AuthUser, 'fullName' | 'phone'>) => {
    const response = await authenticatedRequest<{ message: string; data: AuthUser }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    return { ...response, data: normalizeUser(response.data) }
  },

  uploadAvatar: async (file: File) => {
    const body = new FormData()
    body.append('avatar', file)
    const response = await authenticatedRequest<{ message: string; data: AuthUser }>('/users/avatar', {
      method: 'POST',
      body,
    })
    return { ...response, data: normalizeUser(response.data) }
  },

  logout: async () => {
    try {
      return await apiRequest<MessageResponse>('/auth/logout', { method: 'POST' })
    } finally {
      clearAuthSession()
    }
  },

  restoreSession: async () => {
    if (!getAccessToken()) {
      await refreshAccessToken()
    }
    const response = await authenticatedRequest<ProfileResponse>('/users/me')
    return { ...response, user: normalizeUser(response.user) }
  },
}
