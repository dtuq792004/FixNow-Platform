import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { ProviderNavbar } from '../modules/provider/components/ProviderNavbar'
import { ProviderSidebar } from '../modules/provider/components/ProviderSidebar'
import { NewRequestModal } from '../modules/provider/components/NewRequestModal'
import { useProviderProfile, providerKeys } from '../modules/provider/hooks/useProvider'
import { providerService } from '../modules/provider/services/providerService'
import type { ProviderJob } from '../modules/provider/types/providerTypes'
import { useAuthStore } from '../modules/auth/store/authStore'
import {
  disconnectAuthenticatedSocket,
  getAuthenticatedSocket,
} from '../shared/services/socketClient'

type NewRequestEvent = {
  request: ProviderJob
  expiresAt: string
}

const NEW_REQUEST_WINDOW_MS = 60_000
const SEEN_REQUESTS_KEY = 'fixnow_provider_seen_new_requests'

function getSeenRequestIds() {
  try {
    return new Set<string>(JSON.parse(sessionStorage.getItem(SEEN_REQUESTS_KEY) ?? '[]'))
  } catch {
    return new Set<string>()
  }
}

export function ProviderLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [newRequest, setNewRequest] = useState<NewRequestEvent | null>(null)
  const seenRequestIds = useRef(getSeenRequestIds())
  const queryClient = useQueryClient()
  const accessToken = useAuthStore((state) => state.accessToken)
  const profileQuery = useProviderProfile()
  const isOnline = profileQuery.data?.activeStatus === 'ONLINE'
  const statusMutation = useMutation({
    mutationFn: () => providerService.updateStatus(isOnline ? 'OFFLINE' : 'ONLINE'),
    onSuccess: (profile) => queryClient.setQueryData(providerKeys.profile, profile),
  })

  const showNewRequest = useCallback((payload: NewRequestEvent) => {
    const expiresAt = new Date(payload.expiresAt).getTime()
    if (!payload.request?._id || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) return
    if (seenRequestIds.current.has(payload.request._id)) return

    seenRequestIds.current.add(payload.request._id)
    sessionStorage.setItem(SEEN_REQUESTS_KEY, JSON.stringify([...seenRequestIds.current].slice(-100)))
    setNewRequest(payload)
    void queryClient.invalidateQueries({ queryKey: ['provider', 'jobs'] })
  }, [queryClient])

  useEffect(() => {
    if (!accessToken) return

    const socket = getAuthenticatedSocket(accessToken)
    const joinNotificationRoom = () => socket.emit('notification:join')
    const handleNewRequest = (payload: NewRequestEvent) => showNewRequest(payload)

    socket.on('connect', joinNotificationRoom)
    socket.on('provider:new_request', handleNewRequest)
    if (socket.connected) joinNotificationRoom()

    return () => {
      socket.off('connect', joinNotificationRoom)
      socket.off('provider:new_request', handleNewRequest)
      disconnectAuthenticatedSocket()
    }
  }, [accessToken, showNewRequest])

  useEffect(() => {
    if (!accessToken) return

    let cancelled = false
    const syncRecentRequests = async () => {
      try {
        const jobs = await providerService.getAvailableJobs()
        if (cancelled) return

        const recentJob = jobs
          .filter((job) => job.status === 'PENDING')
          .map((job) => ({ job, createdAt: new Date(job.createdAt).getTime() }))
          .filter(({ createdAt }) => Number.isFinite(createdAt) && Date.now() - createdAt < NEW_REQUEST_WINDOW_MS)
          .sort((a, b) => b.createdAt - a.createdAt)
          .find(({ job }) => !seenRequestIds.current.has(job._id))

        if (recentJob) {
          showNewRequest({
            request: recentJob.job,
            expiresAt: new Date(recentJob.createdAt + NEW_REQUEST_WINDOW_MS).toISOString(),
          })
        }
      } catch {
        // Socket remains the primary channel; polling retries on the next interval.
      }
    }

    void syncRecentRequests()
    const interval = window.setInterval(syncRecentRequests, 5_000)
    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [accessToken, showNewRequest])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <ProviderNavbar onOpenSidebar={() => setIsSidebarOpen(true)} />
      <ProviderSidebar
        isOpen={isSidebarOpen}
        isOnline={isOnline}
        onClose={() => setIsSidebarOpen(false)}
        onToggleOnline={() => statusMutation.mutate()}
        isStatusPending={statusMutation.isPending}
      />
      <main className="min-h-screen pt-16 lg:pl-68">
        <Outlet context={{ isOnline, profile: profileQuery.data }} />
      </main>
      {newRequest && (
        <NewRequestModal
          job={newRequest.request}
          expiresAt={newRequest.expiresAt}
          onClose={() => setNewRequest(null)}
        />
      )}
    </div>
  )
}
