import { apiClient } from './api-client'

export interface TrustedContact {
  id: string
  name: string
  phone_number: string
  relationship: string | null
  priority: number
  notify_sms: boolean
  notify_push: boolean
  is_verified: boolean
  created_at: string
}

export interface ActivityItem {
  id: string
  type: 'auth' | 'sos' | 'report' | 'contact'
  title: string
  description: string
  timestamp: string
  meta?: Record<string, any>
}

export interface SOSAlertSummary {
  id: string
  user_id: string
  status: 'active' | 'resolved' | 'cancelled' | 'escalated' | 'assigned'
  alert_type: string
  severity: string
  initial_latitude: number
  initial_longitude: number
  initial_accuracy: number | null
  initial_address: string | null
  message: string | null
  contacts_notified: number
  created_at: string
  updated_at: string | null
  assigned_to: string | null
  assigned_at: string | null
}

export interface IncidentReportSummary {
  id: string
  report_number: string
  report_type: string
  status: string
  is_anonymous: boolean
  incident_date: string | null
  incident_latitude: number | null
  incident_longitude: number | null
  created_at: string
  updated_at: string | null
}

export interface MobileUser {
  id: string
  phone_number: string | null
  country_code: string | null
  is_anonymous: boolean
  is_verified: boolean
  status: 'active' | 'inactive' | 'suspended' | 'anonymous'
  nickname: string | null
  language_preference: string
  emergency_message_template: string | null
  last_login_at: string | null
  created_at: string
  trusted_contacts?: TrustedContact[]
}

export interface MobileUserListResponse {
  items: MobileUser[]
  total: number
  page: number
  page_size: number
  pages: number
}

export interface MobileUserDetail extends MobileUser {
  trusted_contacts: TrustedContact[]
  sos_alerts: SOSAlertSummary[]
  incident_reports: IncidentReportSummary[]
  activity_log: ActivityItem[]
}

export class MobileUserService {
  async listMobileUsers(params?: {
    is_anonymous?: boolean
    is_verified?: boolean
    status?: string
    search?: string
    page?: number
    page_size?: number
  }): Promise<MobileUserListResponse> {
    const response = await apiClient.get<MobileUserListResponse>('/api/v1/operator/mobile-users', params)
    return response.data
  }

  async getMobileUser(userId: string): Promise<MobileUserDetail> {
    const response = await apiClient.get<MobileUserDetail>(`/api/v1/operator/mobile-users/${userId}`)
    return response.data
  }

  async updateMobileUserStatus(userId: string, status: string): Promise<MobileUser> {
    const response = await apiClient.patch<MobileUser>(`/api/v1/operator/mobile-users/${userId}/status`, { status })
    return response.data
  }

  async deleteMobileUser(userId: string): Promise<void> {
    await apiClient.delete(`/api/v1/operator/mobile-users/${userId}`)
  }
}

export const mobileUserService = new MobileUserService()
