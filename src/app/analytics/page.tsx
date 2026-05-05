'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart3, Download, Calendar, TrendingUp, Users, AlertTriangle, Clock, FileText, BarChart, PieChart } from 'lucide-react'

export default function AnalyticsPage() {
  return (
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
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Last 30 Days
            </Button>
            <Button className="bg-emergency-600 hover:bg-emergency-700" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total SOS Alerts</p>
                  <p className="text-2xl font-bold text-gray-900">1,234</p>
                  <p className="text-xs text-safe-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12% from last month
                  </p>
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
                  <p className="text-sm text-gray-500">Response Time</p>
                  <p className="text-2xl font-bold text-gray-900">4.2 min</p>
                  <p className="text-xs text-safe-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    -18% improvement
                  </p>
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
                  <p className="text-sm text-gray-500">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">142</p>
                  <p className="text-xs text-safe-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8 this week
                  </p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-full">
                  <Users className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Cases Resolved</p>
                  <p className="text-2xl font-bold text-gray-900">892</p>
                  <p className="text-xs text-safe-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +23% this month
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <FileText className="h-6 w-6 text-purple-600" />
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
                    SOS Alerts by Week
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="flex items-end justify-center space-x-4 h-[200px]">
                      {[45, 62, 38, 75, 56, 89, 67].map((h, i) => (
                        <div key={i} className="flex flex-col items-center">
                          <div 
                            className="w-12 bg-emergency-500 rounded-t" 
                            style={{ height: `${h * 2}px` }}
                          />
                          <span className="text-xs text-gray-500 mt-2">W{i + 1}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-4">Weekly SOS alert volume</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <PieChart className="h-5 w-5 mr-2" />
                    Alert Types Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="relative w-40 h-40 mx-auto">
                      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#fee2e2" strokeWidth="20" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#dc2626" strokeWidth="20" strokeDasharray="75 251" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="20" strokeDasharray="50 251" strokeDashoffset="-75" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="20" strokeDasharray="40 251" strokeDashoffset="-125" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="20" strokeDasharray="86 251" strokeDashoffset="-165" />
                      </svg>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                      <div className="flex items-center"><div className="w-3 h-3 bg-red-600 rounded-full mr-2" />Emergency (30%)</div>
                      <div className="flex items-center"><div className="w-3 h-3 bg-amber-500 rounded-full mr-2" />Urgent (20%)</div>
                      <div className="flex items-center"><div className="w-3 h-3 bg-emerald-500 rounded-full mr-2" />Standard (16%)</div>
                      <div className="flex items-center"><div className="w-3 h-3 bg-blue-500 rounded-full mr-2" />Info (34%)</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { action: 'New SOS Alert', user: 'Mobile App User', time: '2 min ago', type: 'alert' },
                    { action: 'Case updated', user: 'Officer Johnson', time: '15 min ago', type: 'case' },
                    { action: 'User logged in', user: 'Dr. Sarah Chen', time: '30 min ago', type: 'user' },
                    { action: 'Support center added', user: 'Admin', time: '1 hour ago', type: 'center' },
                    { action: 'Training completed', user: 'Michael Roberts', time: '2 hours ago', type: 'training' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          item.type === 'alert' ? 'bg-red-500' :
                          item.type === 'case' ? 'bg-blue-500' :
                          item.type === 'user' ? 'bg-emerald-500' :
                          item.type === 'center' ? 'bg-purple-500' : 'bg-amber-500'
                        }`} />
                        <span className="text-sm font-medium text-gray-900">{item.action}</span>
                        <span className="text-sm text-gray-500">by {item.user}</span>
                      </div>
                      <span className="text-sm text-gray-400">{item.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sos">
            <Card>
              <CardHeader>
                <CardTitle>SOS Alert Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Detailed SOS analytics coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cases">
            <Card>
              <CardHeader>
                <CardTitle>Case Performance Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Case analytics coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Activity Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">User activity analytics coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
