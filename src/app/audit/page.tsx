'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { PermissionGuard } from '@/components/auth/permission-guard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { apiClient } from '@/services/api-client'
import { FileSearch, Download, Search, Shield, AlertTriangle, User, FileText, Settings, LogIn, Eye, Database, MoreHorizontal, Loader2 } from 'lucide-react'

interface AuditLog {
  id: string
  action: string
  stakeholder_name?: string
  resource_type?: string
  resource_id?: string
  details?: any
  ip_address?: string
  created_at: string
}

const actionIcons: Record<string, any> = {
  CASE_VIEW: Eye,
  USER_LOGIN: LogIn,
  SOS_ALERT_CREATED: AlertTriangle,
  CASE_UPDATED: FileText,
  USER_PERMISSION_CHANGED: Shield,
  DATA_EXPORT: Download,
  FAILED_LOGIN: AlertTriangle,
  SETTINGS_CHANGED: Settings,
}

const severityColors: Record<string, string> = {
  info: 'bg-blue-100 text-blue-700',
  warning: 'bg-amber-100 text-amber-700',
  critical: 'bg-red-100 text-red-700',
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await apiClient.get<AuditLog[]>('/api/v1/operator/audit/logs')
        setLogs(response.data || [])
      } catch {
        console.error('Failed to fetch audit logs')
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [])

  const severityCount = (sev: string) => logs.filter(l => l.details?.severity === sev).length

  return (
    <PermissionGuard permission="audit_logs.view">
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-emergency-100 rounded-lg">
              <FileSearch className="h-8 w-8 text-emergency-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
              <p className="text-gray-500">System activity and security logs</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" disabled>
              <Database className="h-4 w-4 mr-2" />
              Archive
            </Button>
            <Button className="bg-emergency-600 hover:bg-emergency-700" size="sm" disabled>
              <Download className="h-4 w-4 mr-2" />
              Export Logs
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-gray-900">{loading ? '—' : logs.length}</div>
              <p className="text-sm text-gray-500">Total Events</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600">{loading ? '—' : severityCount('info')}</div>
              <p className="text-sm text-gray-500">Info Events</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-amber-600">{loading ? '—' : severityCount('warning')}</div>
              <p className="text-sm text-gray-500">Warnings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-red-600">{loading ? '—' : severityCount('critical')}</div>
              <p className="text-sm text-gray-500">Critical Events</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="logs" className="w-full">
          <TabsList>
            <TabsTrigger value="logs">All Logs</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="data">Data Access</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="logs" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search audit logs..." className="pl-10" />
                  </div>
                  <Button variant="outline" size="sm" disabled>Filter</Button>
                </div>
              </CardContent>
            </Card>

            {/* Logs Table */}
            <Card>
              <CardHeader>
                <CardTitle>Audit Trail</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : logs.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <FileSearch className="h-10 w-10 mx-auto mb-3 text-gray-200" />
                    <p className="font-medium text-gray-500">No audit logs found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Event</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">User</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Target</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Timestamp</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Severity</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">IP Address</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.map((log) => {
                          const ActionIcon = actionIcons[log.action] || FileText
                          const sev = log.details?.severity || 'info'
                          return (
                            <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-2">
                                  <ActionIcon className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm font-medium text-gray-900">{log.action}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-700">{log.stakeholder_name || 'System'}</td>
                              <td className="py-3 px-4 text-sm text-gray-700">{log.resource_id || log.resource_type || '—'}</td>
                              <td className="py-3 px-4 text-sm text-gray-500">{new Date(log.created_at).toLocaleString()}</td>
                              <td className="py-3 px-4">
                                <Badge className={severityColors[sev] || 'bg-gray-100 text-gray-700'}>{sev}</Badge>
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-500 font-mono">{log.ip_address || '—'}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Security Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                {logs.filter(l => l.details?.severity === 'critical').length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No security events recorded</p>
                ) : (
                  <div className="space-y-4">
                    {logs.filter(l => l.details?.severity === 'critical').map(log => (
                      <div key={log.id} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                          <div>
                            <p className="font-medium text-red-900">{log.action}</p>
                            <p className="text-sm text-red-700">{log.stakeholder_name} — {log.resource_id}</p>
                            <p className="text-xs text-red-600 mt-1">{new Date(log.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle>Data Access Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Data access tracking not yet available</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>System Events</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">System event logs not yet available</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
    </PermissionGuard>
  )
}
