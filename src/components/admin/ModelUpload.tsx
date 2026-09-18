'use client'

import { Box, Loader2, Upload, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import api from '@/lib/api'

interface ModelUploadProps {
  value: string | null | undefined
  onChange: (url: string | null) => void
}

/** Uploads a binary glTF (.glb) through the admin model endpoint and stores its public URL. */
export function ModelUpload({ value, onChange }: ModelUploadProps) {
  const t = useTranslations('admin.equipment.form3d')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async (file: File) => {
    setUploading(true)
    setError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await api.post<{ success: boolean; data: { url: string } }>('/admin/upload/model', form)
      onChange(res.data.data.url)
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ||
        (err instanceof Error ? err.message : 'Upload fehlgeschlagen')
      setError(message)
    } finally {
      setUploading(false)
    }
  }

  const fileName = value ? value.split('/').pop() : null

  return (
    <div className="mt-2">
      {value ? (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2">
          <Box className="h-5 w-5 text-[#036B53]" aria-hidden />
          <a href={value} target="_blank" rel="noopener noreferrer" className="font-mono text-sm text-[#062E25] underline-offset-2 hover:underline">
            {fileName}
          </a>
          <label className="ml-auto inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-[#062E25] hover:underline">
            <input
              type="file"
              accept=".glb,model/gltf-binary"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void handleUpload(file)
              }}
            />
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Upload className="h-4 w-4" aria-hidden />}
            {t('replaceModel')}
          </label>
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)} className="text-destructive hover:text-destructive">
            <X className="mr-1 h-4 w-4" /> {t('removeModel')}
          </Button>
        </div>
      ) : (
        <label className="flex h-24 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 text-sm text-muted-foreground transition-colors hover:border-muted-foreground/50">
          <input
            type="file"
            accept=".glb,model/gltf-binary"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void handleUpload(file)
            }}
          />
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Upload className="h-5 w-5" aria-hidden />}
          {t('uploadModel')}
        </label>
      )}
      <p className="mt-1 text-xs text-muted-foreground">{t('modelHint')}</p>
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  )
}
