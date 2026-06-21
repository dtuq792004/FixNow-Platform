import { authenticatedRequest } from '../../auth/services/authService'
import type { AdminCategory, AdminComplaint, AdminDashboard, AdminFeedback, AdminPayment, AdminReport, AdminRequest, AdminService, AdminSettings, AdminUser, AdminWithdrawal, Paginated, ProviderApplication } from '../types/adminTypes'

type DataResponse<T> = { data: T; success?: boolean; message?: string }
const query = (params: Record<string, string | number | undefined>) => {
  const value = new URLSearchParams(Object.entries(params).filter((entry): entry is [string, string | number] => entry[1] !== undefined).map(([key, item]) => [key, String(item)])).toString()
  return value ? `?${value}` : ''
}

export const adminService = {
  getDashboard: async () => (await authenticatedRequest<DataResponse<AdminDashboard>>('/admin/dashboard')).data,
  getUsers: async (params: { page: number; limit?: number; search?: string; status?: string; role?: string }) => {
    const response = await authenticatedRequest<DataResponse<{ users: AdminUser[]; total: number; page: number; limit: number; totalPages: number }>>(`/admin/users${query(params)}`)
    return { ...response.data, items: response.data.users } as Paginated<AdminUser>
  },
  updateUserStatus: async (id: string, status: AdminUser['status']) => (await authenticatedRequest<DataResponse<AdminUser>>(`/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })).data,
  getProviderApplications: async (params: { page: number; limit?: number; search?: string; status?: string }) => {
    const response = await authenticatedRequest<{ data: ProviderApplication[]; pagination: { total: number; totalPages: number; currentPage: number } }>(`/provider-requests${query(params)}`)
    return { items: response.data, total: response.pagination.total, page: response.pagination.currentPage, limit: params.limit ?? 10, totalPages: response.pagination.totalPages }
  },
  approveProvider: (id: string) => authenticatedRequest(`/provider-requests/${id}`, { method: 'PATCH' }),
  rejectProvider: (id: string, rejectionReason: string) => authenticatedRequest(`/provider-requests/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ rejectionReason }) }),
  getCategories: async () => (await authenticatedRequest<DataResponse<AdminCategory[]>>('/admin/categories')).data,
  uploadCategoryIcon: async (file: File) => {
    const body = new FormData()
    body.append('image', file)
    const response = await authenticatedRequest<DataResponse<{ imageUrl: string }>>('/categories/upload-icon', {
      method: 'POST',
      body,
    })
    return response.data.imageUrl
  },
  createCategory: async (payload: Partial<AdminCategory>) => (await authenticatedRequest<DataResponse<AdminCategory>>('/categories', { method: 'POST', body: JSON.stringify(payload) })).data,
  updateCategory: async (id: string, payload: Partial<AdminCategory>) => (await authenticatedRequest<DataResponse<AdminCategory>>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(payload) })).data,
  getServices: async (params: { page: number; limit?: number; search?: string; status?: string }) => (await authenticatedRequest<DataResponse<Paginated<AdminService>>>(`/admin/services${query(params)}`)).data,
  approveService: async (id: string) => (await authenticatedRequest<DataResponse<AdminService>>(`/services/${id}`, { method: 'PATCH' })).data,
  rejectService: async (id: string) => (await authenticatedRequest<DataResponse<AdminService>>(`/services/${id}/reject`, { method: 'PATCH' })).data,
  getRequests: async (params: { page: number; limit?: number; search?: string; status?: string }) => (await authenticatedRequest<DataResponse<Paginated<AdminRequest>>>(`/admin/requests${query(params)}`)).data,
  getPayments: async (params: { page: number; limit?: number; search?: string; status?: string }) => (await authenticatedRequest<DataResponse<Paginated<AdminPayment> & { summary: { total: number; paid: number; pending: number } }>>(`/admin/payments${query(params)}`)).data,
  getWithdrawals: (status?: string) => authenticatedRequest<AdminWithdrawal[]>(`/withdraw/admin/withdraws${query({ status })}`),
  approveWithdrawal: (id: string) => authenticatedRequest(`/withdraw/admin/withdraws/${id}/approve`, { method: 'PATCH' }),
  rejectWithdrawal: (id: string, reason: string) => authenticatedRequest(`/withdraw/admin/withdraws/${id}/reject`, { method: 'PATCH', body: JSON.stringify({ reason }) }),
  getFeedbacks: async (params: { page: number; limit?: number; status?: string }) => (await authenticatedRequest<DataResponse<Paginated<AdminFeedback> & { summary: { average: number; ratings: number; hidden: number } }>>(`/admin/feedbacks${query(params)}`)).data,
  updateFeedbackStatus: (id: string, status: AdminFeedback['status']) => authenticatedRequest(`/admin/feedbacks/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getComplaints: async (params: { page: number; limit?: number; status?: string }) => (await authenticatedRequest<DataResponse<Paginated<AdminComplaint>>>(`/admin/complaints${query(params)}`)).data,
  updateComplaintStatus: (id: string, status: AdminComplaint['status']) => authenticatedRequest(`/admin/complaints/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getReport: async () => (await authenticatedRequest<DataResponse<AdminReport>>('/admin/reports')).data,
  getSettings: async () => (await authenticatedRequest<DataResponse<AdminSettings>>('/admin/settings')).data,
  updateSettings: async (payload: AdminSettings) => (await authenticatedRequest<DataResponse<AdminSettings>>('/admin/settings', { method: 'PATCH', body: JSON.stringify(payload) })).data,
  createAdmin: async (payload: { fullName: string; email: string }) => (await authenticatedRequest<DataResponse<{ temporaryPassword: string }>>('/admin/admins', { method: 'POST', body: JSON.stringify(payload) })).data,
}
