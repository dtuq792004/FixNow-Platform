import { authenticatedRequest } from '../../auth/services/authService'
import type { Address, AddressPayload } from '../types/addressTypes'

type AddressResponse = { data: Address; message: string }

export const addressService = {
  getAll: async () => {
    const response = await authenticatedRequest<{ data: Address[] }>('/addresses')
    return response.data
  },
  create: (payload: AddressPayload) =>
    authenticatedRequest<AddressResponse>('/addresses', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id: string, payload: Partial<AddressPayload>) =>
    authenticatedRequest<AddressResponse>(`/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  remove: (id: string) =>
    authenticatedRequest<{ message: string }>(`/addresses/${id}`, { method: 'DELETE' }),
}
