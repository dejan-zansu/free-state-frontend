import { useEffect, useRef, useState } from 'react'
import { MoreVertical } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { TableCell, TableRow } from '@/components/ui/table'
import { useIsMobile } from '@/hooks/use-mobile'
import { formatBytes } from '@/lib/format-bytes'
import type {
  WorkspaceFile,
  WorkspaceFolder,
  WorkspaceLevel,
} from '@/types/workspace'

import { FileActionsMenu, type FileActionId } from './FileActionsMenu'
import { FileIcon } from './FileIcon'

interface FileRowProps {
  kind: 'folder' | 'file'
  item: WorkspaceFolder | WorkspaceFile
  index: number
  selected: boolean
  selectionMode: boolean
  level: WorkspaceLevel
  userId: string
  archived: boolean
  renaming: boolean
  renameValue: string
  onRenameValueChange: (value: string) => void
  onRenameSubmit: () => void
  onRenameCancel: () => void
  onToggleSelect: (index: number, shiftKey: boolean) => void
  onOpenFolder: (folder: WorkspaceFolder) => void
  onOpenFile: (file: WorkspaceFile) => void
  onAction: (action: FileActionId) => void
  onRemoveIncomplete: (file: WorkspaceFile) => void
}

export function FileRow({
  kind,
  item,
  index,
  selected,
  selectionMode,
  level,
  userId,
  archived,
  renaming,
  renameValue,
  onRenameValueChange,
  onRenameSubmit,
  onRenameCancel,
  onToggleSelect,
  onOpenFolder,
  onOpenFile,
  onAction,
  onRemoveIncomplete,
}: FileRowProps) {
  const t = useTranslations('admin.workspaces.files')
  const folder = kind === 'folder' ? (item as WorkspaceFolder) : null
  const file = kind === 'file' ? (item as WorkspaceFile) : null
  const incomplete = file?.status === 'UPLOADING'

  const isMobile = useIsMobile()
  const [ctxOpen, setCtxOpen] = useState(false)
  const renameRef = useRef<HTMLInputElement>(null)

  // Radix gibt den Fokus beim Schliessen des Menues an den Ausloeser zurueck
  // und ueberschreibt damit autoFocus. Deshalb setzen wir ihn danach selbst.
  useEffect(() => {
    if (!renaming) return
    const timer = setTimeout(() => renameRef.current?.focus(), 60)
    return () => clearTimeout(timer)
  }, [renaming])

  if (file && incomplete) {
    return (
      <TableRow className="opacity-50">
        <TableCell />
        <TableCell colSpan={4}>
          <div className="flex items-center gap-2">
            <FileIcon mimeType={file.mimeType} className="h-4 w-4" />
            <span className="truncate text-sm text-[#062E25]">{file.name}</span>
            <span className="text-sm text-[#062E25]/75">{t('incomplete')}</span>
          </div>
        </TableCell>
        <TableCell className="text-right">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveIncomplete(file)}
          >
            {t('remove')}
          </Button>
        </TableCell>
      </TableRow>
    )
  }

  const dateValue = file ? file.updatedAt : (folder?.createdAt ?? '')
  const uploaderLabel = file?.uploadedBy
    ? `${file.uploadedBy.firstName} ${file.uploadedBy.lastName}`
    : '-'

  return (
    <ContextMenu onOpenChange={setCtxOpen}>
      <ContextMenuTrigger asChild>
        <TableRow
          data-state={selected ? 'selected' : undefined}
          onDoubleClick={() =>
            folder ? onOpenFolder(folder) : file && onOpenFile(file)
          }
          onClick={() => {
            if (!isMobile || ctxOpen) return
            if (selectionMode) {
              onToggleSelect(index, false)
              return
            }
            if (folder) onOpenFolder(folder)
            else if (file) onOpenFile(file)
          }}
        >
          <TableCell>
            <Checkbox
              checked={selected}
              onClick={event => {
                event.stopPropagation()
                onToggleSelect(index, event.shiftKey)
              }}
            />
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <FileIcon
                mimeType={file?.mimeType}
                folder={!!folder}
                restricted={folder?.isRestricted}
                className="h-4 w-4 shrink-0"
              />
              {renaming ? (
                <Input
                  ref={renameRef}
                  autoFocus
                  value={renameValue}
                  onChange={event => onRenameValueChange(event.target.value)}
                  onClick={event => event.stopPropagation()}
                  onDoubleClick={event => event.stopPropagation()}
                  onKeyDown={event => {
                    if (event.key === 'Enter') onRenameSubmit()
                    if (event.key === 'Escape') onRenameCancel()
                  }}
                  onBlur={onRenameCancel}
                  className="h-8"
                />
              ) : folder ? (
                <button
                  type="button"
                  className="truncate text-left text-sm text-[#062E25] hover:underline"
                  onClick={event => {
                    event.stopPropagation()
                    onOpenFolder(folder)
                  }}
                >
                  {folder.name}
                </button>
              ) : (
                <span className="truncate text-sm text-[#062E25]">
                  {file?.name}
                </span>
              )}
              {folder?.isRestricted && (
                <Badge variant="secondary" className="shrink-0">
                  {t('restrictedBadge')}
                </Badge>
              )}
            </div>
          </TableCell>
          <TableCell className="text-sm text-[#062E25]/75">
            {file ? formatBytes(file.sizeBytes) : '-'}
          </TableCell>
          <TableCell className="text-sm text-[#062E25]/75">
            {uploaderLabel}
          </TableCell>
          <TableCell className="text-sm text-[#062E25]/75">
            {dateValue ? new Date(dateValue).toLocaleDateString('de-CH') : '-'}
          </TableCell>
          <TableCell className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={event => event.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={event => event.stopPropagation()}
              >
                <FileActionsMenu
                  kind={kind}
                  item={item}
                  level={level}
                  userId={userId}
                  archived={archived}
                  variant="dropdown"
                  onAction={onAction}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      </ContextMenuTrigger>
      <ContextMenuContent onClick={event => event.stopPropagation()}>
        <FileActionsMenu
          kind={kind}
          item={item}
          level={level}
          userId={userId}
          archived={archived}
          variant="context"
          onAction={onAction}
        />
      </ContextMenuContent>
    </ContextMenu>
  )
}
