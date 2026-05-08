'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { SOSStatusBadge } from '@/components/sos/SOSStatusBadge'
import { SOSMapPanel } from '@/components/sos/SOSMapPanel'
import { SOSQuickActions } from '@/components/sos/SOSQuickActions'
import { SOSAlert } from '@/types'
import { SOSService } from '@/services/sos-service'
import { useAuthStore } from '@/store/auth-store'
import { ArrowLeft, AlertTriangle, Phone, Users, Clock, Radio, Zap, Activity } from 'lucide-react'
import { formatDateTime, getRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const FALLBACK_ALERT: SOSAlert = {
  id: 'sos-001', user_id: 'u1', status: 'active', alert_type: 'manual', severity: 'critical',
  initial_latitude: 40.7128, initial_longitude: -74.006, initial_accuracy: 8,
  initial_address: '123 Main St, New York, NY 10001',
  message: 'Emergency — Immediate assistance needed.',
  contacts_notified: 3,
  created_at: new Date(Date.now() - 4 * 60000).toISOString(),
  updated_at: null, client_created_at: null, offline_id: null,
  user: { id: 'u1', phone_number: '+1 (212) 555-0101', country_code: 'US',
    is_anonymous: false, is_verified: true, language_preference: 'en',
    status: 'active', last_login_at: new Date().toISOString(), created_at: new Date().toISOString() },
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-gray-50 last:border-0 gap-4">
      <span className="text-sm text-gray-500 flex-shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
    </div>
  )
}

export default function SOSDetailPage() {
  const params = useParams()
  const alertId = params.id as string
  const [alert, setAlert] = useState<SOSAlert | null>(null)
  const [loading, setLoading] = useState(true)
  const { hasPermission } = useAuthStore()

  useEffect(() => {
    const load = async () => {
      try { setAlert(await SOSService.getAlertById(alertId)) }
      catch { setAlert({ ...FALLBACK_ALERT, id: alertId }) }
      finally { setLoading(false) }
    }
    load()
  }, [alertId])

  const updateStatus = (status: SOSAlert['status']) =>
    setAlert(a => a ? { ...a, status, updated_at: new Date().toISOString() } : a)

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <Activity className="h-8 w-8 animate-pulse text-red-400" />
      </div>
    </DashboardLayout>
  )

  if (!alert) return (
    <DashboardLayout>
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <AlertTriangle className="h-10 w-10 text-gray-300" />
        <p className="text-gray-600">Alert not found</p>
        <Link href="/sos" className="text-sm text-red-600 hover:underline">← Back to SOS Monitor</Link>
      </div>
    </DashboardLayout>
  )

  const headerBg = alert.severity === 'critical' ? 'from-red-700 to-red-900'
    : alert.severity === 'high' ? 'from-orange-600 to-orange-800'
    : 'from-amber-600 to-amber-700'

  return (
    <DashboardLayout>
      <div className="space-y-5 max-w-5xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <Link href="/sos" className="flex items-center gap-1.5 text-red-600 hover:text-red-700 font-medium">
            <ArrowLeft className="h-4 w-4" />SOS Monitor
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600 font-mono text-xs">{alert.id}</span>
        </div>

        {/* Emergency Header */}
        <div className={`bg-gradient-to-r ${headerBg} rounded-xl px-6 py-5 shadow-md text-white`}>
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-white/10 rounded-lg flex-shrink-0">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                <SOSStatusBadge status={alert.status} animated={alert.status === 'active'} />
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full capitalize font-semibold">
                  {alert.severity} severity
                </span>
                <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full capitalize">
                  {alert.alert_type} trigger
                </span>
              </div>
              <p className="text-lg font-bold">{alert.message ?? 'No message'}</p>
              <p className="text-sm opacity-70 mt-1">
                Triggered {getRelativeTime(alert.created_at)} · ID: {alert.id}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Details */}
          <div className="lg:col-span-2 space-y-5">
            {/* Survivor Info */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
                <Phone className="h-4 w-4 text-gray-500" />
                <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Survivor Information</h2>
              </div>
              <div className="p-5">
                <InfoRow label="Phone" value={alert.user?.phone_number ?? 'Anonymous'} />
                <InfoRow label="Identity" value={alert.user?.is_anonymous ? 'Anonymous' : 'Identified'} />
                <InfoRow label="Verified" value={alert.user?.is_verified ? '✓ Verified' : 'Unverified'} />
                <InfoRow label="Contacts Notified" value={
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5 text-gray-400" />{alert.contacts_notified}</span>
                } />
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
                <Clock className="h-4 w-4 text-gray-500" />
                <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Alert Timeline</h2>
              </div>
              <div className="p-5 space-y-0">
                {[
                  { label: 'Alert Triggered', time: alert.created_at, dot: 'bg-red-500' },
                  ...(alert.recent_locations ?? []).map((loc, i) => ({
                    label: `Location Ping ${i + 1} — ${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}`,
                    time: loc.recorded_at, dot: 'bg-blue-500',
                  })),
                  ...(alert.updated_at ? [{ label: `Status → ${alert.status}`, time: alert.updated_at, dot: 'bg-amber-500' }] : []),
                ].map((ev, idx, arr) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full mt-0.5 flex-shrink-0 ${ev.dot}`} />
                      {idx < arr.length - 1 && <div className="w-px flex-1 bg-gray-200 my-1 min-h-[16px]" />}
                    </div>
                    <div className={idx < arr.length - 1 ? 'pb-3' : ''}>
                      <p className="text-sm font-medium text-gray-800">{ev.label}</p>
                      <p className="text-xs text-gray-400">{formatDateTime(ev.time)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alert Meta */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
                <Radio className="h-4 w-4 text-gray-500" />
                <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Alert Details</h2>
              </div>
              <div className="p-5">
                <InfoRow label="Alert ID" value={<code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{alert.id}</code>} />
                <InfoRow label="Type" value={<span className="capitalize">{alert.alert_type}</span>} />
                <InfoRow label="Severity" value={<span className="capitalize font-semibold">{alert.severity}</span>} />
                <InfoRow label="Created" value={formatDateTime(alert.created_at)} />
                {alert.updated_at && <InfoRow label="Last Updated" value={formatDateTime(alert.updated_at)} />}
              </div>
            </div>
          </div>

          {/* Right: Map + Actions */}
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-gray-50">
                <Zap className="h-4 w-4 text-gray-500" />
                <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wide">Live Location</h2>
              </div>
              <div className="p-5">
                <SOSMapPanel latitude={alert.initial_latitude} longitude={alert.initial_longitude}
                  address={alert.initial_address} accuracy={alert.initial_accuracy}
                  recentLocations={alert.recent_locations} />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-gray-100 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <h2 className="text-xs font-bold text-red-600 uppercase tracking-wide">Emergency Actions</h2>
              </div>
              <div className="p-5">
                <SOSQuickActions
                  alert={alert}
                  onAssign={async () => {
                    const updated = await SOSService.updateSOSStatus(alert.id, { status: 'assigned' })
                    setAlert(updated)
                  }}
                  onEscalate={async () => {
                    const updated = await SOSService.updateSOSStatus(alert.id, { status: 'escalated' })
                    setAlert(updated)
                  }}
                  onResolve={async () => {
                    const updated = await SOSService.updateSOSStatus(alert.id, { status: 'resolved' })
                    setAlert(updated)
                  }}
                  variant="panel"
                  canAssign={hasPermission('sos.assign')}
                  canEscalate={hasPermission('sos.escalate')}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
