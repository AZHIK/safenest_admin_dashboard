import { IncidentReport, ReportStatus } from '@/types'
import { formatDateTime } from '@/lib/utils'
import { CheckCircle2, Clock, FileText, UserCheck, AlertCircle, PlusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimelineEvent {
  id: string
  type: 'submitted' | 'reviewed' | 'assigned' | 'status_change' | 'note' | 'resolved'
  label: string
  timestamp: string
  description?: string
}

interface ReportTimelineProps {
  report: IncidentReport
  extraEvents?: TimelineEvent[]
}

const EVENT_CONFIG: Record<string, {
  icon: any
  iconBg: string
  iconColor: string
}> = {
  submitted:     { icon: PlusCircle, iconBg: 'bg-blue-100',   iconColor: 'text-blue-600' },
  reviewed:      { icon: Clock,       iconBg: 'bg-amber-100',  iconColor: 'text-amber-600' },
  assigned:      { icon: UserCheck,   iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600' },
  status_change: { icon: AlertCircle, iconBg: 'bg-orange-100', iconColor: 'text-orange-600' },
  note:          { icon: FileText,    iconBg: 'bg-slate-100',  iconColor: 'text-slate-600' },
  resolved:      { icon: CheckCircle2,iconBg: 'bg-green-100',  iconColor: 'text-green-600' },
}

function buildTimelineFromReport(report: IncidentReport): TimelineEvent[] {
  const events: TimelineEvent[] = []

  // Submission event
  events.push({
    id: 'submitted',
    type: 'submitted',
    label: 'Report Submitted',
    timestamp: report.created_at,
    description: `Report ${report.report_number} received from ${report.is_anonymous ? 'anonymous survivor' : 'survivor'}`,
  })

  // Status-based events
  if (report.status !== 'new') {
    events.push({
      id: 'review-start',
      type: 'reviewed',
      label: 'Review Started',
      timestamp: report.updated_at ?? report.created_at,
      description: 'Report assigned to review queue',
    })
  }

  if (report.status === 'resolved') {
    events.push({
      id: 'resolved',
      type: 'resolved',
      label: 'Report Resolved',
      timestamp: report.updated_at ?? report.created_at,
      description: 'Report marked as resolved',
    })
  }

  if (report.status === 'escalated') {
    events.push({
      id: 'escalated',
      type: 'status_change',
      label: 'Escalated',
      timestamp: report.updated_at ?? report.created_at,
      description: 'Report escalated for priority handling',
    })
  }

  return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
}

export function ReportTimeline({ report, extraEvents = [] }: ReportTimelineProps) {
  const baseEvents = buildTimelineFromReport(report)
  const allEvents = [...baseEvents, ...extraEvents].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  return (
    <div className="space-y-1">
      {allEvents.map((event, idx) => {
        const config = EVENT_CONFIG[event.type] ?? EVENT_CONFIG['status_change']
        const Icon = config.icon
        const isLast = idx === allEvents.length - 1

        return (
          <div key={event.id} className="flex gap-3">
            {/* Icon + Connector */}
            <div className="flex flex-col items-center">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                config.iconBg
              )}>
                <Icon className={cn('h-4 w-4', config.iconColor)} />
              </div>
              {!isLast && (
                <div className="w-px flex-1 bg-slate-200 mt-1 mb-1 min-h-[16px]" />
              )}
            </div>

            {/* Content */}
            <div className={cn('pb-4 flex-1', isLast && 'pb-0')}>
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-sm font-semibold text-slate-800">{event.label}</p>
                <span className="text-xs text-slate-400 flex-shrink-0">
                  {formatDateTime(event.timestamp)}
                </span>
              </div>
              {event.description && (
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  {event.description}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
