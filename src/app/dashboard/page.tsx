'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { AlertTriangle, Users, FileText, Activity, Clock, MapPin, Phone, Shield } from 'lucide-react'
import { formatDateTime, getRelativeTime } from '@/lib/utils'
import Link from 'next/link'

// Types
import { DashboardService, DashboardStats } from '@/services/dashboard-service'
import { SOSService } from '@/services/sos-service'
import { caseService } from '@/services/case-service'
import { operatorService, OperatorUser } from '@/services/operator-service'
import { SOSAlert, IncidentReport } from '@/types'

// Initial loading state
const initialMetrics: DashboardStats = {
  active_sos_alerts: 0,
  pending_reports: 0,
  responders_online: 0,
  average_response_time: 0,
  timestamp: new Date().toISOString()
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardStats>(initialMetrics)
  const [sosAlerts, setSOSAlerts] = useState<SOSAlert[]>([])
  const [recentCases, setRecentCases] = useState<IncidentReport[]>([])
  const [responders, setResponders] = useState<OperatorUser[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDashboardData = async () => {
    try {
      const [stats, alerts, cases, users] = await Promise.all([
        DashboardService.getStats(),
        SOSService.getActiveAlerts(),
        caseService.listCases({ limit: 5 }),
        operatorService.listUsers({ is_active: true, limit: 5 })
      ])
      
      setMetrics(stats)
      setSOSAlerts(alerts)
      setRecentCases(cases)
      setResponders(users.items)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'new':
        return 'bg-emergency-500'
      case 'resolved':
        return 'bg-safe-500'
      case 'under_review':
      case 'intervention_active':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-emergency-600 text-white'
      case 'high':
        return 'bg-red-500 text-white'
      case 'medium':
        return 'bg-yellow-500 text-white'
      case 'low':
        return 'bg-blue-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Command Center</h1>
          <p className="text-gray-600">Real-time emergency response coordination</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emergency-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active SOS Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.active_sos_alerts}</p>
              </div>
              <div className="p-3 bg-emergency-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-emergency-600" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-emergency-600 font-medium">+2 from last hour</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Reports</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.pending_reports}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-yellow-600 font-medium">3 require immediate attention</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Responders Online</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.responders_online}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-green-600 font-medium">All units operational</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.average_response_time}m</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-blue-600 font-medium">-0.8m from yesterday</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live SOS Feed */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Live SOS Feed</h2>
                <p className="text-sm text-gray-600">Real-time emergency alerts</p>
              </div>
              <div className="divide-y divide-gray-200">
                {loading ? (
                  Array(3).fill(0).map((_, i) => (
                    <div key={i} className="p-6 animate-pulse">
                      <div className="h-4 bg-gray-100 rounded w-1/4 mb-4"></div>
                      <div className="h-3 bg-gray-50 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-50 rounded w-1/2"></div>
                    </div>
                  ))
                ) : sosAlerts.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-4 text-gray-200" />
                    <p>No active SOS alerts at this time.</p>
                  </div>
                ) : (
                  sosAlerts.map((alert) => (
                    <div key={alert.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                              {alert.status}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                              {alert.severity}
                            </span>
                            <span className="text-xs text-gray-500">
                              {getRelativeTime(alert.created_at)}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {alert.message}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{alert.initial_address}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Phone className="h-4 w-4" />
                              <span>{alert.user?.phone_number || 'Anonymous'}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span>{alert.contacts_notified} notified</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <Link 
                            href={`/sos?alert=${alert.id}`}
                            className="px-3 py-1 bg-emergency-600 text-white text-sm rounded-md hover:bg-emergency-700 transition-colors"
                          >
                            Respond
                          </Link>
                          <Link 
                            href={`/sos/${alert.id}`}
                            className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition-colors"
                          >
                            Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6 space-y-3">
                <button className="w-full px-4 py-2 bg-emergency-600 text-white rounded-md hover:bg-emergency-700 transition-colors flex items-center justify-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Emergency Broadcast</span>
                </button>
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Assign Responder</span>
                </button>
                <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors flex items-center justify-center space-x-2">
                  <Activity className="h-4 w-4" />
                  <span>Escalate Case</span>
                </button>
                <button className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>Contact Center</span>
                </button>
              </div>
            </div>

            {/* Online Responders */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Online Responders</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {responders.map((responder) => (
                  <div key={responder.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{responder.full_name}</p>
                        <p className="text-xs text-gray-600 capitalize">{responder.roles?.[0] || 'Operator'}</p>
                        <p className="text-xs text-gray-500">
                          Last seen: {responder.last_login ? getRelativeTime(responder.last_login) : 'Never'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          responder.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {responder.is_active ? 'online' : 'offline'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Cases */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Cases</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {recentCases.map((case_) => (
                  <div key={case_.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{case_.report_number}</p>
                        <p className="text-xs text-gray-600 capitalize">{case_.report_type.replace('_', ' ')}</p>
                        <p className="text-xs text-gray-500">{getRelativeTime(case_.created_at)}</p>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(case_.status)}`}>
                        {case_.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
