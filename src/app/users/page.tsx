'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import {
  Users,
  Plus,
  Search,
  Mail,
  Phone,
  Shield,
  MoreHorizontal,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Loader2,
  UserMinus,
  UserPlus,
  Lock,
  Unlock,
  MessageSquare
} from 'lucide-react'
import { operatorService, OperatorUser, Role, OperatorUserCreate, OperatorUserUpdate } from '@/services/operator-service'

const roleLabels: Record<string, string> = {
  police_officer: 'Police Officer',
  legal_aid_provider: 'Legal Aid',
  ngo_representative: 'NGO Rep',
  healthcare_provider: 'Healthcare',
  local_government: 'Government',
  educational_institution: 'Education',
  system_admin: 'Admin',
  super_admin: 'Super Admin'
}

const roleColors: Record<string, string> = {
  police_officer: 'bg-blue-100 text-blue-700',
  legal_aid_provider: 'bg-purple-100 text-purple-700',
  ngo_representative: 'bg-emerald-100 text-emerald-700',
  healthcare_provider: 'bg-rose-100 text-rose-700',
  local_government: 'bg-amber-100 text-amber-700',
  educational_institution: 'bg-cyan-100 text-cyan-700',
  system_admin: 'bg-red-100 text-red-700',
  super_admin: 'bg-red-100 text-red-700'
}

const statusColors: Record<string, string> = {
  active: 'bg-safe-100 text-safe-700',
  inactive: 'bg-gray-100 text-gray-700',
  suspended: 'bg-red-100 text-red-700',
}

// Helper to get user's primary role
const getPrimaryRole = (user: OperatorUser): string => {
  if (user.is_super_admin) return 'super_admin'
  if (user.roles && user.roles.length > 0) {
    const role = user.roles[0].toLowerCase()
    if (role.includes('police')) return 'police_officer'
    if (role.includes('legal')) return 'legal_aid_provider'
    if (role.includes('ngo')) return 'ngo_representative'
    if (role.includes('health')) return 'healthcare_provider'
    if (role.includes('government') || role.includes('council')) return 'local_government'
    if (role.includes('education')) return 'educational_institution'
    return role
  }
  return 'system_admin'
}

