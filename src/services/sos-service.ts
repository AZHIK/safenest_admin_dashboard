import { apiClient } from './api-client'
import { SOSAlert, LocationPing, SOSStatus } from '@/types'

export interface SOSCreateRequest {
  latitude: number
  longitude: number
  accuracy?: number
  altitude?: number
  speed?: number
  heading?: number
  battery_level?: number
  network_type?: string
  alert_type?: string
  message?: string
  triggered_by_device_id?: string
  client_created_at?: string
  offline_id?: string
}

export interface LocationUpdateRequest {
  alert_id: string
  latitude: number
  longitude: number
  accuracy?: number
  altitude?: number
  speed?: number
  heading?: number
  battery_level?: number
  network_type?: string
  signal_strength?: number
  recorded_at: string
  offline_sequence?: number
}

export interface SOSStatusUpdateRequest {
  status: SOSStatus
  resolution_notes?: string
  assigned_responder_id?: string
}

export class SOSService {
  // Get all active SOS alerts
  static async getActiveAlerts() {
    const response = await apiClient.get<SOSAlert[]>('/api/v1/sos/active')
    return response.data
  }

  // Get SOS alert by ID with location history
  static async getAlertById(alertId: string) {
    const response = await apiClient.get<SOSAlert>(`/api/v1/sos/status/${alertId}`)
    return response.data
  }

  // Get SOS history for a user
  static async getSOSHistory(userId?: string, limit = 20) {
    const params = userId ? { user_id: userId, limit } : { limit }
    const response = await apiClient.get<SOSAlert[]>('/api/v1/sos/history', params)
    return response.data
  }

  // Create new SOS alert
  static async createSOSAlert(data: SOSCreateRequest) {
    const response = await apiClient.post<SOSAlert>('/api/v1/sos/trigger', data)
    return response.data
  }

  // Update location for SOS alert
  static async updateLocation(data: LocationUpdateRequest) {
    const response = await apiClient.post<LocationPing>('/api/v1/sos/location-update', data)
    return response.data
  }

  // Batch location updates
  static async batchLocationUpdates(alertId: string, locations: LocationUpdateRequest[]) {
    const response = await apiClient.post('/api/v1/sos/location-batch', {
      alert_id: alertId,
      locations: locations
    })
    return response.data
  }

  // Update SOS status
  static async updateSOSStatus(alertId: string, data: SOSStatusUpdateRequest) {
    const response = await apiClient.patch<SOSAlert>(`/api/v1/sos/${alertId}/status`, data)
    return response.data
  }

  // Get active SOS alerts for dashboard
  static async getDashboardAlerts() {
    const response = await apiClient.get<SOSAlert[]>('/api/v1/dashboard/sos-alerts')
    return response.data
  }

  // Get SOS statistics
  static async getSOSStatistics(timeframe = '24h') {
    const response = await apiClient.get('/api/v1/analytics/sos-stats', { timeframe })
    return response.data
  }
}
