'use client'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { Card, CardContent } from '@/components/ui/card'
import { adminService } from '@/services/admin.service'
import type { AdminContactSubmission } from '@/types/admin'

export default function AdminContactDetailPage() {
  const params = useParams()
  const t = useTranslations('admin.contacts')
  const tc = useTranslations('admin.common')

  const { data: submission, isLoading } = useQuery<AdminContactSubmission>({
    queryKey: ['admin', 'contact-submission', params.id],
    queryFn: () => adminService.getContactSubmissionById(params.id as string),
  })

  if (isLoading) {
    return <AdminPageLoader className="h-64" />
  }

  if (!submission) {
    return <p className="text-[#062E25]/60">{tc('notFound')}</p>
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
                <label className="text-sm text-[#062E25]/60">{t('entityType')}</label>
                <p className="font-medium text-[#062E25]">{submission.entityType || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">{t('salutation')}</label>
                <p className="font-medium text-[#062E25]">{submission.salutation || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">{t('email')}</label>
                <p className="font-medium text-[#062E25]">{submission.email}</p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">{t('phone')}</label>
                <p className="font-medium text-[#062E25]">{submission.phone}</p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">{t('address')}</label>
                <p className="font-medium text-[#062E25]">
                  {submission.postalCode} {submission.city}
                </p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">{t('created')}</label>
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
      </div>
    </div>
  )
}
