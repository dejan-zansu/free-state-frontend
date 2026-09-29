'use client'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

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
import { Textarea } from '@/components/ui/textarea'
import { adminService } from '@/services/admin.service'
import type {
  AdminContactSubmission,
  AdminContactSubmissionStatus,
} from '@/types/admin'

export default function AdminContactDetailPage() {
  const params = useParams()
  const t = useTranslations('admin.contacts')
  const tc = useTranslations('admin.common')
  const queryClient = useQueryClient()
  const id = params.id as string

  const { data: submission, isLoading } = useQuery<AdminContactSubmission>({
    queryKey: ['admin', 'contact-submission', id],
    queryFn: () => adminService.getContactSubmissionById(id),
  })

  const [status, setStatus] = useState<AdminContactSubmissionStatus>('NEW')
  const [adminNotes, setAdminNotes] = useState('')

  useEffect(() => {
    if (!submission) return
    setStatus(submission.status ?? 'NEW')
    setAdminNotes(submission.adminNotes ?? '')
  }, [submission])

  const updateMutation = useMutation({
    mutationFn: (data: {
      status: AdminContactSubmissionStatus
      adminNotes: string | null
    }) => adminService.updateContactSubmission(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'contact-submissions'],
      })
      queryClient.invalidateQueries({
        queryKey: ['admin', 'contact-submission', id],
      })
    },
  })

  if (isLoading) {
    return <AdminPageLoader className="h-64" />
  }

  if (!submission) {
    return <p className="text-[#062E25]">{tc('notFound')}</p>
  }

  const handleSave = () => {
    updateMutation.mutate({ status, adminNotes: adminNotes.trim() || null })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#062E25] mb-6">
        {submission.firstName} {submission.lastName}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-[#062E25]/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">
              {t('contactInfo')}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#062E25]">
                  {t('entityType')}
                </label>
                <p className="font-medium text-[#062E25]">
                  {submission.entityType || '-'}
                </p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]">
                  {t('salutation')}
                </label>
                <p className="font-medium text-[#062E25]">
                  {submission.salutation || '-'}
                </p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]">{t('email')}</label>
                <p className="font-medium text-[#062E25]">{submission.email}</p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]">{t('phone')}</label>
                <p className="font-medium text-[#062E25]">{submission.phone}</p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]">{t('address')}</label>
                <p className="font-medium text-[#062E25]">
                  {submission.postalCode} {submission.city}
                </p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]">{t('created')}</label>
                <p className="font-medium text-[#062E25]">
                  {new Date(submission.createdAt).toLocaleDateString('de-CH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#062E25]/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">
              {t('message')}
            </h2>
            <p className="text-[#062E25] whitespace-pre-wrap">
              {submission.message || '-'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#062E25]/10">
          <CardContent className="p-6 space-y-4">
            <h2 className="text-lg font-semibold text-[#062E25]">
              {t('manage')}
            </h2>
            <div>
              <label className="text-sm text-[#062E25] mb-1 block">
                {t('status')}
              </label>
              <Select
                value={status}
                onValueChange={value =>
                  setStatus(value as AdminContactSubmissionStatus)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW">{t('statusNew')}</SelectItem>
                  <SelectItem value="CONTACTED">
                    {t('statusContacted')}
                  </SelectItem>
                  <SelectItem value="QUALIFIED">
                    {t('statusQualified')}
                  </SelectItem>
                  <SelectItem value="CLOSED">{t('statusClosed')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-[#062E25] mb-1 block">
                {t('adminNotes')}
              </label>
              <Textarea
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                className="min-h-[120px] text-base"
              />
            </div>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {t('save')}
            </Button>
            {updateMutation.isSuccess && (
              <p className="text-green-700 text-base" role="status">
                {t('saved')}
              </p>
            )}
            {updateMutation.isError && (
              <p className="text-red-700 text-base" role="alert">
                {t('saveFailed')}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
