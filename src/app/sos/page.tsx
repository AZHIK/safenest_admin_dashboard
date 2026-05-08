'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { SOSAlertCard } from '@/components/sos/SOSAlertCard'
import { SOSStatusBadge } from '@/components/sos/SOSStatusBadge'
import { SOSMapPanel } from '@/components/sos/SOSMapPanel'
import { SOSQuickActions } from '@/components/sos/SOSQuickActions'
import { SOSAlert } from '@/types'
import { SOSService } from '@/services/sos-service'
import { useAuthStore } from '@/store/auth-store'
import {
  AlertTriangle, Search, Filter, Radio,
  Phone, Users, Clock, Activity, RefreshCw, ExternalLink
} from 'lucide-react'
import { formatDateTime, getRelativeTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import Link from 'next/link'

// ─── Filter Tabs ─────────────────────────────────────────────────────────────
const STATUS_FILTERS = [
  { key: 'all',      label: 'All Alerts' },
  { key: 'active',   label: 'Active' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'escalated',label: 'Escalated' },
  { key: 'resolved', label: 'Resolved' },
]

const STATUS_FILTER_COLORS: Record<string, string> = {
  all:       'bg-gray-800 text-white',
  active:    'bg-red-600 text-white',
  assigned:  'bg-amber-500 text-white',
  escalated: 'bg-orange-600 text-white',
  resolved:  'bg-green-600 text-white',
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function SOSMonitorPage() {
  const [alerts, setAlerts] = useState<SOSAlert[]>([])
  const [selectedAlert, setSelectedAlert] = useState<SOSAlert | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [lastRefreshed, setLastRefreshed] = useState(new Date())
  const [loading, setLoading] = useState(false)

  const { hasPermission } = useAuthStore()
  const canAssign   = hasPermission('sos.assign')
  const canEscalate = hasPermission('sos.escalate')

  // Fetch live data
  const fetchAlerts = async () => {
    setLoading(true)
    try {
      const data = await SOSService.getActiveAlerts()
      setAlerts(data || [])
      
      // Update selected alert if it exists in the new data
      if (selectedAlert) {
        const updated = data.find(a => a.id === selectedAlert.id)
        if (updated) setSelectedAlert(updated)
      }
    } catch (error) {
      console.error('Failed to fetch SOS alerts:', error)
    } finally {
      setLoading(false)
      setLastRefreshed(new Date())
    }
  }

  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 30000)
    return () => clearInterval(interval)
  }, [])

  // ── Stats ──────────────────────────────────────────────────────────────────
  const activeCount   = alerts.filter(a => a.status === 'active').length
  const assignedCount = alerts.filter(a => a.status === 'assigned').length
  const escalatedCount= alerts.filter(a => a.status === 'escalated').length
  const resolvedCount = alerts.filter(a => a.status === 'resolved').length

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filteredAlerts = alerts.filter(alert => {
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter
    const q = searchTerm.toLowerCase()
    const matchesSearch = !q ||
      alert.message?.toLowerCase().includes(q) ||
      alert.initial_address?.toLowerCase().includes(q) ||
      alert.user?.phone_number?.includes(q) ||
      alert.id.toLowerCase().includes(q)
    return matchesStatus && matchesSearch
  })

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleUpdateStatus = async (alert: SOSAlert, status: SOSAlert['status']) => {
    try {
      const updated = await SOSService.updateSOSStatus(alert.id, { status })
      setAlerts(prev => prev.map(a => a.id === alert.id ? updated : a))
      if (selectedAlert?.id === alert.id) setSelectedAlert(updated)
    } catch (error) {
      console.error('Failed to update alert status:', error)
    }
  }

  const handleAssign  = (alert: SOSAlert) => handleUpdateStatus(alert, 'assigned')
  const handleEscalate= (alert: SOSAlert) => handleUpdateStatus(alert, 'escalated')
  const handleResolve = (alert: SOSAlert) => handleUpdateStatus(alert, 'resolved')

  return (
    <DashboardLayout>
      <div className="space-y-5">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-red-700 to-red-900 rounded-xl px-6 py-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-white/10 rounded-lg">
                <AlertTriangle className="h-7 w-7 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">SOS Monitor</h1>
                  <span className="flex items-center gap-1.5 bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                    </span>
                    LIVE
                  </span>
                </div>
                <p className="text-red-200 text-sm mt-0.5">
                  Real-time emergency alert tracking &amp; response coordination
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-red-300 text-xs">
                Updated {getRelativeTime(lastRefreshed.toISOString())}
              </span>
              <button
                onClick={fetchAlerts}
                disabled={loading}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-sm px-3 py-1.5 rounded-lg transition-colors"
              >
                <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* ── Stats Bar ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Alerts',    value: activeCount,    color: 'border-red-500',    textColor: 'text-red-600',    bg: 'bg-red-50',    icon: AlertTriangle },
            { label: 'Assigned',         value: assignedCount,  color: 'border-amber-500',  textColor: 'text-amber-600',  bg: 'bg-amber-50',  icon: Users },
            { label: 'Escalated',        value: escalatedCount, color: 'border-orange-500', textColor: 'text-orange-600', bg: 'bg-orange-50', icon: Activity },
            { label: 'Resolved Today',   value: resolvedCount,  color: 'border-green-500',  textColor: 'text-green-600',  bg: 'bg-green-50',  icon: Clock },
          ].map(stat => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className={cn('rounded-xl border-l-4 p-4 shadow-sm', stat.bg, stat.color)}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={cn('text-2xl font-bold', stat.textColor)}>{stat.value}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{stat.label}</p>
                  </div>
                  <Icon className={cn('h-6 w-6 opacity-50', stat.textColor)} />
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Main Content ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left: Alert List */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Search + Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by message, address, or phone…"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {STATUS_FILTERS.map(f => (
                    <button
                      key={f.key}
                      onClick={() => setStatusFilter(f.key)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                        statusFilter === f.key
                          ? STATUS_FILTER_COLORS[f.key]
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Alert Cards */}
            <div className="space-y-3 max-h-[calc(100vh-360px)] overflow-y-auto pr-1">
              {filteredAlerts.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <Radio className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No alerts match your filters</p>
                </div>
              ) : (
                filteredAlerts.map(alert => (
                  <SOSAlertCard
                    key={alert.id}
                    alert={alert}
                    isSelected={selectedAlert?.id === alert.id}
                    onClick={setSelectedAlert}
                    onAssign={handleAssign}
                    onEscalate={handleEscalate}
                    onResolve={handleResolve}
                    canAssign={canAssign}
                    canEscalate={canEscalate}
                  />
                ))
              )}
            </div>
          </div>

          {/* Right: Detail Panel */}
          <div className="lg:col-span-1">
            {selectedAlert ? (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm sticky top-4">
                {/* Panel Header */}
                <div className={cn(
                  'px-5 py-4 rounded-t-xl border-b border-gray-100',
                  selectedAlert.status === 'active' ? 'bg-red-50' :
                  selectedAlert.status === 'escalated' ? 'bg-orange-50' :
                  selectedAlert.status === 'assigned' ? 'bg-amber-50' : 'bg-gray-50'
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <SOSStatusBadge status={selectedAlert.status} animated={selectedAlert.status === 'active'} />
                    <Link
                      href={`/sos/${selectedAlert.id}`}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900"
                    >
                      Full Details <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 leading-snug">
                    {selectedAlert.message ?? 'No message provided'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Alert ID: {selectedAlert.id} · {getRelativeTime(selectedAlert.created_at)}
                  </p>
                </div>

                <div className="p-5 space-y-5 max-h-[calc(100vh-300px)] overflow-y-auto">

                  {/* Survivor Info */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                      Survivor Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Phone</span>
                        <span className="font-medium text-gray-900 flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 text-gray-400" />
                          {selectedAlert.user?.phone_number ?? 'Anonymous'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Verified</span>
                        <span className="font-medium text-gray-900">
                          {selectedAlert.user?.is_verified ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Contacts Notified</span>
                        <span className="font-medium text-gray-900 flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-gray-400" />
                          {selectedAlert.contacts_notified}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Alert Type</span>
                        <span className="font-medium text-gray-900 capitalize">
                          {selectedAlert.alert_type}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Severity</span>
                        <span className="font-medium text-gray-900 capitalize">
                          {selectedAlert.severity}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                      Live Location
                    </h3>
                    <SOSMapPanel
                      latitude={selectedAlert.initial_latitude}
                      longitude={selectedAlert.initial_longitude}
                      address={selectedAlert.initial_address}
                      accuracy={selectedAlert.initial_accuracy}
                      recentLocations={selectedAlert.recent_locations}
                    />
                  </div>

                  {/* Timeline */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                      Alert Timeline
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-1 border-b border-gray-50">
                        <span className="text-gray-500">Alert Triggered</span>
                        <span className="text-gray-700 text-xs">{formatDateTime(selectedAlert.created_at)}</span>
                      </div>
                      {selectedAlert.recent_locations?.map((loc, i) => (
                        <div key={loc.id} className="flex justify-between py-1 border-b border-gray-50">
                          <span className="text-gray-500">Location Ping {i + 1}</span>
                          <span className="text-gray-700 text-xs">{formatDateTime(loc.recorded_at)}</span>
                        </div>
                      ))}
                      {selectedAlert.updated_at && (
                        <div className="flex justify-between py-1">
                          <span className="text-gray-500">Last Update</span>
                          <span className="text-gray-700 text-xs">{formatDateTime(selectedAlert.updated_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                      Emergency Actions
                    </h3>
                    <SOSQuickActions
                      alert={selectedAlert}
                      onAssign={handleAssign}
                      onEscalate={handleEscalate}
                      onResolve={handleResolve}
                      variant="panel"
                      canAssign={canAssign}
                      canEscalate={canEscalate}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                <AlertTriangle className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Select an alert</p>
                <p className="text-xs text-gray-400 mt-1">Click any alert to view details and take action</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </DashboardLayout>
  )
}
