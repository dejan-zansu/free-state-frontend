'use client'

import Image from 'next/image'
import { Upload, X, Check, Loader2, FileIcon } from 'lucide-react'
import { useState } from 'react'

import { Textarea } from '@/components/ui/textarea'
import { dataRequestService } from '@/services/data-request.service'
import type { DataRequestItem } from '@/types/data-request'

interface Props {
  requestId: string
  item: DataRequestItem
  disabled: boolean
  onChange: (patch: Partial<DataRequestItem>) => void
}

export function DataRequestItemInput({ requestId, item, disabled, onChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  const currentUrls = item.fileUrls ?? []

  const markSaved = () => {
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 1200)
  }

  const persist = async (body: { fileUrls?: string[]; textValue?: string; confirmed?: boolean }) => {
    setSaving(true)
    try {
      await dataRequestService.customerUpsertItem(requestId, item.id, body)
      markSaved()
    } finally {
      setSaving(false)
    }
  }

  const handleFile = async (file: File) => {
    setUploading(true)
    try {
      const url = await dataRequestService.customerUpload(requestId, item.id, file)
      const nextUrls = [...currentUrls, url]
      onChange({ fileUrls: nextUrls })
      await persist({ fileUrls: nextUrls })
    } finally {
      setUploading(false)
    }
  }

  const removeFile = async (idx: number) => {
    const nextUrls = currentUrls.filter((_, i) => i !== idx)
    onChange({ fileUrls: nextUrls })
    await persist({ fileUrls: nextUrls })
  }

  const max = item.maxCount ?? 10
  const atMax = currentUrls.length >= max

  return (
    <div className="border border-[#062E25]/10 rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-[#062E25]">
            {item.label}
            {item.required && <span className="text-red-500 ml-1">*</span>}
          </p>
          {item.description && (
            <p className="text-sm text-[#062E25]/60 mt-1">{item.description}</p>
          )}
        </div>
        <div className="text-xs text-[#062E25]/40 min-w-[56px] text-right">
          {saving && <Loader2 className="h-4 w-4 animate-spin inline-block" />}
          {!saving && justSaved && (
            <span className="inline-flex items-center gap-1 text-green-600">
              <Check className="h-3.5 w-3.5" /> Saved
            </span>
          )}
        </div>
      </div>

      {(item.type === 'PHOTO' || item.type === 'DOCUMENT') && (
        <div className="space-y-2">
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
            {currentUrls.map((url, i) => {
              const isPdf = url.toLowerCase().endsWith('.pdf')
              return (
                <div key={i} className="relative aspect-square rounded overflow-hidden bg-muted">
                  {isPdf ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-2">
                      <FileIcon className="h-8 w-8 text-[#062E25]/60" />
                      <span className="text-[10px] text-[#062E25]/60 truncate w-full text-center">
                        Doc {i + 1}
                      </span>
                    </div>
                  ) : (
                    <Image src={url} alt="" fill className="object-cover" unoptimized />
                  )}
                  {!disabled && (
                    <button
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 bg-white rounded-full shadow p-0.5 hover:bg-red-50"
                    >
                      <X className="h-3.5 w-3.5 text-red-500" />
                    </button>
                  )}
                </div>
              )
            })}
            {!disabled && !atMax && (
              <label className="aspect-square flex items-center justify-center rounded border-2 border-dashed border-[#062E25]/20 cursor-pointer hover:border-[#062E25]/40">
                <input
                  type="file"
                  className="hidden"
                  accept={item.type === 'PHOTO' ? 'image/*' : 'image/*,application/pdf'}
                  capture={item.type === 'PHOTO' ? 'environment' : undefined}
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) void handleFile(f)
                  }}
                />
                {uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-[#062E25]/40" />
                ) : (
                  <Upload className="h-5 w-5 text-[#062E25]/40" />
                )}
              </label>
            )}
          </div>
          <p className="text-xs text-[#062E25]/50">
            {currentUrls.length} / {max}
            {item.minCount ? ` · min ${item.minCount}` : ''}
          </p>
        </div>
      )}

      {item.type === 'TEXT' && (
        <Textarea
          rows={3}
          disabled={disabled}
          value={item.textValue ?? ''}
          onChange={(e) => onChange({ textValue: e.target.value })}
          onBlur={(e) => void persist({ textValue: e.target.value })}
        />
      )}

      {item.type === 'CONFIRMATION' && (
        <label className="flex items-center gap-2 text-sm text-[#062E25]">
          <input
            type="checkbox"
            disabled={disabled}
            checked={item.confirmed === true}
            onChange={(e) => {
              onChange({ confirmed: e.target.checked })
              void persist({ confirmed: e.target.checked })
            }}
          />
          I confirm
        </label>
      )}
    </div>
  )
}
