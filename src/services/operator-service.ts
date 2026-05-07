import { apiClient } from './api-client'

// Types matching the backend schemas
export interface OperatorUser {
  id: string
  full_name: string
  email: string
  phone: string | null
  is_active: boolean
  is_super_admin: boolean
  email_verified: boolean
  last_login: string | null
  locked_until: string | null
  created_at: string
  updated_at: string | null
  roles: string[]
  role_count: number
  direct_permission_count: number
}

export interface OperatorUserListResponse {
  items: OperatorUser[]
  total: number
  page: number
  page_size: number
  pages: number
}

export interface OperatorUserCreate {
  full_name: string
  email: string
  phone?: string
  password: string
  is_active?: boolean
  is_super_admin?: boolean
  role_ids?: string[]
}

export interface OperatorUserUpdate {
  full_name?: string
  phone?: string
  is_active?: boolean
}

export interface Role {
  id: string
  name: string
  description: string | null
  is_system: boolean
  created_at: string
  updated_at: string | null
  user_count?: number
  permission_count?: number
}

export interface RoleListResponse {
  items: Role[]
  total: number
  page: number
  page_size: number
  pages: number
}

export class OperatorService {
  // Users
  async listUsers(params?: {
    is_active?: boolean
    is_super_admin?: boolean
    search?: string
    page?: number
    page_size?: number
  }): Promise<OperatorUserListResponse> {
    const response = await apiClient.get<OperatorUserListResponse>('/api/v1/operator/users', params)
    return response.data
  }

  async getUser(userId: string): Promise<OperatorUser> {
    const response = await apiClient.get<OperatorUser>(`/api/v1/operator/users/${userId}`)
    return response.data
  }

  async createUser(data: OperatorUserCreate): Promise<OperatorUser> {
    const response = await apiClient.post<OperatorUser>('/api/v1/operator/users', data)
    return response.data
  }

  async updateUser(userId: string, data: OperatorUserUpdate): Promise<OperatorUser> {
    const response = await apiClient.put<OperatorUser>(`/api/v1/operator/users/${userId}`, data)
    return response.data
  }

  async updateUserStatus(userId: string, isActive: boolean, reason?: string): Promise<OperatorUser> {
    const response = await apiClient.patch<OperatorUser>(`/api/v1/operator/users/${userId}/status`, {
      is_active: isActive,
      reason
    })
    return response.data
  }

  async deleteUser(userId: string): Promise<void> {
    await apiClient.delete(`/api/v1/operator/users/${userId}`)
  }

  async assignRolesToUser(userId: string, roleIds: string[], replaceExisting: boolean = false): Promise<OperatorUser> {
    const response = await apiClient.post<OperatorUser>(`/api/v1/operator/users/${userId}/assign-roles`, {
      role_ids: roleIds,
      replace_existing: replaceExisting
    })
    return response.data
  }

  // Roles
  async listRoles(params?: {
    is_system?: boolean
    search?: string
    page?: number
    page_size?: number
  }): Promise<RoleListResponse> {
    const response = await apiClient.get<RoleListResponse>('/api/v1/operator/roles', params)
    return response.data
  }

  async getRole(roleId: string): Promise<Role> {
    const response = await apiClient.get<Role>(`/api/v1/operator/roles/${roleId}`)
    return response.data
  }
}

export const operatorService = new OperatorService()
