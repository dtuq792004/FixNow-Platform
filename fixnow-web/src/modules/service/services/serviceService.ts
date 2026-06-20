import { apiRequest } from '../../../shared/services/apiClient'
import type { Category, Service } from '../types/serviceTypes'

export const serviceService = {
  getCategories: async () => {
    const response = await apiRequest<{ data: Category[] }>('/categories')
    return response.data.filter((category) => category.isActive)
  },
  getServices: async (categoryId?: string) => {
    const query = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : ''
    const response = await apiRequest<{ data: Service[] }>(`/services${query}`)
    return response.data
  },
}
