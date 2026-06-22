import { authenticatedRequest } from '../../auth/services/authService'
import type {
  PaginatedFeedback,
  PaginatedProviderJobs,
  ProviderFeedback,
  ProviderJob,
  ProviderJobFilter,
  ProviderNotification,
  ProviderProfile,
  ProviderService,
  RevenuePoint,
  Wallet,
  WithdrawRequest,
} from '../types/providerTypes'

type DataResponse<T> = { data: T; message?: string; success?: boolean }

export type ServicePayload = {
  categoryId: string
  name: string
  description?: string
  price: number
  unit: 'hour' | 'job'
  image: string[]
}

export const providerService = {
  getProfile: async () => (await authenticatedRequest<DataResponse<ProviderProfile>>('/providers/me')).data,
  updateStatus: async (activeStatus: ProviderProfile['activeStatus']) =>
    (await authenticatedRequest<DataResponse<ProviderProfile>>('/providers/status', {
      method: 'PATCH',
      body: JSON.stringify({ activeStatus }),
    })).data,
  updateProviderProfile: async (payload: Partial<Pick<ProviderProfile, 'description' | 'experienceYears' | 'workingAreas' | 'operatingRadiusKm' | 'workingSchedule'>>) =>
    (await authenticatedRequest<DataResponse<ProviderProfile>>('/providers/me', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })).data,

  getAvailableJobs: async () => (await authenticatedRequest<DataResponse<ProviderJob[]>>('/requests/provider')).data,
  getMyJobs: async () => (await authenticatedRequest<DataResponse<ProviderJob[]>>('/requests/provider/my-jobs')).data,
  getProviderJobs: async (status: ProviderJobFilter = 'ALL', page = 1, limit = 9) =>
    (await authenticatedRequest<DataResponse<PaginatedProviderJobs>>(
      `/requests/provider/jobs?status=${status}&page=${page}&limit=${limit}`,
    )).data,
  getJob: async (id: string) => (await authenticatedRequest<DataResponse<ProviderJob>>(`/requests/provider/${id}`)).data,
  respondJob: async (id: string, action: 'ACCEPT' | 'REJECT') =>
    (await authenticatedRequest<DataResponse<ProviderJob>>(`/requests/${id}/respond`, {
      method: 'PATCH',
      body: JSON.stringify({ action }),
    })).data,
  startJob: async (id: string) =>
    (await authenticatedRequest<DataResponse<ProviderJob>>(`/requests/${id}/start`, { method: 'PATCH' })).data,
  completeJob: async (id: string, completionNote: string, completionMedia: string[]) =>
    (await authenticatedRequest<DataResponse<ProviderJob>>(`/requests/${id}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ completionNote, completionMedia }),
    })).data,
  uploadJobImage: async (file: File) => {
    const body = new FormData()
    body.append('image', file)
    return (await authenticatedRequest<{ imageUrl: string }>('/requests/provider/upload-image', {
      method: 'POST',
      body,
    })).imageUrl
  },

  getServices: async () => (await authenticatedRequest<DataResponse<ProviderService[]>>('/services/provider/me')).data,
  uploadServiceImage: async (file: File) => {
    const body = new FormData()
    body.append('image', file)
    return (await authenticatedRequest<{ imageUrl: string }>('/services/provider/upload-image', {
      method: 'POST',
      body,
    })).imageUrl
  },
  createService: async (payload: ServicePayload) =>
    (await authenticatedRequest<DataResponse<ProviderService>>('/services', {
      method: 'POST',
      body: JSON.stringify(payload),
    })).data,
  updateService: async (id: string, payload: ServicePayload) =>
    (await authenticatedRequest<DataResponse<ProviderService>>(`/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })).data,
  deleteService: (id: string) => authenticatedRequest<{ message: string }>(`/services/${id}`, { method: 'DELETE' }),

  getWallet: async () => (await authenticatedRequest<DataResponse<Wallet>>('/finance/my-wallet')).data,
  getRevenue: async (range: 'day' | 'month' | 'year' = 'day', weekStart?: string) => {
    const params = new URLSearchParams({ range })
    if (weekStart) params.set('weekStart', weekStart)
    return (await authenticatedRequest<DataResponse<RevenuePoint[]>>(`/finance/my-revenue?${params}`)).data
  },
  getWithdraws: () => authenticatedRequest<WithdrawRequest[]>('/withdraw/provider/withdraws'),
  withdraw: (payload: { amount: number; bankName: string; accountNumber: string; accountHolder: string }) =>
    authenticatedRequest<DataResponse<WithdrawRequest>>('/withdraw/provider/withdraw', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getFeedbacks: async (page = 1, limit = 20) => {
    const response = await authenticatedRequest<{ data?: PaginatedFeedback }>(`/feedback/provider/me?page=${page}&limit=${limit}`)
    return response.data ?? { docs: [], totalDocs: 0, limit, totalPages: 0, page }
  },
  replyFeedback: async (id: string, providerReply: string) =>
    (await authenticatedRequest<DataResponse<ProviderFeedback>>(`/feedback/reply/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ providerReply }),
    })).data,

  getNotifications: async () =>
    (await authenticatedRequest<DataResponse<ProviderNotification[]>>('/notifications/me')).data,
  readNotification: (id: string) =>
    authenticatedRequest<ProviderNotification>(`/notifications/${id}/read`, { method: 'PATCH' }),
  readAllNotifications: () =>
    authenticatedRequest<{ message: string }>('/notifications/me/read-all', { method: 'PATCH' }),
}
