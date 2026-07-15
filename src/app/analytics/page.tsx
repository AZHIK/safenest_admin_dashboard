'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { PermissionGuard } from '@/components/auth/permission-guard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DashboardService } from '@/services/dashboard-service'
import { SOSService } from '@/services/sos-service'
import { reportService } from '@/services/report-service'
import { operatorService } from '@/services/operator-service'
import { BarChart3, Users, AlertTriangle, Clock, FileText, BarChart, Loader2 } from 'lucide-react'

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)
  const [alertCount, setAlertCount] = useState(0)
  const [reportCount, setReportCount] = useState(0)
  const [userCount, setUserCount] = useState(0)

  useEffect(() => {
    const fetch = async () => {
      try {
        const [dashStats, alerts, reports, users] = await Promise.all([
          DashboardService.getStats(),
          SOSService.getActiveAlerts().catch(() => []),
          reportService.listReports().catch(() => []),
          operatorService.listUsers({}).catch(() => ({ items: [] })),
        ])
        setStats(dashStats)
        setAlertCount(Array.isArray(alerts) ? alerts.length : 0)
        setReportCount(Array.isArray(reports) ? reports.length : 0)
        setUserCount(users?.items?.length || 0)
      } catch {
        console.error('Failed to fetch analytics data')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return (
    <PermissionGuard permission="analytics.view">
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-emergency-100 rounded-lg">
              <BarChart3 className="h-8 w-8 text-emergency-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics & Reporting</h1>
              <p className="text-gray-500">Data insights and performance metrics</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active SOS Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">{loading ? '—' : alertCount}</p>
                </div>
                <div className="p-3 bg-emergency-100 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-emergency-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg Response Time</p>
                  <p className="text-2xl font-bold text-gray-900">{loading ? '—' : `${stats?.average_response_time || 0}m`}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Reports</p>
                  <p className="text-2xl font-bold text-gray-900">{loading ? '—' : reportCount}</p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-full">
                  <FileText className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Active Operators</p>
                  <p className="text-2xl font-bold text-gray-900">{loading ? '—' : userCount}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sos">SOS Analytics</TabsTrigger>
            <TabsTrigger value="cases">Case Reports</TabsTrigger>
            <TabsTrigger value="users">User Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart className="h-5 w-5 mr-2" />
                    SOS Alerts Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  {loading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  ) : (
                    <p className="text-gray-500">{alertCount} active SOS alerts</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart className="h-5 w-5 mr-2" />
                    Reports Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  {loading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  ) : (
                    <p className="text-gray-500">{reportCount} total incident reports</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sos">
            <Card>
              <CardHeader>
                <CardTitle>SOS Alert Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-8">
                  {loading ? 'Loading...' : `${alertCount} active SOS alerts in the system`}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cases">
            <Card>
              <CardHeader>
                <CardTitle>Case Performance Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-8">
                  {loading ? 'Loading...' : `${reportCount} incident reports filed`}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Activity Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-8">
                  {loading ? 'Loading...' : `${userCount} active operators in the system`}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
    </PermissionGuard>
  )
}
