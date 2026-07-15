'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'

interface PermissionGuardProps {
  children: React.ReactNode
  permission: string
  fallbackUrl?: string
}

export function PermissionGuard({ children, permission, fallbackUrl = '/dashboard' }: PermissionGuardProps) {
  const router = useRouter()
  const { hasPermission, stakeholder } = useAuthStore()

  useEffect(() => {
    if (stakeholder && !hasPermission(permission)) {
      router.push(fallbackUrl)
    }
  }, [stakeholder, hasPermission, permission, router, fallbackUrl])

  return <>{children}</>
}
