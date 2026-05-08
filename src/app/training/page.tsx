'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import {
  TrainingService,
  TrainingCategory,
  TrainingLesson,
  TrainingLessonDetail
} from '@/services/training-service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Video,
  Layers,
  Search,
  ExternalLink,
  ChevronRight,
  MoreVertical
} from 'lucide-react'
import { TrainingCategoryDialog } from '@/components/training/TrainingCategoryDialog'
import { TrainingLessonDialog } from '@/components/training/TrainingLessonDialog'
import { cn } from '@/lib/utils'

export default function TrainingManagementPage() {
  const [categories, setCategories] = useState<TrainingCategory[]>([])
  const [lessons, setLessons] = useState<TrainingLesson[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('lessons')

  // Dialog states
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false)
  const [lessonDialogOpen, setLessonDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<TrainingCategory | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<TrainingLesson | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [cats, less] = await Promise.all([
        TrainingService.getCategories(),
        TrainingService.getLessons()
      ])
      setCategories(cats)
      setLessons(less)
    } catch (error) {
      console.error('Failed to fetch training data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreateCategory = async (data: Partial<TrainingCategory>) => {
    await TrainingService.createCategory(data)
    fetchData()
  }

  const handleUpdateCategory = async (data: Partial<TrainingCategory>) => {
    if (selectedCategory) {
      await TrainingService.updateCategory(selectedCategory.id, data)
      fetchData()
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Are you sure? This will delete the category and all its lessons.')) {
      await TrainingService.deleteCategory(id)
      fetchData()
    }
  }

  const handleCreateLesson = async (data: Partial<TrainingLessonDetail>) => {
    await TrainingService.createLesson(data)
    fetchData()
  }

  const handleUpdateLesson = async (data: Partial<TrainingLessonDetail>) => {
    if (selectedLesson) {
      await TrainingService.updateLesson(selectedLesson.id, data)
      fetchData()
    }
  }

  const handleDeleteLesson = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      await TrainingService.deleteLesson(id)
      fetchData()
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Training Resources</h1>
            <p className="text-gray-500">Manage educational materials, videos, and self-defense guides.</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCategory(null)
                setCategoryDialogOpen(true)
              }}
              className="gap-2"
            >
              <Layers className="h-4 w-4" />
              New Category
            </Button>
            <Button
              onClick={() => {
                setSelectedLesson(null)
                setLessonDialogOpen(true)
              }}
              className="gap-2 bg-red-600 hover:bg-red-700"
            >
              <Plus className="h-4 w-4" />
              Add Lesson
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-[400px] grid-cols-2">
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          {/* Lessons Tab */}
          <TabsContent value="lessons" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <Card key={i} className="animate-pulse h-[200px]" />
                ))
              ) : lessons.length === 0 ? (
                <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border-2 border-dashed">
                  <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No lessons found</h3>
                  <p className="text-gray-500">Get started by creating your first training lesson.</p>
                </div>
              ) : (
                lessons.map((lesson) => {
                  const category = categories.find(c => c.id === lesson.category_id)
                  return (
                    <Card key={lesson.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <div className="aspect-video bg-gray-100 relative group">
                        {lesson.thumbnail_url ? (
                          <img
                            src={lesson.thumbnail_url}
                            alt={lesson.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Video className="h-12 w-12" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Badge className={cn(
                            lesson.difficulty_level === 'beginner' ? 'bg-green-500' :
                            lesson.difficulty_level === 'intermediate' ? 'bg-blue-500' : 'bg-orange-500'
                          )}>
                            {lesson.difficulty_level}
                          </Badge>
                        </div>
                      </div>
                      <CardHeader className="p-4 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            {category?.name || 'Uncategorized'}
                          </span>
                          {!lesson.is_active && (
                            <Badge variant="outline" className="text-[10px] h-4">Draft</Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg line-clamp-1">{lesson.title}</CardTitle>
                        <CardDescription className="line-clamp-2 text-xs">
                          {lesson.description || 'No description provided.'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 flex items-center justify-between">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {lesson.duration_minutes} min
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setSelectedLesson(lesson)
                              setLessonDialogOpen(true)
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteLesson(lesson.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4 pt-4">
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Slug</th>
                    <th className="px-6 py-3">Lessons</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-8 w-8 rounded-lg flex items-center justify-center text-white"
                            style={{ backgroundColor: category.color_code || '#EF4444' }}
                          >
                            <Layers className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{category.name}</p>
                            {category.is_featured && (
                              <span className="text-[10px] text-amber-600 font-bold">FEATURED</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                        {category.slug}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary">{category.lesson_count} Lessons</Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCategory(category)
                              setCategoryDialogOpen(true)
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <TrainingCategoryDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        category={selectedCategory}
        onSave={selectedCategory ? handleUpdateCategory : handleCreateCategory}
      />

      <TrainingLessonDialog
        open={lessonDialogOpen}
        onOpenChange={setLessonDialogOpen}
        lesson={selectedLesson}
        categories={categories}
        onSave={selectedLesson ? handleUpdateLesson : handleCreateLesson}
      />
    </DashboardLayout>
  )
}
