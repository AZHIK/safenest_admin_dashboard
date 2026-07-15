'use client'

import { useState } from 'react'
import { Bell, Search, User, LogOut, Settings } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { cn } from '@/lib/utils'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { stakeholder, logout } = useAuthStore()

  return (
    <header className={cn(
      "bg-white border-b border-gray-200 px-6 py-4",
      className
    )}>
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search cases, users, reports..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emergency-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications - coming from API */}
          <div className="relative">
            <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
              <Bell className="h-5 w-5" />
            </button>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-emergency-100 rounded-full flex items-center justify-center">
                <span className="text-emergency-600 font-semibold text-sm">
                  {stakeholder?.first_name?.charAt(0)}{stakeholder?.last_name?.charAt(0)}
                </span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">
                  {stakeholder?.first_name} {stakeholder?.last_name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {stakeholder?.role?.replace('_', ' ')}
                </p>
              </div>
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </button>
                  <hr className="my-1" />
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
