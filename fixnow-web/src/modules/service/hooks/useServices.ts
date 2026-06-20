import { useQuery } from '@tanstack/react-query'
import { serviceService } from '../services/serviceService'

export const serviceKeys = {
  categories: ['categories'] as const,
  services: (categoryId?: string) => ['services', categoryId ?? 'all'] as const,
}

export function useCategoriesQuery() {
  return useQuery({
    queryKey: serviceKeys.categories,
    queryFn: serviceService.getCategories,
  })
}

export function useServicesQuery(categoryId?: string) {
  return useQuery({
    queryKey: serviceKeys.services(categoryId),
    queryFn: () => serviceService.getServices(categoryId),
  })
}
