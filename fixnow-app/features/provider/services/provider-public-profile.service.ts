/** Public provider profile — frontend API + types for customer-facing profile screen. */
import apiClient from '~/lib/api-client';
import type { ServiceCategoryType } from '~/features/home/types';

// ── Response shape from GET /providers/:id ────────────────────────────────────
export interface PublicCategoryInfo {
  _id: string;
  name: string;
  type: ServiceCategoryType;
}

export interface PublicReviewItem {
  _id: string;
  customerId: { fullName: string; avatar?: string | null } | null;
  servicesFeedbacks: Array<{ rating: number; comment?: string }>;
  createdAt: string;
}

export interface PublicProviderProfile {
  id: string;               // Provider._id
  userId: string;           // User._id
  fullName: string;
  avatar?: string | null;
  description: string;
  experienceYears: number;
  activeStatus: 'ONLINE' | 'OFFLINE';
  verified: boolean;
  workingAreas: string[];
  serviceCategories: PublicCategoryInfo[];
  avgRating: number;
  reviewCount: number;
  recentReviews: Array<{
    id: string;
    customerName: string;
    rating: number;         // avg across servicesFeedbacks for this request
    comment: string;
    createdAt: string;
  }>;
}

// ── Mapper ────────────────────────────────────────────────────────────────────
const mapProfile = (raw: any): PublicProviderProfile => ({
  id:              raw._id,
  userId:          raw.userId?._id ?? raw.userId,
  fullName:        raw.userId?.fullName ?? 'Thợ kỹ thuật',
  avatar:          raw.userId?.avatar ?? null,
  description:     raw.description ?? '',
  experienceYears: raw.experienceYears ?? 0,
  activeStatus:    raw.activeStatus ?? 'OFFLINE',
  verified:        raw.verified ?? false,
  workingAreas:    raw.workingAreas ?? [],
  serviceCategories: (raw.serviceCategories ?? []).map((c: any) => ({
    _id:  c._id,
    name: c.name,
    type: c.type,
  })),
  avgRating:   raw.avgRating ?? 0,
  reviewCount: raw.reviewCount ?? 0,
  recentReviews: (raw.recentFeedbacks ?? []).map((fb: PublicReviewItem) => {
    const ratings = fb.servicesFeedbacks.map((s) => s.rating);
    const avgRating = ratings.length
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;
    const comment = fb.servicesFeedbacks.find((s) => s.comment)?.comment ?? '';
    return {
      id:           fb._id,
      customerName: fb.customerId?.fullName ?? 'Ẩn danh',
      rating:       Math.round(avgRating * 10) / 10,
      comment,
      createdAt:    fb.createdAt,
    };
  }),
});

// ── API call ──────────────────────────────────────────────────────────────────

/** GET /providers/:id — works with either Provider._id or User._id */
export const getProviderProfileApi = async (id: string): Promise<PublicProviderProfile> => {
  const res = await apiClient.get<{ success: boolean; data: any }>(`/providers/${id}`);
  return mapProfile(res.data.data);
};
