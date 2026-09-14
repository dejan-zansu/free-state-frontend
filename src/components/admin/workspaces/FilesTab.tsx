'use client'

import type { ChangeEvent, DragEvent } from 'react'
import { useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Download,
  FolderPlus,
  LayoutGrid,
  List,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useIsMobile } from '@/hooks/use-mobile'
import { adminWorkspaceService } from '@/services/admin-workspace.service'
import { useAuthStore } from '@/stores/auth.store'
import { useUploadStore } from '@/stores/upload.store'
import { pumpUploads } from '@/lib/workspace-upload'
import type {
  BrowseResult,
  SearchHit,
  WorkspaceDetail,
  WorkspaceFile,
  WorkspaceFolder,
} from '@/types/workspace'

import { FileActionsMenu, type FileActionId } from './FileActionsMenu'
import { FileGrid } from './FileGrid'
import { FileIcon } from './FileIcon'
import { FileRow } from './FileRow'
import { FolderBreadcrumb } from './FolderBreadcrumb'

type Entry =
  | { kind: 'folder'; item: WorkspaceFolder }
  | { kind: 'file'; item: WorkspaceFile }

type SortKey = 'name' | 'date' | 'size'

interface FilesTabProps {
  workspace: WorkspaceDetail
  onPreview?: (file: WorkspaceFile) => void
  onMove?: (target: Entry) => void
  onRestrict?: (folder: WorkspaceFolder) => void
}

function extractErrorCode(error: unknown): string | undefined {
  return (error as { response?: { data?: { error?: { code?: string } } } })
    ?.response?.data?.error?.code
}

function isPreviewableFile(file: WorkspaceFile): boolean {
  return (
    file.mimeType.startsWith('image/') || file.mimeType === 'application/pdf'
  )
}

function readDirectoryEntries(
  reader: FileSystemDirectoryReader
): Promise<FileSystemEntry[]> {
  return new Promise((resolve, reject) => reader.readEntries(resolve, reject))
}

async function collectAllEntries(
  dirEntry: FileSystemDirectoryEntry
): Promise<FileSystemEntry[]> {
  const reader = dirEntry.createReader()
  const all: FileSystemEntry[] = []
  while (true) {
    const batch = await readDirectoryEntries(reader)
    if (batch.length === 0) break
    all.push(...batch)
  }
  return all
}

function readFileFromEntry(entry: FileSystemFileEntry): Promise<File> {
  return new Promise((resolve, reject) => entry.file(resolve, reject))
}

async function resolveDroppedFolder(
  dirEntry: FileSystemDirectoryEntry,
  workspaceId: string,
  parentId: string | null
): Promise<WorkspaceFolder> {
  try {
    return await adminWorkspaceService.createFolder(
      workspaceId,
      parentId,
      dirEntry.name
    )
  } catch (error) {
    if (extractErrorCode(error) !== 'FOLDER_EXISTS') throw error
    const existing = await adminWorkspaceService.browse(workspaceId, parentId)
    const match = existing.folders.find(item => item.name === dirEntry.name)
    if (!match) throw error
    return match
  }
}

async function walkDroppedDirectory(
  dirEntry: FileSystemDirectoryEntry,
  workspaceId: string,
  parentId: string | null,
  onError: (error: unknown) => void
): Promise<void> {
  try {
    const folder = await resolveDroppedFolder(dirEntry, workspaceId, parentId)
    const children = await collectAllEntries(dirEntry)
    const files: File[] = []
    const subDirs: FileSystemDirectoryEntry[] = []
    for (const child of children) {
      if (child.isFile) {
        files.push(await readFileFromEntry(child as FileSystemFileEntry))
      } else if (child.isDirectory) {
        subDirs.push(child as FileSystemDirectoryEntry)
      }
    }
    if (files.length > 0) {
      useUploadStore.getState().enqueue(files, workspaceId, folder.id)
    }
    for (const subDir of subDirs) {
      await walkDroppedDirectory(subDir, workspaceId, folder.id, onError)
    }
  } catch (error) {
    onError(error)
  }
}

