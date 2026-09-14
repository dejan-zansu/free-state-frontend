'use client'

import { useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
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
import { adminWorkspaceService } from '@/services/admin-workspace.service'
import type { WorkspaceDetail, WorkspaceLevel } from '@/types/workspace'

const LEVELS: WorkspaceLevel[] = ['VIEWER', 'CONTRIBUTOR', 'MANAGER']

interface MembersTabProps {
  workspace: WorkspaceDetail
}

function extractErrorCode(e: unknown): string | undefined {
  return (e as { response?: { data?: { error?: { code?: string } } } })
    ?.response?.data?.error?.code
}

export function MembersTab({ workspace }: MembersTabProps) {
  const t = useTranslations('admin.workspaces')
  const tc = useTranslations('admin.common')
  const queryClient = useQueryClient()
  const isManager = workspace.myLevel === 'MANAGER'
  const isArchived = workspace.status === 'ARCHIVED'
  const canManageMembers = isManager && !isArchived

  const [error, setError] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )

  const [addUserId, setAddUserId] = useState('')
  const [addLevel, setAddLevel] = useState<WorkspaceLevel>('CONTRIBUTOR')
  const [busy, setBusy] = useState(false)

  const { data: team, isError: teamError } = useQuery({
    queryKey: ['admin', 'workspaces', workspace.id, 'team'],
    queryFn: () => adminWorkspaceService.team(workspace.id),
    enabled: canManageMembers,
  })

  const availableUsers = (team ?? []).filter(
    u => !workspace.members.some(m => m.userId === u.id)
  )

  const showError = (e: unknown) => {
    const code = extractErrorCode(e)
    setError(
      code && t.has(`errors.${code}`)
        ? t(`errors.${code}`)
        : t('errors.generic')
    )
  }

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: ['admin', 'workspaces', workspace.id],
    })
    queryClient.invalidateQueries({
      queryKey: ['admin', 'workspaces', workspace.id, 'activity'],
    })
  }

  const changeLevel = async (userId: string, level: WorkspaceLevel) => {
    setError(null)
    try {
      await adminWorkspaceService.updateMember(workspace.id, userId, level)
      invalidate()
    } catch (e: unknown) {
      showError(e)
    }
  }

  const requestRemove = (memberId: string) => {
    setConfirmingId(memberId)
    if (confirmTimer.current) clearTimeout(confirmTimer.current)
    confirmTimer.current = setTimeout(() => setConfirmingId(null), 4000)
  }

  const confirmRemove = async (userId: string) => {
    setConfirmingId(null)
    if (confirmTimer.current) clearTimeout(confirmTimer.current)
    setError(null)
    try {
      await adminWorkspaceService.removeMember(workspace.id, userId)
      invalidate()
    } catch (e: unknown) {
      showError(e)
    }
  }

  const addMember = async () => {
    if (!addUserId) return
    setBusy(true)
    setError(null)
    try {
      await adminWorkspaceService.addMember(workspace.id, addUserId, addLevel)
      setAddUserId('')
      setAddLevel('CONTRIBUTOR')
      invalidate()
    } catch (e: unknown) {
      showError(e)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg">
          {error}
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('members.columns.name')}</TableHead>
            <TableHead>{t('members.columns.email')}</TableHead>
            <TableHead>{t('members.level')}</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {workspace.members.map(member => (
            <TableRow key={member.id}>
              <TableCell className="font-medium text-[#062E25]">
                {member.user.firstName} {member.user.lastName}
              </TableCell>
              <TableCell className="text-sm text-[#062E25]/75">
                {member.user.email}
              </TableCell>
              <TableCell>
                {canManageMembers ? (
                  <Select
                    value={member.level}
                    onValueChange={v =>
                      changeLevel(member.userId, v as WorkspaceLevel)
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVELS.map(level => (
                        <SelectItem key={level} value={level}>
                          {t(`levels.${level}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="secondary">
                    {t(`levels.${member.level}`)}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {canManageMembers && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      confirmingId === member.id
                        ? confirmRemove(member.userId)
                        : requestRemove(member.id)
                    }
                  >
                    {confirmingId === member.id
                      ? t('members.confirmRemove')
                      : t('members.remove')}
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
          {workspace.members.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={4}
                className="text-center py-8 text-[#062E25]/75"
              >
                {t('members.empty')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {canManageMembers && teamError && (
        <p className="text-sm text-red-700 pt-4 border-t border-[#062E25]/10">
          {tc('failedToLoad')}
        </p>
      )}

      {canManageMembers && !teamError && (
        <div className="flex flex-wrap items-end gap-3 pt-4 border-t border-[#062E25]/10">
          <div>
            <Label>{t('members.selectUser')}</Label>
            <Select value={addUserId} onValueChange={setAddUserId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder={t('members.selectUser')} />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.map(u => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.firstName} {u.lastName} ({u.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t('members.level')}</Label>
            <Select
              value={addLevel}
              onValueChange={v => setAddLevel(v as WorkspaceLevel)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEVELS.map(level => (
                  <SelectItem key={level} value={level}>
                    {t(`levels.${level}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={addMember}
            disabled={busy || !addUserId}
            className="bg-[#062E25] hover:bg-[#062E25]/90 text-white"
          >
            {t('members.add')}
          </Button>
        </div>
      )}
    </div>
  )
}
