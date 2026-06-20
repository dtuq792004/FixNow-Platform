import { useEffect, type ReactNode } from 'react'
import { authService } from '../services/authService'
import { useAuthStore } from '../store/authStore'

export function AuthInitializer({ children }: { children: ReactNode }) {
  const isInitialized = useAuthStore((state) => state.isInitialized)
  const setUser = useAuthStore((state) => state.setUser)
  const markInitialized = useAuthStore((state) => state.markInitialized)
  const clearSession = useAuthStore((state) => state.clearSession)

  useEffect(() => {
    if (isInitialized) return

    authService
      .restoreSession()
      .then((response) => setUser(response.user))
      .catch(() => clearSession())
      .finally(markInitialized)
  }, [clearSession, isInitialized, markInitialized, setUser])

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-24 w-72 animate-pulse rounded-2xl bg-slate-200" aria-label="Đang tải phiên đăng nhập" />
      </div>
    )
  }

  return children
}
