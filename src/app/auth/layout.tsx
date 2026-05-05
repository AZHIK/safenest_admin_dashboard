'use client'

import { ReactNode } from 'react'
import { Shield } from 'lucide-react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emergency-600 to-emergency-800 items-center justify-center">
        <div className="max-w-md text-center text-white p-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur">
              <Shield className="h-16 w-16 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">SafeNest</h1>
          <p className="text-xl text-white/90 mb-6">
            Coordinated Response System for Domestic Violence Support
          </p>
          <p className="text-white/70">
            A unified platform connecting survivors, help centers, police, legal aid, 
            counselors, and NGOs for comprehensive support and care.
          </p>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}
