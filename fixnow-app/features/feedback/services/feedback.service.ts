import apiClient from '~/lib/api-client';

export interface ServiceFeedbackItem {
  rating: number;   // 1–5
  comment?: string;
}

export interface CreateFeedbackDto {
  requestId: string;
  providerId: string; // User._id; backend resolves → Provider._id
  servicesFeedbacks: ServiceFeedbackItem[];
}

/** Normalised review record used across all review displays. */
export interface ReviewData {
  id: string;
  rating: number;        // avg across servicesFeedbacks, rounded 1 decimal
  comment: string;
  customerName: string;
  createdAt: string;
}

export interface ProviderFeedbacksPage {
  reviews: ReviewData[];
  totalDocs: number;
  totalPages: number;
  page: number;
}

// ── Shared mapper ─────────────────────────────────────────────────────────────
const mapFeedbackDoc = (fb: any): ReviewData => {
  const items: Array<{ rating: number; comment?: string }> = fb.servicesFeedbacks ?? [];
  const avg = items.length
    ? items.reduce((sum, s) => sum + s.rating, 0) / items.length
    : 0;
  return {
    id:           fb._id,
    rating:       Math.round(avg * 10) / 10,
    comment:      items.find((s) => s.comment)?.comment ?? '',
    customerName: fb.customerId?.fullName ?? 'Ẩn danh',
    createdAt:    fb.createdAt,
  };
};

// ── API calls ─────────────────────────────────────────────────────────────────

/** POST /feedback — submit feedback for a completed request */
export const createFeedbackApi = async (dto: CreateFeedbackDto): Promise<void> => {
  await apiClient.post('/feedback', dto);
};

/**
 * GET /feedback/request/:id — boolean existence check.
 * Returns true if customer already submitted feedback for this request.
 */
export const hasFeedbackForRequestApi = async (requestId: string): Promise<boolean> => {
  const res = await apiClient.get(`/feedback/request/${requestId}`);
  return (res.data?.data?.docs?.length ?? 0) > 0;
};

/**
 * GET /feedback/request/:id — fetch the actual feedback data for a request.
 * Returns null if no feedback submitted yet.
 * Used by the provider to see customer's rating on a completed job.
 */
export const getRequestFeedbackApi = async (requestId: string): Promise<ReviewData | null> => {
  const res = await apiClient.get(`/feedback/request/${requestId}`);
  const docs: any[] = res.data?.data?.docs ?? [];
  if (!docs.length) return null;
  return mapFeedbackDoc(docs[0]);
};

/**
 * GET /feedback/provider/:id — paginated list of all feedbacks for a provider.
 * `providerId` must be Provider._id (not User._id).
 */
export const getProviderFeedbacksApi = async (
  providerId: string,
  page = 1,
  limit = 15,
): Promise<ProviderFeedbacksPage> => {
  const res = await apiClient.get(`/feedback/provider/${providerId}`, {
    params: { page, limit },
  });
  const data = res.data?.data;
  return {
    reviews:    (data?.docs ?? []).map(mapFeedbackDoc),
    totalDocs:  data?.totalDocs  ?? 0,
    totalPages: data?.totalPages ?? 1,
    page:       data?.page       ?? 1,
  };
};
