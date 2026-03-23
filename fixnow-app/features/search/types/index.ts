import type { ServiceCategoryType } from '~/features/home/types';

export interface Provider {
  id: string;
  name: string;
  rating: number;
  completedJobs: number;
  specialties: ServiceCategoryType[];
  location: string;
  isVerified: boolean;
  priceNote?: string;
}

export type SearchSegment = 'service' | 'provider';

export interface ServiceSearchResult {
  type: 'service';
  category: ServiceCategoryType;
  label: string;
  description: string;
  icon: string;
  bgClass: string;
  iconColor: string;
}

export interface ProviderSearchResult {
  type: 'provider';
  provider: Provider;
}

export type SearchResult = ServiceSearchResult | ProviderSearchResult;
