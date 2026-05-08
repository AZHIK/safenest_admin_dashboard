'use client'

import { SOSAlert } from '@/types'
import { SOSStatusBadge } from './SOSStatusBadge'
import { SOSQuickActions } from './SOSQuickActions'
import { MapPin, Phone, Clock, Users, Radio } from 'lucide-react'
import { getRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface SOSAlertCardProps {
  alert: SOSAlert
  isSelected?: boolean
  onClick?: (alert: SOSAlert) => void
  onAssign?: (alert: SOSAlert) => void
  onEscalate?: (alert: SOSAlert) => void
  onResolve?: (alert: SOSAlert) => void
  canAssign?: boolean
  canEscalate?: boolean
}

const SEVERITY_BORDER: Record<string, string> = {
  critical: 'border-l-red-600',
  high:     'border-l-orange-500',
  medium:   'border-l-amber-400',
  low:      'border-l-blue-400',
}

const SEVERITY_LABEL_CLASS: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 border border-red-200',
  high:     'bg-orange-100 text-orange-700 border border-orange-200',
  medium:   'bg-amber-100 text-amber-700 border border-amber-200',
  low:      'bg-blue-100 text-blue-700 border border-blue-200',
}

const ALERT_TYPE_LABELS: Record<string, string> = {
  manual: 'Manual',
  timer:  'Timer',
  shake:  'Shake',
  voice:  'Voice',
  auto:   'Auto',
}

export function SOSAlertCard({
  alert,
  isSelected = false,
  onClick,
  onAssign,
  onEscalate,
  onResolve,
  canAssign = true,
  canEscalate = true,
}: SOSAlertCardProps) {
  const severityBorder = SEVERITY_BORDER[alert.severity] ?? 'border-l-gray-400'
  const severityLabel  = SEVERITY_LABEL_CLASS[alert.severity] ?? 'bg-gray-100 text-gray-700'
  const isActive       = alert.status === 'active' || alert.status === 'assigned' || alert.status === 'escalated'

  return (
    <div
      onClick={() => onClick?.(alert)}
      className={cn(
        'border-l-4 bg-white rounded-r-lg shadow-sm cursor-pointer transition-all duration-200',
        'hover:shadow-md hover:translate-x-0.5',
        severityBorder,
        isSelected ? 'ring-2 ring-red-300 shadow-md' : '',
        isActive ? '' : 'opacity-75'
      )}
    >
      <div className="p-4">
        {/* Top Row: Status + Severity + Time */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <SOSStatusBadge status={alert.status} size="sm" animated={alert.status === 'active'} />
            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full capitalize', severityLabel)}>
              {alert.severity}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Radio className="h-3 w-3" />
              {ALERT_TYPE_LABELS[alert.alert_type] ?? alert.alert_type}
            </span>
          </div>
          <span className="text-xs text-gray-400 flex-shrink-0">
            {getRelativeTime(alert.created_at)}
          </span>
        </div>

        {/* Message */}
        {alert.message && (
          <p className="text-sm text-gray-800 font-medium leading-snug mb-2.5 line-clamp-2">
            {alert.message}
          </p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mb-3">
          <span className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-gray-400" />
            <span className="truncate max-w-[180px]">
              {alert.initial_address ?? `${alert.initial_latitude.toFixed(4)}, ${alert.initial_longitude.toFixed(4)}`}
            </span>
          </span>
          <span className="flex items-center gap-1">
            <Phone className="h-3.5 w-3.5 text-gray-400" />
            {alert.user?.phone_number ?? 'Anonymous'}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5 text-gray-400" />
            {alert.contacts_notified} notified
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            ID: {alert.id.slice(0, 8)}
          </span>
          <SOSQuickActions
            alert={alert}
            onAssign={onAssign}
            onEscalate={onEscalate}
            onResolve={onResolve}
            variant="card"
            canAssign={canAssign}
            canEscalate={canEscalate}
          />
        </div>
      </div>
    </div>
  )
}
