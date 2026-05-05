'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Eye, EyeOff, Loader2, Shield } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await login(formData.email, formData.password)
      router.push('/dashboard')
    } catch (err) {
      setError('Invalid email or password. Password must be at least 6 characters.')
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4 lg:hidden">
          <div className="p-3 bg-emergency-100 rounded-xl">
            <Shield className="h-8 w-8 text-emergency-600" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
        <CardDescription className="text-center">
          Sign in to access the SafeNest coordination platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <Input
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              Hint: Use keywords like admin, police, legal, counselor, ngo in email for different roles
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded border-gray-300" />
              <span className="text-sm text-gray-600">Remember me</span>
            </label>
            <Link href="/auth/forgot-password" className="text-sm text-emergency-600 hover:text-emergency-700">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full bg-emergency-600 hover:bg-emergency-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Demo Accounts</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setFormData({ email: 'admin@safenest.org', password: 'password123' })}
              className="p-2 bg-gray-100 rounded hover:bg-gray-200 text-gray-700 text-left"
            >
              <strong>Super Admin</strong><br />
              admin@safenest.org
            </button>
            <button
              type="button"
              onClick={() => setFormData({ email: 'officer@police.gov', password: 'password123' })}
              className="p-2 bg-gray-100 rounded hover:bg-gray-200 text-gray-700 text-left"
            >
              <strong>Police</strong><br />
              officer@police.gov
            </button>
            <button
              type="button"
              onClick={() => setFormData({ email: 'counselor@health.org', password: 'password123' })}
              className="p-2 bg-gray-100 rounded hover:bg-gray-200 text-gray-700 text-left"
            >
              <strong>Counselor</strong><br />
              counselor@health.org
            </button>
            <button
              type="button"
              onClick={() => setFormData({ email: 'legal@aid.org', password: 'password123' })}
              className="p-2 bg-gray-100 rounded hover:bg-gray-200 text-gray-700 text-left"
            >
              <strong>Legal Aid</strong><br />
              legal@aid.org
            </button>
          </div>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/auth/register" className="text-emergency-600 hover:text-emergency-700 font-medium">
              Create account
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
