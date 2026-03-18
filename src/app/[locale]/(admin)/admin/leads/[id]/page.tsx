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
import { Textarea } from '@/components/ui/textarea'
import { adminService } from '@/services/admin.service'
import type { AdminLead, SalesRep } from '@/types/admin'

const LEAD_STATUSES = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL_SENT',
  'NEGOTIATION',
  'WON',
  'LOST',
  'ON_HOLD',
]

export default function AdminLeadDetailPage() {
  const params = useParams()
  const locale = useLocale()
  const t = useTranslations('admin.leads')
  const tc = useTranslations('admin.common')
  const queryClient = useQueryClient()
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState('')
  const [notesInitialized, setNotesInitialized] = useState(false)

  const { data: lead, isLoading } = useQuery<AdminLead>({
    queryKey: ['admin', 'lead', params.id],
    queryFn: async () => {
      const data = await adminService.getLeadById(params.id as string)
      if (!notesInitialized) {
        setNotes(data.notes || '')
        setNotesInitialized(true)
      }
      return data
    },
  })

  const { data: salesReps = [] } = useQuery<SalesRep[]>({
    queryKey: ['admin', 'sales-reps'],
    queryFn: () => adminService.listSalesReps(),
  })

  const handleUpdate = async (data: Record<string, string | null>) => {
    if (!lead) return
    setSaving(true)
    try {
      await adminService.updateLead(lead.id, data)
      queryClient.invalidateQueries({ queryKey: ['admin', 'lead', params.id] })
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return <AdminPageLoader className="h-64" />
  }

  if (!lead) {
    return <p className="text-[#062E25]/60">{tc('notFound')}</p>
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-[#062E25]">
          {lead.customer.user.firstName} {lead.customer.user.lastName}
        </h1>
        <StatusBadge status={lead.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-[#062E25]/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">
              {t('leadInfo')}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#062E25]/60">{t('propertyAddress')}</label>
                <p className="font-medium text-[#062E25]">{lead.propertyAddress}</p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">{t('source')}</label>
                <p className="font-medium text-[#062E25]">{lead.source}</p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">{t('interestedPackage')}</label>
                <p className="font-medium text-[#062E25]">{lead.interestedPackage || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">{t('estimatedBudget')}</label>
                <p className="font-medium text-[#062E25]">
                  {lead.estimatedBudget
                    ? `CHF ${lead.estimatedBudget.toLocaleString('de-CH')}`
                    : '-'}
                </p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">{t('created')}</label>
                <p className="font-medium text-[#062E25]">
                  {new Date(lead.createdAt).toLocaleDateString('de-CH')}
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
                  value={lead.status}
                  onValueChange={v => handleUpdate({ status: v })}
                  disabled={saving}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEAD_STATUSES.map(s => (
                      <SelectItem key={s} value={s}>
                        {s.replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60 mb-1 block">{t('assignedTo')}</label>
                <Select
                  value={lead.assignedTo?.id || '__none__'}
                  onValueChange={v =>
                    handleUpdate({ assignedToId: v === '__none__' ? null : v })
                  }
                  disabled={saving}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('unassigned')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">{t('unassigned')}</SelectItem>
                    {salesReps.map(rep => (
                      <SelectItem key={rep.id} value={rep.id}>
                        {rep.firstName} {rep.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60 mb-1 block">{t('notes')}</label>
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={4}
                  className="mb-2"
                />
                <Button
                  size="sm"
                  onClick={() => handleUpdate({ notes })}
                  disabled={saving || notes === (lead.notes || '')}
                  className="bg-[#062E25] hover:bg-[#062E25]/90 text-white"
                >
                  {t('saveNotes')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#062E25]/10 lg:col-span-2">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">
              {t('contact')}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm text-[#062E25]/60">{t('name')}</label>
                <p className="font-medium text-[#062E25]">
                  {lead.customer.user.firstName} {lead.customer.user.lastName}
                </p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">{t('email')}</label>
                <p className="font-medium text-[#062E25]">
                  {lead.customer.user.email}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
