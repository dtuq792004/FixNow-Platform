import { Crosshair, ExternalLink, LocateFixed, MapPin } from 'lucide-react'
import { AppButton } from '../../../shared/components/AppButton'
import { AppMap, type MapPoint } from '../../../shared/components/AppMap'
import { useProviderLocation } from '../hooks/useProviderLocation'
import type { ProviderJob } from '../types/providerTypes'

type ProviderJobMapProps = {
  job: ProviderJob
  address: string
}

export function ProviderJobMap({ job, address }: ProviderJobMapProps) {
  const latitude = job.addressId?.latitude
  const longitude = job.addressId?.longitude
  const hasCustomerCoordinates =
    typeof latitude === 'number' && typeof longitude === 'number'
  const shouldBroadcast =
    Boolean(job.providerId) &&
    (job.status === 'ACCEPTED' || job.status === 'IN_PROGRESS')
  const { providerLocation, accuracy, error, isLocating } = useProviderLocation({
    requestId: job._id,
    shouldBroadcast,
  })

  const customerLocation: MapPoint | null = hasCustomerCoordinates
    ? {
        lat: latitude,
        lng: longitude,
        label: `Vị trí khách hàng: ${address}`,
      }
    : null

  const directionsUrl = customerLocation
    ? `https://www.google.com/maps/dir/?api=1&destination=${customerLocation.lat},${customerLocation.lng}${
        providerLocation
          ? `&origin=${providerLocation.lat},${providerLocation.lng}`
          : ''
      }`
    : null

  return (
    <section className="mt-5 overflow-hidden border-t border-slate-200 pt-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <MapPin className="text-blue-600" size={21} />
            Theo dõi vị trí
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            GPS của Provider được cập nhật tự động khi trang này đang mở.
          </p>
        </div>
        {directionsUrl && (
          <AppButton
            variant="outline"
            size="sm"
            onClick={() => window.open(directionsUrl, '_blank', 'noopener,noreferrer')}
          >
            <ExternalLink size={16} />
            Chỉ đường
          </AppButton>
        )}
      </div>

      {!customerLocation ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Địa chỉ khách hàng chưa có tọa độ. Hãy cập nhật latitude/longitude cho địa chỉ này để hiển thị bản đồ.
        </div>
      ) : (
        <>
          <AppMap
            customer={customerLocation}
            provider={providerLocation}
            className="mt-4 h-[260px] w-full rounded-2xl border border-slate-200 sm:h-[300px]"
          />
          <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-xl bg-red-50 p-3 text-red-800">
              <MapPin className="mt-0.5 shrink-0" size={18} />
              <div>
                <strong>Khách hàng</strong>
                <p className="mt-1 text-red-700">{address}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-blue-50 p-3 text-blue-800">
              {isLocating ? (
                <LocateFixed className="mt-0.5 shrink-0 animate-pulse" size={18} />
              ) : (
                <Crosshair className="mt-0.5 shrink-0" size={18} />
              )}
              <div>
                <strong>Provider</strong>
                <p className="mt-1 text-blue-700">
                  {isLocating
                    ? 'Đang lấy vị trí hiện tại...'
                    : error
                      ? error
                      : `Đã định vị${accuracy ? ` · sai số khoảng ${Math.round(accuracy)} m` : ''}`}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
