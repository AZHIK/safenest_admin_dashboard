'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard, AlertTriangle, FileText, MessageSquare,
  Users, BarChart3, FileSearch, Settings, Menu, X,
  Shield, Phone, Building, LogOut, BookOpen
} from 'lucide-react'

interface SidebarItem {
  title: string
  href: string
  icon: any
  permission?: string
}

interface SidebarSection {
  label?: string
  items: SidebarItem[]
}

const sidebarSections: SidebarSection[] = [
  {
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, permission: 'view_dashboard' },
    ],
  },
  {
    label: 'Emergency Operations',
    items: [
      { title: 'SOS Monitor', href: '/sos', icon: AlertTriangle, permission: 'sos.view' },
    ],
  },
  {
    label: 'Documentation',
    items: [
      { title: 'Incident Reports', href: '/reports', icon: FileText, permission: 'reports.view' },
      { title: 'Training', href: '/training', icon: BookOpen, permission: 'training.view' },
    ],
  },
  {
    label: 'Communications',
    items: [
      { title: 'Messages', href: '/messages', icon: MessageSquare, permission: 'view_messages' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { title: 'Users & Roles', href: '/users', icon: Users, permission: 'manage_users' },
      { title: 'Support Centers', href: '/support', icon: Building, permission: 'manage_support_centers' },
      { title: 'Analytics', href: '/analytics', icon: BarChart3, permission: 'view_analytics' },
      { title: 'Audit Logs', href: '/audit', icon: FileSearch, permission: 'view_audit_logs' },
      { title: 'Settings', href: '/settings', icon: Settings, permission: 'manage_settings' },
    ],
  },
]

interface SidebarProps { className?: string }

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { stakeholder, hasPermission, logout } = useAuthStore()

  const handleLogout = () => { logout(); router.push('/auth/login') }

  const isVisible = (item: SidebarItem) => {
    if (!stakeholder) return true
    if (item.permission && !hasPermission(item.permission)) return false
    return true
  }

  return (
    <div className={cn(
      "flex flex-col bg-white border-r border-gray-200 transition-all duration-300 min-h-screen",
      isCollapsed ? "w-16" : "w-64", className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-emergency-600" />
            <span className="text-lg font-bold text-gray-900">SafeNest</span>
          </div>
        )}
        <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 rounded-md hover:bg-gray-100 transition-colors">
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </button>
      </div>

      {/* User Info */}
      {!isCollapsed && stakeholder && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emergency-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-emergency-600 font-semibold text-sm">
                {(stakeholder.first_name?.[0] ?? '') + (stakeholder.last_name?.[0] ?? '')}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{stakeholder.first_name} {stakeholder.last_name}</p>
              <p className="text-xs text-gray-500 capitalize">{stakeholder.role.replace(/_/g, ' ')}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full mt-3 text-gray-500 hover:text-red-600 hover:bg-red-50">
            <LogOut className="h-4 w-4 mr-2" />Logout
          </Button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {sidebarSections.map((section, si) => {
          const visibleItems = section.items.filter(isVisible)
          if (visibleItems.length === 0) return null
          return (
            <div key={si} className="mb-1">
              {!isCollapsed && section.label && (
                <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {section.label}
                </p>
              )}
              {isCollapsed && section.label && si > 0 && <div className="mx-3 my-1.5 border-t border-gray-100" />}
              <div className="space-y-0.5 px-2">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  const Icon = item.icon
                  const isSOS = item.href === '/sos'
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={isCollapsed ? item.title : undefined}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                        isActive
                          ? isSOS
                            ? "bg-red-50 text-red-700 border-l-[3px] border-red-600"
                            : "bg-indigo-50 text-indigo-700 border-l-[3px] border-indigo-600"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <Icon className="flex-shrink-0 h-[18px] w-[18px]" />
                      {!isCollapsed && <span className="flex-1">{item.title}</span>}
                      {!isCollapsed && isSOS && isActive && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Phone className="h-4 w-4" /><span>Emergency Hotline</span>
          </div>
          <div className="mt-1 text-sm font-semibold text-emergency-600">911</div>
        </div>
      )}
    </div>
  )
}
