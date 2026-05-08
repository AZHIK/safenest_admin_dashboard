'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ReportStatusBadge } from '@/components/reports/ReportStatusBadge'
import { IncidentReport, ReportStatus, ReportType } from '@/types'
import { reportService } from '@/services/report-service'
import { useAuthStore } from '@/store/auth-store'
import {
  FileText, Search, Filter, Eye, MoreHorizontal,
  Calendar, MapPin, Phone, User, Shield, ChevronDown,
  Loader2, ClipboardList
} from 'lucide-react'
import { formatDate, getRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import Link from 'next/link'

// ── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_REPORTS: IncidentReport[] = [
  {
    id: 'rpt-001', report_number: 'RPT-2024-001', report_type: 'assault',
    status: 'under_review', is_anonymous: false,
    incident_date: new Date(Date.now() - 86400000).toISOString(),
    incident_latitude: 40.7128, incident_longitude: -74.006,
    incident_address: '123 Main St, New York, NY',
    encryption_metadata: null, created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
    client_created_at: null, offline_id: null,
    user: { id: 'u1', phone_number: '+1 (212) 555-0101', country_code: 'US',
      is_anonymous: false, is_verified: true, language_preference: 'en',
      status: 'active', last_login_at: null, created_at: new Date().toISOString() },
    evidence_files: [],
  },
  {
    id: 'rpt-002', report_number: 'RPT-2024-002', report_type: 'domestic_violence',
    status: 'new', is_anonymous: true,
    incident_date: new Date(Date.now() - 172800000).toISOString(),
    incident_latitude: 40.7589, incident_longitude: -73.985,
    incident_address: '456 Broadway, New York, NY',
    encryption_metadata: null, created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: null, client_created_at: null, offline_id: null,
    evidence_files: [],
  },
  {
    id: 'rpt-003', report_number: 'RPT-2024-003', report_type: 'harassment',
    status: 'new', is_anonymous: false,
    incident_date: new Date(Date.now() - 259200000).toISOString(),
    incident_latitude: 40.7489, incident_longitude: -73.968,
    incident_address: '789 5th Ave, New York, NY',
    encryption_metadata: null, created_at: new Date(Date.now() - 259200000).toISOString(),
    updated_at: null, client_created_at: null, offline_id: null,
    user: { id: 'u3', phone_number: '+1 (347) 555-0133', country_code: 'US',
      is_anonymous: false, is_verified: true, language_preference: 'en',
      status: 'active', last_login_at: null, created_at: new Date().toISOString() },
    evidence_files: [],
  },
  {
    id: 'rpt-004', report_number: 'RPT-2024-004', report_type: 'stalking',
    status: 'resolved', is_anonymous: false,
    incident_date: new Date(Date.now() - 604800000).toISOString(),
    incident_latitude: 40.7061, incident_longitude: -74.009,
    incident_address: '321 Wall St, New York, NY',
    encryption_metadata: null, created_at: new Date(Date.now() - 604800000).toISOString(),
    updated_at: new Date(Date.now() - 172800000).toISOString(),
    client_created_at: null, offline_id: null,
    user: { id: 'u4', phone_number: '+1 (718) 555-0144', country_code: 'US',
      is_anonymous: false, is_verified: true, language_preference: 'en',
      status: 'active', last_login_at: null, created_at: new Date().toISOString() },
    evidence_files: [],
  },
  {
    id: 'rpt-005', report_number: 'RPT-2024-005', report_type: 'threat',
    status: 'under_review', is_anonymous: true,
    incident_date: new Date(Date.now() - 432000000).toISOString(),
    incident_latitude: 40.7306, incident_longitude: -73.935,
    incident_address: '654 Park Ave, Brooklyn, NY',
    encryption_metadata: null, created_at: new Date(Date.now() - 432000000).toISOString(),
    updated_at: new Date(Date.now() - 10800000).toISOString(),
    client_created_at: null, offline_id: null,
    evidence_files: [],
  },
]

// ── Constants ─────────────────────────────────────────────────────────────────
const TYPE_LABELS: Record<string, string> = {
  assault: 'Assault', harassment: 'Harassment',
  domestic_violence: 'Domestic Violence', stalking: 'Stalking',
  threat: 'Threat', other: 'Other',
}

const TYPE_COLORS: Record<string, string> = {
  assault: 'bg-red-100 text-red-700',
  harassment: 'bg-orange-100 text-orange-700',
  domestic_violence: 'bg-purple-100 text-purple-700',
  stalking: 'bg-pink-100 text-pink-700',
  threat: 'bg-amber-100 text-amber-700',
  other: 'bg-gray-100 text-gray-700',
}

const STATUS_TABS = [
  { key: 'all', label: 'All Reports' },
  { key: 'new', label: 'New' },
  { key: 'under_review', label: 'Under Review' },
  { key: 'resolved', label: 'Resolved' },
]

