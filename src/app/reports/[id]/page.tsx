'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ReportDetailsCard } from '@/components/reports/ReportDetailsCard'
import { ReportStatusBadge } from '@/components/reports/ReportStatusBadge'
import { ReportTimeline } from '@/components/reports/ReportTimeline'
import { ReportEvidenceViewer } from '@/components/reports/ReportEvidenceViewer'
import { IncidentReport, ReportStatus } from '@/types'
import { reportService } from '@/services/report-service'
import { useAuthStore } from '@/store/auth-store'
import {
  ArrowLeft, FileText, MessageSquare, UserCheck,
  Loader2, ChevronDown, PlusCircle, Save
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const MOCK_REPORT: IncidentReport = {
  id: 'rpt-001', report_number: 'RPT-2024-001', report_type: 'assault',
  status: 'under_review', is_anonymous: false,
  incident_date: new Date(Date.now() - 86400000).toISOString(),
  incident_latitude: 40.7128, incident_longitude: -74.006,
  incident_address: '123 Main St, New York, NY',
  encryption_metadata: null,
  created_at: new Date(Date.now() - 86400000).toISOString(),
  updated_at: new Date(Date.now() - 3600000).toISOString(),
  client_created_at: null, offline_id: null,
  user: { id: 'u1', phone_number: '+1 (212) 555-0101', country_code: 'US',
    is_anonymous: false, is_verified: true, language_preference: 'en',
    status: 'active', last_login_at: null, created_at: new Date().toISOString() },
  evidence_files: [
    { id: 'ev1', report_id: 'rpt-001', file_type: 'image', mime_type: 'image/jpeg',
      file_size_bytes: 2048000, storage_path: '/secure/ev1.jpg', encryption_metadata: null,
      file_hash_sha256: 'abc123', has_gps_metadata: true, processing_status: 'completed',
      virus_scan_status: 'clean', uploaded_at: new Date(Date.now() - 80000000).toISOString(),
      thumbnail_path: null, offline_id: null },
    { id: 'ev2', report_id: 'rpt-001', file_type: 'audio', mime_type: 'audio/mpeg',
      file_size_bytes: 512000, storage_path: '/secure/ev2.mp3', encryption_metadata: null,
      file_hash_sha256: 'def456', has_gps_metadata: false, processing_status: 'completed',
      virus_scan_status: 'clean', uploaded_at: new Date(Date.now() - 79000000).toISOString(),
      thumbnail_path: null, offline_id: null },
  ],
}

export default function ReportDetailPage() {
  const params = useParams()
  const reportId = params.id as string

  const [report, setReport] = useState<IncidentReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [noteText, setNoteText] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [notes, setNotes] = useState<{ text: string; time: string }[]>([])

  const { hasPermission } = useAuthStore()
  const canReview   = hasPermission('reports.review')
  const canResolve  = hasPermission('reports.resolve')
  const canEvidence = hasPermission('evidence.view')

  useEffect(() => {
    const load = async () => {
      try { setReport(await reportService.getReport(reportId)) }
      catch { setReport({ ...MOCK_REPORT, id: reportId }) }
      finally { setLoading(false) }
    }
    load()
  }, [reportId])

  const handleStatusChange = async (status: ReportStatus) => {
    if (!report) return
    try { await reportService.updateReportStatus(report.id, status) } catch {}
    setReport({ ...report, status, updated_at: new Date().toISOString() })
  }

  const handleAddNote = async () => {
    if (!noteText.trim()) return
    setSavingNote(true)
    await new Promise(r => setTimeout(r, 500))
    setNotes(prev => [{ text: noteText.trim(), time: new Date().toISOString() }, ...prev])
    setNoteText('')
    setSavingNote(false)
  }

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    </DashboardLayout>
  )

  if (!report) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <FileText className="h-10 w-10 text-gray-300" />
        <p className="text-gray-600">Report not found</p>
        <Link href="/reports" className="text-sm text-indigo-600 hover:underline">← Back to Reports</Link>
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div className="space-y-5 max-w-5xl">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link href="/reports" className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-medium">
            <ArrowLeft className="h-4 w-4" />Incident Reports
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600 font-mono text-xs">{report.report_number}</span>
        </div>

        {/* Page Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 rounded-xl px-6 py-5 shadow-md text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-white/10 rounded-lg flex-shrink-0">
                <FileText className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <ReportStatusBadge status={report.status} />
                </div>
                <h1 className="text-xl font-bold">{report.report_number}</h1>
                <p className="text-indigo-200 text-sm mt-0.5 capitalize">
                  {report.report_type.replace(/_/g, ' ')} · Submitted {new Date(report.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Status Change */}
            {canReview && (
              <div className="relative flex-shrink-0">
                <select
                  value={report.status}
                  onChange={e => handleStatusChange(e.target.value as ReportStatus)}
                  className="appearance-none pl-3 pr-8 py-2 text-sm bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-white/30 hover:bg-white/20 transition-colors"
                >
                  <option value="new" className="text-gray-900 bg-white">New</option>
                  <option value="under_review" className="text-gray-900 bg-white">Under Review</option>
                  {canResolve && <option value="resolved" className="text-gray-900 bg-white">Resolved</option>}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70 pointer-events-none" />
              </div>
            )}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left: Details + Evidence + Notes */}
          <div className="lg:col-span-2 space-y-5">

            {/* Report Details */}
            <ReportDetailsCard report={report} />

            {/* Evidence */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
                <FileText className="h-4 w-4 text-gray-500" />
                <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Evidence Files</h2>
                <span className="ml-auto text-xs text-gray-400">{report.evidence_files?.length ?? 0} file(s)</span>
              </div>
              <div className="p-5">
                <ReportEvidenceViewer files={report.evidence_files} canView={canEvidence} />
              </div>
            </div>

            {/* Internal Notes */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
                <MessageSquare className="h-4 w-4 text-gray-500" />
                <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Internal Notes</h2>
              </div>
              <div className="p-5 space-y-4">
                {canReview && (
                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                      placeholder="Add an internal note visible only to stakeholders…"
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder:text-gray-400"
                    />
                    <button
                      onClick={handleAddNote}
                      disabled={!noteText.trim() || savingNote}
                      className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      {savingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlusCircle className="h-4 w-4" />}
                      Add Note
                    </button>
                  </div>
                )}
                {notes.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-4">No notes yet</p>
                ) : (
                  <div className="space-y-3">
                    {notes.map((n, i) => (
                      <div key={i} className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                        <p className="text-sm text-gray-800">{n.text}</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(n.time).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Timeline + Assign */}
          <div className="space-y-5">
            {/* Timeline */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
                <FileText className="h-4 w-4 text-gray-500" />
                <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Report Timeline</h2>
              </div>
              <div className="p-5">
                <ReportTimeline report={report} />
              </div>
            </div>

            {/* Assign Officer */}
            {canReview && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-gray-100 bg-indigo-50">
                  <UserCheck className="h-4 w-4 text-indigo-500" />
                  <h2 className="text-xs font-bold text-indigo-700 uppercase tracking-wide">Assign Officer</h2>
                </div>
                <div className="p-5 space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 font-medium block mb-1">Select Officer</label>
                    <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                      <option value="">— Unassigned —</option>
                      <option value="of1">Officer Jane Smith</option>
                      <option value="of2">Officer Mark Johnson</option>
                      <option value="of3">Counselor Aisha Patel</option>
                      <option value="of4">Legal Officer David Kim</option>
                    </select>
                  </div>
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
                    <Save className="h-4 w-4" />
                    Save Assignment
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
