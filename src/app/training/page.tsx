'use client'

import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, Plus, Search, Play, Clock, Users, Star, FileText, Video, CheckCircle, MoreHorizontal } from 'lucide-react'

const mockCourses = [
  { id: 1, title: 'Crisis Response Protocols', type: 'Video', duration: '2h 30m', enrolled: 45, rating: 4.8, status: 'published', category: 'Emergency Response' },
  { id: 2, title: 'Trauma-Informed Care', type: 'Course', duration: '4h 15m', enrolled: 78, rating: 4.9, status: 'published', category: 'Counseling' },
  { id: 3, title: 'Legal Advocacy Basics', type: 'Document', duration: '1h 45m', enrolled: 32, rating: 4.6, status: 'published', category: 'Legal' },
  { id: 4, title: 'Safety Planning Workshop', type: 'Workshop', duration: '3h 00m', enrolled: 56, rating: 4.7, status: 'published', category: 'Prevention' },
  { id: 5, title: 'Cultural Competency Training', type: 'Video', duration: '2h 00m', enrolled: 0, rating: 0, status: 'draft', category: 'Diversity' },
]

const statusColors: Record<string, string> = {
  published: 'bg-safe-100 text-safe-700',
  draft: 'bg-gray-100 text-gray-700',
  archived: 'bg-amber-100 text-amber-700',
}

const typeIcons: Record<string, any> = {
  Video: Video,
  Course: BookOpen,
  Document: FileText,
  Workshop: Users,
}

export default function TrainingPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-emergency-100 rounded-lg">
              <BookOpen className="h-8 w-8 text-emergency-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Training Content</h1>
              <p className="text-gray-500">Manage courses, workshops, and educational materials</p>
            </div>
          </div>
          <Button className="bg-emergency-600 hover:bg-emergency-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Content
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-gray-900">18</div>
              <p className="text-sm text-gray-500">Total Courses</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-emergency-600">245</div>
              <p className="text-sm text-gray-500">Active Learners</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-safe-600">1,234</div>
              <p className="text-sm text-gray-500">Completions This Month</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-amber-600">4.7</div>
              <p className="text-sm text-gray-500">Average Rating</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="content" className="w-full">
          <TabsList>
            <TabsTrigger value="content">All Content</TabsTrigger>
            <TabsTrigger value="learners">Learners</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search training content..." className="pl-10" />
                  </div>
                  <Button variant="outline" size="sm">Filter</Button>
                </div>
              </CardContent>
            </Card>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockCourses.map((course) => {
                const TypeIcon = typeIcons[course.type] || FileText
                return (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <TypeIcon className="h-5 w-5 text-gray-600" />
                        </div>
                        <Badge className={statusColors[course.status]}>{course.status}</Badge>
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                      <p className="text-sm text-gray-500 mb-4">{course.category}</p>

                      <div className="flex items-center space-x-4 mb-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {course.duration}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {course.enrolled} enrolled
                        </div>
                        {course.rating > 0 && (
                          <div className="flex items-center">
                            <Star className="h-4 w-4 mr-1 text-yellow-400" />
                            {course.rating}
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Play className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          <TabsContent value="learners">
            <Card>
              <CardHeader>
                <CardTitle>Top Learners</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Jennifer Adams', role: 'Case Worker', completed: 12, hours: 45 },
                    { name: 'Michael Roberts', role: 'Officer', completed: 10, hours: 38 },
                    { name: 'Sarah Chen', role: 'Counselor', completed: 9, hours: 36 },
                    { name: 'David Martinez', role: 'Legal Advocate', completed: 8, hours: 32 },
                  ].map((learner, index) => (
                    <div key={learner.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-emergency-100 rounded-full flex items-center justify-center">
                          <span className="text-emergency-600 font-semibold">{learner.name.charAt(0)}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{learner.name}</h4>
                          <p className="text-sm text-gray-500">{learner.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">{learner.completed}</div>
                          <div className="text-gray-500">Courses</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-gray-900">{learner.hours}h</div>
                          <div className="text-gray-500">Hours</div>
                        </div>
                        {index === 0 && <CheckCircle className="h-5 w-5 text-safe-600" />}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Course Completion Rate</CardTitle>
                </CardHeader>
                <CardContent className="h-[200px] flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-emergency-600">78%</div>
                    <p className="text-sm text-gray-500">Average completion rate</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Popular Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {['Emergency Response', 'Counseling', 'Legal', 'Prevention', 'Diversity'].map((cat, i) => (
                      <div key={cat} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{cat}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div className="bg-emergency-500 h-2 rounded-full" style={{ width: `${[85, 72, 65, 58, 45][i]}%` }} />
                          </div>
                          <span className="text-sm text-gray-500">{[85, 72, 65, 58, 45][i]}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
