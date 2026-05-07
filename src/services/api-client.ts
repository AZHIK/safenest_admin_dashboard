import axios, { AxiosInstance, AxiosResponse } from 'axios'

class ApiClient {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor for auth token
    this.client.interceptors.request.use(
      (config) => {
        // Use a dynamic import or require if needed to avoid circular dependencies
        // but since auth-store is likely imported after this, we can use it here
        const { useAuthStore } = require('@/store/auth-store')
        const token = useAuthStore.getState().token
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          const { useAuthStore } = require('@/store/auth-store')
          // Handle unauthorized - redirect to login
          useAuthStore.getState().logout()
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login'
          }
        }
        return Promise.reject(error)
      }
    )
  }

  // Generic request methods
  async get<T>(url: string, params?: any): Promise<AxiosResponse<T>> {
    return this.client.get(url, { params })
  }

  async post<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.client.post(url, data)
  }

  async put<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.client.put(url, data)
  }

  async patch<T>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.client.patch(url, data)
  }

  async delete<T>(url: string): Promise<AxiosResponse<T>> {
    return this.client.delete(url)
  }

  // File upload
  async upload<T>(url: string, formData: FormData): Promise<AxiosResponse<T>> {
    return this.client.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  }
}

export const apiClient = new ApiClient()
