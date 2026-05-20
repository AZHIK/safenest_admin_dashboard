'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Users,
  Phone,
  Search,
  Loader2,
  AlertTriangle,
  Shield,
  Calendar,
  MapPin,
  Heart,
  Clock,
  FileText,
  CheckCircle2,
  XCircle,
  MoreVertical,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Lock,
  Smartphone,
  Eye,
  Settings,
  ShieldClose,
  UserCheck,
  UserX
} from 'lucide-react'
import { mobileUserService, MobileUser, MobileUserDetail, TrustedContact, ActivityItem } from '@/services/mobile-user-service'
import { useAuthStore } from '@/store/auth-store'
import { formatDateTime, getRelativeTime } from '@/lib/utils'
import { SOSMapPanel } from '@/components/sos/SOSMapPanel'
import { cn } from '@/lib/utils'

export default function MobileUsersPage() {
  const [users, setUsers] = useState<MobileUser[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [selectedUser, setSelectedUser] = useState<MobileUserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [anonFilter, setAnonFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  const { hasPermission } = useAuthStore()
  const canSuspend = hasPermission('users.suspend')
  const canDelete = hasPermission('users.delete')

  // Load Users
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params: any = {
        page: currentPage,
        page_size: 15,
        search: searchTerm || undefined,
      }
      
      if (statusFilter !== 'all') {
        params.status = statusFilter
      }
      if (anonFilter !== 'all') {
        params.is_anonymous = anonFilter === 'anonymous'
      }

      const data = await mobileUserService.listMobileUsers(params)
      setUsers(data.items || [])
      setTotalCount(data.total || 0)
      setTotalPages(data.pages || 1)

      // Auto-select first user if none selected
      if (data.items && data.items.length > 0 && !selectedUser) {
        handleSelectUser(data.items[0].id)
      }
    } catch (error) {
      console.error('Failed to load mobile users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [currentPage, statusFilter, anonFilter])

  // Trigger search on enter or button click
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchUsers()
  }

  // Load User Details
  const handleSelectUser = async (userId: string) => {
    setDetailLoading(true)
    try {
      const data = await mobileUserService.getMobileUser(userId)
      setSelectedUser(data)
    } catch (error) {
      console.error('Failed to load user details:', error)
    } finally {
      setDetailLoading(false)
    }
  }

  // Change user status (Suspend/Activate)
  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    try {
      const updated = await mobileUserService.updateMobileUserStatus(userId, newStatus)
      // Update local state lists
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: updated.status as any } : u))
      if (selectedUser?.id === userId) {
        setSelectedUser(prev => prev ? { ...prev, status: updated.status as any } : null)
      }
      fetchUsers()
    } catch (error) {
      console.error('Failed to update user status:', error)
    }
  }

  // Delete User
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to permanently delete this mobile user? This action will remove all their contacts, reports, and alerts.')) {
      return
    }
    try {
      await mobileUserService.deleteMobileUser(userId)
      setSelectedUser(null)
      fetchUsers()
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  // Quick helper for status colors
  const getStatusBadge = (statusStr: string) => {
    switch (statusStr) {
      case 'active':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none font-medium">Active</Badge>
      case 'suspended':
        return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-none font-medium">Suspended</Badge>
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-none font-medium">Inactive</Badge>
      case 'anonymous':
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none font-medium">Anonymous</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-none font-medium">{statusStr}</Badge>
    }
  }

  // Quick helper for timeline icons
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'auth':
        return <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600"><Lock className="h-4 w-4" /></div>
      case 'sos':
        return <div className="p-1.5 bg-red-50 rounded-lg text-red-600"><AlertTriangle className="h-4 w-4" /></div>
      case 'report':
        return <div className="p-1.5 bg-amber-50 rounded-lg text-amber-600"><FileText className="h-4 w-4" /></div>
      case 'contact':
        return <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600"><Heart className="h-4 w-4" /></div>
      default:
        return <div className="p-1.5 bg-gray-50 rounded-lg text-gray-600"><Clock className="h-4 w-4" /></div>
    }
  }

  // Quick stats calculations
  const anonymousCount = users.filter(u => u.is_anonymous).length
  const suspendedCount = users.filter(u => u.status === 'suspended').length
  const verifiedCount = users.filter(u => u.is_verified).length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 rounded-2xl px-6 py-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
              <Phone className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Mobile App Users</h1>
              <p className="text-indigo-200 text-sm mt-0.5">
                Oversee mobile application subscribers, manage trusted emergency contacts, and monitor active safety statuses
              </p>
            </div>
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md text-xs text-indigo-100 flex items-center gap-2">
            <Users className="h-4 w-4 text-indigo-300" />
            <span className="font-semibold text-white">{totalCount}</span> Total Mobile App Profiles
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Subscribers', value: totalCount, bg: 'bg-white border-l-4 border-indigo-600', text: 'text-indigo-700', sub: 'Registered app profiles' },
            { label: 'Verified Accounts', value: totalCount - anonymousCount, bg: 'bg-white border-l-4 border-emerald-500', text: 'text-emerald-700', sub: 'Verified phone numbers' },
            { label: 'Anonymous Sessions', value: anonymousCount, bg: 'bg-white border-l-4 border-amber-500', text: 'text-amber-700', sub: 'Privacy-focused profiles' },
            { label: 'Suspended Users', value: suspendedCount, bg: 'bg-white border-l-4 border-rose-500', text: 'text-rose-700', sub: 'Blocked or flagged for review' },
          ].map((stat, i) => (
            <Card key={i} className={cn(stat.bg, "shadow-sm")}>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{stat.label}</p>
                  <p className={cn("text-3xl font-bold mt-1", stat.text)}>{stat.value}</p>
                  <p className="text-[10px] text-gray-400 mt-1">{stat.sub}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left master list (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* Filtering Box */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm space-y-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by phone, nickname..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2"
                  />
                </div>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  Search
                </Button>
              </form>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Profile Type</label>
                  <select 
                    value={anonFilter}
                    onChange={e => { setAnonFilter(e.target.value); setCurrentPage(1); }}
                    className="w-full mt-1 border border-gray-200 rounded-lg p-2 bg-gray-50 text-gray-700 focus:outline-none"
                  >
                    <option value="all">All Profiles</option>
                    <option value="verified">Verified Users</option>
                    <option value="anonymous">Anonymous Users</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Account Status</label>
                  <select
                    value={statusFilter}
                    onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    className="w-full mt-1 border border-gray-200 rounded-lg p-2 bg-gray-50 text-gray-700 focus:outline-none"
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="suspended">Suspended Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Master User List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex-1 flex flex-col min-h-[500px]">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <span className="text-sm font-semibold text-gray-700">Subscribers list</span>
                <span className="text-[10px] text-gray-400">Sorted by registration date</span>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[600px] divide-y divide-gray-100">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    <p className="text-xs">Loading subscriber directory...</p>
                  </div>
                ) : users.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
                    <Smartphone className="h-10 w-10 text-gray-300" />
                    <p className="text-sm font-medium">No mobile users match your filters</p>
                  </div>
                ) : (
                  users.map(user => {
                    const isSelected = selectedUser?.id === user.id
                    return (
                      <div
                        key={user.id}
                        onClick={() => handleSelectUser(user.id)}
                        className={cn(
                          "p-4 cursor-pointer transition-all flex items-center justify-between hover:bg-indigo-50/30",
                          isSelected ? "bg-indigo-50/80 border-r-4 border-indigo-600" : ""
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                            user.is_anonymous 
                              ? "bg-amber-50 text-amber-700 border border-amber-200" 
                              : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          )}>
                            {user.is_anonymous ? 'A' : (user.nickname?.charAt(0).toUpperCase() || 'U')}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-gray-800">
                              {user.is_anonymous ? 'Anonymous Survivor' : (user.nickname || 'Verified User')}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <Phone className="h-3 w-3 text-gray-400" />
                              {user.phone_number ? `${user.country_code || ''} ${user.phone_number}` : 'No phone number'}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          {getStatusBadge(user.status)}
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(user.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="p-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-xs text-gray-600">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  >
                    Previous
                  </Button>
                  <span>Page {currentPage} of {totalPages}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Right details panel (7 Cols) */}
          <div className="lg:col-span-7">
            {detailLoading ? (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-24 text-center flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                <p className="text-sm font-semibold text-gray-700">Loading user profile details...</p>
                <p className="text-xs text-gray-400">Assembling contacts list and safety action logs</p>
              </div>
            ) : selectedUser ? (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-4 flex flex-col">
                
                {/* Profile Header card */}
                <div className={cn(
                  "p-6 border-b border-gray-100 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm",
                  selectedUser.status === 'suspended' ? 'bg-gradient-to-r from-red-600 to-red-800' : 'bg-gradient-to-r from-indigo-600 to-indigo-800'
                )}>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center font-bold text-2xl backdrop-blur-md border border-white/20">
                      {selectedUser.is_anonymous ? 'A' : (selectedUser.nickname?.charAt(0).toUpperCase() || 'U')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="text-xl font-bold text-white">
                          {selectedUser.is_anonymous ? 'Anonymous Survivor' : (selectedUser.nickname || 'Verified User')}
                        </h2>
                        {getStatusBadge(selectedUser.status)}
                      </div>
                      <p className="text-indigo-100 text-xs mt-1 leading-relaxed">
                        ID: {selectedUser.id}
                      </p>
                      <p className="text-indigo-200 text-[11px] mt-1.5 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        Registered {formatDateTime(selectedUser.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Actions Dropdown */}
                  <div className="flex items-center gap-2 self-end md:self-auto">
                    {canSuspend && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-9 w-9 p-0 bg-white/10 hover:bg-white/20 text-white hover:text-white rounded-lg">
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                          <DropdownMenuItem 
                            onClick={() => handleUpdateStatus(selectedUser.id, selectedUser.status === 'suspended' ? 'active' : 'suspended')}
                            className="cursor-pointer font-medium p-2 text-sm flex items-center gap-2 hover:bg-gray-50"
                          >
                            {selectedUser.status === 'suspended' ? (
                              <><UserCheck className="h-4 w-4 text-emerald-600" /> Activate Account</>
                            ) : (
                              <><UserX className="h-4 w-4 text-rose-600" /> Suspend Account</>
                            )}
                          </DropdownMenuItem>
                          
                          <DropdownMenuItem
                            onClick={() => handleUpdateStatus(selectedUser.id, 'inactive')}
                            className="cursor-pointer font-medium p-2 text-sm flex items-center gap-2 hover:bg-gray-50 text-gray-700"
                          >
                            <ShieldClose className="h-4 w-4" /> Set Inactive
                          </DropdownMenuItem>

                          {canDelete && (
                            <>
                              <DropdownMenuSeparator className="border-t border-gray-100 my-1" />
                              <DropdownMenuItem
                                onClick={() => handleDeleteUser(selectedUser.id)}
                                className="cursor-pointer font-semibold p-2 text-sm flex items-center gap-2 text-rose-600 hover:bg-rose-50"
                              >
                                <Trash2 className="h-4 w-4" /> Delete Account
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>

                {/* Tabs Panel */}
                <Tabs defaultValue="contacts" className="w-full">
                  <div className="border-b border-gray-100 bg-gray-50/50">
                    <TabsList className="bg-transparent flex justify-start rounded-none h-12 p-0 px-4 border-none">
                      <TabsTrigger 
                        value="contacts" 
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-4 font-semibold text-xs text-gray-500 data-[state=active]:text-indigo-700 h-full"
                      >
                        Trusted Contacts ({selectedUser.trusted_contacts.length})
                      </TabsTrigger>
                      <TabsTrigger 
                        value="timeline" 
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-4 font-semibold text-xs text-gray-500 data-[state=active]:text-indigo-700 h-full"
                      >
                        User Actions ({selectedUser.activity_log.length})
                      </TabsTrigger>
                      <TabsTrigger 
                        value="map" 
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent px-4 font-semibold text-xs text-gray-500 data-[state=active]:text-indigo-700 h-full"
                      >
                        Latest SOS Locations
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* TAB 1: Trusted Contacts list */}
                  <TabsContent value="contacts" className="p-6 focus-visible:outline-none">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Emergency Safeguard Contacts</h3>
                        <span className="text-xs text-gray-400">Priority ordered</span>
                      </div>

                      {selectedUser.trusted_contacts.length === 0 ? (
                        <div className="border border-dashed border-gray-200 rounded-xl p-12 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
                          <Heart className="h-8 w-8 text-gray-300" />
                          <p className="text-sm font-medium">No trusted contacts added by this user</p>
                          <p className="text-xs text-gray-400">Emergency notifications will fall back to local authorities</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedUser.trusted_contacts.map((contact, index) => (
                            <div 
                              key={contact.id} 
                              className="border border-gray-200 hover:border-indigo-100 rounded-xl p-4 shadow-sm flex flex-col justify-between hover:bg-indigo-50/10 transition-colors relative overflow-hidden"
                            >
                              {/* Top priority banner */}
                              <div className="absolute top-0 right-0 bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 text-[9px] rounded-bl-lg">
                                PRIORITY {contact.priority}
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                    {contact.name.charAt(0)}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm text-gray-800">{contact.name}</h4>
                                    <p className="text-xs text-gray-500 capitalize">{contact.relationship || 'Contact'}</p>
                                  </div>
                                </div>

                                <div className="mt-4 space-y-1.5 text-xs text-gray-600">
                                  <p className="flex items-center gap-1.5">
                                    <Phone className="h-3.5 w-3.5 text-gray-400" />
                                    {contact.phone_number}
                                  </p>
                                  <p className="flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                    Added {new Date(contact.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>

                              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-1 text-[10px] text-gray-500">
                                <span className={cn(
                                  "flex items-center gap-1 font-semibold",
                                  contact.notify_sms ? "text-indigo-600" : "text-gray-400"
                                )}>
                                  {contact.notify_sms ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                  SMS Alerts
                                </span>
                                <span className={cn(
                                  "flex items-center gap-1 font-semibold",
                                  contact.notify_push ? "text-indigo-600" : "text-gray-400"
                                )}>
                                  {contact.notify_push ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                                  Push Alerts
                                </span>
                                <span className={cn(
                                  "flex items-center gap-1 font-semibold px-1.5 py-0.5 rounded-full",
                                  contact.is_verified ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                                )}>
                                  {contact.is_verified ? 'Verified' : 'Pending'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  {/* TAB 2: visual chronological activities timeline */}
                  <TabsContent value="timeline" className="p-6 focus-visible:outline-none">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Subscriber Event Log</h3>
                        <span className="text-xs text-gray-400">Chronological history</span>
                      </div>

                      <div className="relative pl-6 border-l border-gray-200 space-y-6 ml-3 py-1">
                        {selectedUser.activity_log.map((item, index) => (
                          <div key={item.id} className="relative">
                            
                            {/* Dot on border */}
                            <span className="absolute -left-[37px] top-1 bg-white p-0.5 rounded-full border border-gray-200">
                              {getActivityIcon(item.type)}
                            </span>

                            <div className="bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-xl p-4 shadow-xs transition-colors">
                              <div className="flex justify-between items-start gap-4">
                                <div>
                                  <h4 className="font-semibold text-sm text-gray-800">{item.title}</h4>
                                  <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                                </div>
                                <span className="text-[10px] text-gray-400 font-medium shrink-0 flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  {getRelativeTime(item.timestamp)}
                                </span>
                              </div>

                              {/* Metadata chips */}
                              {item.meta && (
                                <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
                                  {Object.entries(item.meta).map(([k, v]) => {
                                    if (typeof v === 'object') return null
                                    return (
                                      <span key={k} className="bg-white border border-gray-200 px-2 py-0.5 rounded-md text-gray-500 font-mono">
                                        <span className="text-gray-400 capitalize">{k.replace(/_/g, ' ')}:</span> {String(v)}
                                      </span>
                                    )
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* TAB 3: Map Panel showing latest locations */}
                  <TabsContent value="map" className="p-6 focus-visible:outline-none">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Last Emergency Location Ping</h3>
                        {selectedUser.sos_alerts.length > 0 && (
                          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none font-medium text-xs">
                            Active SOS
                          </Badge>
                        )}
                      </div>

                      {selectedUser.sos_alerts.length === 0 ? (
                        <div className="border border-dashed border-gray-200 rounded-xl p-16 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
                          <MapPin className="h-10 w-10 text-gray-300" />
                          <p className="text-sm font-medium">No emergency location data available</p>
                          <p className="text-xs text-gray-400">Survivor has not triggered any SOS alarms yet</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {/* Display the map for the latest SOS alert */}
                          {(() => {
                            const latestAlert = selectedUser.sos_alerts[0]
                            return (
                              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center text-xs text-gray-600 font-medium">
                                  <span className="flex items-center gap-1.5 text-gray-700">
                                    <MapPin className="h-4 w-4 text-red-500" />
                                    {latestAlert.initial_address || 'Address coordinates lookup...'}
                                  </span>
                                  <span>Alert Triggered {new Date(latestAlert.created_at).toLocaleTimeString()}</span>
                                </div>
                                <div className="h-[380px]">
                                  <SOSMapPanel
                                    latitude={latestAlert.initial_latitude}
                                    longitude={latestAlert.initial_longitude}
                                    address={latestAlert.initial_address}
                                    accuracy={latestAlert.initial_accuracy}
                                    recentLocations={[]}  // We only show initial pin, or recentLocations if included in detail
                                  />
                                </div>
                              </div>
                            )
                          })()}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-24 text-center">
                <Smartphone className="h-16 w-16 text-indigo-100 mx-auto mb-3" />
                <p className="text-gray-500 font-semibold">Select a Mobile Subscriber</p>
                <p className="text-xs text-gray-400 mt-1">Select a user profile from the left sidebar to examine contacts, logs, and map locations</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}
