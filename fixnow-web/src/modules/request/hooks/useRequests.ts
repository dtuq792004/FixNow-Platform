import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { requestService } from '../services/requestService'

export const requestKeys = {
  all: ['requests', 'customer'] as const,
  detail: (id: string) => ['requests', id] as const,
}

export function useMyRequestsQuery() {
  return useQuery({ queryKey: requestKeys.all, queryFn: requestService.getMine })
}

export function useRequestQuery(id?: string) {
  return useQuery({
    queryKey: requestKeys.detail(id ?? ''),
    queryFn: () => requestService.getById(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateRequestMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: requestService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: requestKeys.all }),
  })
}

export function useCancelRequestMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: requestService.cancel,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: requestKeys.all })
      queryClient.setQueryData(requestKeys.detail(response.data._id), response.data)
    },
  })
}
