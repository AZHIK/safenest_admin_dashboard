import { IncidentReport } from '@/types'
import { Calendar, MapPin, Phone, User, Hash, Shield, FileText } from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/utils'
import { ReportStatusBadge } from './ReportStatusBadge'

const REPORT_TYPE_LABELS: Record<string, string> = {
  assault:          'Assault',
  harassment:       'Harassment',
  domestic_violence:'Domestic Violence',
  stalking:         'Stalking',
  threat:           'Threat',
  other:            'Other',
}

const REPORT_TYPE_COLORS: Record<string, string> = {
  assault:          'bg-red-100 text-red-700',
  harassment:       'bg-orange-100 text-orange-700',
  domestic_violence:'bg-purple-100 text-purple-700',
  stalking:         'bg-pink-100 text-pink-700',
  threat:           'bg-amber-100 text-amber-700',
  other:            'bg-gray-100 text-gray-700',
}

interface ReportDetailsCardProps {
  report: IncidentReport
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: any
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <div className="p-1.5 bg-slate-100 rounded-md flex-shrink-0 mt-0.5">
        <Icon className="h-3.5 w-3.5 text-slate-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">{label}</p>
        <div className="text-sm text-slate-800 font-medium mt-0.5">{value}</div>
      </div>
    </div>
  )
}

export function ReportDetailsCard({ report }: ReportDetailsCardProps) {
  const typeColor = REPORT_TYPE_COLORS[report.report_type] ?? 'bg-gray-100 text-gray-700'
  const typeLabel = REPORT_TYPE_LABELS[report.report_type] ?? report.report_type

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Card Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-slate-200">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${typeColor}`}>
                {typeLabel}
              </span>
              <ReportStatusBadge status={report.status} size="sm" />
            </div>
            <h3 className="text-base font-bold text-slate-900">{report.report_number}</h3>
          </div>
          {report.is_anonymous && (
            <div className="flex items-center gap-1 text-xs text-slate-500 bg-white border border-slate-200 rounded-full px-2.5 py-1">
              <Shield className="h-3.5 w-3.5" />
              Anonymous
            </div>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="px-5 py-1">
        <DetailRow
          icon={Hash}
          label="Report Number"
          value={report.report_number}
        />
        <DetailRow
          icon={FileText}
          label="Incident Type"
          value={
            <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${typeColor}`}>
              {typeLabel}
            </span>
          }
        />
        {report.incident_date && (
          <DetailRow
            icon={Calendar}
            label="Incident Date"
            value={formatDate(report.incident_date)}
          />
        )}
        {report.incident_address && (
          <DetailRow
            icon={MapPin}
            label="Location"
            value={report.incident_address}
          />
        )}
        <DetailRow
          icon={report.is_anonymous ? Shield : User}
          label="Reporter"
          value={report.is_anonymous ? 'Anonymous (identity protected)' : report.user?.phone_number ?? 'Unknown'}
        />
        {!report.is_anonymous && report.user?.phone_number && (
          <DetailRow
            icon={Phone}
            label="Contact"
            value={report.user.phone_number}
          />
        )}
        <DetailRow
          icon={Calendar}
          label="Submitted"
          value={formatDateTime(report.created_at)}
        />
        {report.updated_at && (
          <DetailRow
            icon={Calendar}
            label="Last Updated"
            value={formatDateTime(report.updated_at)}
          />
        )}
      </div>
    </div>
  )
}
