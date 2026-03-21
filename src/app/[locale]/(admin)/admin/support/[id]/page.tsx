'use client'

import { useTranslations } from 'next-intl'
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
import { Textarea } from '@/components/ui/textarea'
import { adminService } from '@/services/admin.service'
import type { AdminInquiry } from '@/types/admin'

const INQUIRY_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Offen',
  IN_PROGRESS: 'In Bearbeitung',
  RESOLVED: 'Gelöst',
  CLOSED: 'Geschlossen',
}

export default function AdminSupportDetailPage() {
  const params = useParams()
  const t = useTranslations('admin.support')
  const tc = useTranslations('admin.common')
  const queryClient = useQueryClient()
  const [saving, setSaving] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  const [notesInitialized, setNotesInitialized] = useState(false)

  const { data: inquiry, isLoading } = useQuery<AdminInquiry>({
    queryKey: ['admin', 'inquiry', params.id],
    queryFn: async () => {
      const data = await adminService.getInquiryById(params.id as string)
      if (!notesInitialized) {
        setAdminNotes(data.adminNotes || '')
        setNotesInitialized(true)
      }
      return data
    },
  })

  const handleUpdate = async (data: Record<string, string | null>) => {
    if (!inquiry) return
    setSaving(true)
    try {
      await adminService.updateInquiry(inquiry.id, data)
      queryClient.invalidateQueries({ queryKey: ['admin', 'inquiry', params.id] })
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return <AdminPageLoader className="h-64" />
  }

  if (!inquiry) {
    return <p className="text-[#062E25]/60">{tc('notFound')}</p>
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-[#062E25]">
          {inquiry.firstName} {inquiry.lastName}
        </h1>
        <StatusBadge status={inquiry.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-[#062E25]/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">
              {t('ticketInfo')}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#062E25]/60">{t('message')}</label>
                <p className="font-medium text-[#062E25] whitespace-pre-wrap">
                  {inquiry.message || '-'}
                </p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">{t('email')}</label>
                <p className="font-medium text-[#062E25]">{inquiry.email}</p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">{t('phone')}</label>
                <p className="font-medium text-[#062E25]">{inquiry.phone || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">{t('address')}</label>
                <p className="font-medium text-[#062E25]">
                  {inquiry.street}, {inquiry.postalCode} {inquiry.location}
                </p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">{t('created')}</label>
                <p className="font-medium text-[#062E25]">
                  {new Date(inquiry.createdAt).toLocaleDateString('de-CH', {
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
              {t('manage')}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#062E25]/60 mb-1 block">{t('status')}</label>
                <Select
                  value={inquiry.status}
                  onValueChange={v => handleUpdate({ status: v })}
                  disabled={saving}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INQUIRY_STATUSES.map(s => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABELS[s] || s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60 mb-1 block">{t('adminNotes')}</label>
                <Textarea
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  rows={6}
                  className="mb-2"
                />
                <Button
                  size="sm"
                  onClick={() => handleUpdate({ adminNotes })}
                  disabled={saving || adminNotes === (inquiry.adminNotes || '')}
                  className="bg-[#062E25] hover:bg-[#062E25]/90 text-white"
                >
                  {t('saveNotes')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
