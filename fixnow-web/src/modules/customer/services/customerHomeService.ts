import { authenticatedRequest } from '../../auth/services/authService'
import type { CustomerNotification, FeaturedProvider } from '../types/customerHomeTypes'

type DataResponse<T> = { data: T }

export const customerHomeService = {
  getNotifications: async () =>
    (await authenticatedRequest<DataResponse<CustomerNotification[]>>('/notifications/me')).data,
  getFeaturedProviders: async () =>
    (await authenticatedRequest<DataResponse<FeaturedProvider[]>>('/providers/top-rated')).data,
}
