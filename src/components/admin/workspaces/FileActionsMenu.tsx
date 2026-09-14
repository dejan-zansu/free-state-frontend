import { Fragment } from 'react'
import { useTranslations } from 'next-intl'

import {
  ContextMenuItem,
  ContextMenuSeparator,
} from '@/components/ui/context-menu'
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import type {
  WorkspaceFile,
  WorkspaceFolder,
  WorkspaceLevel,
} from '@/types/workspace'

export type FileActionId =
  | 'open'
  | 'download'
  | 'rename'
  | 'move'
  | 'restrict'
  | 'trash'

interface FileActionsMenuProps {
  kind: 'folder' | 'file'
  item: WorkspaceFolder | WorkspaceFile
  level: WorkspaceLevel
  userId: string
  archived: boolean
  variant: 'dropdown' | 'context'
  onAction: (action: FileActionId) => void
}

function isPreviewable(file: WorkspaceFile): boolean {
  return (
    file.mimeType.startsWith('image/') || file.mimeType === 'application/pdf'
  )
}

export function FileActionsMenu({
  kind,
  item,
  level,
  userId,
  archived,
  variant,
  onAction,
}: FileActionsMenuProps) {
  const t = useTranslations('admin.workspaces.files.actions')

  const ownerId =
    kind === 'folder'
      ? (item as WorkspaceFolder).createdById
      : (item as WorkspaceFile).uploadedById
  const canEdit =
    !archived &&
    (level === 'MANAGER' || (level === 'CONTRIBUTOR' && ownerId === userId))

  const actions: FileActionId[] = []
  if (kind === 'folder' || isPreviewable(item as WorkspaceFile)) {
    actions.push('open')
  }
  if (kind === 'file') {
    actions.push('download')
  }
  if (canEdit) {
    actions.push('rename', 'move')
  }
  if (!archived && kind === 'folder' && level === 'MANAGER') {
    actions.push('restrict')
  }
  if (canEdit) {
    actions.push('trash')
  }

  const Item = variant === 'dropdown' ? DropdownMenuItem : ContextMenuItem
  const Separator =
    variant === 'dropdown' ? DropdownMenuSeparator : ContextMenuSeparator

  return (
    <Fragment>
      {actions.map((action, index) => (
        <Fragment key={action}>
          {action === 'trash' && index > 0 && <Separator />}
          <Item
            variant={action === 'trash' ? 'destructive' : 'default'}
            onSelect={() => onAction(action)}
          >
            {t(action)}
          </Item>
        </Fragment>
      ))}
    </Fragment>
  )
}
