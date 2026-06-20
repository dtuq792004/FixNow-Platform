import { useEffect } from 'react'
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet'
import { divIcon, latLngBounds } from 'leaflet'

export type MapPoint = {
  lat: number
  lng: number
  label: string
}

type AppMapProps = {
  customer: MapPoint
  provider?: MapPoint | null
  className?: string
}

const markerIcon = (color: string, symbol: string) =>
  divIcon({
    className: '',
    html: `<div style="display:grid;place-items:center;width:38px;height:38px;border:3px solid white;border-radius:9999px;background:${color};color:white;font-size:18px;font-weight:800;box-shadow:0 4px 14px rgba(15,23,42,.3)">${symbol}</div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -22],
  })

const customerIcon = markerIcon('#ef4444', 'K')
const providerIcon = markerIcon('#2563eb', 'P')

function FitMapBounds({ points }: { points: MapPoint[] }) {
  const map = useMap()

  useEffect(() => {
    if (points.length === 1) {
      map.setView([points[0].lat, points[0].lng], 15)
      return
    }

    map.fitBounds(
      latLngBounds(points.map((point) => [point.lat, point.lng])),
      { padding: [48, 48], maxZoom: 16 },
    )
  }, [map, points])

  return null
}

export function AppMap({ customer, provider, className }: AppMapProps) {
  const points = provider ? [customer, provider] : [customer]

  return (
    <MapContainer
      center={[customer.lat, customer.lng]}
      zoom={15}
      scrollWheelZoom
      className={className ?? 'h-80 w-full'}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitMapBounds points={points} />
      <Marker position={[customer.lat, customer.lng]} icon={customerIcon}>
        <Popup>{customer.label}</Popup>
      </Marker>
      {provider && (
        <>
          <Marker position={[provider.lat, provider.lng]} icon={providerIcon}>
            <Popup>{provider.label}</Popup>
          </Marker>
          <Polyline
            positions={[
              [provider.lat, provider.lng],
              [customer.lat, customer.lng],
            ]}
            pathOptions={{ color: '#2563eb', weight: 4, dashArray: '8 8' }}
          />
        </>
      )}
    </MapContainer>
  )
}
