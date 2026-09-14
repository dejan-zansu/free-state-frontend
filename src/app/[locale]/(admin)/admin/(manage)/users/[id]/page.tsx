'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { StatusBadge } from '@/components/admin/StatusBadge'
import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { adminService } from '@/services/admin.service'
import type { AdminUserDetail, StaffAuditEntry } from '@/types/admin'

export default function AdminUserDetailPage() {
  const params = useParams()
  const locale = useLocale()
  const t = useTranslations('admin.users')
  const tc = useTranslations('admin.common')
  const tl = useTranslations('admin.statusLabels')
  const queryClient = useQueryClient()
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [resending, setResending] = useState(false)
  const [resendMessage, setResendMessage] = useState<string | null>(null)
  const [resendError, setResendError] = useState<string | null>(null)

  const { data: user, isLoading } = useQuery<AdminUserDetail>({
    queryKey: ['admin', 'user', params.id],
    queryFn: () => adminService.getUserById(params.id as string),
  })

  const {
    data: auditEntries,
    isLoading: auditLoading,
    isError: auditFailed,
  } = useQuery<StaffAuditEntry[]>({
    queryKey: ['admin', 'users', params.id, 'audit'],
    queryFn: () => adminService.listUserAudit(params.id as string),
  })

  const handleUpdate = async (field: string, value: string) => {
    if (!user) return
    setSaving(true)
    setSaveError(null)
    try {
      await adminService.updateUser(user.id, { [field]: value })
      queryClient.invalidateQueries({ queryKey: ['admin', 'user', params.id] })
      queryClient.invalidateQueries({
        queryKey: ['admin', 'users', params.id, 'audit'],
      })
    } catch (e: unknown) {
      const code = (
        e as { response?: { data?: { error?: { code?: string } } } }
      )?.response?.data?.error?.code
      if (
        code === 'SELF_ROLE_CHANGE' ||
        code === 'LAST_ADMIN' ||
        code === 'CUSTOMER_ROLE_LOCKED'
      ) {
        setSaveError(t(`errors.${code}`))
      } else {
        setSaveError(t('errors.generic'))
      }
    } finally {
      setSaving(false)
    }
  }

  const handleResendInvite = async () => {
    if (!user) return
    setResending(true)
    setResendMessage(null)
    setResendError(null)
    try {
      await adminService.resendInvite(user.id)
      setResendMessage(t('invite.resent'))
      queryClient.invalidateQueries({
        queryKey: ['admin', 'users', params.id, 'audit'],
      })
    } catch (e: unknown) {
      const code = (
        e as { response?: { data?: { error?: { code?: string } } } }
      )?.response?.data?.error?.code
      setResendError(
        code === 'INVITE_NOT_PENDING'
          ? t('errors.INVITE_NOT_PENDING')
          : t('invite.errorGeneric')
      )
    } finally {
      setResending(false)
    }
  }

  const auditTransition = (entry: StaffAuditEntry) => {
    const beforeRaw = entry.before.role ?? entry.before.status
    const afterRaw = entry.after.role ?? entry.after.status
    if (!beforeRaw || !afterRaw) return null
    const beforeLabel = tl.has(beforeRaw) ? tl(beforeRaw) : beforeRaw
    const afterLabel = tl.has(afterRaw) ? tl(afterRaw) : afterRaw
    return t('audit.transition', { before: beforeLabel, after: afterLabel })
  }

  if (isLoading) {
    return <AdminPageLoader className="h-64" />
  }

  if (!user) {
    return <p className="text-[#062E25]">{tc('notFound')}</p>
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-[#062E25]">
          {user.firstName} {user.lastName}
        </h1>
        <StatusBadge status={user.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-[#062E25]/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">
              {t('accountInfo')}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#062E25]">{t('email')}</label>
                <p className="font-medium text-[#062E25]">{user.email}</p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]">{t('phone')}</label>
                <p className="font-medium text-[#062E25]">
                  {user.phone || '-'}
                </p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]">
                  {t('dateOfBirth')}
                </label>
                <p className="font-medium text-[#062E25]">
                  {user.dateOfBirth
                    ? new Date(user.dateOfBirth).toLocaleDateString('de-CH')
                    : '-'}
                </p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]">
                  {t('nationality')}
                </label>
                <p className="font-medium text-[#062E25]">
                  {user.nationality || '-'}
                </p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]">
                  {t('emailVerified')}
                </label>
                <p className="font-medium text-[#062E25]">
                  {user.emailVerified ? t('yes') : t('no')}
                </p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]">
                  {t('lastLogin')}
                </label>
                <p className="font-medium text-[#062E25]">
                  {user.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleString('de-CH')
                    : t('never')}
                </p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]">{t('joined')}</label>
                <p className="font-medium text-[#062E25]">
                  {new Date(user.createdAt).toLocaleDateString('de-CH')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#062E25]/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">
              {t('manage')}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#062E25] mb-1 block">
                  {t('role')}
                </label>
                <Select
                  value={user.role}
                  onValueChange={v => handleUpdate('role', v)}
                  disabled={saving || user.role === 'CUSTOMER'}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {user.role === 'CUSTOMER' && (
                      <SelectItem value="CUSTOMER">{tl('CUSTOMER')}</SelectItem>
                    )}
                    <SelectItem value="ADMIN">{tl('ADMIN')}</SelectItem>
                    <SelectItem value="SALES_REP">{tl('SALES_REP')}</SelectItem>
                    <SelectItem value="PROJECT_MANAGER">
                      {tl('PROJECT_MANAGER')}
                    </SelectItem>
                    <SelectItem value="EMPLOYEE">{tl('EMPLOYEE')}</SelectItem>
                  </SelectContent>
                </Select>
                {user.role === 'CUSTOMER' && (
                  <p className="text-sm text-[#062E25]/75 mt-1">
                    {t('errors.CUSTOMER_ROLE_LOCKED')}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm text-[#062E25] mb-1 block">
                  {t('status')}
                </label>
                <Select
                  value={user.status}
                  onValueChange={v => handleUpdate('status', v)}
                  disabled={saving}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">{tl('ACTIVE')}</SelectItem>
                    <SelectItem value="INACTIVE">{tl('INACTIVE')}</SelectItem>
                    <SelectItem value="PENDING_VERIFICATION">
                      {tl('PENDING_VERIFICATION')}
                    </SelectItem>
                    <SelectItem value="SUSPENDED">{tl('SUSPENDED')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {saveError && (
                <p className="text-sm text-destructive">{saveError}</p>
              )}
              {user.status === 'PENDING_VERIFICATION' &&
                user.role !== 'CUSTOMER' && (
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResendInvite}
                      disabled={resending}
                    >
                      {t('invite.resend')}
                    </Button>
                    {resendMessage && (
                      <p className="text-sm text-[#062E25]/75 mt-1">
                        {resendMessage}
                      </p>
                    )}
                    {resendError && (
                      <p className="text-sm text-destructive mt-1">
                        {resendError}
                      </p>
                    )}
                  </div>
                )}
            </div>
          </CardContent>
        </Card>

        {user.customer && (
          <Card className="border-[#062E25]/10 lg:col-span-2">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-[#062E25] mb-4">
                {t('customerProfile')}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm text-[#062E25]">
                    {t('company')}
                  </label>
                  <p className="font-medium text-[#062E25]">
                    {user.customer.companyName || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-[#062E25]">
                    {t('street')}
                  </label>
                  <p className="font-medium text-[#062E25]">
                    {[user.customer.street, user.customer.streetNumber]
                      .filter(Boolean)
                      .join(' ') || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-[#062E25]">
                    {t('postalCode')}
                  </label>
                  <p className="font-medium text-[#062E25]">
                    {user.customer.postalCode || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-[#062E25]">{t('city')}</label>
                  <p className="font-medium text-[#062E25]">
                    {user.customer.city || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-[#062E25]">
                    {t('country')}
                  </label>
                  <p className="font-medium text-[#062E25]">
                    {user.customer.country || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-[#062E25]">
                    {t('canton')}
                  </label>
                  <p className="font-medium text-[#062E25]">
                    {user.customer.canton || '-'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-[#062E25]">
                    {t('addressAdditional')}
                  </label>
                  <p className="font-medium text-[#062E25]">
                    {user.customer.addressAdditional || '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-[#062E25]/10 lg:col-span-2">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-2">
              {t('activitySummary')}
            </h2>
            <div className="flex gap-8">
              <div>
                <p className="text-2xl font-bold text-[#062E25]">
                  {user._count.assignedLeads}
                </p>
                <p className="text-sm text-[#062E25]">{t('assignedLeads')}</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#062E25]">
                  {user._count.createdQuotes}
                </p>
                <p className="text-sm text-[#062E25]">{t('createdQuotes')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#062E25]/10 lg:col-span-2">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">
              {t('audit.title')}
            </h2>
            {auditLoading ? (
              <AdminPageLoader className="h-24" />
            ) : auditFailed ? (
              <p className="text-sm text-destructive">{tc('failedToLoad')}</p>
            ) : !auditEntries || auditEntries.length === 0 ? (
              <p className="text-sm text-[#062E25]/75">{t('audit.empty')}</p>
            ) : (
              <div className="space-y-3">
                {auditEntries.map(entry => {
                  const transition = auditTransition(entry)
                  const actorName = entry.actor
                    ? `${entry.actor.firstName} ${entry.actor.lastName}`
                    : t('audit.actorUnknown')
                  return (
                    <div
                      key={entry.id}
                      className="border-b border-[#062E25]/10 pb-3 last:border-0 last:pb-0"
                    >
                      <p className="text-sm text-[#062E25]/75">
                        {new Date(entry.createdAt).toLocaleString('de-CH')},{' '}
                        {actorName}
                      </p>
                      <p className="text-sm font-medium text-[#062E25]">
                        {t(`audit.${entry.action}`)}
                        {transition ? `: ${transition}` : ''}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
