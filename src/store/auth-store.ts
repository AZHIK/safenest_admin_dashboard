import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Stakeholder, StakeholderRole } from '@/types'

interface AuthState {
  stakeholder: Stakeholder | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refreshAccessToken: () => Promise<void>
  hasPermission: (permission: string) => boolean
  hasRole: (role: StakeholderRole | StakeholderRole[]) => boolean
}

const ROLE_PERMISSIONS: Record<StakeholderRole, string[]> = {
  super_admin: [
    'view_dashboard',
    'manage_sos',
    'manage_cases',
    'manage_users',
    'manage_stakeholders',
    'manage_support_centers',
    'manage_training',
    'view_analytics',
    'view_audit_logs',
    'manage_settings'
  ],
  police: [
    'view_dashboard',
    'view_sos',
    'manage_cases',
    'view_analytics',
    'view_audit_logs'
  ],
  legal_officer: [
    'view_dashboard',
    'view_sos',
    'manage_cases',
    'view_analytics',
    'view_audit_logs'
  ],
  counselor: [
    'view_dashboard',
    'view_sos',
    'manage_cases',
    'view_analytics',
    'view_audit_logs'
  ],
  help_center: [
    'view_dashboard',
    'view_sos',
    'manage_cases',
    'view_analytics'
  ],
  ngo_manager: [
    'view_dashboard',
    'view_sos',
    'manage_cases',
    'view_analytics',
    'view_audit_logs'
  ],
  regional_manager: [
    'view_dashboard',
    'view_sos',
    'manage_cases',
    'view_analytics',
    'view_audit_logs',
    'manage_support_centers'
  ]
}

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
          // API call would go here
          const response = await fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          })

          if (!response.ok) {
            throw new Error('Login failed')
          }

          const data = await response.json()
          
          set({
            stakeholder: data.stakeholder,
            token: data.access_token,
            refreshToken: data.refresh_token,
            isAuthenticated: true,
            isLoading: false
          })
        } catch (error) {
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
      },

      refreshAccessToken: async () => {
        const { refreshToken: currentRefreshToken } = get()
        if (!currentRefreshToken) {
          get().logout()
          return
        }

        try {
          const response = await fetch('/api/v1/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `refresh_token=${currentRefreshToken}`
          })

          if (!response.ok) {
            get().logout()
            return
          }

          const data = await response.json()
          
          set({
            token: data.access_token,
            refreshToken: data.refresh_token
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
