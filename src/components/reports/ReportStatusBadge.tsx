import { ReportStatus } from '@/types'
import { cn } from '@/lib/utils'
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react'

interface ReportStatusBadgeProps {
  status: ReportStatus
  size?: 'sm' | 'md' | 'lg'
}

const STATUS_CONFIG: Record<string, {
  label: string
  bgClass: string
  textClass: string
  borderClass: string
  icon: any
}> = {
  new: {
    label: 'NEW',
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-200',
    icon: AlertCircle,
  },
  under_review: {
    label: 'UNDER REVIEW',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-200',
    icon: Clock,
  },
  // Group intervention_active and legal_followup under "Under Review" display
  intervention_active: {
    label: 'UNDER REVIEW',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-200',
    icon: Clock,
  },
  legal_followup: {
    label: 'UNDER REVIEW',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-200',
    icon: Clock,
  },
  resolved: {
    label: 'RESOLVED',
    bgClass: 'bg-green-50',
    textClass: 'text-green-700',
    borderClass: 'border-green-200',
    icon: CheckCircle2,
  },
  escalated: {
    label: 'ESCALATED',
    bgClass: 'bg-red-50',
    textClass: 'text-red-700',
    borderClass: 'border-red-200',
    icon: AlertCircle,
  },
}

const SIZE_CLASSES = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-xs px-2.5 py-1 gap-1.5',
  lg: 'text-sm px-3 py-1.5 gap-2',
}

export function ReportStatusBadge({ status, size = 'md' }: ReportStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG['new']
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
      <Icon className={cn('flex-shrink-0', size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5')} />
      {config.label}
    </span>
  )
}
