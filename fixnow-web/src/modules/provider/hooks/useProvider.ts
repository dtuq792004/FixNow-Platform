import { useQuery, useQueryClient } from '@tanstack/react-query'
import { providerService } from '../services/providerService'
import type { ProviderJobFilter } from '../types/providerTypes'

export const providerKeys = {
  all: ['provider'] as const,
  profile: ['provider', 'profile'] as const,
  jobs: ['provider', 'jobs'] as const,
  jobsPage: (status: ProviderJobFilter, page: number) => ['provider', 'jobs', 'page', status, page] as const,
  availableJobs: ['provider', 'jobs', 'available'] as const,
  job: (id: string) => ['provider', 'jobs', id] as const,
  services: ['provider', 'services'] as const,
  wallet: ['provider', 'wallet'] as const,
  revenue: (range: string, period?: string) => ['provider', 'revenue', range, period ?? 'current'] as const,
  withdraws: ['provider', 'withdraws'] as const,
  feedbacks: ['provider', 'feedbacks'] as const,
  notifications: ['provider', 'notifications'] as const,
}

export function useProviderProfile() {
  return useQuery({ queryKey: providerKeys.profile, queryFn: providerService.getProfile })
}

export function useProviderJobs() {
  return useQuery({ queryKey: providerKeys.jobs, queryFn: providerService.getMyJobs })
}

export function usePaginatedProviderJobs(status: ProviderJobFilter, page: number) {
  return useQuery({
    queryKey: providerKeys.jobsPage(status, page),
    queryFn: () => providerService.getProviderJobs(status, page),
  })
}

export function useAvailableJobs() {
  return useQuery({ queryKey: providerKeys.availableJobs, queryFn: providerService.getAvailableJobs })
}

export function useProviderJob(id?: string) {
  return useQuery({
    queryKey: providerKeys.job(id ?? ''),
    queryFn: () => providerService.getJob(id ?? ''),
    enabled: Boolean(id),
  })
}

export function useInvalidateProviderJobs() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['provider', 'jobs'] })
}
