'use client'

import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline, useMapEvents } from 'react-leaflet'
import { LatLng } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'

// Fix for default marker icons in Leaflet with Next.js
const createIcon = () => {
  if (typeof window !== 'undefined') {
    const L = require('leaflet')
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    })
  }
}

// Component to handle map click events
function MapClickHandler({ onClick }: { onClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onClick) {
        onClick(e.latlng.lat, e.latlng.lng)
      }
    },
  })
  return null
}

interface MapMarker {
  id: string
  lat: number
  lng: number
  popup?: string
  color?: string
}

interface MapPolyline {
  id: string
  positions: [number, number][]
  color?: string
}

interface OpenStreetMapProps {
  center?: [number, number]
  zoom?: number
  markers?: MapMarker[]
  polylines?: MapPolyline[]
  accuracyCircle?: {
    center: [number, number]
    radius: number
    color?: string
  }
  className?: string
  style?: React.CSSProperties
  onClick?: (lat: number, lng: number) => void
}

export function OpenStreetMap({
  center = [0, 0],
  zoom = 13,
  markers = [],
  polylines = [],
  accuracyCircle,
  className = '',
  style,
  onClick,
}: OpenStreetMapProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    createIcon()
  }, [])

  if (!isClient) {
    return (
      <div className={`bg-slate-200 rounded-lg flex items-center justify-center ${className}`} style={style}>
        <div className="text-slate-500">Loading map...</div>
      </div>
    )
  }

  return (
    <MapContainer
      center={center as unknown as LatLng}
      zoom={zoom}
      className={className}
      style={style}
      scrollWheelZoom={false}
    >
      <MapClickHandler onClick={onClick} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {accuracyCircle && (
        <CircleMarker
          center={accuracyCircle.center as unknown as LatLng}
          radius={accuracyCircle.radius}
          pathOptions={{
            color: accuracyCircle.color || '#ef4444',
            fillColor: accuracyCircle.color || '#ef4444',
            fillOpacity: 0.2,
            weight: 2,
          }}
        />
      )}

      {polylines.map((polyline) => (
        <Polyline
          key={polyline.id}
          positions={polyline.positions}
          pathOptions={{
            color: polyline.color || '#3b82f6',
            weight: 3,
            opacity: 0.7,
          }}
        />
      ))}

      {markers.map((marker) => (
        <Marker key={marker.id} position={[marker.lat, marker.lng] as unknown as LatLng}>
          {marker.popup && <Popup>{marker.popup}</Popup>}
        </Marker>
      ))}
    </MapContainer>
  )
}
