import apiClient from '~/lib/api-client';

export const paymentService = {
  /** PATCH /requests/:id/pay-later — customer chooses to pay on completion (cash) */
  payLater: async (requestId: string): Promise<void> => {
    await apiClient.patch(`/requests/${requestId}/pay-later`);
  },

  /** POST /payments — generate a new PayOS checkout URL for an existing request */
  createPaymentUrl: async (requestId: string): Promise<string> => {
    const { data: res } = await apiClient.post<{ checkoutUrl: string }>('/payments', { requestId });
    return res.checkoutUrl;
  },
};
