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
import { TrainingCategory } from '@/services/training-service'

interface TrainingCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: TrainingCategory | null
  onSave: (data: Partial<TrainingCategory>) => Promise<void>
}

export function TrainingCategoryDialog({
  open,
  onOpenChange,
  category,
  onSave,
}: TrainingCategoryDialogProps) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [iconName, setIconName] = useState('')
  const [colorCode, setColorCode] = useState('#EF4444')
  const [isActive, setIsActive] = useState(true)
  const [isFeatured, setIsFeatured] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (category) {
      setName(category.name)
      setSlug(category.slug)
      setDescription(category.description || '')
      setIconName(category.icon_name || '')
      setColorCode(category.color_code || '#EF4444')
      setIsActive(category.is_active)
      setIsFeatured(category.is_featured)
    } else {
      setName('')
      setSlug('')
      setDescription('')
      setIconName('')
      setColorCode('#EF4444')
      setIsActive(true)
      setIsFeatured(false)
    }
  }, [category, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSave({
        name,
        slug,
        description,
        icon_name: iconName,
        color_code: colorCode,
        is_active: isActive,
        is_featured: isFeatured,
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save category:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{category ? 'Edit Category' : 'Add New Category'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (!category) {
                  setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))
                }
              }}
              placeholder="e.g. Self Defense"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="e.g. self-defense"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief overview of the category"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="icon">Icon Name (Lucide)</Label>
              <Input
                id="icon"
                value={iconName}
                onChange={(e) => setIconName(e.target.value)}
                placeholder="e.g. Shield"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="color">Color Code</Label>
              <div className="flex gap-2">
                <Input
                  id="color"
                  type="color"
                  value={colorCode}
                  onChange={(e) => setColorCode(e.target.value)}
                  className="w-12 p-1"
                />
                <Input
                  value={colorCode}
                  onChange={(e) => setColorCode(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6 pt-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_featured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <Label htmlFor="is_featured">Featured</Label>
            </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={loading}>
              {loading ? 'Saving...' : 'Save Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
