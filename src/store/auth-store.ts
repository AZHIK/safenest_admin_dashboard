import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Stakeholder, StakeholderRole } from '@/types'
import { apiClient } from '@/services/api-client'

interface AuthState {
  stakeholder: Stakeholder | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  fetchProfile: () => Promise<void>
  refreshAccessToken: () => Promise<void>
  hasPermission: (permission: string) => boolean
  hasRole: (role: StakeholderRole | StakeholderRole[]) => boolean
}

interface RegisterData {
  email: string
  password: string
  full_name: string
  phone?: string
  organization?: string
  role: StakeholderRole
}

const ROLE_PERMISSIONS: Record<StakeholderRole, string[]> = {
  super_admin: [
    'analytics.dashboard',
    // SOS permissions
    'sos.view', 'sos.assign', 'sos.escalate',
    // Incident report permissions
    'reports.view', 'reports.review', 'reports.resolve', 'evidence.view',
    // Administration
    'users.view', 'operators.view',
    'manage_support_centers', 'support_centers.view', 'support_centers.manage', 'training.view', 'training.manage',
    'analytics.view', 'audit_logs.view',
    'system.settings_view', 'messages.view'
  ],
  police: [
    'analytics.dashboard',
    // SOS: police can view, assign responders, and escalate
    'sos.view', 'sos.assign', 'sos.escalate',
    // Reports: police can view reports and evidence
    'reports.view', 'evidence.view',
    'analytics.view', 'audit_logs.view', 'messages.view', 'training.view', 'support_centers.view'
  ],
  legal_officer: [
    'analytics.dashboard',
    // SOS: legal can only monitor
    'sos.view',
    // Reports: legal handles full review lifecycle
    'reports.view', 'reports.review', 'reports.resolve', 'evidence.view',
    'analytics.view', 'audit_logs.view', 'messages.view', 'training.view', 'support_centers.view'
  ],
  counselor: [
    'analytics.dashboard',
    // SOS: counselors monitor alerts
    'sos.view',
    // Reports: counselors review but not resolve
    'reports.view', 'reports.review', 'evidence.view',
    'analytics.view', 'audit_logs.view', 'messages.view', 'training.view', 'support_centers.view'
  ],
  help_center: [
    'analytics.dashboard',
    // SOS: help center monitors
    'sos.view',
    // Reports: help center can view only
    'reports.view',
    'analytics.view', 'messages.view', 'training.view', 'support_centers.view'
  ],
  ngo_manager: [
    'analytics.dashboard',
    // SOS: NGO monitors
    'sos.view',
    // Reports: NGO reviews and views evidence
    'reports.view', 'reports.review', 'evidence.view',
    'analytics.view', 'audit_logs.view', 'messages.view', 'training.view', 'support_centers.view'
  ],
  regional_manager: [
    'analytics.dashboard',
    // SOS: regional manager can monitor and assign
    'sos.view', 'sos.assign',
    // Reports: regional manager handles full report lifecycle
    'reports.view', 'reports.review', 'reports.resolve', 'evidence.view',
    'analytics.view', 'audit_logs.view',
    'support_centers.view', 'operators.view', 'messages.view', 'training.view'
  ]
}

// Map backend role names to frontend StakeholderRole
const mapRole = (backendRoles: string[], isSuperAdmin: boolean): StakeholderRole => {
  if (isSuperAdmin) return 'super_admin';
  
  const role = backendRoles[0]?.toLowerCase() || '';
  if (role.includes('police')) return 'police';
  if (role.includes('legal')) return 'legal_officer';
  if (role.includes('counselor')) return 'counselor';
  if (role.includes('ngo')) return 'ngo_manager';
  if (role.includes('regional')) return 'regional_manager';
  return 'help_center';
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      stakeholder: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        
        try {
          const response = await apiClient.post<{
            access_token: string,
            refresh_token: string,
            token_type: string
          }>('/api/v1/operator/auth/login', { email, password })

          const { access_token, refresh_token } = response.data
          
          set({ 
            token: access_token, 
            refreshToken: refresh_token,
            isAuthenticated: true 
          })

          // Fetch profile after login
          await get().fetchProfile()
          
          set({ isLoading: false })
        } catch (error: any) {
          set({ isLoading: false, isAuthenticated: false, token: null, refreshToken: null })
          throw error
        }
      },

      fetchProfile: async () => {
        try {
          const response = await apiClient.get<any>('/api/v1/operator/auth/me')
          const data = response.data

          const stakeholder: Stakeholder = {
            id: data.id,
            email: data.email,
            full_name: data.full_name,
            phone: data.phone,
            is_active: data.is_active,
            is_super_admin: data.is_super_admin,
            email_verified: data.email_verified,
            last_login: data.last_login,
            created_at: data.created_at,
            roles: data.roles,
            role: mapRole(data.roles, data.is_super_admin),
            // Legacy/Derived fields
            first_name: data.full_name.split(' ')[0],
            last_name: data.full_name.split(' ').slice(1).join(' '),
            phone_number: data.phone,
            updated_at: data.created_at // fallback
          }

          set({ stakeholder })
        } catch (error) {
          get().logout()
          throw error
        }
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true })
        try {
          await apiClient.post('/api/v1/operator/auth/register', {
            full_name: userData.full_name,
            email: userData.email,
            password: userData.password,
            phone: userData.phone,
            organization: userData.organization
          })
          
          set({ isLoading: false })
        } catch (error: any) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: () => {
        set({
          stakeholder: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false
        })
        // Optional: Call logout endpoint on backend
        apiClient.post('/api/v1/operator/auth/logout').catch(() => {})
        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login'
        }
      },

      refreshAccessToken: async () => {
        const { refreshToken: currentRefreshToken } = get()
        if (!currentRefreshToken) {
          get().logout()
          return
        }

        try {
          const response = await apiClient.post<{
            access_token: string,
            refresh_token: string
          }>('/api/v1/operator/auth/refresh', {
            refresh_token: currentRefreshToken
          })

          set({
            token: response.data.access_token,
            refreshToken: response.data.refresh_token
          })
        } catch (error) {
          get().logout()
        }
      },

      hasPermission: (permission: string) => {
        const { stakeholder } = get()
        if (!stakeholder) return false
        
        const permissions = ROLE_PERMISSIONS[stakeholder.role] || []
        return permissions.includes(permission)
      },

      hasRole: (role: StakeholderRole | StakeholderRole[]) => {
        const { stakeholder } = get()
        if (!stakeholder) return false
        
        if (Array.isArray(role)) {
          return role.includes(stakeholder.role)
        }
        
        return stakeholder.role === role
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        stakeholder: state.stakeholder,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
