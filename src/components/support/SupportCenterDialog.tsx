'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SupportCenter, SupportCenterType } from '@/services/support-service'

interface SupportCenterDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  center: SupportCenter | null
  onSave: (data: Partial<SupportCenter>) => Promise<void>
}

export function SupportCenterDialog({
  open,
  onOpenChange,
  center,
  onSave,
}: SupportCenterDialogProps) {
  const [formData, setFormData] = useState<Partial<SupportCenter>>({
    name: '',
    center_type: 'ngo',
    address: '',
    city: '',
    latitude: 0,
    longitude: 0,
    phone_primary: '',
    is_24_7: false,
    is_active: true,
    is_verified: false,
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (center) {
      setFormData(center)
    } else {
      setFormData({
        name: '',
        center_type: 'ngo',
        address: '',
        city: '',
        latitude: 0,
        longitude: 0,
        phone_primary: '',
        is_24_7: false,
        is_active: true,
        is_verified: false,
      })
    }
  }, [center, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave(formData)
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save support center:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateField = (field: keyof SupportCenter, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{center ? 'Edit Support Center' : 'Add New Support Center'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Center Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="e.g. Hope Women's Shelter"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Center Type</Label>
              <Select 
                value={formData.center_type} 
                onValueChange={(v) => updateField('center_type', v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="police">Police Station</SelectItem>
                  <SelectItem value="hospital">Hospital / Clinic</SelectItem>
                  <SelectItem value="ngo">NGO / Support Group</SelectItem>
                  <SelectItem value="legal_aid">Legal Aid</SelectItem>
                  <SelectItem value="shelter">Shelter</SelectItem>
                  <SelectItem value="hotline">Hotline</SelectItem>
                  <SelectItem value="counseling">Counseling Center</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="Full physical address"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => updateField('city', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lat">Latitude</Label>
              <Input
                id="lat"
                type="number"
                step="0.000001"
                value={formData.latitude}
                onChange={(e) => updateField('latitude', parseFloat(e.target.value))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lng">Longitude</Label>
              <Input
                id="lng"
                type="number"
                step="0.000001"
                value={formData.longitude}
                onChange={(e) => updateField('longitude', parseFloat(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="phone">Primary Phone</Label>
              <Input
                id="phone"
                value={formData.phone_primary}
                onChange={(e) => updateField('phone_primary', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label>Services Provided</Label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { id: 'provides_medical', label: 'Medical Support' },
                  { id: 'provides_legal', label: 'Legal Aid' },
                  { id: 'provides_shelter', label: 'Emergency Shelter' },
                  { id: 'provides_counseling', label: 'Counseling' },
                  { id: 'provides_emergency_response', label: 'Emergency Response' },
                ].map((s) => (
                  <div key={s.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={s.id}
                      checked={(formData as any)[s.id]}
                      onChange={(e) => updateField(s.id as any, e.target.checked)}
                      className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor={s.id} className="text-sm text-gray-700">{s.label}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Label>Status & Verification</Label>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_24_7"
                    checked={formData.is_24_7}
                    onChange={(e) => updateField('is_24_7', e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="is_24_7" className="text-sm font-medium">Open 24/7</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => updateField('is_active', e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium">Active / Visible</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_verified"
                    checked={formData.is_verified}
                    onChange={(e) => updateField('is_verified', e.target.checked)}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="is_verified" className="text-sm font-medium">Verified Source</label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading}>
              {loading ? 'Saving...' : 'Save Support Center'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
