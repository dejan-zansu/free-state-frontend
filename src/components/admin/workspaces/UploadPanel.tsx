'use client'

import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ChevronDown, ChevronUp, RotateCcw, X } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { pumpUploads, retryUpload } from '@/lib/workspace-upload'
import { useUploadStore, type UploadItem } from '@/stores/upload.store'

export function UploadPanel() {
  const t = useTranslations('admin.workspaces')
  const queryClient = useQueryClient()
  const items = useUploadStore(state => state.items)
  const cancel = useUploadStore(state => state.cancel)
  const clearFinished = useUploadStore(state => state.clearFinished)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (items.length === 0) return
    pumpUploads((workspaceId, folderId) => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'workspaces', workspaceId, 'browse', folderId],
      })
    })
  }, [items, queryClient])

  useEffect(() => {
    const anyUploading = items.some(item => item.status === 'uploading')
    if (!anyUploading) return
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [items])

  useEffect(() => {
    if (items.length === 0) return
    const anyActive = items.some(
      item => item.status === 'uploading' || item.status === 'queued'
    )
    if (!anyActive) {
      const timer = setTimeout(() => clearFinished(), 2000)
      return () => clearTimeout(timer)
    }
  }, [items, clearFinished])

  if (items.length === 0) return null

  const done = items.filter(item => item.status === 'done').length
  const total = items.length

  const statusText = (item: UploadItem) => {
    if (item.status === 'error') {
      const key = item.error ? `errors.${item.error}` : undefined
      if (key && t.has(key)) return t(key)
      return t('upload.error')
    }
    return t(`upload.${item.status}`)
  }

  return (
    <div className="fixed bottom-[4.5rem] right-4 z-40 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-[#062E25]/10 bg-white shadow-lg md:bottom-4">
      <div className="flex items-center justify-between gap-2 border-b border-[#062E25]/10 px-4 py-3">
        <p className="text-sm font-medium text-[#062E25]">
          {t('upload.title', { done, total })}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={() => setCollapsed(prev => !prev)}
        >
          {collapsed ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>
      {!collapsed && (
        <>
          <div className="max-h-80 space-y-3 overflow-y-auto px-4 py-3">
            {items.map(item => (
              <div key={item.id} className="space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="min-w-0 flex-1 truncate text-sm text-[#062E25]">
                    {item.file.name}
                  </p>
                  {(item.status === 'uploading' ||
                    item.status === 'queued') && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t('upload.cancel')}
                      onClick={() => cancel(item.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {item.status === 'error' && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t('upload.retry')}
                      onClick={() => retryUpload(item.id)}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                <Progress value={item.progress} className="h-1.5" />
                <p className="text-sm text-[#062E25]/75">{statusText(item)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-[#062E25]/10 px-4 py-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={clearFinished}
            >
              {t('upload.clearFinished')}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
