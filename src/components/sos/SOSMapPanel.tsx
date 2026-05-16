'use client'

import { useState } from 'react'
import { LocationPing } from '@/types'
import { MapPin, Navigation, Wifi, Battery, Clock } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'
import { OpenStreetMap } from '@/components/maps/OpenStreetMap'
import { MapModal } from '@/components/maps/MapModal'

interface SOSMapPanelProps {
  latitude: number
  longitude: number
  address?: string | null
  accuracy?: number | null
  recentLocations?: LocationPing[]
}

export function SOSMapPanel({
  latitude,
  longitude,
  address,
  accuracy,
  recentLocations = [],
}: SOSMapPanelProps) {
  const latestPing = recentLocations[recentLocations.length - 1]
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)

  const handleMapClick = (lat: number, lng: number) => {
    setIsMapModalOpen(true)
  }

  return (
    <div className="space-y-3">
      {/* OpenStreetMap */}
      <OpenStreetMap
        center={[latitude, longitude]}
        zoom={15}
        markers={[
          {
            id: 'current',
            lat: latitude,
            lng: longitude,
            popup: address || 'Current Location',
          },
        ]}
        polylines={
          recentLocations.length > 1
            ? [
                {
                  id: 'history',
                  positions: recentLocations.map((loc) => [loc.latitude, loc.longitude]),
                  color: '#ef4444',
                },
              ]
            : []
        }
        accuracyCircle={
          accuracy
            ? {
                center: [latitude, longitude],
                radius: accuracy,
                color: '#ef4444',
              }
            : undefined
        }
        onClick={handleMapClick}
        className="w-full h-64 rounded-lg border border-slate-300 cursor-pointer"
      />

      {/* Location Info */}
      <div className="space-y-2">
        {address && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <span className="text-gray-700 leading-snug">{address}</span>
          </div>
        )}

        {accuracy && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Navigation className="h-3.5 w-3.5" />
            <span>Accuracy: ±{accuracy}m</span>
          </div>
        )}

        {latestPing && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-3.5 w-3.5" />
            <span>Last ping: {formatDateTime(latestPing.recorded_at)}</span>
          </div>
        )}

        {latestPing?.battery_level && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Battery className="h-3.5 w-3.5" />
            <span>Battery: {latestPing.battery_level}%</span>
          </div>
        )}

        {latestPing?.network_type && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Wifi className="h-3.5 w-3.5" />
            <span className="capitalize">{latestPing.network_type}</span>
          </div>
        )}
      </div>

      {/* Location History */}
      {recentLocations.length > 1 && (
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
            Location History ({recentLocations.length} pings)
          </p>
          <div className="space-y-1">
            {recentLocations.slice(-3).reverse().map((ping, idx) => (
              <div
                key={ping.id}
                className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 rounded px-2 py-1"
              >
                <span className="font-mono">
                  {ping.latitude.toFixed(4)}, {ping.longitude.toFixed(4)}
                </span>
                <span>{idx === 0 ? 'Latest' : formatDateTime(ping.recorded_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Map Modal */}
      <MapModal
        open={isMapModalOpen}
        onOpenChange={setIsMapModalOpen}
        center={[latitude, longitude]}
        title={address || 'Location Details'}
        markers={[
          {
            id: 'current',
            lat: latitude,
            lng: longitude,
            popup: address || 'Current Location',
          },
        ]}
        polylines={
          recentLocations.length > 1
            ? [
                {
                  id: 'history',
                  positions: recentLocations.map((loc) => [loc.latitude, loc.longitude]),
                  color: '#ef4444',
                },
              ]
            : []
        }
        accuracyCircle={
          accuracy
            ? {
                center: [latitude, longitude],
                radius: accuracy,
                color: '#ef4444',
              }
            : undefined
        }
      />
    </div>
  )
}
