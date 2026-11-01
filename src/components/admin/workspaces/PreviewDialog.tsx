'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { adminWorkspaceService } from '@/services/admin-workspace.service'
import type { WorkspaceFile } from '@/types/workspace'

interface PreviewDialogProps {
  workspaceId: string
  files: WorkspaceFile[]
  index: number
  onIndexChange: (index: number) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PreviewDialog({
  workspaceId,
  files,
  index,
  onIndexChange,
  open,
  onOpenChange,
}: PreviewDialogProps) {
  const t = useTranslations('admin.workspaces.preview')
  const file = files[index]

  const { data: url, isLoading } = useQuery({
    queryKey: ['admin', 'workspaces', workspaceId, 'preview-url', file?.id],
    queryFn: () =>
      adminWorkspaceService.downloadUrl(workspaceId, file!.id, true),
    enabled: open && !!file,
    staleTime: 4 * 60 * 1000,
  })

  useEffect(() => {
    if (!open) return
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' && index > 0) onIndexChange(index - 1)
      if (event.key === 'ArrowRight' && index < files.length - 1)
        onIndexChange(index + 1)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, index, files.length, onIndexChange])

  const download = async () => {
    if (!file) return
    const href = await adminWorkspaceService.downloadUrl(workspaceId, file.id)
    window.location.assign(href)
  }

  if (!file) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[calc(100dvh-2rem)] grid-rows-[auto_minmax(0,1fr)] sm:max-w-[calc(100%-2rem)]">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3 pr-8">
            <DialogTitle className="truncate">{file.name}</DialogTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={download}
            >
              <Download className="h-4 w-4" />
              {t('download')}
            </Button>
          </div>
        </DialogHeader>
        <div className="relative flex min-h-0 items-center justify-center overflow-hidden rounded-md bg-[#062E25]/5">
          {index > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t('previous')}
              className="absolute left-2 z-10 bg-white"
              onClick={() => onIndexChange(index - 1)}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          {isLoading || !url ? (
            <AdminPageLoader className="h-full" />
          ) : file.mimeType.startsWith('image/') ? (
            <img
              key={file.id}
              src={url}
              alt={file.name}
              className="max-h-full max-w-full object-contain"
            />
          ) : file.mimeType === 'application/pdf' ? (
            <iframe src={url} title={file.name} className="h-full w-full" />
          ) : (
            <p className="py-12 text-sm text-[#062E25]/75">{t('noPreview')}</p>
          )}
          {index < files.length - 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={t('next')}
              className="absolute right-2 z-10 bg-white"
              onClick={() => onIndexChange(index + 1)}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