// ── Component ─────────────────────────────────────────────────────────────────
export default function IncidentReportsPage() {
  const [reports, setReports] = useState<IncidentReport[]>([])
  const [loading, setLoading] = useState(true)
  const [statusTab, setStatusTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')

  const { hasPermission } = useAuthStore()

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const data = await reportService.listReports()
        setReports(data || [])
      } catch {
        setReports(MOCK_REPORTS)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  // Stats
  const totalCount      = reports.length
  const newCount        = reports.filter(r => r.status === 'new').length
  const underReviewCount= reports.filter(r => ['under_review', 'intervention_active', 'legal_followup'].includes(r.status)).length
  const resolvedCount   = reports.filter(r => r.status === 'resolved').length

  // Filter
  const filtered = reports.filter(r => {
    const matchesTab = statusTab === 'all' ||
      (statusTab === 'under_review' ? ['under_review','intervention_active','legal_followup'].includes(r.status) : r.status === statusTab)
    const matchesType = typeFilter === 'all' || r.report_type === typeFilter
    const q = searchQuery.toLowerCase()
    const matchesSearch = !q ||
      r.report_number.toLowerCase().includes(q) ||
      r.incident_address?.toLowerCase().includes(q) ||
      r.user?.phone_number?.includes(q)
    return matchesTab && matchesType && matchesSearch
  })

  const handleStatusChange = async (report: IncidentReport, status: ReportStatus) => {
    try {
      await reportService.updateReportStatus(report.id, status)
    } catch {}
    setReports(prev => prev.map(r => r.id === report.id ? { ...r, status, updated_at: new Date().toISOString() } : r))
  }

  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 rounded-xl px-6 py-5 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-white/10 rounded-lg">
              <FileText className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Incident Reports</h1>
              <p className="text-indigo-200 text-sm mt-0.5">
                Secure documentation, evidence review &amp; report management
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Reports',  value: totalCount,       color: 'border-slate-400',  text: 'text-slate-700',  bg: 'bg-slate-50' },
            { label: 'New',            value: newCount,         color: 'border-blue-500',   text: 'text-blue-700',   bg: 'bg-blue-50' },
            { label: 'Under Review',   value: underReviewCount, color: 'border-amber-500',  text: 'text-amber-700',  bg: 'bg-amber-50' },
            { label: 'Resolved',       value: resolvedCount,    color: 'border-green-500',  text: 'text-green-700',  bg: 'bg-green-50' },
          ].map(s => (
            <div key={s.label} className={cn('rounded-xl border-l-4 p-4 shadow-sm', s.bg, s.color)}>
              <p className={cn('text-2xl font-bold', s.text)}>{loading ? '—' : s.value}</p>
              <p className="text-xs text-gray-600 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by report #, address, or phone…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="all">All Categories</option>
                {Object.entries(TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex gap-1.5 mt-3 flex-wrap">
            {STATUS_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setStatusTab(tab.key)}
                className={cn(
                  'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  statusTab === tab.key
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-indigo-500" />
              <h2 className="text-sm font-bold text-gray-700">
                Reports <span className="text-gray-400 font-normal ml-1">({filtered.length})</span>
              </h2>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center text-gray-400">
              <FileText className="h-10 w-10 mb-3 text-gray-200" />
              <p className="font-medium text-gray-500">No reports found</p>
              <p className="text-xs mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Report #', 'Category', 'Status', 'Reporter', 'Location', 'Submitted', 'Actions'].map(h => (
                      <th key={h} className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(report => (
                    <tr key={report.id} className="border-b border-gray-50 hover:bg-indigo-50/30 transition-colors">
                      <td className="py-3 px-4">
                        <span className="text-sm font-semibold text-gray-900 font-mono">
                          {report.report_number}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full', TYPE_COLORS[report.report_type] ?? 'bg-gray-100 text-gray-700')}>
                          {TYPE_LABELS[report.report_type] ?? report.report_type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <ReportStatusBadge status={report.status} size="sm" />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-700">
                          {report.is_anonymous
                            ? <><Shield className="h-3.5 w-3.5 text-gray-400" /><span className="text-gray-400 italic">Anonymous</span></>
                            : report.user?.phone_number
                              ? <><Phone className="h-3.5 w-3.5 text-gray-400" />{report.user.phone_number}</>
                              : <><User className="h-3.5 w-3.5 text-gray-400" />Unknown</>
                          }
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
                          <span className="truncate max-w-[140px]">
                            {report.incident_address ?? 'Not provided'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-3.5 w-3.5 text-gray-300" />
                          {formatDate(report.created_at)}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{getRelativeTime(report.created_at)}</p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/reports/${report.id}`}
                            className="p-1.5 rounded-md text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="View Report"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          {hasPermission('reports.review') && (
                            <select
                              value={report.status}
                              onChange={e => handleStatusChange(report, e.target.value as ReportStatus)}
                              className="text-xs border border-gray-200 rounded px-1.5 py-1 text-gray-600 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            >
                              <option value="new">New</option>
                              <option value="under_review">Under Review</option>
                              <option value="resolved">Resolved</option>
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
