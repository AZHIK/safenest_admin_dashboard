'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Building, Plus, Search, MapPin, Phone, Users, Bed, MoreHorizontal, Navigation } from 'lucide-react'

const mockCenters = [
  { id: 1, name: 'Safe Haven Shelter', type: 'Emergency Shelter', address: '123 Main St, Downtown', phone: '(555) 123-4567', capacity: 50, occupied: 42, status: 'active', services: ['Housing', 'Counseling', 'Legal Aid'] },
  { id: 2, name: 'Hope Recovery Center', type: 'Support Center', address: '456 Oak Ave, Westside', phone: '(555) 234-5678', capacity: 30, occupied: 28, status: 'active', services: ['Counseling', 'Support Groups'] },
  { id: 3, name: 'Women\'s Resource Center', type: 'Resource Center', address: '789 Pine St, North District', phone: '(555) 345-6789', capacity: 100, occupied: 65, status: 'active', services: ['Legal Aid', 'Job Training', 'Childcare'] },
  { id: 4, name: 'Crisis Intervention Hub', type: 'Crisis Center', address: '321 Elm St, Central', phone: '(555) 456-7890', capacity: 20, occupied: 20, status: 'full', services: ['24/7 Hotline', 'Emergency Response'] },
  { id: 5, name: 'Community Outreach Center', type: 'Outreach', address: '654 Maple Dr, Eastside', phone: '(555) 567-8901', capacity: 40, occupied: 15, status: 'active', services: ['Education', 'Advocacy', 'Prevention'] },
]

const statusColors: Record<string, string> = {
  active: 'bg-safe-100 text-safe-700',
  full: 'bg-red-100 text-red-700',
  maintenance: 'bg-amber-100 text-amber-700',
}

export default function SupportPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-emergency-100 rounded-lg">
              <Building className="h-8 w-8 text-emergency-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Support Centers</h1>
              <p className="text-gray-500">Manage shelters, crisis centers, and resources</p>
            </div>
          </div>
          <Button className="bg-emergency-600 hover:bg-emergency-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Center
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-gray-900">12</div>
              <p className="text-sm text-gray-500">Total Centers</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-emergency-600">170</div>
              <p className="text-sm text-gray-500">Current Occupancy</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-safe-600">45</div>
              <p className="text-sm text-gray-500">Available Beds</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-amber-600">1</div>
              <p className="text-sm text-gray-500">At Full Capacity</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="centers" className="w-full">
          <TabsList>
            <TabsTrigger value="centers">All Centers</TabsTrigger>
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
          </TabsList>

          <TabsContent value="centers" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search centers..." className="pl-10" />
                  </div>
                  <Button variant="outline" size="sm">Filter</Button>
                </div>
              </CardContent>
            </Card>

            {/* Centers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockCenters.map((center) => (
                <Card key={center.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{center.name}</h3>
                        <p className="text-sm text-gray-500">{center.type}</p>
                      </div>
                      <Badge className={statusColors[center.status]}>{center.status}</Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        {center.address}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        {center.phone}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Bed className="h-4 w-4 mr-2 text-gray-400" />
                        <span className={center.occupied === center.capacity ? 'text-red-600 font-medium' : ''}>
                          {center.occupied}/{center.capacity}
                        </span>
                        <span className="text-gray-400 ml-1">beds</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2 text-gray-400" />
                        {Math.round((center.occupied / center.capacity) * 100)}% full
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                      <div 
                        className={`h-2 rounded-full ${center.occupied === center.capacity ? 'bg-red-500' : 'bg-emergency-500'}`}
                        style={{ width: `${(center.occupied / center.capacity) * 100}%` }}
                      />
                    </div>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {center.services.map((service) => (
                        <span key={service} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {service}
                        </span>
                      ))}
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Navigation className="h-4 w-4 mr-1" />
                        Directions
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="map">
            <Card className="h-[500px]">
              <CardContent className="p-8 flex items-center justify-center h-full">
                <div className="text-center">
                  <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Interactive map view coming soon</p>
                  <p className="text-sm text-gray-400">All support centers will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Available Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['Emergency Shelter', 'Counseling', 'Legal Aid', 'Support Groups', 'Job Training', 'Childcare', '24/7 Hotline', 'Advocacy'].map((service) => (
                    <div key={service} className="p-4 bg-gray-50 rounded-lg text-center">
                      <p className="font-medium text-gray-900">{service}</p>
                      <p className="text-sm text-gray-500">4 centers</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
