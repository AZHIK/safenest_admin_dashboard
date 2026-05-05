'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/auth-store'
import { 
  LayoutDashboard,
  AlertTriangle,
  FileText,
  MessageSquare,
  MapPin,
  BookOpen,
  Users,
  BarChart3,
  FileSearch,
  Settings,
  Menu,
  X,
  Shield,
  Phone,
  Building,
  GraduationCap
} from 'lucide-react'

interface SidebarItem {
  title: string
  href: string
  icon: any
  permission?: string
  roles?: string[]
}

const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    permission: 'view_dashboard'
  },
  {
    title: 'SOS Monitor',
    href: '/sos',
    icon: AlertTriangle,
    permission: 'view_sos'
  },
  {
    title: 'Case Management',
    href: '/cases',
    icon: FileText,
    permission: 'manage_cases'
  },
  {
    title: 'Messages',
    href: '/messages',
    icon: MessageSquare,
    permission: 'view_messages'
  },
  {
    title: 'Support Centers',
    href: '/support',
    icon: Building,
    permission: 'manage_support_centers'
  },
  {
    title: 'Training Content',
    href: '/training',
    icon: BookOpen,
    permission: 'manage_training'
  },
  {
    title: 'User Management',
    href: '/users',
    icon: Users,
    permission: 'manage_users'
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    permission: 'view_analytics'
  },
  {
    title: 'Audit Logs',
    href: '/audit',
    icon: FileSearch,
    permission: 'view_audit_logs'
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    permission: 'manage_settings'
  }
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  const { stakeholder, hasPermission, hasRole } = useAuthStore()

  const filteredItems = sidebarItems.filter(item => {
    if (item.permission && !hasPermission(item.permission)) {
      return false
    }
    if (item.roles && !hasRole(item.roles as any)) {
      return false
    }
    return true
  })

  return (
    <div className={cn(
      "flex flex-col bg-white border-r border-gray-200 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-emergency-600" />
            <span className="text-lg font-bold text-gray-900">SafeNest</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </button>
      </div>

      {/* User Info */}
      {!isCollapsed && stakeholder && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emergency-100 rounded-full flex items-center justify-center">
              <span className="text-emergency-600 font-semibold">
                {stakeholder.first_name?.charAt(0)}{stakeholder.last_name?.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {stakeholder.first_name} {stakeholder.last_name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {stakeholder.role.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-emergency-50 text-emergency-700 border-l-4 border-emergency-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.title}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Phone className="h-4 w-4" />
            <span>Emergency Hotline</span>
          </div>
          <div className="mt-1 text-sm font-semibold text-emergency-600">
            911
          </div>
        </div>
      )}
    </div>
  )
}
