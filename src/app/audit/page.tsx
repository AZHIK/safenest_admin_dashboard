'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileSearch, Download, Search, Shield, AlertTriangle, User, FileText, Settings, LogIn, Eye, Database, MoreHorizontal } from 'lucide-react'

const mockAuditLogs = [
  { id: 1, action: 'CASE_VIEW', user: 'Officer Smith', target: 'CASE-2024-001', timestamp: '2024-01-15 10:30:22', severity: 'info', ip: '192.168.1.45' },
  { id: 2, action: 'USER_LOGIN', user: 'Dr. Johnson', target: 'System', timestamp: '2024-01-15 10:28:15', severity: 'info', ip: '192.168.1.32' },
  { id: 3, action: 'SOS_ALERT_CREATED', user: 'Mobile App', target: 'SOS-789', timestamp: '2024-01-15 10:25:00', severity: 'warning', ip: '10.0.0.15' },
  { id: 4, action: 'CASE_UPDATED', user: 'Case Worker Lee', target: 'CASE-2024-002', timestamp: '2024-01-15 10:20:45', severity: 'info', ip: '192.168.1.28' },
  { id: 5, action: 'USER_PERMISSION_CHANGED', user: 'Admin', target: 'User: Sarah Chen', timestamp: '2024-01-15 10:15:30', severity: 'warning', ip: '192.168.1.10' },
  { id: 6, action: 'DATA_EXPORT', user: 'Manager Wilson', target: 'Cases Report', timestamp: '2024-01-15 10:10:00', severity: 'info', ip: '192.168.1.50' },
  { id: 7, action: 'FAILED_LOGIN', user: 'Unknown', target: 'System', timestamp: '2024-01-15 10:05:12', severity: 'critical', ip: '203.0.113.45' },
  { id: 8, action: 'SETTINGS_CHANGED', user: 'Admin', target: 'Notification Settings', timestamp: '2024-01-15 09:55:00', severity: 'warning', ip: '192.168.1.10' },
]

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
  return (
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
            <Button variant="outline" size="sm">
              <Database className="h-4 w-4 mr-2" />
              Archive
            </Button>
            <Button className="bg-emergency-600 hover:bg-emergency-700" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Logs
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-gray-900">12,456</div>
              <p className="text-sm text-gray-500">Total Events (24h)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600">8,234</div>
              <p className="text-sm text-gray-500">Info Events</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-amber-600">3,567</div>
              <p className="text-sm text-gray-500">Warnings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-red-600">12</div>
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
                  <Button variant="outline" size="sm">Filter</Button>
                </div>
              </CardContent>
            </Card>

            {/* Logs Table */}
            <Card>
              <CardHeader>
                <CardTitle>Audit Trail</CardTitle>
              </CardHeader>
              <CardContent>
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
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockAuditLogs.map((log) => {
                        const ActionIcon = actionIcons[log.action] || FileText
                        return (
                          <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center space-x-2">
                                <ActionIcon className="h-4 w-4 text-gray-400" />
                                <span className="text-sm font-medium text-gray-900">{log.action}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-700">{log.user}</td>
                            <td className="py-3 px-4 text-sm text-gray-700">{log.target}</td>
                            <td className="py-3 px-4 text-sm text-gray-500">{log.timestamp}</td>
                            <td className="py-3 px-4">
                              <Badge className={severityColors[log.severity]}>{log.severity}</Badge>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-500 font-mono">{log.ip}</td>
                            <td className="py-3 px-4">
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
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
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-medium text-red-900">Failed Login Attempt</p>
                        <p className="text-sm text-red-700">Multiple failed login attempts detected from IP 203.0.113.45</p>
                        <p className="text-xs text-red-600 mt-1">2024-01-15 10:05:12</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-amber-600" />
                      <div>
                        <p className="font-medium text-amber-900">Permission Change</p>
                        <p className="text-sm text-amber-700">User permissions modified for Sarah Chen by Admin</p>
                        <p className="text-xs text-amber-600 mt-1">2024-01-15 10:15:30</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle>Data Access Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Data access tracking logs coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <Card>
              <CardHeader>
                <CardTitle>System Events</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">System event logs coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
