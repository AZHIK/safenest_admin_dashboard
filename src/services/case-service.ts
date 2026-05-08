import { apiClient } from './api-client'
import { IncidentReport, ReportStatus, ReportType, PaginatedResponse } from '@/types'

export interface CaseUpdateRequest {
  status?: ReportStatus
  assigned_responder_id?: string
  notes?: string
  escalation_reason?: string
}

export interface CaseListParams {
  status?: ReportStatus
  report_type?: ReportType
  search?: string
  page?: number
  page_size?: number
}

export class CaseService {
  // Get all incident reports (cases)
  async listCases(params?: CaseListParams): Promise<IncidentReport[]> {
    const response = await apiClient.get<IncidentReport[]>('/api/v1/operator/reports', params)
    return response.data
  }

  // Get a single case by ID
  async getCase(caseId: string): Promise<IncidentReport> {
    const response = await apiClient.get<IncidentReport>(`/api/v1/operator/reports/${caseId}`)
    return response.data
  }

  // Update a case
  async updateCase(caseId: string, data: CaseUpdateRequest): Promise<IncidentReport> {
    const response = await apiClient.put<IncidentReport>(`/api/v1/operator/reports/${caseId}`, data)
    return response.data
  }

  // Update case status
  async updateCaseStatus(caseId: string, status: ReportStatus, notes?: string): Promise<IncidentReport> {
    const response = await apiClient.patch<IncidentReport>(`/api/v1/operator/reports/${caseId}/status`, {
      status,
      notes
    })
    return response.data
  }

  // Assign a case to a responder
  async assignCase(caseId: string, responderId: string): Promise<IncidentReport> {
    const response = await apiClient.post<IncidentReport>(`/api/v1/operator/reports/${caseId}/assign`, {
      assigned_responder_id: responderId
    })
    return response.data
  }

  // Delete a case
  async deleteCase(caseId: string): Promise<void> {
    await apiClient.delete(`/api/v1/operator/reports/${caseId}`)
  }

  // Get case statistics
  async getCaseStatistics(timeframe?: string) {
    const response = await apiClient.get('/api/v1/analytics/case-stats', { timeframe })
    return response.data
  }
}

export const caseService = new CaseService()
