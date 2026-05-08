import { apiClient } from './api-client'
import { IncidentReport, ReportStatus, ReportType } from '@/types'

export interface ReportUpdateRequest {
  status?: ReportStatus
  assigned_officer_id?: string
  internal_notes?: string
}

export interface ReportListParams {
  status?: ReportStatus
  report_type?: ReportType
  search?: string
  page?: number
  page_size?: number
}

export class ReportService {
  // Get all incident reports
  async listReports(params?: ReportListParams): Promise<IncidentReport[]> {
    const response = await apiClient.get<IncidentReport[]>('/api/v1/operator/reports', params)
    return response.data
  }

  // Get a single report by ID
  async getReport(reportId: string): Promise<IncidentReport> {
    const response = await apiClient.get<IncidentReport>(`/api/v1/operator/reports/${reportId}`)
    return response.data
  }

  // Update report status
  async updateReportStatus(reportId: string, status: ReportStatus, notes?: string): Promise<IncidentReport> {
    const response = await apiClient.patch<IncidentReport>(
      `/api/v1/operator/reports/${reportId}/status`,
      { status, notes }
    )
    return response.data
  }

  // Assign an officer to a report
  async assignOfficer(reportId: string, officerId: string): Promise<IncidentReport> {
    const response = await apiClient.post<IncidentReport>(
      `/api/v1/operator/reports/${reportId}/assign`,
      { assigned_responder_id: officerId }
    )
    return response.data
  }

  // Update report details
  async updateReport(reportId: string, data: ReportUpdateRequest): Promise<IncidentReport> {
    const response = await apiClient.put<IncidentReport>(
      `/api/v1/operator/reports/${reportId}`,
      data
    )
    return response.data
  }

  // Get report statistics
  async getReportStatistics(timeframe?: string) {
    const response = await apiClient.get('/api/v1/analytics/case-stats', { timeframe })
    return response.data
  }
}

export const reportService = new ReportService()
