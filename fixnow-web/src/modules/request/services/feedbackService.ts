import { authenticatedRequest } from '../../auth/services/authService'

export const feedbackService = {
  create: (payload: {
    requestId: string
    providerId: string
    servicesFeedbacks: Array<{ serviceId?: string; rating: number; comment: string }>
  }) =>
    authenticatedRequest<{ message: string }>('/feedback', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
}
