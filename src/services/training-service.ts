import { apiClient } from './api-client'

export interface TrainingCategory {
  id: string
  name: string
  slug: string
  description?: string
  icon_name?: string
  color_code?: string
  sort_order: number
  is_active: boolean
  is_featured: boolean
  lesson_count: number
}

export interface TrainingLesson {
  id: string
  category_id: string
  title: string
  slug: string
  description?: string
  thumbnail_url?: string
  duration_minutes?: number
  difficulty_level: 'beginner' | 'intermediate' | 'advanced'
  is_active: boolean
  is_premium: boolean
  view_count: number
  sort_order: number
  created_at: string
}

export interface ContentBlock {
  type: 'text' | 'video' | 'audio' | 'image' | 'quiz' | 'interactive'
  content?: string
  url?: string
  metadata?: any
}

export interface TrainingLessonDetail extends TrainingLesson {
  content_blocks?: ContentBlock[]
  video_url?: string
  audio_url?: string
  pdf_url?: string
  tags?: string
  related_lesson_ids?: string[]
  completion_count: number
  rating_average: number
  rating_count: number
}

export class TrainingService {
  // --- Categories ---

  static async getCategories() {
    const response = await apiClient.get<TrainingCategory[]>('/api/v1/operator/training/categories')
    return response.data
  }

  static async createCategory(data: Partial<TrainingCategory>) {
    const response = await apiClient.post<TrainingCategory>('/api/v1/operator/training/categories', data)
    return response.data
  }

  static async updateCategory(categoryId: string, data: Partial<TrainingCategory>) {
    const response = await apiClient.patch<TrainingCategory>(`/api/v1/operator/training/categories/${categoryId}`, data)
    return response.data
  }

  static async deleteCategory(categoryId: string) {
    await apiClient.delete(`/api/v1/operator/training/categories/${categoryId}`)
  }

  // --- Lessons ---

  static async getLessons() {
    const response = await apiClient.get<TrainingLesson[]>('/api/v1/operator/training/lessons')
    return response.data
  }

  static async createLesson(data: Partial<TrainingLessonDetail>) {
    const response = await apiClient.post<TrainingLesson>('/api/v1/operator/training/lessons', data)
    return response.data
  }

  static async updateLesson(lessonId: string, data: Partial<TrainingLessonDetail>) {
    const response = await apiClient.patch<TrainingLesson>(`/api/v1/operator/training/lessons/${lessonId}`, data)
    return response.data
  }

  static async deleteLesson(lessonId: string) {
    await apiClient.delete(`/api/v1/operator/training/lessons/${lessonId}`)
  }
}