export function FilesTab({
  workspace,
  onPreview,
  onMove,
  onRestrict,
}: FilesTabProps) {
  const t = useTranslations('admin.workspaces')
  const tc = useTranslations('admin.common')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const userId = useAuthStore(state => state.user?.id) ?? ''
  const enqueue = useUploadStore(state => state.enqueue)

  const folderId = searchParams.get('folder')

  const [view, setViewState] = useState<'grid' | 'list'>(() => {
    try {
      const stored = localStorage.getItem('ws-view')
      if (stored === 'grid' || stored === 'list') return stored
    } catch {}
    return 'grid'
  })
  const [sort, setSort] = useState<SortKey>('name')
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )
  const [creatingFolder, setCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [lastIndex, setLastIndex] = useState<number | null>(null)
  const [dragging, setDragging] = useState(false)
  const [renamingKey, setRenamingKey] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [trashRequest, setTrashRequest] = useState<Entry[] | null>(null)
  const [trashing, setTrashing] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mobileFileInputRef = useRef<HTMLInputElement>(null)
  const isMobile = useIsMobile()

  const { data, isLoading, isError } = useQuery<BrowseResult>({
    queryKey: ['admin', 'workspaces', workspace.id, 'browse', folderId],
    queryFn: () => adminWorkspaceService.browse(workspace.id, folderId),
  })

  const { data: searchHits, isLoading: searchLoading } = useQuery<SearchHit[]>({
    queryKey: ['admin', 'workspaces', workspace.id, 'search', debouncedSearch],
    queryFn: () => adminWorkspaceService.search(workspace.id, debouncedSearch),
    enabled: debouncedSearch.length > 0,
  })

  const effectiveLevel = data?.myLevel ?? workspace.myLevel
  const archived = workspace.status === 'ARCHIVED'
  const canManage = effectiveLevel !== 'VIEWER' && !archived

  const entries = useMemo<Entry[]>(() => {
    if (!data) return []
    const combined: Entry[] = [
      ...data.folders.map(item => ({ kind: 'folder' as const, item })),
      ...data.files.map(item => ({ kind: 'file' as const, item })),
    ]
    return combined.sort((a, b) => {
      if (a.kind !== b.kind) return a.kind === 'folder' ? -1 : 1
      if (sort === 'name') return a.item.name.localeCompare(b.item.name, 'de')
      if (sort === 'date') {
        const aDate = a.kind === 'file' ? a.item.updatedAt : a.item.createdAt
        const bDate = b.kind === 'file' ? b.item.updatedAt : b.item.createdAt
        return bDate.localeCompare(aDate)
      }
      const aSize = a.kind === 'file' ? a.item.sizeBytes : 0
      const bSize = b.kind === 'file' ? b.item.sizeBytes : 0
      return bSize - aSize
    })
  }, [data, sort])

  const errorMessage = (code: string | undefined): string => {
    const key = code ? `errors.${code}` : 'errors.generic'
    return t.has(key) ? t(key) : t('errors.generic')
  }

  const invalidateBrowse = () => {
    queryClient.invalidateQueries({
      queryKey: ['admin', 'workspaces', workspace.id, 'browse'],
    })
  }

  const setView = (next: 'grid' | 'list') => {
    setViewState(next)
    try {
      localStorage.setItem('ws-view', next)
    } catch {}
  }

  const navigate = (nextFolderId: string | null) => {
    setSelected(new Set())
    setLastIndex(null)
    setRenamingKey(null)
    setCreatingFolder(false)
    setNewFolderName('')
    setSearchInput('')
    setDebouncedSearch('')
    const params = new URLSearchParams(searchParams.toString())
    if (nextFolderId) params.set('folder', nextFolderId)
    else params.delete('folder')
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname)
  }

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(
      () => setDebouncedSearch(value.trim()),
      300
    )
  }

  const toggleMobileSearch = () => {
    setMobileSearchOpen(open => {
      const next = !open
      if (!next) {
        setSearchInput('')
        setDebouncedSearch('')
      }
      return next
    })
  }

  const handleSearchHitOpen = (hit: SearchHit) => {
    setSearchInput('')
    setDebouncedSearch('')
    if (hit.kind === 'folder') {
      navigate(hit.item.id)
      return
    }
    const parentId =
      hit.path.length > 0 ? hit.path[hit.path.length - 1].id : null
    navigate(parentId)
  }

  const handleUploadDone = (workspaceId: string) => {
    queryClient.invalidateQueries({
      queryKey: ['admin', 'workspaces', workspaceId, 'browse'],
    })
  }

  const handleFilesChosen = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (files.length === 0) return
    enqueue(files, workspace.id, folderId)
    pumpUploads(handleUploadDone)
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (!canManage) return
    setDragging(true)
  }

  const handleDragLeave = () => setDragging(false)

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(false)
    if (!canManage) return
    const items = Array.from(event.dataTransfer.items)
    const topFiles: File[] = []
    const dirEntries: FileSystemDirectoryEntry[] = []
    for (const dataItem of items) {
      const entry = dataItem.webkitGetAsEntry?.()
      if (!entry) continue
      if (entry.isDirectory) {
        dirEntries.push(entry as FileSystemDirectoryEntry)
      } else {
        const file = dataItem.getAsFile()
        if (file) topFiles.push(file)
      }
    }
    if (topFiles.length > 0) enqueue(topFiles, workspace.id, folderId)
    const walkErrors: unknown[] = []
    try {
      for (const dirEntry of dirEntries) {
        await walkDroppedDirectory(dirEntry, workspace.id, folderId, error =>
          walkErrors.push(error)
        )
      }
    } finally {
      pumpUploads(handleUploadDone)
      invalidateBrowse()
    }
    if (walkErrors.length > 0) {
      toast.error(errorMessage(extractErrorCode(walkErrors[0])))
    }
  }

  const submitNewFolder = async () => {
    const name = newFolderName.trim()
    if (!name) {
      setCreatingFolder(false)
      setNewFolderName('')
      return
    }
    try {
      await adminWorkspaceService.createFolder(workspace.id, folderId, name)
      toast.success(t('files.folderCreated'))
      setCreatingFolder(false)
      setNewFolderName('')
      invalidateBrowse()
    } catch (error) {
      toast.error(errorMessage(extractErrorCode(error)))
    }
  }

  const startRename = (
    kind: 'folder' | 'file',
    item: WorkspaceFolder | WorkspaceFile
  ) => {
    setRenamingKey(`${kind}:${item.id}`)
    setRenameValue(item.name)
  }

  const cancelRename = () => {
    setRenamingKey(null)
    setRenameValue('')
  }

  const submitRename = async () => {
    if (!renamingKey) return
    const separator = renamingKey.indexOf(':')
    const kind = renamingKey.slice(0, separator) as 'folder' | 'file'
    const id = renamingKey.slice(separator + 1)
    const name = renameValue.trim()
    setRenamingKey(null)
    if (!name) return
    try {
      if (kind === 'folder') {
        await adminWorkspaceService.renameFolder(workspace.id, id, name)
      } else {
        await adminWorkspaceService.renameFile(workspace.id, id, name)
      }
      toast.success(t('files.renamed'))
      invalidateBrowse()
    } catch (error) {
      toast.error(errorMessage(extractErrorCode(error)))
    }
  }

  const openDownload = async (file: WorkspaceFile) => {
    try {
      const url = await adminWorkspaceService.downloadUrl(workspace.id, file.id)
      window.location.assign(url)
    } catch (error) {
      toast.error(errorMessage(extractErrorCode(error)))
    }
  }

  const onRemoveIncomplete = async (file: WorkspaceFile) => {
    try {
      await adminWorkspaceService.cancelUpload(workspace.id, file.id)
      invalidateBrowse()
    } catch (error) {
      toast.error(errorMessage(extractErrorCode(error)))
    }
  }

  const handleAction = async (
    action: FileActionId,
    kind: 'folder' | 'file',
    item: WorkspaceFolder | WorkspaceFile
  ) => {
    if (kind === 'folder') {
      const folder = item as WorkspaceFolder
      if (action === 'open') {
        navigate(folder.id)
      } else if (action === 'rename') {
        startRename('folder', folder)
      } else if (action === 'move') {
        onMove?.({ kind: 'folder', item: folder })
      } else if (action === 'restrict') {
        onRestrict?.(folder)
      } else if (action === 'trash') {
        setTrashRequest([{ kind: 'folder', item: folder }])
      }
      return
    }
    const file = item as WorkspaceFile
    if (action === 'open') {
      if (isPreviewableFile(file) && onPreview) {
        onPreview(file)
      } else {
        await openDownload(file)
      }
    } else if (action === 'download') {
      await openDownload(file)
    } else if (action === 'rename') {
      startRename('file', file)
    } else if (action === 'move') {
      onMove?.({ kind: 'file', item: file })
    } else if (action === 'trash') {
      setTrashRequest([{ kind: 'file', item: file }])
    }
  }

  const onOpenFolder = (folder: WorkspaceFolder) => navigate(folder.id)
  const onOpenFile = (file: WorkspaceFile) => {
    void handleAction('open', 'file', file)
  }

  const toggleSelect = (key: string, index: number, shiftKey: boolean) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (shiftKey && lastIndex !== null) {
        const [start, end] =
          lastIndex < index ? [lastIndex, index] : [index, lastIndex]
        for (let i = start; i <= end; i++) {
          const entry = entries[i]
          if (entry) next.add(`${entry.kind}:${entry.item.id}`)
        }
      } else if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
    setLastIndex(index)
  }

  const selectedEntries = useMemo(
    () =>
      entries.filter(entry => selected.has(`${entry.kind}:${entry.item.id}`)),
    [entries, selected]
  )

  const canEditEntry = (entry: Entry) => {
    const ownerId =
      entry.kind === 'folder' ? entry.item.createdById : entry.item.uploadedById
    return (
      !archived &&
      (effectiveLevel === 'MANAGER' ||
        (effectiveLevel === 'CONTRIBUTOR' && ownerId === userId))
    )
  }

  const allSelectedEditable =
    selectedEntries.length > 0 && selectedEntries.every(canEditEntry)

  const handleBulkDownload = async () => {
    const fileIds = selectedEntries
      .filter(entry => entry.kind === 'file')
      .map(entry => entry.item.id)
    const folderIds = selectedEntries
      .filter(entry => entry.kind === 'folder')
      .map(entry => entry.item.id)
    try {
      const blob = await adminWorkspaceService.bulkDownload(
        workspace.id,
        fileIds,
        folderIds
      )
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${workspace.name}.zip`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
    } catch (error) {
      toast.error(errorMessage(extractErrorCode(error)))
    }
  }

  const confirmTrash = async () => {
    if (!trashRequest) return
    setTrashing(true)
    try {
      await Promise.all(
        trashRequest.map(entry =>
          entry.kind === 'folder'
            ? adminWorkspaceService.trashFolder(workspace.id, entry.item.id)
            : adminWorkspaceService.trashFile(workspace.id, entry.item.id)
        )
      )
      toast.success(t('files.trashed'))
      setSelected(new Set())
      invalidateBrowse()
    } catch (error) {
      toast.error(errorMessage(extractErrorCode(error)))
    } finally {
      setTrashing(false)
      setTrashRequest(null)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <FolderBreadcrumb
          workspaceName={workspace.name}
          breadcrumb={data?.breadcrumb ?? []}
          onNavigate={navigate}
        />
        <div className="hidden flex-wrap items-center gap-2 md:flex">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#062E25]/50" />
            <Input
              value={searchInput}
              onChange={event => handleSearchChange(event.target.value)}
              placeholder={t('files.search')}
              className="w-64 pl-8"
            />
          </div>
          <Select
            value={sort}
            onValueChange={value => setSort(value as SortKey)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">{t('files.sortName')}</SelectItem>
              <SelectItem value="date">{t('files.sortDate')}</SelectItem>
              <SelectItem value="size">{t('files.sortSize')}</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center rounded-md border border-[#062E25]/10">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={t('files.viewGrid')}
              className={view === 'grid' ? 'bg-[#062E25]/10' : ''}
              onClick={() => setView('grid')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={t('files.viewList')}
              className={view === 'list' ? 'bg-[#062E25]/10' : ''}
              onClick={() => setView('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          {canManage && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreatingFolder(true)}
              >
                <FolderPlus className="h-4 w-4" />
                {t('files.newFolder')}
              </Button>
              <Button
                type="button"
                className="bg-[#062E25] text-white hover:bg-[#062E25]/90"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                {t('files.upload')}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFilesChosen}
              />
            </>
          )}
        </div>
      </div>

      <div
        className="relative pb-16 md:pb-0"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {dragging && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-[#062E25] bg-[#062E25]/5">
            <p className="text-sm font-medium text-[#062E25]">
              {t('files.dropHere')}
            </p>
          </div>
        )}

        {selected.size > 0 && (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#062E25]/10 bg-[#062E25]/5 px-4 py-2">
            <p className="text-sm text-[#062E25]">
              {t('files.selected', { count: selected.size })}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBulkDownload}
              >
                <Download className="h-4 w-4" />
                {t('files.downloadZip')}
              </Button>
              {allSelectedEditable && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setTrashRequest(selectedEntries)}
                >
                  <Trash2 className="h-4 w-4" />
                  {t('files.actions.trash')}
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setSelected(new Set())}
              >
                <X className="h-4 w-4" />
                {t('files.clearSelection')}
              </Button>
            </div>
          </div>
        )}

        {creatingFolder && (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-[#062E25]/10 p-2">
            <FileIcon folder className="h-4 w-4" />
            <Input
              autoFocus
              value={newFolderName}
              onChange={event => setNewFolderName(event.target.value)}
              placeholder={t('files.newFolderPlaceholder')}
              onKeyDown={event => {
                if (event.key === 'Enter') submitNewFolder()
                if (event.key === 'Escape') {
                  setCreatingFolder(false)
                  setNewFolderName('')
                }
              }}
              onBlur={() => {
                setCreatingFolder(false)
                setNewFolderName('')
              }}
              className="h-8 max-w-xs"
            />
          </div>
        )}

        {debouncedSearch ? (
          <div className="space-y-1">
            {searchLoading ? (
              <AdminPageLoader className="h-32" />
            ) : !searchHits || searchHits.length === 0 ? (
              <p className="py-8 text-center text-sm text-[#062E25]/75">
                {t('files.noResults')}
              </p>
            ) : (
              searchHits.map(hit => (
                <button
                  key={`${hit.kind}:${hit.item.id}`}
                  type="button"
                  onClick={() => handleSearchHitOpen(hit)}
                  className="flex w-full items-center gap-3 rounded-lg border border-[#062E25]/10 p-3 text-left hover:bg-[#062E25]/5"
                >
                  <FileIcon
                    mimeType={
                      hit.kind === 'file'
                        ? (hit.item as WorkspaceFile).mimeType
                        : undefined
                    }
                    folder={hit.kind === 'folder'}
                    restricted={
                      hit.kind === 'folder'
                        ? (hit.item as WorkspaceFolder).isRestricted
                        : undefined
                    }
                    className="h-5 w-5 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm text-[#062E25]">
                      {hit.item.name}
                    </p>
                    <p className="truncate text-sm text-[#062E25]/75">
                      {hit.path.length > 0
                        ? hit.path.map(entry => entry.name).join(' / ')
                        : workspace.name}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : isLoading ? (
          <AdminPageLoader className="h-64" />
        ) : isError || !data ? (
          <p className="text-sm text-[#062E25]/75">{tc('failedToLoad')}</p>
        ) : entries.length === 0 && !creatingFolder ? (
          <p className="py-12 text-center text-sm text-[#062E25]/75">
            {t('files.empty')}
          </p>
        ) : view === 'grid' || isMobile ? (
          <FileGrid
            workspaceId={workspace.id}
            entries={entries}
            selected={selected}
            selectionMode={selected.size > 0}
            level={effectiveLevel}
            userId={userId}
            archived={archived}
            renamingKey={renamingKey}
            renameValue={renameValue}
            onRenameValueChange={setRenameValue}
            onRenameSubmit={submitRename}
            onRenameCancel={cancelRename}
            onToggleSelect={toggleSelect}
            onOpenFolder={onOpenFolder}
            onOpenFile={onOpenFile}
            onAction={handleAction}
            onRemoveIncomplete={onRemoveIncomplete}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead />
                <TableHead>{t('files.columns.name')}</TableHead>
                <TableHead>{t('files.columns.size')}</TableHead>
                <TableHead>{t('files.columns.uploader')}</TableHead>
                <TableHead>{t('files.columns.date')}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry, index) => (
                <FileRow
                  key={`${entry.kind}:${entry.item.id}`}
                  kind={entry.kind}
                  item={entry.item}
                  index={index}
                  selected={selected.has(`${entry.kind}:${entry.item.id}`)}
                  selectionMode={selected.size > 0}
                  level={effectiveLevel}
                  userId={userId}
                  archived={archived}
                  renaming={renamingKey === `${entry.kind}:${entry.item.id}`}
                  renameValue={renameValue}
                  onRenameValueChange={setRenameValue}
                  onRenameSubmit={submitRename}
                  onRenameCancel={cancelRename}
                  onToggleSelect={(rowIndex, shiftKey) =>
                    toggleSelect(
                      `${entry.kind}:${entry.item.id}`,
                      rowIndex,
                      shiftKey
                    )
                  }
                  onOpenFolder={onOpenFolder}
                  onOpenFile={onOpenFile}
                  onAction={action =>
                    handleAction(action, entry.kind, entry.item)
                  }
                  onRemoveIncomplete={onRemoveIncomplete}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {mobileSearchOpen && (
        <div className="fixed inset-x-0 bottom-14 z-30 border-t border-[#062E25]/10 bg-white px-4 py-2 md:hidden">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#062E25]/50" />
            <Input
              autoFocus
              value={searchInput}
              onChange={event => handleSearchChange(event.target.value)}
              placeholder={t('files.search')}
              className="w-full pl-8"
            />
          </div>
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 flex h-14 items-center justify-around border-t border-[#062E25]/10 bg-white md:hidden">
        <button
          type="button"
          onClick={toggleMobileSearch}
          className="flex flex-col items-center gap-0.5 px-3 text-sm text-[#062E25]"
        >
          <Search className="h-5 w-5" />
          {t('files.searchLabel')}
        </button>
        {canManage && (
          <button
            type="button"
            onClick={() => mobileFileInputRef.current?.click()}
            className="flex flex-col items-center gap-0.5 px-3 text-sm text-[#062E25]"
          >
            <Upload className="h-5 w-5" />
            {t('files.upload')}
          </button>
        )}
        {canManage && (
          <button
            type="button"
            onClick={() => setCreatingFolder(true)}
            className="flex flex-col items-center gap-0.5 px-3 text-sm text-[#062E25]"
          >
            <FolderPlus className="h-5 w-5" />
            {t('files.newFolder')}
          </button>
        )}
      </div>
      <input
        ref={mobileFileInputRef}
        type="file"
        multiple
        accept="image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.dwg"
        className="hidden"
        onChange={handleFilesChosen}
      />

      <AlertDialog
        open={!!trashRequest}
        onOpenChange={open => !open && setTrashRequest(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('files.actions.trash')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('files.confirmTrash')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={trashing}>
              {tc('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={trashing}
              onClick={confirmTrash}
            >
              {t('files.actions.trash')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
