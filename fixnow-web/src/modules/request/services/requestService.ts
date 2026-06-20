import { authenticatedRequest } from '../../auth/services/authService'
import type { CreateRequestPayload, RequestItem } from '../types/requestTypes'

export const requestService = {
  getMine: async () => {
    const response = await authenticatedRequest<{ data: RequestItem[] }>('/requests/customer')
    return response.data
  },
  getById: async (id: string) => {
    const response = await authenticatedRequest<{ data: RequestItem }>(`/requests/${id}`)
    return response.data
  },
  create: (payload: CreateRequestPayload) =>
    authenticatedRequest<{ data: RequestItem; checkoutUrl?: string }>('/requests', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  cancel: (id: string) =>
    authenticatedRequest<{ data: RequestItem }>(`/requests/${id}/cancel`, { method: 'PATCH' }),
}
