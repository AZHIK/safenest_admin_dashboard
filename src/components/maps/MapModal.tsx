'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { OpenStreetMap } from './OpenStreetMap'
import { MapMarker, MapPolyline } from './OpenStreetMap'

interface MapModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  center: [number, number]
  title?: string
  markers?: MapMarker[]
  polylines?: MapPolyline[]
  accuracyCircle?: {
    center: [number, number]
    radius: number
    color?: string
  }
}

export function MapModal({
  open,
  onOpenChange,
  center,
  title = 'Location Details',
  markers,
  polylines,
  accuracyCircle,
}: MapModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="h-full">
          <OpenStreetMap
            center={center}
            zoom={16}
            markers={markers}
            polylines={polylines}
            accuracyCircle={accuracyCircle}
            className="w-full h-full"
            style={{ height: 'calc(80vh - 60px)' }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
