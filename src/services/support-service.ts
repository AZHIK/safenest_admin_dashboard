import { apiClient } from './api-client'

export type SupportCenterType = 
  | 'police' 
  | 'hospital' 
  | 'ngo' 
  | 'legal_aid' 
  | 'shelter' 
  | 'hotline' 
  | 'counseling'

export interface SupportCenter {
  id: string
  name: string
  center_type: SupportCenterType
  category_tags?: string
  address: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
  latitude: number
  longitude: number
  phone_primary?: string
  phone_emergency?: string
  email?: string
  website?: string
  is_24_7: boolean
  operating_hours?: string
  languages_supported?: string
  provides_medical: boolean
  provides_legal: boolean
  provides_shelter: boolean
  provides_counseling: boolean
  provides_emergency_response: boolean
  provides_anonymous_support: boolean
  wheelchair_accessible: boolean
  gender_specific?: string
  is_verified: boolean
  rating_average: number
  rating_count: number
  is_active: boolean
}

export class SupportCenterService {
  static async getCenters(skip = 0, limit = 100) {
    const response = await apiClient.get<SupportCenter[]>('/api/v1/operator/support-centers', { skip, limit })
    return response.data
  }

  static async getCenterById(id: string) {
    const response = await apiClient.get<SupportCenter>(`/api/v1/operator/support-centers/${id}`)
    return response.data
  }

  static async createCenter(data: Partial<SupportCenter>) {
    const response = await apiClient.post<SupportCenter>('/api/v1/operator/support-centers', data)
    return response.data
  }

  static async updateCenter(id: string, data: Partial<SupportCenter>) {
    const response = await apiClient.patch<SupportCenter>(`/api/v1/operator/support-centers/${id}`, data)
    return response.data
  }

  static async deleteCenter(id: string) {
    await apiClient.delete(`/api/v1/operator/support-centers/${id}`)
  }
}
