import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { AuthInitializer } from '../../modules/auth/components/AuthInitializer'
import { ConfirmModal } from '../../shared/components/ConfirmModal'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
})

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>{children}</AuthInitializer>
      <ConfirmModal />
    </QueryClientProvider>
  )
}
