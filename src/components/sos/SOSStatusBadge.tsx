import { SOSStatus } from '@/types'
import { cn } from '@/lib/utils'
import { Activity, UserCheck, TrendingUp, CheckCircle2 } from 'lucide-react'

interface SOSStatusBadgeProps {
  status: SOSStatus
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
}

const STATUS_CONFIG: Record<string, {
  label: string
  bgClass: string
  textClass: string
  borderClass: string
  icon: any
}> = {
  active: {
    label: 'ACTIVE',
    bgClass: 'bg-red-100',
    textClass: 'text-red-700',
    borderClass: 'border-red-300',
    icon: Activity,
  },
  assigned: {
    label: 'ASSIGNED',
    bgClass: 'bg-amber-100',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-300',
    icon: UserCheck,
  },
  escalated: {
    label: 'ESCALATED',
    bgClass: 'bg-orange-100',
    textClass: 'text-orange-700',
    borderClass: 'border-orange-300',
    icon: TrendingUp,
  },
  resolved: {
    label: 'RESOLVED',
    bgClass: 'bg-green-100',
    textClass: 'text-green-700',
    borderClass: 'border-green-300',
    icon: CheckCircle2,
  },
  cancelled: {
    label: 'CANCELLED',
    bgClass: 'bg-gray-100',
    textClass: 'text-gray-600',
    borderClass: 'border-gray-300',
    icon: CheckCircle2,
  },
}

const SIZE_CLASSES = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-xs px-2.5 py-1 gap-1.5',
  lg: 'text-sm px-3 py-1.5 gap-2',
}

export function SOSStatusBadge({ status, size = 'md', animated = false }: SOSStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG['active']
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full border',
        config.bgClass,
        config.textClass,
        config.borderClass,
        SIZE_CLASSES[size]
      )}
    >
      {animated && status === 'active' ? (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
        </span>
      ) : (
        <Icon className={cn('flex-shrink-0', size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
      )}
      {config.label}
    </span>
  )
}
