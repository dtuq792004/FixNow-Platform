import { useEffect, useState } from 'react'
import { useAuthStore } from '../../auth/store/authStore'
import type { MapPoint } from '../../../shared/components/AppMap'
import { getAuthenticatedSocket } from '../../../shared/services/socketClient'

type LocationPayload = {
  requestId: string
  location: {
    lat: number
    lng: number
    accuracy?: number
  }
}

type UseProviderLocationOptions = {
  requestId: string
  shouldBroadcast: boolean
}

const geolocationErrors: Record<number, string> = {
  1: 'Bạn đã từ chối quyền truy cập vị trí. Hãy bật quyền vị trí trong trình duyệt.',
  2: 'Không thể xác định vị trí hiện tại của thiết bị.',
  3: 'Quá thời gian lấy vị trí. Vui lòng thử lại.',
}

export function useProviderLocation({
  requestId,
  shouldBroadcast,
}: UseProviderLocationOptions) {
  const supportsGeolocation =
    typeof navigator !== 'undefined' && Boolean(navigator.geolocation)
  const accessToken = useAuthStore((state) => state.accessToken)
  const [providerLocation, setProviderLocation] = useState<MapPoint | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(
    supportsGeolocation ? null : 'Trình duyệt này không hỗ trợ định vị GPS.',
  )
  const [isLocating, setIsLocating] = useState(supportsGeolocation)

  useEffect(() => {
    if (!supportsGeolocation) return

    const socket = accessToken ? getAuthenticatedSocket(accessToken) : null
    const applyServerLocation = (payload: LocationPayload) => {
      if (payload.requestId !== requestId) return
      setProviderLocation({
        lat: payload.location.lat,
        lng: payload.location.lng,
        label: 'Vị trí Provider',
      })
      setAccuracy(payload.location.accuracy ?? null)
    }

    if (socket && shouldBroadcast) {
      socket.emit('location:join_request', { requestId })
      socket.on('location:provider_snapshot', applyServerLocation)
      socket.on('location:provider_updated', applyServerLocation)
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const nextLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          label: 'Vị trí hiện tại của bạn',
        }
        setProviderLocation(nextLocation)
        setAccuracy(position.coords.accuracy)
        setError(null)
        setIsLocating(false)

        if (socket && shouldBroadcast) {
          socket.emit('location:update', {
            requestId,
            lat: nextLocation.lat,
            lng: nextLocation.lng,
            accuracy: position.coords.accuracy,
            heading: position.coords.heading ?? undefined,
            speed: position.coords.speed ?? undefined,
          })
        }
      },
      (positionError) => {
        setError(geolocationErrors[positionError.code] ?? 'Không thể lấy vị trí hiện tại.')
        setIsLocating(false)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 15_000,
        timeout: 20_000,
      },
    )

    return () => {
      navigator.geolocation.clearWatch(watchId)
      if (socket && shouldBroadcast) {
        socket.emit('location:leave_request', { requestId })
        socket.off('location:provider_snapshot', applyServerLocation)
        socket.off('location:provider_updated', applyServerLocation)
      }
    }
  }, [accessToken, requestId, shouldBroadcast, supportsGeolocation])

  return { providerLocation, accuracy, error, isLocating }
}
