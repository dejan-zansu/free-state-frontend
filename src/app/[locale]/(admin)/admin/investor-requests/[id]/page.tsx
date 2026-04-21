'use client'

import { useParams, useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'

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

export default function AdminInvestorRequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const locale = useLocale()
  const router = useRouter()
  const t = useTranslations('admin.investorRequests')
  const queryClient = useQueryClient()

  const { data: request, isLoading } = useQuery({
    queryKey: ['admin', 'investor-requests', 'detail', id],
    queryFn: () => adminService.getInvestorRequestById(id),
  })

  const [status, setStatus] = useState('')
  const [adminNotes, setAdminNotes] = useState('')

  const updateMutation = useMutation({
    mutationFn: (data: { status?: string; adminNotes?: string | null }) =>
      adminService.updateInvestorRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'investor-requests'] })
    },
  })

  if (isLoading || !request) return <AdminPageLoader />

  if (!status && request.status) setStatus(request.status)
  if (!adminNotes && request.adminNotes) setAdminNotes(request.adminNotes)

  const handleSave = () => {
    updateMutation.mutate({ status, adminNotes })
  }

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        onClick={() => router.push(`/${locale}/admin/investor-requests`)}
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        {t('backToList')}
      </Button>

      <h1 className="text-2xl font-bold text-[#062E25] mb-6">
        {request.firstName} {request.lastName}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-[#062E25]/10">
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold text-[#062E25]">{t('details')}</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[#062E25]/40">{t('type')}</p>
                <p className="text-[#062E25] capitalize">{request.entityType || '-'}</p>
              </div>
              <div>
                <p className="text-[#062E25]/40">{t('salutation')}</p>
                <p className="text-[#062E25] capitalize">{request.salutation || '-'}</p>
              </div>
              <div>
                <p className="text-[#062E25]/40">{t('email')}</p>
                <p className="text-[#062E25]">{request.email}</p>
              </div>
              <div>
                <p className="text-[#062E25]/40">{t('phone')}</p>
                <p className="text-[#062E25]">{request.phonePrefix} {request.phone || '-'}</p>
              </div>
              <div>
                <p className="text-[#062E25]/40">{t('address')}</p>
                <p className="text-[#062E25]">{request.address || '-'}</p>
              </div>
              <div>
                <p className="text-[#062E25]/40">{t('location')}</p>
                <p className="text-[#062E25]">{request.postalCode} {request.city || '-'}</p>
              </div>
              <div>
                <p className="text-[#062E25]/40">{t('language')}</p>
                <p className="text-[#062E25] capitalize">{request.language}</p>
              </div>
              <div>
                <p className="text-[#062E25]/40">{t('created')}</p>
                <p className="text-[#062E25]">{new Date(request.createdAt).toLocaleString('de-CH')}</p>
              </div>
            </div>
            {request.comment && (
              <div>
                <p className="text-[#062E25]/40 text-sm">{t('comment')}</p>
                <p className="text-[#062E25] text-sm mt-1">{request.comment}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-[#062E25]/10">
          <CardContent className="p-6 space-y-4">
            <h2 className="font-semibold text-[#062E25]">{t('manage')}</h2>
            <div>
              <p className="text-sm text-[#062E25]/40 mb-1">{t('status')}</p>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NEW">{t('statusNew')}</SelectItem>
                  <SelectItem value="CONTACTED">{t('statusContacted')}</SelectItem>
                  <SelectItem value="DOCUMENTS_SENT">{t('statusDocumentsSent')}</SelectItem>
                  <SelectItem value="CLOSED">{t('statusClosed')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-sm text-[#062E25]/40 mb-1">{t('adminNotes')}</p>
              <Textarea
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              {t('save')}
            </Button>
            {updateMutation.isSuccess && (
              <p className="text-green-600 text-sm">{t('saved')}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
