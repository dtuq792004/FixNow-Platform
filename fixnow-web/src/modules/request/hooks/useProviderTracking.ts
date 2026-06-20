import { useEffect, useState } from 'react'
import type { MapPoint } from '../../../shared/components/AppMap'
import { getAuthenticatedSocket } from '../../../shared/services/socketClient'
import { useAuthStore } from '../../auth/store/authStore'

type ProviderLocationPayload = {
  requestId: string
  location: {
    lat: number
    lng: number
    accuracy?: number
    isOnline?: boolean
    lastSeenAt?: string
  }
}

export function useProviderTracking(requestId: string, enabled: boolean) {
  const accessToken = useAuthStore((state) => state.accessToken)
  const [providerLocation, setProviderLocation] = useState<MapPoint | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(false)
  const [isWaiting, setIsWaiting] = useState(enabled)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!accessToken || !requestId || !enabled) return

    const socket = getAuthenticatedSocket(accessToken)

    const applyLocation = (payload: ProviderLocationPayload) => {
      if (payload.requestId !== requestId) return

      setProviderLocation({
        lat: payload.location.lat,
        lng: payload.location.lng,
        label: 'Vị trí hiện tại của kỹ thuật viên',
      })
      setAccuracy(payload.location.accuracy ?? null)
      setLastUpdatedAt(payload.location.lastSeenAt ?? new Date().toISOString())
      setIsOnline(payload.location.isOnline ?? true)
      setIsWaiting(false)
      setError(null)
    }

    const handleJoined = (payload: { requestId: string }) => {
      if (payload.requestId === requestId) setError(null)
    }

    const handleError = (payload: { message?: string }) => {
      if (payload.message === 'Forbidden' || payload.message === 'Request not found') {
        setError('Bạn không có quyền theo dõi vị trí của đơn này.')
        setIsWaiting(false)
      }
    }

    socket.emit('location:join_request', { requestId })
    socket.on('location:provider_snapshot', applyLocation)
    socket.on('location:provider_updated', applyLocation)
    socket.on('location:joined_request', handleJoined)
    socket.on('location:error', handleError)

    return () => {
      socket.emit('location:leave_request', { requestId })
      socket.off('location:provider_snapshot', applyLocation)
      socket.off('location:provider_updated', applyLocation)
      socket.off('location:joined_request', handleJoined)
      socket.off('location:error', handleError)
    }
  }, [accessToken, enabled, requestId])

  return {
    providerLocation,
    accuracy,
    lastUpdatedAt,
    isOnline,
    isWaiting,
    error,
  }
}
