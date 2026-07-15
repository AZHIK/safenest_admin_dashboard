'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { SupportCenterService, SupportCenterType } from '@/services/support-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, MapPin, Phone, Mail, Clock, CheckCircle2, Loader2, ChevronRight, ChevronLeft, Building2 } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function SetupPage() {
  const router = useRouter()
  const { stakeholder, updateSetupStatus } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState<{
    name: string
    center_type: SupportCenterType
    address: string
    city: string
    state: string
    country: string
    phone_primary: string
    email: string
    latitude: number
    longitude: number
    is_24_7: boolean
  }>({
    name: '',
    center_type: 'police',
    address: '',
    city: '',
    state: '',
    country: 'TZ',
    phone_primary: '',
    email: '',
    latitude: -6.7924,
    longitude: 39.2083,
    is_24_7: true,
  })

  const handleNext = () => setStep(step + 1)
  const handleBack = () => setStep(step - 1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      await SupportCenterService.setupMyCenter(formData)
      updateSetupStatus(true)
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Setup failed:', error)
      setError(error.response?.data?.detail || 'Failed to save support center information. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <Label htmlFor="name">Center Name</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  id="name" 
                  placeholder="e.g. Oysterbay Police Station" 
                  className="pl-10"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Center Type</Label>
              <Select 
                value={formData.center_type} 
                onValueChange={(value) => setFormData({...formData, center_type: value as SupportCenterType})}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="police">Police Station</SelectItem>
                  <SelectItem value="hospital">Hospital / Health Center</SelectItem>
                  <SelectItem value="ngo">NGO / Crisis Center</SelectItem>
                  <SelectItem value="legal_aid">Legal Aid Office</SelectItem>
                  <SelectItem value="shelter">Safe House / Shelter</SelectItem>
                  <SelectItem value="counseling">Counseling Center</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <Label htmlFor="address">Full Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  id="address" 
                  placeholder="Street name, Building..." 
                  className="pl-10"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input 
                  id="city" 
                  placeholder="City" 
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State/Region</Label>
                <Input 
                  id="state" 
                  placeholder="Region" 
                  value={formData.state}
                  onChange={(e) => setFormData({...formData, state: e.target.value})}
                  required
                />
              </div>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
              <Label htmlFor="phone">Contact Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  id="phone" 
                  placeholder="+255..." 
                  className="pl-10"
                  value={formData.phone_primary}
                  onChange={(e) => setFormData({...formData, phone_primary: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Official Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="center@safenest.org" 
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <input 
                type="checkbox" 
                id="is_24_7" 
                checked={formData.is_24_7}
                onChange={(e) => setFormData({...formData, is_24_7: e.target.checked})}
                className="rounded border-gray-300 text-emergency-600 focus:ring-emergency-500"
              />
              <Label htmlFor="is_24_7" className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                Available 24/7
              </Label>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-emergency-100 rounded-2xl mb-4">
            <Shield className="h-8 w-8 text-emergency-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Finalize Your Setup</h1>
          <p className="text-gray-600 mt-2">
            Welcome, {stakeholder?.full_name}! Please provide your support center details to start using the platform.
          </p>
        </div>

        <Card className="shadow-xl border-t-4 border-t-emergency-600">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-emergency-600 uppercase tracking-wider">Step {step} of 3</span>
              <div className="flex space-x-1">
                {[1, 2, 3].map((i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${i <= step ? 'bg-emergency-600' : 'bg-gray-200'}`} 
                  />
                ))}
              </div>
            </div>
            <CardTitle>
              {step === 1 && "Center Identification"}
              {step === 2 && "Location Details"}
              {step === 3 && "Contact Information"}
            </CardTitle>
            <CardDescription>
              {step === 1 && "Tell us about the institution you represent."}
              {step === 2 && "Where is your center located?"}
              {step === 3 && "How can survivors and coordinators reach you?"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={step === 3 ? handleSubmit : (e) => e.preventDefault()}>
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}
              
              <div className="min-h-[200px]">
                {renderStep()}
              </div>

              <div className="flex items-center justify-between mt-8 pt-6 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleBack}
                  disabled={step === 1 || isLoading}
                  className={step === 1 ? 'invisible' : ''}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                
                {step < 3 ? (
                  <Button 
                    type="button" 
                    onClick={handleNext}
                    disabled={!formData.name && step === 1}
                    className="bg-emergency-600 hover:bg-emergency-700"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    type="submit" 
                    className="bg-emergency-600 hover:bg-emergency-700 min-w-[120px]"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Complete Setup
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
        
        <p className="text-center text-xs text-gray-500 mt-8 uppercase tracking-widest font-semibold">
          SafeNest Security Protocol v2.4
        </p>
      </div>
    </div>
  )
}
