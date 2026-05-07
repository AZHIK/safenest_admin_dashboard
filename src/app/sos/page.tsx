'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { AlertTriangle, MapPin, Clock, Users, Phone, Activity, Filter, Search } from 'lucide-react'
import { SOSAlert, LocationPing } from '@/types'
import { formatDateTime, getRelativeTime, getStatusColor, getSeverityColor } from '@/lib/utils'

// Mock data - in production this would come from API
const mockSOSAlerts: SOSAlert[] = [
  {
    id: '1',
    user_id: 'user_1',
    status: 'active',
    alert_type: 'manual',
    severity: 'high',
    initial_latitude: 40.7128,
    initial_longitude: -74.0060,
    initial_accuracy: 10,
    initial_address: '123 Main St, New York, NY 10001',
    message: 'Emergency - Need immediate assistance. Threat detected in area.',
    contacts_notified: 3,
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
    updated_at: null,
    client_created_at: new Date(Date.now() - 5 * 60000).toISOString(),
    offline_id: null,
    user: {
      id: 'user_1',
      phone_number: '+1234567890',
      country_code: 'US',
      is_anonymous: false,
      is_verified: true,
      language_preference: 'en',
      status: 'active',
      last_login_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    },
    recent_locations: [
      {
        id: 'loc_1',
        alert_id: '1',
        latitude: 40.7128,
        longitude: -74.0060,
        accuracy: 10,
        altitude: 0,
        speed: 0,
        heading: 0,
        battery_level: 85,
        network_type: 'wifi',
        signal_strength: -65,
        recorded_at: new Date(Date.now() - 5 * 60000).toISOString(),
        received_at: new Date(Date.now() - 5 * 60000).toISOString(),
      },
      {
        id: 'loc_2',
        alert_id: '1',
        latitude: 40.7130,
        longitude: -74.0062,
        accuracy: 12,
        altitude: 0,
        speed: 2,
        heading: 45,
        battery_level: 84,
        network_type: 'wifi',
        signal_strength: -68,
        recorded_at: new Date(Date.now() - 2 * 60000).toISOString(),
        received_at: new Date(Date.now() - 2 * 60000).toISOString(),
      }
    ]
  },
  {
    id: '2',
    user_id: 'user_2',
    status: 'active',
    alert_type: 'timer',
    severity: 'medium',
    initial_latitude: 40.7589,
    initial_longitude: -73.9851,
    initial_accuracy: 15,
    initial_address: '456 Broadway, New York, NY 10013',
    message: 'Timer expired - Please check on me. Safe word not provided.',
    contacts_notified: 2,
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    updated_at: null,
    client_created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    offline_id: null,
    user: {
      id: 'user_2',
      phone_number: '+0987654321',
      country_code: 'US',
      is_anonymous: true,
      is_verified: false,
      language_preference: 'en',
      status: 'inactive',
      last_login_at: null,
      created_at: new Date().toISOString(),
    }
  },
  {
    id: '3',
    user_id: 'user_3',
    status: 'resolved',
    alert_type: 'manual',
    severity: 'critical',
    initial_latitude: 40.7489,
    initial_longitude: -73.9680,
    initial_accuracy: 8,
    initial_address: '789 5th Ave, New York, NY 10019',
    message: 'Immediate danger - Police needed. Intruder detected.',
    contacts_notified: 5,
    created_at: new Date(Date.now() - 120 * 60000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 60000).toISOString(),
    client_created_at: new Date(Date.now() - 120 * 60000).toISOString(),
    offline_id: null,
    user: {
      id: 'user_3',
      phone_number: '+1122334455',
      country_code: 'US',
      is_anonymous: false,
      is_verified: true,
      language_preference: 'en',
      status: 'active',
      last_login_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
    }
  }
]

