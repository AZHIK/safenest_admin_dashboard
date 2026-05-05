'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Eye, EyeOff, Loader2, Shield, Check } from 'lucide-react'
import { StakeholderRole } from '@/types'

const ROLES: { value: StakeholderRole; label: string; description: string }[] = [
  { value: 'police', label: 'Police Officer', description: 'Law enforcement and case investigation' },
  { value: 'legal_officer', label: 'Legal Aid', description: 'Legal support and court assistance' },
  { value: 'counselor', label: 'Counselor', description: 'Mental health and counseling services' },
  { value: 'help_center', label: 'Help Center Staff', description: 'Shelter and immediate assistance' },
  { value: 'ngo_manager', label: 'NGO Manager', description: 'Non-profit organization coordinator' },
  { value: 'regional_manager', label: 'Regional Manager', description: 'Multi-region coordination and oversight' },
]

export default function RegisterPage() {
  const router = useRouter()
  const { register, isLoading } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [selectedRole, setSelectedRole] = useState<StakeholderRole>('help_center')
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    organization: '',
    password: '',
    confirmPassword: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        phone: formData.phone,
        organization: formData.organization,
        role: selectedRole
      })
      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    }
  }

  if (success) {
    return (
      <Card className="shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-safe-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-safe-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
          <p className="text-gray-600 mb-4">
            Your account has been created and is pending verification. Redirecting to dashboard...
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-emergency-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }} />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center mb-4 lg:hidden">
          <div className="p-3 bg-emergency-100 rounded-xl">
            <Shield className="h-8 w-8 text-emergency-600" />
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Create Account</CardTitle>
        <CardDescription className="text-center">
          Join the SafeNest coordination network
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

          {/* Role Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Select Your Role</label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {ROLES.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setSelectedRole(role.value)}
                  className={`p-3 border rounded-lg text-left transition-all ${
                    selectedRole === role.value
                      ? 'border-emergency-500 bg-emergency-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{role.label}</p>
                      <p className="text-sm text-gray-500">{role.description}</p>
                    </div>
                    {selectedRole === role.value && (
                      <Badge className="bg-emergency-100 text-emergency-700">Selected</Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <Input
                placeholder="John Doe"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input
                type="email"
                placeholder="you@organization.org"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Phone Number</label>
              <Input
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Organization</label>
              <Input
                placeholder="Organization name"
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Confirm Password</label>
            <Input
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              disabled={isLoading}
              minLength={6}
            />
          </div>

          <div className="flex items-start space-x-2">
            <input type="checkbox" required className="mt-1 rounded border-gray-300" />
            <p className="text-sm text-gray-600">
              I agree to the{' '}
              <Link href="/terms" className="text-emergency-600 hover:text-emergency-700">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-emergency-600 hover:text-emergency-700">
                Privacy Policy
              </Link>
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-emergency-600 hover:bg-emergency-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-emergency-600 hover:text-emergency-700 font-medium">
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
