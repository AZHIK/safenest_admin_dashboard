'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, Plus, Search, Mail, Phone, Shield, MoreHorizontal, Edit, Trash2, UserCheck, UserX } from 'lucide-react'

const mockUsers = [
  { id: 1, name: 'Dr. Sarah Johnson', email: 'sarah.j@police.gov', role: 'police_officer', department: 'Domestic Violence Unit', phone: '(555) 123-4567', status: 'active', lastActive: '2 min ago' },
  { id: 2, name: 'Michael Chen', email: 'mchen@legalaid.org', role: 'legal_aid_provider', department: 'Legal Aid Society', phone: '(555) 234-5678', status: 'active', lastActive: '1 hour ago' },
  { id: 3, name: 'Emily Rodriguez', email: 'emily.r@hope.org', role: 'ngo_representative', department: 'Hope Center', phone: '(555) 345-6789', status: 'active', lastActive: '30 min ago' },
  { id: 4, name: 'James Wilson', email: 'jwilson@health.gov', role: 'healthcare_provider', department: 'Public Health Dept', phone: '(555) 456-7890', status: 'inactive', lastActive: '3 days ago' },
  { id: 5, name: 'Lisa Thompson', email: 'lisa.t@council.gov', role: 'local_government', department: 'City Council', phone: '(555) 567-8901', status: 'active', lastActive: '5 min ago' },
  { id: 6, name: 'Robert Kim', email: 'rkim@edu.org', role: 'educational_institution', department: 'Community College', phone: '(555) 678-9012', status: 'active', lastActive: '2 hours ago' },
]

const roleLabels: Record<string, string> = {
  police_officer: 'Police Officer',
  legal_aid_provider: 'Legal Aid',
  ngo_representative: 'NGO Rep',
  healthcare_provider: 'Healthcare',
  local_government: 'Government',
  educational_institution: 'Education',
  system_admin: 'Admin',
}

const roleColors: Record<string, string> = {
  police_officer: 'bg-blue-100 text-blue-700',
  legal_aid_provider: 'bg-purple-100 text-purple-700',
  ngo_representative: 'bg-emerald-100 text-emerald-700',
  healthcare_provider: 'bg-rose-100 text-rose-700',
  local_government: 'bg-amber-100 text-amber-700',
  educational_institution: 'bg-cyan-100 text-cyan-700',
  system_admin: 'bg-red-100 text-red-700',
}

const statusColors: Record<string, string> = {
  active: 'bg-safe-100 text-safe-700',
  inactive: 'bg-gray-100 text-gray-700',
  suspended: 'bg-red-100 text-red-700',
}

export default function UsersPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-emergency-100 rounded-lg">
              <Users className="h-8 w-8 text-emergency-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-500">Manage stakeholders and system users</p>
            </div>
          </div>
          <Button className="bg-emergency-600 hover:bg-emergency-700">
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-gray-900">156</div>
              <p className="text-sm text-gray-500">Total Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-safe-600">142</div>
              <p className="text-sm text-gray-500">Active Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-emergency-600">12</div>
              <p className="text-sm text-gray-500">New This Week</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-amber-600">14</div>
              <p className="text-sm text-gray-500">Pending Approval</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Users</TabsTrigger>
            <TabsTrigger value="roles">By Role</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search users..." className="pl-10" />
                  </div>
                  <Button variant="outline" size="sm">Filter</Button>
                </div>
              </CardContent>
            </Card>

            {/* Users Table */}
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">User</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Role</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Department</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Contact</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Last Active</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockUsers.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-emergency-100 rounded-full flex items-center justify-center">
                                <span className="text-emergency-600 font-semibold">{user.name.charAt(0)}</span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{user.name}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={roleColors[user.role]}>{roleLabels[user.role]}</Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">{user.department}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">{user.phone}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={statusColors[user.status]}>
                              {user.status === 'active' ? <UserCheck className="h-3 w-3 mr-1" /> : <UserX className="h-3 w-3 mr-1" />}
                              {user.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-500">{user.lastActive}</td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-1">
                              <Button variant="ghost" size="sm">
                                <Mail className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Shield className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(roleLabels).filter(([key]) => key !== 'system_admin').map(([key, label]) => (
                <Card key={key}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Badge className={roleColors[key]}>{label}</Badge>
                      <span className="text-2xl font-bold text-gray-900">
                        {Math.floor(Math.random() * 30) + 5}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">Active users in this role</p>
                    <div className="mt-4 flex -space-x-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-8 h-8 bg-gray-200 rounded-full border-2 border-white" />
                      ))}
                      <div className="w-8 h-8 bg-gray-100 rounded-full border-2 border-white flex items-center justify-center text-xs text-gray-500">
                        +5
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">No pending user approvals</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
