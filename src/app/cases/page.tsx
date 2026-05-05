'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { FileText, Plus, Search, Filter, MoreHorizontal, Clock, User, MapPin } from 'lucide-react'

const mockCases = [
  { id: 'CASE-001', title: 'Domestic Violence Report', status: 'active', priority: 'high', assignedTo: 'Officer Smith', location: 'Downtown', createdAt: '2024-01-15' },
  { id: 'CASE-002', title: 'Missing Person Investigation', status: 'pending', priority: 'critical', assignedTo: 'Detective Jones', location: 'Westside', createdAt: '2024-01-14' },
  { id: 'CASE-003', title: 'Harassment Complaint', status: 'resolved', priority: 'medium', assignedTo: 'Officer Brown', location: 'North District', createdAt: '2024-01-13' },
  { id: 'CASE-004', title: 'Emergency Shelter Referral', status: 'active', priority: 'high', assignedTo: 'Case Worker Lee', location: 'Central', createdAt: '2024-01-12' },
  { id: 'CASE-005', title: 'Safety Planning Session', status: 'scheduled', priority: 'low', assignedTo: 'Counselor Davis', location: 'Support Center A', createdAt: '2024-01-11' },
]

const statusColors: Record<string, string> = {
  active: 'bg-emergency-100 text-emergency-700',
  pending: 'bg-amber-100 text-amber-700',
  resolved: 'bg-safe-100 text-safe-700',
  scheduled: 'bg-blue-100 text-blue-700',
}

const priorityColors: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-700',
}

export default function CasesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-emergency-100 rounded-lg">
              <FileText className="h-8 w-8 text-emergency-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Case Management</h1>
              <p className="text-gray-500">Manage and track all cases</p>
            </div>
          </div>
          <Button className="bg-emergency-600 hover:bg-emergency-700">
            <Plus className="h-4 w-4 mr-2" />
            New Case
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-gray-900">24</div>
              <p className="text-sm text-gray-500">Active Cases</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-amber-600">8</div>
              <p className="text-sm text-gray-500">Pending Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-safe-600">156</div>
              <p className="text-sm text-gray-500">Resolved This Month</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-red-600">3</div>
              <p className="text-sm text-gray-500">Critical Priority</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search cases..." className="pl-10" />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cases Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Case ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Title</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Priority</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Assigned To</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Location</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Created</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockCases.map((case_) => (
                    <tr key={case_.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{case_.id}</td>
                      <td className="py-3 px-4 text-sm text-gray-700">{case_.title}</td>
                      <td className="py-3 px-4">
                        <Badge className={statusColors[case_.status]}>{case_.status}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={priorityColors[case_.priority]}>{case_.priority}</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1 text-gray-400" />
                          {case_.assignedTo}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-700">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                          {case_.location}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {case_.createdAt}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
