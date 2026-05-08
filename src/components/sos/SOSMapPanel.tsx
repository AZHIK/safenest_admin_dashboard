'use client'

import { LocationPing } from '@/types'
import { MapPin, Navigation, Wifi, Battery, Clock } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

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

  return (
    <div className="space-y-3">
      {/* Map Placeholder */}
      <div className="relative w-full h-36 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg overflow-hidden border border-slate-600">
        {/* Grid lines to simulate map */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Road lines */}
        <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#64748b" strokeWidth="3" />
          <line x1="40%" y1="0" x2="40%" y2="100%" stroke="#64748b" strokeWidth="2" />
          <line x1="70%" y1="0" x2="70%" y2="100%" stroke="#64748b" strokeWidth="2" />
          <line x1="0" y1="30%" x2="100%" y2="30%" stroke="#64748b" strokeWidth="1.5" />
          <line x1="0" y1="70%" x2="100%" y2="70%" stroke="#64748b" strokeWidth="1.5" />
        </svg>

        {/* Accuracy circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-lg" />
            </div>
          </div>
        </div>

        {/* Coordinates overlay */}
        <div className="absolute bottom-2 left-2 right-2 bg-black/50 backdrop-blur-sm rounded px-2 py-1">
          <p className="text-white text-xs font-mono">
            {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </p>
        </div>
      </div>

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
    </div>
  )
}
