'use client'

import { useEffect, useState } from 'react'
import { EvidenceFile } from '@/types'
import { Image, Music, Video, FileText, Eye, Download, ShieldCheck, X, Loader2 } from 'lucide-react'
import { formatFileSize } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { fetchAndDecryptFile, getKEK, normalizeEncryptionMetadata } from '@/lib/decryption'
import { useAuthStore } from '@/store/auth-store'

interface ReportEvidenceViewerProps {
  files?: EvidenceFile[]
  canView?: boolean
}

const getApiBaseUrl = (): string => {
  return (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '')
}

// Helper function to construct the backend evidence download URL.
const getFileUrl = (file: EvidenceFile): string => {
  if (/^https?:\/\//i.test(file.storage_path)) {
    return file.storage_path
  }

  const normalizedPath = file.storage_path.replace(/^\/+/, '')
  const url = new URL(`/api/v1/evidence/download/${normalizedPath}`, `${getApiBaseUrl()}/`)
  url.searchParams.set('evidence_id', file.id)
  return url.toString()
}

const FILE_TYPE_CONFIG: Record<string, {
  icon: any
  bgClass: string
  iconColor: string
  label: string
}> = {
  image:    { icon: Image,    bgClass: 'bg-blue-50',   iconColor: 'text-blue-500',   label: 'Image' },
  audio:    { icon: Music,    bgClass: 'bg-purple-50', iconColor: 'text-purple-500', label: 'Audio' },
  video:    { icon: Video,    bgClass: 'bg-green-50',  iconColor: 'text-green-500',  label: 'Video' },
  document: { icon: FileText, bgClass: 'bg-amber-50',  iconColor: 'text-amber-500',  label: 'Document' },
}

