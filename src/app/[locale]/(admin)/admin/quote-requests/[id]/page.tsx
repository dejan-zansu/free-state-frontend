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

export default function AdminQuoteRequestDetailPage() {
  const { id } = useParams<{ id: string }>()
  const locale = useLocale()
  const router = useRouter()
  const t = useTranslations('admin.quoteRequests')
  const queryClient = useQueryClient()

  const { data: request, isLoading } = useQuery({
    queryKey: ['admin', 'quote-requests', 'detail', id],
    queryFn: () => adminService.getQuoteRequestById(id),
  })

  const [status, setStatus] = useState('')
  const [adminNotes, setAdminNotes] = useState('')

  const updateMutation = useMutation({
    mutationFn: (data: { status?: string; adminNotes?: string | null }) =>
      adminService.updateQuoteRequest(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'quote-requests'] })
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
        onClick={() => router.push(`/${locale}/admin/quote-requests`)}
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
                <p className="text-[#062E25]/40">{t('source')}</p>
                <p className="text-[#062E25]">
                  {t(request.source === 'SOLAR_FREE' ? 'sourceSolarFree' : 'sourceSolarDirect')}
                </p>
              </div>
              <div>
                <p className="text-[#062E25]/40">{t('ownsHome')}</p>
                <p className="text-[#062E25]">
                  {request.ownsHome ? t('yes') : t('no')}
                </p>
              </div>
              <div>
                <p className="text-[#062E25]/40">{t('email')}</p>
                <p className="text-[#062E25]">{request.email}</p>
              </div>
              <div>
                <p className="text-[#062E25]/40">{t('phone')}</p>
                <p className="text-[#062E25]">{request.phone}</p>
              </div>
              <div>
                <p className="text-[#062E25]/40">{t('postalCode')}</p>
                <p className="text-[#062E25]">{request.postalCode}</p>
              </div>
              <div>
                <p className="text-[#062E25]/40">{t('locale')}</p>
                <p className="text-[#062E25]">{request.locale || '-'}</p>
              </div>
              <div>
                <p className="text-[#062E25]/40">{t('consent')}</p>
                <p className="text-[#062E25]">{request.consent ? t('yes') : t('no')}</p>
              </div>
              <div>
                <p className="text-[#062E25]/40">{t('created')}</p>
                <p className="text-[#062E25]">
                  {new Date(request.createdAt).toLocaleString('de-CH')}
                </p>
              </div>
            </div>
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
                  <SelectItem value="QUALIFIED">{t('statusQualified')}</SelectItem>
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
