'use client'

import { useEffect, useState } from 'react'
import { ChevronRight, Folder } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { adminWorkspaceService } from '@/services/admin-workspace.service'
import type { WorkspaceFolder } from '@/types/workspace'

interface FolderNodeProps {
  folder: WorkspaceFolder
  depth: number
  excludeFolderId: string | null | undefined
  expanded: Set<string>
  onToggleExpand: (folderId: string) => void
  childrenMap: Record<string, WorkspaceFolder[]>
  loadingIds: Set<string>
  selected: string | null
  onSelect: (folderId: string) => void
}

function FolderNode({
  folder,
  depth,
  excludeFolderId,
  expanded,
  onToggleExpand,
  childrenMap,
  loadingIds,
  selected,
  onSelect,
}: FolderNodeProps) {
  const isExcluded = folder.id === excludeFolderId
  const isExpanded = expanded.has(folder.id)
  const children = childrenMap[folder.id]
  const isLoading = loadingIds.has(folder.id)

  return (
    <div>
      <div
        className="flex items-center gap-1 py-1"
        style={{ paddingLeft: depth * 20 }}
      >
        {isExcluded ? (
          <span className="h-5 w-5 shrink-0" />
        ) : (
          <button
            type="button"
            onClick={() => onToggleExpand(folder.id)}
            className="flex h-5 w-5 shrink-0 items-center justify-center text-[#062E25]/60"
          >
            <ChevronRight
              className={cn(
                'h-3.5 w-3.5 transition-transform',
                isExpanded && 'rotate-90'
              )}
            />
          </button>
        )}
        <Folder className="h-4 w-4 shrink-0 text-[#062E25]/75" />
        <button
          type="button"
          disabled={isExcluded}
          onClick={() => onSelect(folder.id)}
          className={cn(
            'flex-1 truncate rounded px-2 py-1 text-left text-sm',
            isExcluded
              ? 'cursor-not-allowed text-[#062E25]/40'
              : 'text-[#062E25] hover:bg-[#062E25]/5',
            selected === folder.id && 'bg-[#062E25]/10 font-medium'
          )}
        >
          {folder.name}
        </button>
      </div>
      {isExpanded && !isExcluded && (
        <div>
          {isLoading ? (
            <p
              className="py-1 text-sm text-[#062E25]/50"
              style={{ paddingLeft: (depth + 1) * 20 + 24 }}
            >
              ...
            </p>
          ) : (
            (children ?? []).map(child => (
              <FolderNode
                key={child.id}
                folder={child}
                depth={depth + 1}
                excludeFolderId={excludeFolderId}
                expanded={expanded}
                onToggleExpand={onToggleExpand}
                childrenMap={childrenMap}
                loadingIds={loadingIds}
                selected={selected}
                onSelect={onSelect}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

interface MoveDialogProps {
  workspaceId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onPick: (folderId: string | null) => void
  excludeFolderId?: string | null
}

export function MoveDialog({
  workspaceId,
  open,
  onOpenChange,
  onPick,
  excludeFolderId,
}: MoveDialogProps) {
  const t = useTranslations('admin.workspaces.move')
  const tc = useTranslations('admin.common')
  const [rootFolders, setRootFolders] = useState<WorkspaceFolder[] | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [childrenMap, setChildrenMap] = useState<
    Record<string, WorkspaceFolder[]>
  >({})
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!open) return
    setSelected(null)
    setExpanded(new Set())
    setChildrenMap({})
    setLoadingIds(new Set())
    setRootFolders(null)
    adminWorkspaceService
      .browse(workspaceId, null)
      .then(result => setRootFolders(result.folders))
  }, [open, workspaceId])

  const onToggleExpand = (folderId: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(folderId)) next.delete(folderId)
      else next.add(folderId)
      return next
    })
    if (!(folderId in childrenMap) && !loadingIds.has(folderId)) {
      setLoadingIds(prev => new Set(prev).add(folderId))
      adminWorkspaceService
        .browse(workspaceId, folderId)
        .then(result => {
          setChildrenMap(prev => ({ ...prev, [folderId]: result.folders }))
        })
        .finally(() => {
          setLoadingIds(prev => {
            const next = new Set(prev)
            next.delete(folderId)
            return next
          })
        })
    }
  }

  const confirm = () => {
    onPick(selected)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        <div className="max-h-80 overflow-y-auto rounded-lg border border-[#062E25]/10 p-2">
          {rootFolders === null ? (
            <AdminPageLoader className="h-32" />
          ) : (
            <>
              <div className="flex items-center gap-1 py-1">
                <span className="h-5 w-5 shrink-0" />
                <Folder className="h-4 w-4 shrink-0 text-[#062E25]/75" />
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className={cn(
                    'flex-1 truncate rounded px-2 py-1 text-left text-sm text-[#062E25] hover:bg-[#062E25]/5',
                    selected === null && 'bg-[#062E25]/10 font-medium'
                  )}
                >
                  {t('root')}
                </button>
              </div>
              {rootFolders.map(folder => (
                <FolderNode
                  key={folder.id}
                  folder={folder}
                  depth={1}
                  excludeFolderId={excludeFolderId}
                  expanded={expanded}
                  onToggleExpand={onToggleExpand}
                  childrenMap={childrenMap}
                  loadingIds={loadingIds}
                  selected={selected}
                  onSelect={setSelected}
                />
              ))}
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tc('cancel')}
          </Button>
          <Button
            className="bg-[#062E25] text-white hover:bg-[#062E25]/90"
            onClick={confirm}
          >
            {t('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
