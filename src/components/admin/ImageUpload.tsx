'use client'

import { Upload, X } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

import api from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface ImageUploadProps {
  value: string | null | undefined
  onChange: (url: string | null) => void
  folder?: string
  size?: number
}

export function ImageUpload({ value, onChange, folder = 'equipment', size = 128 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (file: File) => {
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await api.post(`/admin/upload?folder=${folder}`, form)
      onChange((res.data as any).data.url)
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
    }
  }

  if (value) {
    return (
      <div className="flex items-start gap-3 mt-2">
        <div className="relative rounded-lg overflow-hidden border bg-muted" style={{ width: size, height: size }}>
          <Image src={value} alt="" fill className="object-contain" unoptimized />
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)} className="text-destructive hover:text-destructive">
          <X className="h-4 w-4 mr-1" /> Remove
        </Button>
      </div>
    )
  }

  return (
    <label
      className="mt-2 flex items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 cursor-pointer hover:border-muted-foreground/50 transition-colors"
      style={{ width: size, height: size }}
    >
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) handleUpload(file)
        }}
      />
      {uploading ? (
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/50" />
      ) : (
        <Upload className="h-6 w-6 text-muted-foreground/50" />
      )}
    </label>
  )
}
