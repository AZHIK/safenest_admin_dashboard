'use client'

import { SOSAlert, SOSStatus } from '@/types'
import { UserCheck, TrendingUp, CheckCircle2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SOSQuickActionsProps {
  alert: SOSAlert
  onAssign?: (alert: SOSAlert) => void
  onEscalate?: (alert: SOSAlert) => void
  onResolve?: (alert: SOSAlert) => void
  loading?: boolean
  variant?: 'card' | 'panel'
  canAssign?: boolean
  canEscalate?: boolean
}

export function SOSQuickActions({
  alert,
  onAssign,
  onEscalate,
  onResolve,
  loading = false,
  variant = 'card',
  canAssign = true,
  canEscalate = true,
}: SOSQuickActionsProps) {
  const isResolved = alert.status === 'resolved' || alert.status === 'cancelled'

  if (isResolved) {
    return (
      <div className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
        <CheckCircle2 className="h-4 w-4" />
        <span>Resolved</span>
      </div>
    )
  }

  if (variant === 'panel') {
    return (
      <div className="space-y-2">
        {canAssign && (
          <button
            onClick={() => onAssign?.(alert)}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
            Assign Responder
          </button>
        )}
        {canEscalate && (
          <button
            onClick={() => onEscalate?.(alert)}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrendingUp className="h-4 w-4" />}
            Escalate Alert
          </button>
        )}
        <button
          onClick={() => onResolve?.(alert)}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          Mark Resolved
        </button>
      </div>
    )
  }

  // Card variant — compact inline buttons
  return (
    <div className="flex items-center gap-1.5">
      {canAssign && (
        <button
          onClick={(e) => { e.stopPropagation(); onAssign?.(alert) }}
          disabled={loading}
          title="Assign Responder"
          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md transition-colors disabled:opacity-50"
        >
          <UserCheck className="h-4 w-4" />
        </button>
      )}
      {canEscalate && (
        <button
          onClick={(e) => { e.stopPropagation(); onEscalate?.(alert) }}
          disabled={loading}
          title="Escalate"
          className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-md transition-colors disabled:opacity-50"
        >
          <TrendingUp className="h-4 w-4" />
        </button>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onResolve?.(alert) }}
        disabled={loading}
        title="Mark Resolved"
        className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50"
      >
        <CheckCircle2 className="h-4 w-4" />
      </button>
    </div>
  )
}
