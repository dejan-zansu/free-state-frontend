'use client'

import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Lock } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { adminWorkspaceService } from '@/services/admin-workspace.service'
import type { WorkspaceDetail, WorkspaceFolder } from '@/types/workspace'

function extractErrorCode(error: unknown): string | undefined {
  return (error as { response?: { data?: { error?: { code?: string } } } })
    ?.response?.data?.error?.code
}

interface RestrictDialogProps {
  workspace: WorkspaceDetail
  folder: WorkspaceFolder | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RestrictDialog({
  workspace,
  folder,
  open,
  onOpenChange,
}: RestrictDialogProps) {
  const t = useTranslations('admin.workspaces')
  const tc = useTranslations('admin.common')
  const queryClient = useQueryClient()
  const [isRestricted, setIsRestricted] = useState(false)
  const [checkedUserIds, setCheckedUserIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open || !folder) return
    setLoading(true)
    setIsRestricted(folder.isRestricted)
    setCheckedUserIds(new Set())
    adminWorkspaceService
      .browse(workspace.id, folder.id)
      .then(result => {
        setIsRestricted(result.folder?.isRestricted ?? folder.isRestricted)
        setCheckedUserIds(
          new Set((result.folder?.access ?? []).map(user => user.id))
        )
      })
      .finally(() => setLoading(false))
  }, [open, folder, workspace.id])

  const toggleUser = (userId: string) => {
    setCheckedUserIds(prev => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
  }

  const save = async () => {
    if (!folder) return
    setSaving(true)
    try {
      await adminWorkspaceService.restrictFolder(
        workspace.id,
        folder.id,
        isRestricted,
        Array.from(checkedUserIds)
      )
      queryClient.invalidateQueries({
        queryKey: ['admin', 'workspaces', workspace.id, 'browse'],
      })
      toast.success(t('restrict.saved'))
      onOpenChange(false)
    } catch (error) {
      const code = extractErrorCode(error)
      const key = code ? `errors.${code}` : 'errors.generic'
      toast.error(t.has(key) ? t(key) : t('errors.generic'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('restrict.title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-[#062E25]">
                {t('restrict.toggle')}
              </p>
              <p className="text-sm text-[#062E25]/75">{t('restrict.hint')}</p>
            </div>
            <Switch checked={isRestricted} onCheckedChange={setIsRestricted} />
          </div>
          {loading ? (
            <AdminPageLoader className="h-32" />
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-sm text-[#062E25]/75">
                <Lock className="h-3.5 w-3.5" />
                <span>{t('restrict.managers')}</span>
              </div>
              <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-[#062E25]/10 p-2">
                {workspace.members.map(member => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2 rounded px-2 py-1.5"
                  >
                    {member.level === 'MANAGER' ? (
                      <Lock className="h-4 w-4 shrink-0 text-[#062E25]/40" />
                    ) : (
                      <Checkbox
                        checked={checkedUserIds.has(member.userId)}
                        onCheckedChange={() => toggleUser(member.userId)}
                      />
                    )}
                    <span className="text-sm text-[#062E25]">
                      {member.user.firstName} {member.user.lastName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            {tc('cancel')}
          </Button>
          <Button
            className="bg-[#062E25] text-white hover:bg-[#062E25]/90"
            onClick={save}
            disabled={saving || loading}
          >
            {t('restrict.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
