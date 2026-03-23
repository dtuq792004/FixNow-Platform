import apiClient from '~/lib/api-client';
import type { ProviderSearchResult } from '../types';

interface SearchProvidersResponse {
  success: boolean;
  data: any[]; // Đây là IProvider join với User từ backend
  message: string;
}

export const searchProvidersApi = async (keyword: string): Promise<ProviderSearchResult[]> => {
  const { data } = await apiClient.get<SearchProvidersResponse>('/providers/search', {
    params: { keyword }
  });

  if (!data.success) return [];

  return data.data.map((item) => ({
    type: 'provider' as const,
    provider: {
      id: item._id,
      name: item.userId?.fullName || 'N/A',
      rating: item.avgRating || 0,
      completedJobs: item.reviewCount || 0,
      specialties: item.serviceCategories?.map((cat: any) => cat.name) || [],
      location: item.workingAreas?.[0] || 'Toàn quốc',
      isVerified: item.verified || false,
    }
  }));
};

export const getTopRatedProvidersApi = async (): Promise<ProviderSearchResult[]> => {
  const { data } = await apiClient.get<SearchProvidersResponse>('/providers/top-rated');

  if (!data.success) return [];

  return data.data.map((item) => ({
    type: 'provider' as const,
    provider: {
      id: item._id,
      name: item.userId?.fullName || 'N/A',
      rating: item.avgRating || 0,
      completedJobs: item.reviewCount || 0,
      specialties: item.serviceCategories?.map((cat: any) => cat.name) || [],
      location: item.workingAreas?.[0] || 'Toàn quốc',
      isVerified: true, // Giả định thợ top rated là verified
    }
  }));
};
