import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addressService } from '../services/addressService'
import type { AddressPayload } from '../types/addressTypes'

export const addressKeys = { all: ['addresses'] as const }

export function useAddressesQuery() {
  return useQuery({ queryKey: addressKeys.all, queryFn: addressService.getAll })
}

export function useCreateAddressMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addressService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: addressKeys.all }),
  })
}

export function useUpdateAddressMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<AddressPayload> }) =>
      addressService.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: addressKeys.all }),
  })
}

export function useDeleteAddressMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addressService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: addressKeys.all }),
  })
}
