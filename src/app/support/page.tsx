'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { SupportCenterService, SupportCenter } from '@/services/support-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Building,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Phone,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  MoreHorizontal,
  Map as MapIcon
} from 'lucide-react'
import { SupportCenterDialog } from '@/components/support/SupportCenterDialog'
import { cn } from '@/lib/utils'

export default function SupportCentersPage() {
  const [centers, setCenters] = useState<SupportCenter[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCenter, setSelectedCenter] = useState<SupportCenter | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const data = await SupportCenterService.getCenters()
      setCenters(data)
    } catch (error) {
      console.error('Failed to fetch support centers:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSave = async (data: Partial<SupportCenter>) => {
    if (selectedCenter) {
      await SupportCenterService.updateCenter(selectedCenter.id, data)
    } else {
      await SupportCenterService.createCenter(data)
    }
    fetchData()
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this support center?')) {
      await SupportCenterService.deleteCenter(id)
      fetchData()
    }
  }

  const filteredCenters = centers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.center_type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'police': return 'bg-blue-100 text-blue-700'
      case 'hospital': return 'bg-red-100 text-red-700'
      case 'ngo': return 'bg-green-100 text-green-700'
      case 'legal_aid': return 'bg-purple-100 text-purple-700'
      case 'shelter': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Support Centers</h1>
            <p className="text-gray-500">Manage institutional partners, emergency facilities, and support groups.</p>
          </div>
          <Button
            onClick={() => {
              setSelectedCenter(null)
              setDialogOpen(true)
            }}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Add Center
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name, city, or type..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* Table/List */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold border-b">
                <tr>
                  <th className="px-6 py-4">Center Info</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Services</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-6 py-8">
                        <div className="h-4 bg-gray-100 rounded w-1/4 mb-2"></div>
                        <div className="h-3 bg-gray-50 rounded w-1/2"></div>
                      </td>
                    </tr>
                  ))
                ) : filteredCenters.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No support centers found</p>
                      <p>Try adjusting your search or add a new center.</p>
                    </td>
                  </tr>
                ) : (
                  filteredCenters.map((center) => (
                    <tr key={center.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                            <Building className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900">{center.name}</p>
                              {center.is_verified && (
                                <CheckCircle2 className="h-3.5 w-3.5 text-blue-500" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <MapPin className="h-3 w-3" />
                              {center.city ? `${center.city}, ` : ''}{center.address}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className={cn("capitalize", getTypeBadgeColor(center.center_type))}>
                          {center.center_type.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {center.provides_medical && <Badge variant="outline" className="text-[10px] h-5">Medical</Badge>}
                          {center.provides_legal && <Badge variant="outline" className="text-[10px] h-5">Legal</Badge>}
                          {center.provides_shelter && <Badge variant="outline" className="text-[10px] h-5">Shelter</Badge>}
                          {center.provides_counseling && <Badge variant="outline" className="text-[10px] h-5">Counseling</Badge>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {center.is_24_7 ? (
                            <span className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                              <Clock className="h-3 w-3" /> 24/7 OPEN
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" /> HOURS VARIES
                            </span>
                          )}
                          {!center.is_active && (
                            <span className="text-[10px] font-bold text-red-500 italic">INACTIVE</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setSelectedCenter(center)
                              setDialogOpen(true)
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(center.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Showing {filteredCenters.length} centers
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        </div>
      </div>

      <SupportCenterDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        center={selectedCenter}
        onSave={handleSave}
      />
    </DashboardLayout>
  )
}
