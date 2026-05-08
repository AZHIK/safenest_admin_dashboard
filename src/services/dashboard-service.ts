import { apiClient } from './api-client'

export interface DashboardStats {
  active_sos_alerts: number
  pending_reports: number
  responders_online: number
  average_response_time: number
  timestamp: string
}

export class DashboardService {
  static async getStats() {
    const response = await apiClient.get<DashboardStats>('/api/v1/operator/dashboard/stats')
    return response.data
  }
}