function EvidenceItem({
  file,
  canView,
  onView,
  onDownload,
}: {
  file: EvidenceFile
  canView: boolean
  onView: (file: EvidenceFile) => void
  onDownload: (file: EvidenceFile) => void
}) {
  const config = FILE_TYPE_CONFIG[file.file_type] ?? FILE_TYPE_CONFIG['document']
  const Icon = config.icon

  const handleView = () => {
    onView(file)
  }

  const handleDownload = () => {
    onDownload(file)
  }

  return (
    <div className={cn(
      'rounded-lg border border-slate-200 overflow-hidden',
      'transition-all duration-200 hover:shadow-md hover:border-indigo-300'
    )}>
      {/* Preview Area */}
      <div className={cn(
        'w-full h-28 flex flex-col items-center justify-center gap-2',
        config.bgClass
      )}>
        <Icon className={cn('h-10 w-10', config.iconColor)} />
        <span className={cn('text-xs font-medium', config.iconColor)}>
          {config.label}
        </span>

        {/* Simulated audio waveform for audio files */}
        {file.file_type === 'audio' && (
          <div className="flex items-end gap-0.5 h-6">
            {[3, 5, 8, 12, 8, 5, 10, 14, 8, 5, 3, 7, 11, 7, 4].map((h, i) => (
              <div
                key={i}
                className="w-1 bg-purple-400 rounded-full"
                style={{ height: `${h}px` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* File Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-700 truncate">
              {file.file_type}_{file.id.slice(0, 6)}.{file.mime_type.split('/')[1] ?? 'bin'}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {formatFileSize(file.file_size_bytes)}
            </p>
          </div>
        </div>

        {/* Metadata Badges */}
        <div className="flex flex-wrap gap-1 mb-2.5">
          {file.has_gps_metadata && (
            <span className="text-xs bg-blue-50 text-blue-600 border border-blue-100 rounded-full px-1.5 py-0.5">
              GPS
            </span>
          )}
          {file.virus_scan_status === 'clean' && (
            <span className="text-xs bg-green-50 text-green-600 border border-green-100 rounded-full px-1.5 py-0.5 flex items-center gap-1">
              <ShieldCheck className="h-2.5 w-2.5" />
              Clean
            </span>
          )}
          <span className="text-xs bg-slate-50 text-slate-500 border border-slate-100 rounded-full px-1.5 py-0.5 capitalize">
            {file.processing_status}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-1.5">
          <button
            disabled={!canView}
            onClick={handleView}
            className="flex-1 flex items-center justify-center gap-1 text-xs px-2 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-md transition-colors"
          >
            <Eye className="h-3 w-3" />
            View
          </button>
          <button
            disabled={!canView}
            onClick={handleDownload}
            className="flex items-center justify-center gap-1 text-xs px-2 py-1.5 border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 rounded-md transition-colors"
          >
            <Download className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function ReportEvidenceViewer({ files = [], canView = true }: ReportEvidenceViewerProps) {
  const token = useAuthStore((state) => state.token)
  const [viewingFile, setViewingFile] = useState<EvidenceFile | null>(null)
  const [decryptedBlob, setDecryptedBlob] = useState<Blob | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDecrypting, setIsDecrypting] = useState(false)
  const [decryptionError, setDecryptionError] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  useEffect(() => {
    if (!decryptedBlob) {
      setPreviewUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(decryptedBlob)
    setPreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [decryptedBlob])

  const getAuthorizedRequestInit = (): RequestInit => ({
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  const getDownloadFilename = (file: EvidenceFile): string => {
    const extension = file.mime_type.split('/')[1] ?? 'bin'
    return `${file.file_type}_${file.id.slice(0, 6)}.${extension}`
  }

  const fetchEvidenceBlob = async (file: EvidenceFile): Promise<Blob> => {
    const response = await fetch(getFileUrl(file), getAuthorizedRequestInit())

    if (!response.ok) {
      throw new Error(`Failed to fetch evidence: ${response.status}`)
    }

    return response.blob()
  }

  const triggerBlobDownload = (file: EvidenceFile, blob: Blob) => {
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = getDownloadFilename(file)
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
  }

  const prepareEvidenceBlob = async (file: EvidenceFile): Promise<Blob> => {
    if (!file.encryption_metadata || Object.keys(file.encryption_metadata).length === 0) {
      return fetchEvidenceBlob(file)
    }

    const fileUrl = getFileUrl(file)
    const kek = getKEK()
    const metadata = normalizeEncryptionMetadata(file.encryption_metadata)
    return fetchAndDecryptFile(
      fileUrl,
      metadata,
      kek,
      getAuthorizedRequestInit()
    )
  }

  const handleViewFile = async (file: EvidenceFile) => {
    setViewingFile(file)
    setDecryptionError(null)
    setDecryptedBlob(null)
    setIsDecrypting(true)

    try {
      const blob = await prepareEvidenceBlob(file)
      setDecryptedBlob(blob)
    } catch (error) {
      console.error('Evidence preview failed:', error)
      const message = error instanceof Error
        ? error.message
        : 'Failed to load evidence file.'
      setDecryptionError(message)
    } finally {
      setIsDecrypting(false)
    }
  }

  const handleDownloadFile = async (file: EvidenceFile) => {
    setDownloadError(null)
    setIsDownloading(true)

    try {
      const blob = await prepareEvidenceBlob(file)
      triggerBlobDownload(file, blob)
    } catch (error) {
      console.error('Evidence download failed:', error)
      const message = error instanceof Error
        ? error.message
        : 'Failed to download evidence file.'
      setDownloadError(message)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleCloseModal = () => {
    setViewingFile(null)
    setDecryptedBlob(null)
    setPreviewUrl(null)
    setDecryptionError(null)
    setDownloadError(null)
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-3">
          <FileText className="h-7 w-7 text-slate-400" />
        </div>
        <p className="text-sm font-medium text-slate-600">No evidence attached</p>
        <p className="text-xs text-slate-400 mt-1">
          No files were uploaded with this report
        </p>
      </div>
    )
  }

  const imageFiles    = files.filter(f => f.file_type === 'image')
  const audioFiles    = files.filter(f => f.file_type === 'audio')
  const otherFiles    = files.filter(f => !['image', 'audio'].includes(f.file_type))

  return (
    <div className="space-y-4">
      {/* Summary Bar */}
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="font-medium text-slate-700">{files.length} file{files.length !== 1 ? 's' : ''}</span>
        {imageFiles.length > 0 && <span>{imageFiles.length} image{imageFiles.length !== 1 ? 's' : ''}</span>}
        {audioFiles.length > 0 && <span>{audioFiles.length} audio</span>}
        {otherFiles.length > 0 && <span>{otherFiles.length} other</span>}
      </div>

      {!canView && (
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <ShieldCheck className="h-4 w-4" />
          You do not have permission to view evidence files
        </div>
      )}

      {/* File Grid */}
      <div className="grid grid-cols-2 gap-3">
        {files.map(file => (
          <EvidenceItem
            key={file.id}
            file={file}
            canView={canView}
            onView={handleViewFile}
            onDownload={handleDownloadFile}
          />
        ))}
      </div>

      {/* File Viewer Modal */}
      {viewingFile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-sm font-medium text-slate-700">
                {viewingFile.file_type}_{viewingFile.id.slice(0, 6)}.{viewingFile.mime_type.split('/')[1] ?? 'bin'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1 hover:bg-slate-100 rounded-md transition-colors"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 flex items-center justify-center bg-slate-50 min-h-[400px]">
              {isDecrypting || isDownloading ? (
                <div className="text-center">
                  <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mx-auto mb-3" />
                  <p className="text-sm text-slate-600">
                    {isDownloading ? 'Preparing download...' : 'Decrypting file...'}
                  </p>
                </div>
              ) : decryptionError || downloadError ? (
                <div className="text-center">
                  <ShieldCheck className="h-16 w-16 text-amber-500 mx-auto mb-3" />
                  <p className="text-sm text-slate-600 mb-3">{decryptionError || downloadError}</p>
                  <button
                    onClick={() => handleViewFile(viewingFile)}
                    className="text-sm text-indigo-600 hover:text-indigo-700"
                  >
                    Retry preview
                  </button>
                </div>
              ) : (
                <>
                  {viewingFile.file_type === 'image' && (
                    <img
                      src={previewUrl ?? undefined}
                      alt="Evidence"
                      className="max-w-full max-h-[70vh] object-contain rounded-lg"
                    />
                  )}
                  {viewingFile.file_type === 'audio' && (
                    <audio
                      src={previewUrl ?? undefined}
                      controls
                      className="w-full max-w-md"
                    />
                  )}
                  {viewingFile.file_type === 'video' && (
                    <video
                      src={previewUrl ?? undefined}
                      controls
                      className="max-w-full max-h-[70vh] rounded-lg"
                    />
                  )}
                  {viewingFile.file_type === 'document' && (
                    <div className="text-center">
                      <FileText className="h-16 w-16 text-slate-400 mx-auto mb-3" />
                      <p className="text-sm text-slate-600">Document preview not available</p>
                      <button
                        onClick={() => handleDownloadFile(viewingFile)}
                        className="mt-3 text-sm text-indigo-600 hover:text-indigo-700"
                      >
                        Download to view
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
