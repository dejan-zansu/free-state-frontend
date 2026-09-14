import {
  File,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Folder,
  FolderLock,
  type LucideIcon,
} from 'lucide-react'

import { cn } from '@/lib/utils'

interface FileIconProps {
  mimeType?: string
  folder?: boolean
  restricted?: boolean
  className?: string
}

function iconForMime(mimeType?: string): LucideIcon {
  if (!mimeType) return File
  if (mimeType.startsWith('image/')) return FileImage
  if (mimeType === 'application/pdf') return FileText
  if (mimeType.startsWith('video/')) return FileVideo
  if (
    mimeType.includes('spreadsheet') ||
    mimeType.includes('excel') ||
    mimeType === 'text/csv'
  )
    return FileSpreadsheet
  if (
    mimeType.includes('zip') ||
    mimeType.includes('compressed') ||
    mimeType.includes('archive') ||
    mimeType.includes('rar') ||
    mimeType.includes('7z-compressed')
  )
    return FileArchive
  if (mimeType.startsWith('text/')) return FileText
  return File
}

export function FileIcon({
  mimeType,
  folder,
  restricted,
  className,
}: FileIconProps) {
  if (folder) {
    const Icon = restricted ? FolderLock : Folder
    return <Icon className={cn('text-[#062E25]/75', className)} />
  }
  const Icon = iconForMime(mimeType)
  return <Icon className={cn('text-[#062E25]/75', className)} />
}
