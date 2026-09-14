'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Archive,
  ArchiveRestore,
  ChevronLeft,
  ExternalLink,
  Pencil,
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { useHasCapability } from '@/lib/capabilities'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { ActivityTab } from '@/components/admin/workspaces/ActivityTab'
import { FilesTab } from '@/components/admin/workspaces/FilesTab'
import { MembersTab } from '@/components/admin/workspaces/MembersTab'
import { MoveDialog } from '@/components/admin/workspaces/MoveDialog'
import { PreviewDialog } from '@/components/admin/workspaces/PreviewDialog'
import { RestrictDialog } from '@/components/admin/workspaces/RestrictDialog'
import { TrashTab } from '@/components/admin/workspaces/TrashTab'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { adminWorkspaceService } from '@/services/admin-workspace.service'
import type {
  BrowseResult,
  WorkspaceDetail,
  WorkspaceFile,
  WorkspaceFolder,
} from '@/types/workspace'

type MoveTarget =
  | { kind: 'folder'; item: WorkspaceFolder }
  | { kind: 'file'; item: WorkspaceFile }

function isPreviewableFile(file: WorkspaceFile): boolean {
  return (
    file.mimeType.startsWith('image/') || file.mimeType === 'application/pdf'
  )
}

interface EditWorkspaceDialogProps {
  workspace: WorkspaceDetail
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

function EditWorkspaceDialog({
  workspace,
  open,
  onOpenChange,
  onSaved,
}: EditWorkspaceDialogProps) {
  const t = useTranslations('admin.workspaces')
  const tc = useTranslations('admin.common')
  const [name, setName] = useState(workspace.name)
  const [siteAddress, setSiteAddress] = useState(workspace.siteAddress ?? '')
  const [description, setDescription] = useState(workspace.description ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    setBusy(true)
    setError(null)
    try {
      await adminWorkspaceService.update(workspace.id, {
        name: name.trim(),
        siteAddress: siteAddress.trim() || null,
        description: description.trim() || null,
      })
      onSaved()
      onOpenChange(false)
    } catch (e: unknown) {
      const code = (
        e as { response?: { data?: { error?: { code?: string } } } }
      )?.response?.data?.error?.code
      setError(
        code && t.has(`errors.${code}`)
          ? t(`errors.${code}`)
          : t('errors.generic')
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('detail.edit')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>{t('dialog.name')}</Label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <Label>{t('dialog.siteAddress')}</Label>
            <Input
              value={siteAddress}
              onChange={e => setSiteAddress(e.target.value)}
            />
          </div>
          <div>
            <Label>{t('dialog.description')}</Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={busy}
          >
            {tc('cancel')}
          </Button>
          <Button
            onClick={submit}
            disabled={busy || !name.trim()}
            className="bg-[#062E25] hover:bg-[#062E25]/90 text-white"
          >
            {t('detail.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminWorkspaceDetailPage() {
  const params = useParams<{ id: string }>()
  const searchParams = useSearchParams()
  const locale = useLocale()
  const router = useRouter()
  const t = useTranslations('admin.workspaces')
  const tc = useTranslations('admin.common')
  const queryClient = useQueryClient()
  const canManageUsers = useHasCapability('users.manage')
  const canUseSalesTools = useHasCapability('sales.tools')

  const [tab, setTab] = useState('files')
  const [editOpen, setEditOpen] = useState(false)
  const [archiving, setArchiving] = useState(false)
  const [archiveError, setArchiveError] = useState<string | null>(null)
  const [moveTarget, setMoveTarget] = useState<MoveTarget | null>(null)
  const [restrictTarget, setRestrictTarget] = useState<WorkspaceFolder | null>(
    null
  )
  const [previewFiles, setPreviewFiles] = useState<WorkspaceFile[]>([])
  const [previewIndex, setPreviewIndex] = useState(0)
  const [previewOpen, setPreviewOpen] = useState(false)

  const {
    data: workspace,
    isLoading,
    isError,
  } = useQuery<WorkspaceDetail>({
    queryKey: ['admin', 'workspaces', params.id],
    queryFn: () => adminWorkspaceService.get(params.id),
  })

  const currentFolderId = searchParams.get('folder')

  const { data: browseData } = useQuery<BrowseResult>({
    queryKey: ['admin', 'workspaces', params.id, 'browse', currentFolderId],
    queryFn: () => adminWorkspaceService.browse(params.id, currentFolderId),
    enabled: !!workspace,
  })

  const errorMessage = (code: string | undefined) => {
    const key = code ? `errors.${code}` : 'errors.generic'
    return t.has(key) ? t(key) : t('errors.generic')
  }

  const handlePreview = (file: WorkspaceFile) => {
    const list = (browseData?.files ?? []).filter(isPreviewableFile)
    const idx = list.findIndex(entry => entry.id === file.id)
    setPreviewFiles(list)
    setPreviewIndex(idx >= 0 ? idx : 0)
    setPreviewOpen(true)
  }

  const handleMovePick = async (folderId: string | null) => {
    if (!moveTarget || !workspace) return
    try {
      if (moveTarget.kind === 'folder') {
        await adminWorkspaceService.moveFolder(
          workspace.id,
          moveTarget.item.id,
          folderId
        )
      } else {
        await adminWorkspaceService.moveFile(
          workspace.id,
          moveTarget.item.id,
          folderId
        )
      }
      toast.success(t('files.moved'))
      queryClient.invalidateQueries({
        queryKey: ['admin', 'workspaces', workspace.id, 'browse'],
      })
    } catch (error) {
      const code = (
        error as { response?: { data?: { error?: { code?: string } } } }
      )?.response?.data?.error?.code
      toast.error(errorMessage(code))
    } finally {
      setMoveTarget(null)
    }
  }

  const refetch = () => {
    queryClient.invalidateQueries({
      queryKey: ['admin', 'workspaces', params.id],
    })
    queryClient.invalidateQueries({
      queryKey: ['admin', 'workspaces', params.id, 'activity'],
    })
  }

  const toggleArchive = async () => {
    if (!workspace) return
    setArchiving(true)
    setArchiveError(null)
    try {
      if (workspace.status === 'ARCHIVED') {
        await adminWorkspaceService.restore(workspace.id)
      } else {
        await adminWorkspaceService.archive(workspace.id)
      }
      refetch()
    } catch {
      setArchiveError(t('errors.generic'))
    } finally {
      setArchiving(false)
    }
  }

  if (isLoading) {
    return <AdminPageLoader className="h-64" />
  }

  if (isError || !workspace) {
    return <p className="text-[#062E25]">{tc('notFound')}</p>
  }

  const isArchived = workspace.status === 'ARCHIVED'

  return (
    <div>
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="gap-2 mb-4"
      >
        <ChevronLeft className="h-4 w-4" />
        {t('detail.back')}
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <p className="font-mono text-sm text-[#062E25]/75">
            {workspace.number}
          </p>
          <h1 className="text-2xl font-bold text-[#062E25]">
            {workspace.name}
          </h1>
          {workspace.siteAddress && (
            <p className="text-sm text-[#062E25]/75">{workspace.siteAddress}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <StatusBadge status={workspace.status} />
            {workspace.residentialProject && canManageUsers && (
              <Link
                href={`/${locale}/admin/projects/${workspace.residentialProject.id}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-[#062E25] hover:underline"
              >
                {t('detail.linkedProject')}
                <ExternalLink className="h-4 w-4" />
              </Link>
            )}
            {workspace.commercialLead && canUseSalesTools && (
              <Link
                href={`/${locale}/admin/commercial-leads/${workspace.commercialLead.id}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-[#062E25] hover:underline"
              >
                {t('detail.linkedLead')} ({workspace.commercialLead.reference})
                <ExternalLink className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
        {workspace.myLevel === 'MANAGER' && (
          <div className="flex items-center gap-2">
            {!isArchived && (
              <Button variant="outline" onClick={() => setEditOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                {t('detail.edit')}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={toggleArchive}
              disabled={archiving}
            >
              {isArchived ? (
                <ArchiveRestore className="mr-2 h-4 w-4" />
              ) : (
                <Archive className="mr-2 h-4 w-4" />
              )}
              {isArchived ? t('detail.restore') : t('detail.archive')}
            </Button>
          </div>
        )}
      </div>

      {isArchived && (
        <div className="mb-4 text-sm text-[#062E25] bg-gray-100 border border-gray-200 p-3 rounded-lg">
          {t('detail.archivedNotice')}
        </div>
      )}

      {archiveError && (
        <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg">
          {archiveError}
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="files">{t('detail.tabs.files')}</TabsTrigger>
          <TabsTrigger value="members">{t('detail.tabs.members')}</TabsTrigger>
          <TabsTrigger value="activity">
            {t('detail.tabs.activity')}
          </TabsTrigger>
          <TabsTrigger value="trash">{t('detail.tabs.trash')}</TabsTrigger>
        </TabsList>
        <TabsContent value="files">
          <FilesTab
            workspace={workspace}
            onPreview={handlePreview}
            onMove={setMoveTarget}
            onRestrict={setRestrictTarget}
          />
        </TabsContent>
        <TabsContent value="members">
          <MembersTab workspace={workspace} />
        </TabsContent>
        <TabsContent value="activity">
          <ActivityTab workspace={workspace} />
        </TabsContent>
        <TabsContent value="trash">
          <TrashTab workspace={workspace} />
        </TabsContent>
      </Tabs>

      <EditWorkspaceDialog
        workspace={workspace}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={refetch}
      />

      <MoveDialog
        workspaceId={workspace.id}
        open={!!moveTarget}
        onOpenChange={open => !open && setMoveTarget(null)}
        onPick={handleMovePick}
        excludeFolderId={
          moveTarget?.kind === 'folder' ? moveTarget.item.id : null
        }
      />

      <RestrictDialog
        workspace={workspace}
        folder={restrictTarget}
        open={!!restrictTarget}
        onOpenChange={open => !open && setRestrictTarget(null)}
      />

      <PreviewDialog
        workspaceId={workspace.id}
        files={previewFiles}
        index={previewIndex}
        onIndexChange={setPreviewIndex}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </div>
  )
}