export default function SOSMonitoringPage() {
  const [sosAlerts, setSOSAlerts] = useState<SOSAlert[]>(mockSOSAlerts)
  const [selectedAlert, setSelectedAlert] = useState<SOSAlert | null>(null)
  const [filter, setFilter] = useState('all') // all, active, resolved
  const [searchTerm, setSearchTerm] = useState('')

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // In production, this would be WebSocket updates
      console.log('Checking for SOS updates...')
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const filteredAlerts = sosAlerts.filter(alert => {
    const matchesFilter = filter === 'all' || alert.status === filter
    const matchesSearch = searchTerm === '' || 
      alert.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.initial_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.user?.phone_number?.includes(searchTerm)
    
    return matchesFilter && matchesSearch
  })

  const activeAlerts = filteredAlerts.filter(alert => alert.status === 'active')
  const resolvedAlerts = filteredAlerts.filter(alert => alert.status === 'resolved')

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SOS Monitoring</h1>
          <p className="text-gray-600">Real-time emergency alert tracking and response coordination</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-emergency-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{activeAlerts.length}</p>
              </div>
              <div className="p-3 bg-emergency-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-emergency-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Severity</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeAlerts.filter(a => a.severity === 'critical').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Activity className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved Today</p>
                <p className="text-2xl font-bold text-gray-900">{resolvedAlerts.length}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filter:</span>
              </div>
              <div className="flex space-x-2">
                {['all', 'active', 'resolved'].map((filterOption) => (
                  <button
                    key={filterOption}
                    onClick={() => setFilter(filterOption)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      filter === filterOption
                        ? 'bg-emergency-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emergency-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* SOS Alerts List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Emergency Alerts</h2>
                <p className="text-sm text-gray-600">
                  {filteredAlerts.length} alert{filteredAlerts.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {filteredAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-6 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedAlert?.id === alert.id ? 'bg-emergency-50' : ''
                    }`}
                    onClick={() => setSelectedAlert(alert)}
                  >
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
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{alert.initial_address}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Phone className="h-4 w-4" />
                            <span>{alert.user?.phone_number || 'Anonymous'}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>Created: {formatDateTime(alert.created_at)}</span>
                          </div>
                          {alert.updated_at && (
                            <div className="flex items-center space-x-1">
                              <Activity className="h-3 w-3" />
                              <span>Updated: {formatDateTime(alert.updated_at)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        <button className="px-3 py-1 bg-emergency-600 text-white text-sm rounded-md hover:bg-emergency-700 transition-colors">
                          Respond
                        </button>
                        <button className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300 transition-colors">
                          Map
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Alert Details Panel */}
          <div className="lg:col-span-1">
            {selectedAlert ? (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Alert Details</h2>
                  <p className="text-sm text-gray-600">ID: {selectedAlert.id}</p>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Status and Severity */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Status Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedAlert.status)}`}>
                          {selectedAlert.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Severity:</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(selectedAlert.severity)}`}>
                          {selectedAlert.severity}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Alert Type:</span>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {selectedAlert.alert_type}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* User Information */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">User Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Phone:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedAlert.user?.phone_number || 'Anonymous'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Verified:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedAlert.user?.is_verified ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Contacts Notified:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedAlert.contacts_notified}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Location Information */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Location</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Address:</span>
                        <span className="text-sm font-medium text-gray-900 text-right max-w-[150px]">
                          {selectedAlert.initial_address}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Coordinates:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedAlert.initial_latitude.toFixed(4)}, {selectedAlert.initial_longitude.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Accuracy:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedAlert.initial_accuracy}m
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Timeline</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Created:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatDateTime(selectedAlert.created_at)}
                        </span>
                      </div>
                      {selectedAlert.updated_at && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Last Updated:</span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatDateTime(selectedAlert.updated_at)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <button className="w-full px-4 py-2 bg-emergency-600 text-white rounded-md hover:bg-emergency-700 transition-colors">
                      Assign Responder
                    </button>
                    <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors">
                      Escalate
                    </button>
                    <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                      Mark Resolved
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center text-gray-500">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">Select an alert to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
