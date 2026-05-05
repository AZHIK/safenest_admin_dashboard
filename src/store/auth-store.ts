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
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
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

      // Mock users for demo
      login: async (email: string, password: string) => {
        set({ isLoading: true })
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 800))
        
        try {
          // Mock authentication - accept any email with password >= 6 chars
          if (password.length < 6) {
            throw new Error('Invalid credentials')
          }

          // Determine role from email or use default
          let role: StakeholderRole = 'help_center'
          if (email.includes('admin')) role = 'super_admin'
          else if (email.includes('police')) role = 'police'
          else if (email.includes('legal')) role = 'legal_officer'
          else if (email.includes('counselor')) role = 'counselor'
          else if (email.includes('ngo')) role = 'ngo_manager'
          else if (email.includes('regional')) role = 'regional_manager'

          const nameParts = email.split('@')[0].replace(/\./g, ' ').replace(/_/g, ' ').split(' ')
          const firstName = nameParts[0]?.charAt(0).toUpperCase() + nameParts[0]?.slice(1) || 'Demo'
          const lastName = nameParts[1]?.charAt(0).toUpperCase() + nameParts[1]?.slice(1) || 'User'
          
          const mockStakeholder: Stakeholder = {
            id: Math.random().toString(36).substring(2, 9),
            email,
            first_name: firstName,
            last_name: lastName,
            phone_number: '+1 (555) 000-0000',
            role,
            department: role === 'police' ? 'Domestic Violence Unit' : role === 'counselor' ? 'Counseling Services' : null,
            region: null,
            is_active: true,
            last_login_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          set({
            stakeholder: mockStakeholder,
            token: 'mock_access_token_' + Date.now(),
            refreshToken: 'mock_refresh_token_' + Date.now(),
            isAuthenticated: true,
            isLoading: false
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true })
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        try {
          if (userData.password.length < 6) {
            throw new Error('Password must be at least 6 characters')
          }

          const nameParts = userData.full_name.split(' ')
          const newStakeholder: Stakeholder = {
            id: Math.random().toString(36).substring(2, 9),
            email: userData.email,
            first_name: nameParts[0] || 'New',
            last_name: nameParts.slice(1).join(' ') || 'User',
            phone_number: userData.phone || null,
            role: userData.role,
            department: userData.organization || null,
            region: null,
            is_active: true,
            last_login_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          set({
            stakeholder: newStakeholder,
            token: 'mock_access_token_' + Date.now(),
            refreshToken: 'mock_refresh_token_' + Date.now(),
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
