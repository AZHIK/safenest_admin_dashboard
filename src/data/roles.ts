import { StakeholderRole } from '@/types'

export interface RoleDefinition {
  value: StakeholderRole
  label: string
  description: string
  backendName: string
}

/**
 * Available roles for operator registration.
 * Mirrors the backend system roles defined in app/rbac/permission_enum.py.
 * `value` is the frontend StakeholderRole; `backendName` maps to the backend's system role name.
 */
export const SEED_ROLES: RoleDefinition[] = [
  {
    value: 'police',
    label: 'Police Officer',
    description: 'Law enforcement and case investigation',
    backendName: 'police_officer',
  },
  {
    value: 'legal_officer',
    label: 'Legal Aid',
    description: 'Legal support and court assistance',
    backendName: 'legal_officer',
  },
  {
    value: 'counselor',
    label: 'Counselor',
    description: 'Mental health and counseling services',
    backendName: 'counselor',
  },
  {
    value: 'help_center',
    label: 'Help Center Staff',
    description: 'Shelter and immediate assistance',
    backendName: 'help_center_staff',
  },
  {
    value: 'ngo_manager',
    label: 'NGO Manager',
    description: 'Non-profit organization coordinator',
    backendName: 'ngo_manager',
  },
  {
    value: 'regional_manager',
    label: 'Regional Manager',
    description: 'Multi-region coordination and oversight',
    backendName: 'regional_manager',
  },
]

/** Map frontend StakeholderRole to the backend's system role name. */
export function toBackendRoleName(role: StakeholderRole): string {
  return SEED_ROLES.find(r => r.value === role)?.backendName ?? role
}
