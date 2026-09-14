'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { adminWorkspaceService } from '@/services/admin-workspace.service'
import type {
  TrashResult,
  WorkspaceDetail,
  WorkspaceFile,
} from '@/types/workspace'

import { FileIcon } from './FileIcon'

function extractErrorCode(error: unknown): string | undefined {
  return (error as { response?: { data?: { error?: { code?: string } } } })
    ?.response?.data?.error?.code
}

interface TrashTabProps {
  workspace: WorkspaceDetail
}

export function TrashTab({ workspace }: TrashTabProps) {
  const t = useTranslations('admin.workspaces')
  const tc = useTranslations('admin.common')
  const queryClient = useQueryClient()
  const [deleteTarget, setDeleteTarget] = useState<WorkspaceFile | null>(null)
  const [deleting, setDeleting] = useState(false)

  const { data, isLoading, isError } = useQuery<TrashResult>({
    queryKey: ['admin', 'workspaces', workspace.id, 'trash'],
    queryFn: () => adminWorkspaceService.trash(workspace.id),
  })

  const canRestore =
    workspace.myLevel !== 'VIEWER' && workspace.status === 'ACTIVE'
  const canDeleteForever =
    workspace.myLevel === 'MANAGER' && workspace.status === 'ACTIVE'

  const errorMessage = (code: string | undefined) => {
    const key = code ? `errors.${code}` : 'errors.generic'
    return t.has(key) ? t(key) : t('errors.generic')
  }

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: ['admin', 'workspaces', workspace.id, 'trash'],
    })
    queryClient.invalidateQueries({
      queryKey: ['admin', 'workspaces', workspace.id, 'browse'],
    })
  }

  const restoreFolder = async (folderId: string) => {
    try {
      await adminWorkspaceService.restoreFolder(workspace.id, folderId)
      invalidate()
    } catch (error) {
      toast.error(errorMessage(extractErrorCode(error)))
    }
  }

  const restoreFile = async (fileId: string) => {
    try {
      await adminWorkspaceService.restoreFile(workspace.id, fileId)
      invalidate()
    } catch (error) {
      toast.error(errorMessage(extractErrorCode(error)))
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await adminWorkspaceService.deleteFile(workspace.id, deleteTarget.id)
      invalidate()
    } catch (error) {
      toast.error(errorMessage(extractErrorCode(error)))
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  if (isLoading) {
    return <AdminPageLoader className="h-64" />
  }

  if (isError || !data) {
    return <p className="text-sm text-[#062E25]/75">{tc('failedToLoad')}</p>
  }

  const isEmpty = data.folders.length === 0 && data.files.length === 0

  return (
    <div className="space-y-6">
      {isEmpty ? (
        <p className="py-12 text-center text-sm text-[#062E25]/75">
          {t('trash.empty')}
        </p>
      ) : (
        <>
          <p className="text-sm text-[#062E25]/75">{t('trash.retention')}</p>

          {data.folders.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-[#062E25]">
                {t('trash.folders')}
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead />
                    <TableHead>{t('files.columns.name')}</TableHead>
                    <TableHead>{t('trash.deletedAt')}</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.folders.map(folder => (
                    <TableRow key={folder.id}>
                      <TableCell>
                        <FileIcon folder className="h-4 w-4" />
                      </TableCell>
                      <TableCell className="text-sm text-[#062E25]">
                        {folder.name}
                      </TableCell>
                      <TableCell className="text-sm text-[#062E25]/75">
                        {folder.deletedAt
                          ? new Date(folder.deletedAt).toLocaleDateString(
                              'de-CH'
                            )
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {canRestore && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => restoreFolder(folder.id)}
                          >
                            {t('trash.restore')}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {data.files.length > 0 && (
            <div>
              <h3 className="mb-2 text-sm font-medium text-[#062E25]">
                {t('trash.files')}
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead />
                    <TableHead>{t('files.columns.name')}</TableHead>
                    <TableHead>{t('trash.deletedAt')}</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.files.map(file => (
                    <TableRow key={file.id}>
                      <TableCell>
                        <FileIcon
                          mimeType={file.mimeType}
                          className="h-4 w-4"
                        />
                      </TableCell>
                      <TableCell className="text-sm text-[#062E25]">
                        {file.name}
                      </TableCell>
                      <TableCell className="text-sm text-[#062E25]/75">
                        {file.deletedAt
                          ? new Date(file.deletedAt).toLocaleDateString('de-CH')
                          : '-'}
                      </TableCell>
                      <TableCell className="flex justify-end gap-2">
                        {canRestore && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => restoreFile(file.id)}
                          >
                            {t('trash.restore')}
                          </Button>
                        )}
                        {canDeleteForever && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteTarget(file)}
                          >
                            {t('trash.deleteForever')}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={open => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('trash.deleteForever')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('trash.confirmDelete')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              {tc('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleting}
              onClick={confirmDelete}
            >
              {t('trash.deleteForever')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