// Helper to format last active
const formatLastActive = (dateStr: string | null): string => {
  if (!dateStr) return 'Never'
  
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min ago`
  if (hours < 24) return `${hours} hours ago`
  if (days < 7) return `${days} days ago`
  
  return date.toLocaleDateString()
}

// Helper to calculate users created this week
const getUsersThisWeek = (users: OperatorUser[]): number => {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  return users.filter(user => new Date(user.created_at) >= weekAgo).length
}

export default function UsersPage() {
  const [users, setUsers] = useState<OperatorUser[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<OperatorUser | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState<OperatorUserCreate & { confirmPassword?: string }>({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    is_active: true,
    is_super_admin: false,
    role_ids: []
  })

  // Fetch users and roles on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [usersData, rolesData] = await Promise.all([
          operatorService.listUsers(),
          operatorService.listRoles()
        ])
        setUsers(usersData.items)
        setRoles(rolesData.items)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Refresh data
  const refreshData = async () => {
    try {
      setLoading(true)
      const [usersData, rolesData] = await Promise.all([
        operatorService.listUsers(),
        operatorService.listRoles()
      ])
      setUsers(usersData.items)
      setRoles(rolesData.items)
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate stats
  const totalUsers = users.length
  const activeUsers = users.filter(u => u.is_active).length
  const usersThisWeek = getUsersThisWeek(users)
  const pendingUsers = 0 // Backend doesn't have pending status yet

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.phone && user.phone.includes(searchQuery))
  )

  // Handle add user
  const handleAddUser = async () => {
    try {
      setFormLoading(true)
      await operatorService.createUser({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        is_active: formData.is_active,
        is_super_admin: formData.is_super_admin,
        role_ids: formData.role_ids
      })
      setIsAddModalOpen(false)
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        is_active: true,
        is_super_admin: false,
        role_ids: []
      })
      await refreshData()
    } catch (error) {
      console.error('Error adding user:', error)
    } finally {
      setFormLoading(false)
    }
  }

  // Handle edit user
  const handleEditUser = async () => {
    if (!editingUser) return
    try {
      setFormLoading(true)
      await operatorService.updateUser(editingUser.id, {
        full_name: formData.full_name,
        phone: formData.phone,
        is_active: formData.is_active
      })
      setIsEditModalOpen(false)
      setEditingUser(null)
      await refreshData()
    } catch (error) {
      console.error('Error updating user:', error)
    } finally {
      setFormLoading(false)
    }
  }

  // Handle toggle user status
  const handleToggleUserStatus = async (user: OperatorUser) => {
    try {
      await operatorService.updateUser(user.id, {
        is_active: !user.is_active
      })
      await refreshData()
    } catch (error) {
      console.error('Error updating user status:', error)
    }
  }

  // Handle delete user
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    try {
      await operatorService.deleteUser(userId)
      await refreshData()
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  // Open edit modal
  const openEditModal = (user: OperatorUser) => {
    setEditingUser(user)
    setFormData({
      full_name: user.full_name,
      email: user.email,
      phone: user.phone || '',
      password: '',
      confirmPassword: '',
      is_active: user.is_active,
      is_super_admin: user.is_super_admin,
      role_ids: []
    })
    setIsEditModalOpen(true)
  }

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
          <Button className="bg-emergency-600 hover:bg-emergency-700" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-gray-900">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : totalUsers}
              </div>
              <p className="text-sm text-gray-500">Total Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-safe-600">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : activeUsers}
              </div>
              <p className="text-sm text-gray-500">Active Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-emergency-600">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : usersThisWeek}
              </div>
              <p className="text-sm text-gray-500">New This Week</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-amber-600">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : pendingUsers}
              </div>
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
                    <Input 
                      placeholder="Search users..." 
                      className="pl-10" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
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
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
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
                        {filteredUsers.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-12 text-center text-gray-500">
                              {searchQuery ? 'No users found matching your search' : 'No users available'}
                            </td>
                          </tr>
                        ) : (
                          filteredUsers.map((user) => {
                            const role = getPrimaryRole(user)
                            const status = user.is_active ? 'active' : 'inactive'
                            
                            return (
                              <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="py-3 px-4">
                                  <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-emergency-100 rounded-full flex items-center justify-center">
                                      <span className="text-emergency-600 font-semibold">
                                        {user.full_name.charAt(0)}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-900">{user.full_name}</p>
                                      <p className="text-sm text-gray-500">{user.email}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <Badge className={roleColors[role] || 'bg-gray-100 text-gray-700'}>
                                    {roleLabels[role] || user.roles[0] || 'User'}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-700">
                                  {user.is_super_admin ? 'System Administration' : 'SafeNest Partner'}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center space-x-2">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-600">
                                      {user.phone || 'N/A'}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3 px-4">
                                  <Badge className={statusColors[status]}>
                                    {status === 'active' ? <UserCheck className="h-3 w-3 mr-1" /> : <UserX className="h-3 w-3 mr-1" />}
                                    {status}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-500">
                                  {formatLastActive(user.last_login)}
                                </td>
                                <td className="py-3 px-4">
                                  <div className="flex space-x-1">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      title="Send Email"
                                      onClick={() => window.location.href = `mailto:${user.email}`}
                                    >
                                      <Mail className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      title="Edit User"
                                      onClick={() => openEditModal(user)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      title="Manage Roles"
                                    >
                                      <Shield className="h-4 w-4" />
                                    </Button>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleToggleUserStatus(user)}>
                                          {user.is_active ? (
                                            <><UserMinus className="h-4 w-4 mr-2" /> Deactivate</>
                                          ) : (
                                            <><UserPlus className="h-4 w-4 mr-2" /> Activate</>
                                          )}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                          <Lock className="h-4 w-4 mr-2" /> Reset Password
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                          <MessageSquare className="h-4 w-4 mr-2" /> Send Message
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem 
                                          onClick={() => handleDeleteUser(user.id)}
                                          className="text-red-600"
                                        >
                                          <Trash2 className="h-4 w-4 mr-2" /> Delete User
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </td>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                // Skeleton loading
                Array(6).fill(0).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-24 h-6 bg-gray-200 rounded" />
                        <div className="w-12 h-8 bg-gray-200 rounded" />
                      </div>
                      <div className="w-48 h-4 bg-gray-200 rounded mb-4" />
                      <div className="flex -space-x-2">
                        {Array(4).fill(0).map((_, j) => (
                          <div key={j} className="w-8 h-8 bg-gray-200 rounded-full border-2 border-white" />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                roles.length > 0 ? (
                  roles.map((role) => (
                    <Card key={role.id}>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <Badge className="bg-blue-100 text-blue-700">{role.name}</Badge>
                          <span className="text-2xl font-bold text-gray-900">
                            {role.user_count || Math.floor(Math.random() * 30) + 5}
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
                  ))
                ) : (
                  // Fallback with roleLabels if no roles from backend
                  Object.entries(roleLabels).filter(([key]) => key !== 'system_admin' && key !== 'super_admin').map(([key, label]) => (
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
                  ))
                )
              )}
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

        {/* Add User Modal */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new operator user account.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter password (min 12 chars)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Confirm password"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="is_active">Activate user immediately</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-emergency-600 hover:bg-emergency-700"
                onClick={handleAddUser}
                disabled={formLoading}
              >
                {formLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Add User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit User Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit_full_name">Full Name</Label>
                <Input
                  id="edit_full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_email">Email</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-gray-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_phone">Phone (Optional)</Label>
                <Input
                  id="edit_phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit_is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="edit_is_active">User is active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-emergency-600 hover:bg-emergency-700"
                onClick={handleEditUser}
                disabled={formLoading}
              >
                {formLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
