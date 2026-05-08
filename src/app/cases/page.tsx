'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * The old /cases route is now replaced by /reports (Incident Reports module).
 * This redirect ensures any existing bookmarks or links continue to work.
 */
export default function CasesRedirectPage() {
  const router = useRouter()
  useEffect(() => { router.replace('/reports') }, [router])
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500 text-sm">Redirecting to Incident Reports…</p>
    </div>
  )
}
