'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { adminCommercialLeadService } from '@/services/admin-commercial-lead.service'
import { statusLabel } from '@/lib/commercial-lead-labels'
import type { CommercialLeadDetail, CommercialLeadStatus } from '@/types/commercial-lead'

const ALL_STATUSES: CommercialLeadStatus[] = [
  'NEW','CONTACTED','QUALIFIED','QUOTE_PREPARING','QUOTE_SENT','NEGOTIATION','WON','LOST','ON_HOLD',
]

export default function ControlsColumn({
  lead, onUpdated,
}: { lead: CommercialLeadDetail; onUpdated: () => void }) {
  const t = useTranslations('admin.commercialLeads.detail')
  const [status, setStatus] = useState<CommercialLeadStatus>(lead.status)
  const [nextFollowUp, setNextFollowUp] = useState(lead.nextFollowUpAt?.slice(0, 16) ?? '')
  const [wonAmount, setWonAmount] = useState<string>(lead.wonAmountChf ?? '')
  const [lostReason, setLostReason] = useState(lead.lostReason ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const save = async () => {
    setSaving(true); setError(null)
    try {
      await adminCommercialLeadService.update(lead.id, {
        status: status !== lead.status ? status : undefined,
        nextFollowUpAt: nextFollowUp ? new Date(nextFollowUp).toISOString() : null,
        wonAmountChf: status === 'WON' ? Number(wonAmount) || null : undefined,
        lostReason: status === 'LOST' ? lostReason || null : undefined,
      })
      onUpdated()
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err?.message)
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-4">
      <Card><CardContent className="p-4 space-y-4">
        <h3 className="text-sm font-semibold text-[#062E25]/60 uppercase tracking-wide">{t('controls')}</h3>

        <div>
          <Label>{t('status')}</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as CommercialLeadStatus)}>
            <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {ALL_STATUSES.map((s) => <SelectItem key={s} value={s}>{statusLabel[s]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>{t('nextFollowUp')}</Label>
          <Input type="datetime-local" value={nextFollowUp}
                 onChange={(e) => setNextFollowUp(e.target.value)} className="mt-1" />
        </div>

        {status === 'WON' && (
          <div>
            <Label>{t('wonAmount')}</Label>
            <Input type="number" value={wonAmount}
                   onChange={(e) => setWonAmount(e.target.value)} className="mt-1" />
          </div>
        )}

        {status === 'LOST' && (
          <div>
            <Label>{t('lostReason')}</Label>
            <Textarea rows={3} value={lostReason}
                      onChange={(e) => setLostReason(e.target.value)} className="mt-1" />
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button className="w-full" onClick={save} disabled={saving}>
          {saving ? t('saving') : t('save')}
        </Button>
      </CardContent></Card>

      <QuickActions lead={lead} onUpdated={onUpdated} />
    </div>
  )
}

function QuickActions({ lead, onUpdated }: { lead: CommercialLeadDetail; onUpdated: () => void }) {
  const t = useTranslations('admin.commercialLeads.detail')
  const logCall = async () => {
    await adminCommercialLeadService.logActivity(lead.id, 'CALL_LOGGED', { at: new Date().toISOString() })
    onUpdated()
  }
  const logMeeting = async () => {
    await adminCommercialLeadService.logActivity(lead.id, 'MEETING_SCHEDULED', { at: new Date().toISOString() })
    onUpdated()
  }
  return (
    <Card><CardContent className="p-4 space-y-2">
      <h3 className="text-sm font-semibold text-[#062E25]/60 uppercase tracking-wide">{t('quickActions')}</h3>
      <Button variant="outline" className="w-full" onClick={logCall}>{t('logCall')}</Button>
      <Button variant="outline" className="w-full" onClick={logMeeting}>{t('logMeeting')}</Button>
      <a href={`mailto:${lead.contactEmail}?subject=${encodeURIComponent(`[${lead.reference}] ${lead.companyName}`)}`}>
        <Button variant="outline" className="w-full">{t('sendEmail')}</Button>
      </a>
    </CardContent></Card>
  )
}
