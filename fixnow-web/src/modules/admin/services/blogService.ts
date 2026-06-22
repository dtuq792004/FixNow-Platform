import { authenticatedRequest } from '../../auth/services/authService'
import { apiRequest } from '../../../shared/services/apiClient'
import type { Blog, BlogPayload, BlogStatus } from '../types/blogTypes'

type DataResponse<T> = { data: T; success?: boolean; message?: string }
type BlogPage = { items: Blog[]; total: number; page: number; limit: number; totalPages: number }
export type BlogReviewSummary = {
  averageRating: number
  totalReviews: number
  reviews: Array<{ _id: string; rating: number; comment: string; createdAt: string }>
}

const queryString = (params: Record<string, string | number | undefined>) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') query.set(key, String(value))
  })
  const value = query.toString()
  return value ? `?${value}` : ''
}

export const blogService = {
  listAdmin: async (params: { page: number; limit?: number; search?: string; status?: BlogStatus | '' }) =>
    (await authenticatedRequest<DataResponse<BlogPage>>(`/admin/blogs${queryString(params)}`)).data,
  getAdmin: async (id: string) =>
    (await authenticatedRequest<DataResponse<Blog>>(`/admin/blogs/${id}`)).data,
  create: async (payload: BlogPayload) =>
    (await authenticatedRequest<DataResponse<Blog>>('/admin/blogs', {
      method: 'POST',
      body: JSON.stringify(payload),
    })).data,
  update: async (id: string, payload: BlogPayload) =>
    (await authenticatedRequest<DataResponse<Blog>>(`/admin/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })).data,
  remove: (id: string) => authenticatedRequest(`/admin/blogs/${id}`, { method: 'DELETE' }),
  uploadImage: async (file: File) => {
    const body = new FormData()
    body.append('image', file)
    const response = await authenticatedRequest<DataResponse<{ imageUrl: string }>>('/admin/blogs/upload-image', {
      method: 'POST',
      body,
    })
    return response.data.imageUrl
  },
  listPublic: async (params: { page: number; limit?: number; search?: string; category?: string; categoryId?: string; serviceName?: string }) =>
    (await apiRequest<DataResponse<BlogPage>>(`/blogs${queryString(params)}`)).data,
  getPublic: async (slug: string) =>
    (await apiRequest<DataResponse<Blog>>(`/blogs/${slug}`)).data,
  getReviews: async (slug: string) =>
    (await apiRequest<DataResponse<BlogReviewSummary>>(`/blogs/${slug}/reviews`)).data,
  createReview: async (slug: string, payload: { rating: number; comment: string }) =>
    (await apiRequest<DataResponse<BlogReviewSummary>>(`/blogs/${slug}/reviews`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })).data,
}
