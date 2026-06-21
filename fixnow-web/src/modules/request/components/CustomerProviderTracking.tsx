import { Clock3, Crosshair, MapPin, Navigation, Radio } from 'lucide-react'
import { AppMap, type MapPoint } from '../../../shared/components/AppMap'
import type { RequestStatus } from '../types/requestTypes'
import { useProviderTracking } from '../hooks/useProviderTracking'

type CustomerProviderTrackingProps = {
  requestId: string
  status: RequestStatus
  address: string
  latitude?: number
  longitude?: number
  hasProvider: boolean
  canGeocodeAddress?: boolean
  isGeocoding?: boolean
  geocodingError?: string
  onGeocodeAddress?: () => void
}

const activeStatuses: RequestStatus[] = ['ACCEPTED', 'IN_PROGRESS']

function getDistanceInKm(from: MapPoint, to: MapPoint) {
  const earthRadius = 6371
  const toRadians = (value: number) => (value * Math.PI) / 180
  const latitudeDelta = toRadians(to.lat - from.lat)
  const longitudeDelta = toRadians(to.lng - from.lng)
  const fromLatitude = toRadians(from.lat)
  const toLatitude = toRadians(to.lat)
  const value =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) *
      Math.cos(toLatitude) *
      Math.sin(longitudeDelta / 2) ** 2

  return earthRadius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value))
}

export function CustomerProviderTracking({
  requestId,
  status,
  address,
  latitude,
  longitude,
  hasProvider,
  canGeocodeAddress,
  isGeocoding,
  geocodingError,
  onGeocodeAddress,
}: CustomerProviderTrackingProps) {
  const canTrack = hasProvider && activeStatuses.includes(status)
  const tracking = useProviderTracking(requestId, canTrack)
  const customerLocation =
    typeof latitude === 'number' && typeof longitude === 'number'
      ? {
          lat: latitude,
          lng: longitude,
          label: `Vị trí của bạn: ${address}`,
        }
      : null
  const distance =
    customerLocation && tracking.providerLocation
      ? getDistanceInKm(tracking.providerLocation, customerLocation)
      : null

  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="flex flex-col gap-3 border-b border-blue-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 font-bold text-slate-900">
            <Navigation size={19} className="text-blue-600" />
            Theo dõi vị trí kỹ thuật viên
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Vị trí được cập nhật trực tiếp khi kỹ thuật viên đang di chuyển.
          </p>
        </div>
        {canTrack && (
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
            <Radio size={14} className={tracking.isOnline ? 'animate-pulse' : ''} />
            {tracking.isOnline ? 'Đang trực tuyến' : 'Đang kết nối'}
          </span>
        )}
      </div>

      {!customerLocation ? (
        <div className="m-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p>Địa chỉ của bạn chưa có tọa độ nên chưa thể hiển thị bản đồ.</p>
          {geocodingError && <p className="mt-2 font-semibold text-red-600">{geocodingError}</p>}
          {canGeocodeAddress && onGeocodeAddress ? (
            <button
              type="button"
              onClick={onGeocodeAddress}
              disabled={isGeocoding}
              className="mt-3 rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-700 disabled:opacity-60"
            >
              {isGeocoding ? 'Đang tìm tọa độ...' : 'Tìm tọa độ từ địa chỉ này'}
            </button>
          ) : (
            <p className="mt-2 text-xs">Booking này không còn liên kết với địa chỉ đã lưu. Hãy chọn địa chỉ có tọa độ cho yêu cầu mới.</p>
          )}
        </div>
      ) : !hasProvider ? (
        <p className="m-5 rounded-xl bg-white/80 p-4 text-sm text-slate-600">
          FixNow đang tìm kỹ thuật viên phù hợp. Bản đồ sẽ hiển thị sau khi có người nhận đơn.
        </p>
      ) : !canTrack ? (
        <p className="m-5 rounded-xl bg-white/80 p-4 text-sm text-slate-600">
          Theo dõi trực tiếp khả dụng khi kỹ thuật viên đã nhận đơn và đang thực hiện công việc.
        </p>
      ) : tracking.error ? (
        <p className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {tracking.error}
        </p>
      ) : (
        <>
          <AppMap
            customer={customerLocation}
            provider={tracking.providerLocation}
            className="h-[280px] w-full sm:h-[320px]"
          />
          <div className="grid gap-3 p-4 md:grid-cols-3">
            <div className="flex items-start gap-3 rounded-xl bg-white p-3 shadow-sm">
              <MapPin size={18} className="mt-0.5 shrink-0 text-red-500" />
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Điểm đến</p>
                <p className="mt-1 line-clamp-2 text-sm font-medium text-slate-700">{address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-white p-3 shadow-sm">
              <Crosshair size={18} className="mt-0.5 shrink-0 text-blue-600" />
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Khoảng cách</p>
                <p className="mt-1 text-sm font-bold text-slate-800">
                  {distance === null
                    ? tracking.isWaiting
                      ? 'Đang chờ vị trí...'
                      : 'Thợ chưa chia sẻ GPS'
                    : distance < 1
                      ? `${Math.round(distance * 1000)} m`
                      : `${distance.toFixed(1)} km`}
                </p>
                {tracking.accuracy && (
                  <p className="mt-0.5 text-xs text-slate-400">
                    Sai số khoảng {Math.round(tracking.accuracy)} m
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-white p-3 shadow-sm">
              <Clock3 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
              <div>
                <p className="text-xs font-semibold uppercase text-slate-400">Cập nhật cuối</p>
                <p className="mt-1 text-sm font-bold text-slate-800">
                  {tracking.lastUpdatedAt
                    ? new Intl.DateTimeFormat('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      }).format(new Date(tracking.lastUpdatedAt))
                    : 'Chưa có dữ liệu'}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
