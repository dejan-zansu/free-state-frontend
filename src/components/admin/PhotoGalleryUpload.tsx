'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Camera, Loader2, Upload, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { adminService } from '@/services/admin.service'

interface PhotoGalleryUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
  folder: string
  disabled?: boolean
  maxPhotos?: number
}

export function PhotoGalleryUpload({
  value,
  onChange,
  folder,
  disabled = false,
  maxPhotos = 20,
}: PhotoGalleryUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const canAddMore = value.length < maxPhotos && !disabled

  const handleFiles = async (files: FileList) => {
    if (!files.length) return
    setError(null)
    setUploading(true)

    const remaining = Math.max(0, maxPhotos - value.length)
    const toUpload = Array.from(files).slice(0, remaining)

    try {
      const newUrls: string[] = []
      for (const file of toUpload) {
        if (!file.type.startsWith('image/')) {
          setError(`Überspringe "${file.name}" — kein Bild.`)
          continue
        }
        if (file.size > 10 * 1024 * 1024) {
          setError(`"${file.name}" ist grösser als 10 MB.`)
          continue
        }
        const url = await adminService.uploadImage(file, folder)
        newUrls.push(url)
      }
      if (newUrls.length > 0) {
        onChange([...value, ...newUrls])
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload fehlgeschlagen')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
      if (cameraInputRef.current) cameraInputRef.current.value = ''
    }
  }

  const handleRemove = (index: number) => {
    const next = value.filter((_, i) => i !== index)
    onChange(next)
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {value.map((url, i) => (
          <div
            key={`${url}-${i}`}
            className="relative aspect-square rounded-lg overflow-hidden border border-[#062E25]/10 bg-[#062E25]/5 group"
          >
            <Image
              src={url}
              alt={`Foto ${i + 1}`}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover"
              unoptimized
            />
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="absolute top-1.5 right-1.5 inline-flex items-center justify-center w-7 h-7 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-black/80 transition-opacity"
                aria-label="Entfernen"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}

        {canAddMore && (
          <div className="aspect-square rounded-lg border-2 border-dashed border-[#062E25]/20 flex flex-col items-center justify-center gap-2 text-[#062E25]/60">
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Upload className="w-6 h-6" />
                <span className="text-sm">Foto hinzufügen</span>
              </>
            )}
          </div>
        )}
      </div>

      {canAddMore && (
        <div className="mt-4 flex flex-wrap gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => {
              if (e.target.files) handleFiles(e.target.files)
            }}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={e => {
              if (e.target.files) handleFiles(e.target.files)
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            Dateien auswählen
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => cameraInputRef.current?.click()}
            disabled={uploading}
          >
            <Camera className="w-4 h-4 mr-2" />
            Foto aufnehmen
          </Button>
          <p className="w-full text-sm text-[#062E25]/50">
            Bis zu {maxPhotos} Fotos, je max. 10 MB.
          </p>
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-md border border-red-200 bg-red-50 text-red-800 px-3 py-2 text-sm">
          {error}
        </div>
      )}
    </div>
  )
}
