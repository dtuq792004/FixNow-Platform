import { apiRequest } from '../../../shared/services/apiClient'

export const paymentService = {
  createCheckout: (requestId: string, promoCode?: string) =>
    apiRequest<{ checkoutUrl: string }>('/payments', {
      method: 'POST',
      body: JSON.stringify({ requestId, promoCode }),
    }),
}
