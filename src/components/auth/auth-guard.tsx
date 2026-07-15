'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Loader2 } from 'lucide-react'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, isLoading, stakeholder } = useAuthStore()
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // By the time this effect runs, the persist middleware has already
    // rehydrated the store from localStorage (microtasks process before effects).
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated && !isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login')
      } else if (
        stakeholder && 
        !stakeholder.setup_completed && 
        !stakeholder.is_super_admin && 
        pathname !== '/setup'
      ) {
        router.push('/setup')
      }
    }
  }, [hydrated, isAuthenticated, isLoading, stakeholder, router, pathname])

  if (!hydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-emergency-200 border-t-emergency-600 rounded-full animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-emergency-600" />
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
