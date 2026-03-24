import apiClient from '~/lib/api-client';

export interface ServiceFeedbackItem {
  rating: number;   // 1–5
  comment?: string; // optional overall comment (no serviceId needed)
}

export interface CreateFeedbackDto {
  requestId: string;
  providerId: string; // provider.id = User._id; backend resolves → Provider._id
  servicesFeedbacks: ServiceFeedbackItem[];
}

/** POST /feedback — submit feedback for a completed request */
export const createFeedbackApi = async (dto: CreateFeedbackDto): Promise<void> => {
  await apiClient.post('/feedback', dto);
};

/**
 * GET /feedback/request/:id — check whether feedback exists for a request.
 * Returns true if already submitted, false if not.
 */
export const hasFeedbackForRequestApi = async (requestId: string): Promise<boolean> => {
  const res = await apiClient.get(`/feedback/request/${requestId}`);
  return (res.data?.data?.docs?.length ?? 0) > 0;
};
