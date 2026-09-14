import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
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
import { useIsMobile } from '@/hooks/use-mobile'
import { formatBytes } from '@/lib/format-bytes'
import { cn } from '@/lib/utils'
import { adminWorkspaceService } from '@/services/admin-workspace.service'
import type {
  WorkspaceFile,
  WorkspaceFolder,
  WorkspaceLevel,
} from '@/types/workspace'

import { FileActionsMenu, type FileActionId } from './FileActionsMenu'
import { FileIcon } from './FileIcon'

type Entry =
  | { kind: 'folder'; item: WorkspaceFolder }
  | { kind: 'file'; item: WorkspaceFile }

interface FileGridProps {
  workspaceId: string
  entries: Entry[]
  selected: Set<string>
  selectionMode: boolean
  level: WorkspaceLevel
  userId: string
  archived: boolean
  renamingKey: string | null
  renameValue: string
  onRenameValueChange: (value: string) => void
  onRenameSubmit: () => void
  onRenameCancel: () => void
  onToggleSelect: (key: string, index: number, shiftKey: boolean) => void
  onOpenFolder: (folder: WorkspaceFolder) => void
  onOpenFile: (file: WorkspaceFile) => void
  onAction: (
    action: FileActionId,
    kind: 'folder' | 'file',
    item: WorkspaceFolder | WorkspaceFile
  ) => void
  onRemoveIncomplete: (file: WorkspaceFile) => void
}

export function FileGrid({
  workspaceId,
  entries,
  selected,
  selectionMode,
  level,
  userId,
  archived,
  renamingKey,
  renameValue,
  onRenameValueChange,
  onRenameSubmit,
  onRenameCancel,
  onToggleSelect,
  onOpenFolder,
  onOpenFile,
  onAction,
  onRemoveIncomplete,
}: FileGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
      {entries.map((entry, index) => {
        const key = `${entry.kind}:${entry.item.id}`
        return (
          <FileCard
            key={key}
            workspaceId={workspaceId}
            entry={entry}
            selected={selected.has(key)}
            selectionMode={selectionMode}
            level={level}
            userId={userId}
            archived={archived}
            renaming={renamingKey === key}
            renameValue={renameValue}
            onRenameValueChange={onRenameValueChange}
            onRenameSubmit={onRenameSubmit}
            onRenameCancel={onRenameCancel}
            onToggleSelect={shiftKey => onToggleSelect(key, index, shiftKey)}
            onOpenFolder={onOpenFolder}
            onOpenFile={onOpenFile}
            onAction={action => onAction(action, entry.kind, entry.item)}
            onRemoveIncomplete={onRemoveIncomplete}
          />
        )
      })}
    </div>
  )
}

interface FileCardProps {
  workspaceId: string
  entry: Entry
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
  onToggleSelect: (shiftKey: boolean) => void
  onOpenFolder: (folder: WorkspaceFolder) => void
  onOpenFile: (file: WorkspaceFile) => void
  onAction: (action: FileActionId) => void
  onRemoveIncomplete: (file: WorkspaceFile) => void
}

function FileCard({
  workspaceId,
  entry,
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
}: FileCardProps) {
  const t = useTranslations('admin.workspaces.files')
  const folder = entry.kind === 'folder' ? entry.item : null
  const file = entry.kind === 'file' ? entry.item : null
  const incomplete = file?.status === 'UPLOADING'

  const isMobile = useIsMobile()
  const [ctxOpen, setCtxOpen] = useState(false)

  const showThumb =
    !!file &&
    file.hasThumbnail &&
    !incomplete &&
    file.mimeType.startsWith('image/')
  const { data: thumbUrl } = useQuery({
    queryKey: ['admin', 'workspaces', workspaceId, 'thumb', file?.id],
    queryFn: () => adminWorkspaceService.thumbnailUrl(workspaceId, file!.id),
    enabled: showThumb,
    staleTime: 4 * 60 * 1000,
  })

  if (file && incomplete) {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-[#062E25]/10 p-3 opacity-50">
        <div className="flex aspect-square items-center justify-center rounded-md bg-[#062E25]/5">
          <FileIcon mimeType={file.mimeType} className="h-10 w-10" />
        </div>
        <p className="truncate text-sm text-[#062E25]">{file.name}</p>
        <p className="text-sm text-[#062E25]/75">{t('incomplete')}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRemoveIncomplete(file)}
        >
          {t('remove')}
        </Button>
      </div>
    )
  }

  const name = folder ? folder.name : (file?.name ?? '')

  const card = (
    <div
      className="group relative flex flex-col gap-2 rounded-lg border border-[#062E25]/10 p-3"
      onDoubleClick={() =>
        folder ? onOpenFolder(folder) : file && onOpenFile(file)
      }
      onClick={() => {
        if (!isMobile || ctxOpen) return
        if (selectionMode) {
          onToggleSelect(false)
          return
        }
        if (folder) onOpenFolder(folder)
        else if (file) onOpenFile(file)
      }}
    >
      <div
        className={cn(
          'absolute left-2 top-2 z-10',
          selected
            ? 'opacity-100'
            : 'opacity-100 md:opacity-0 md:group-hover:opacity-100'
        )}
      >
        <Checkbox
          checked={selected}
          className="bg-white"
          onClick={event => {
            event.stopPropagation()
            onToggleSelect(event.shiftKey)
          }}
        />
      </div>
      <div className="absolute right-2 top-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="bg-white"
              onClick={event => event.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <FileActionsMenu
              kind={entry.kind}
              item={entry.item}
              level={level}
              userId={userId}
              archived={archived}
              variant="dropdown"
              onAction={onAction}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex aspect-square items-center justify-center overflow-hidden rounded-md bg-[#062E25]/5">
        {showThumb && thumbUrl ? (
          <img
            src={thumbUrl}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <FileIcon
            mimeType={file?.mimeType}
            folder={!!folder}
            restricted={folder?.isRestricted}
            className="h-10 w-10"
          />
        )}
      </div>
      {renaming ? (
        <Input
          autoFocus
          value={renameValue}
          onChange={event => onRenameValueChange(event.target.value)}
          onClick={event => event.stopPropagation()}
          onKeyDown={event => {
            if (event.key === 'Enter') onRenameSubmit()
            if (event.key === 'Escape') onRenameCancel()
          }}
          onBlur={onRenameCancel}
          className="h-8"
        />
      ) : (
        <div className="flex items-center gap-1">
          <p className="truncate text-sm text-[#062E25]">{name}</p>
          {folder?.isRestricted && (
            <Badge variant="secondary">{t('restrictedBadge')}</Badge>
          )}
        </div>
      )}
      {file && (
        <p className="text-sm text-[#062E25]/75">
          {formatBytes(file.sizeBytes)}
        </p>
      )}
    </div>
  )

  return (
    <ContextMenu onOpenChange={setCtxOpen}>
      <ContextMenuTrigger asChild>{card}</ContextMenuTrigger>
      <ContextMenuContent>
        <FileActionsMenu
          kind={entry.kind}
          item={entry.item}
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
