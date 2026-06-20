import { useQuery } from '@tanstack/react-query'
import { customerHomeService } from '../services/customerHomeService'

export const customerHomeKeys = {
  notifications: ['customer', 'home', 'notifications'] as const,
  featuredProviders: ['customer', 'home', 'featured-providers'] as const,
}

export function useCustomerNotificationsQuery() {
  return useQuery({
    queryKey: customerHomeKeys.notifications,
    queryFn: customerHomeService.getNotifications,
  })
}

export function useFeaturedProvidersQuery() {
  return useQuery({
    queryKey: customerHomeKeys.featuredProviders,
    queryFn: customerHomeService.getFeaturedProviders,
  })
}
