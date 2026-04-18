'use client'

import { useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { adminCommercialLeadService } from '@/services/admin-commercial-lead.service'
import { attachmentTypeLabel } from '@/lib/commercial-lead-labels'
import type { CommercialLeadDetail, CommercialAttachmentType } from '@/types/commercial-lead'

const TYPES: CommercialAttachmentType[] = [
  'ELECTRICITY_BILL','PROPERTY_REGISTER','BUILDING_PLANS','SUPPLIER_CONTRACT','OTHER',
]

export default function AttachmentsTab({
  lead, onChange,
}: { lead: CommercialLeadDetail; onChange: () => void }) {
  const t = useTranslations('admin.commercialLeads.detail')
  const [type, setType] = useState<CommercialAttachmentType>('ELECTRICITY_BILL')
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const upload = async (f: File) => {
    setBusy(true)
    try { await adminCommercialLeadService.uploadAttachment(lead.id, type, f); onChange() }
    finally { setBusy(false); if (fileRef.current) fileRef.current.value = '' }
  }

  const remove = async (id: string) => {
    if (!confirm(t('confirmDelete'))) return
    await adminCommercialLeadService.deleteAttachment(lead.id, id)
    onChange()
  }

  return (
    <div className="space-y-4">
      <Card><CardContent className="p-4 flex items-center gap-3">
        <Select value={type} onValueChange={(v) => setType(v as CommercialAttachmentType)}>
          <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
          <SelectContent>
            {TYPES.map((v) => <SelectItem key={v} value={v}>{attachmentTypeLabel[v]}</SelectItem>)}
          </SelectContent>
        </Select>
        <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png"
               className="hidden"
               onChange={(e) => {
                 const f = e.target.files?.[0]
                 if (f) upload(f)
               }} />
        <Button onClick={() => fileRef.current?.click()} disabled={busy}>{t('upload')}</Button>
      </CardContent></Card>

      <Card><CardContent className="p-0">
        {lead.attachments.length === 0
          ? <div className="p-6 text-[#062E25]/50">{t('noAttachments')}</div>
          : <ul>
              {lead.attachments.map((a) => (
                <li key={a.id} className="flex items-center justify-between px-4 py-3 border-b border-[#062E25]/5 last:border-0">
                  <div>
                    <p className="font-medium">{attachmentTypeLabel[a.type]}</p>
                    <p className="text-sm text-[#062E25]/60">
                      <a href={a.storagePath} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                        {a.fileName}
                      </a>
                      <span className="ml-2">{(a.sizeBytes / 1024).toFixed(0)} KB</span>
                      <span className="ml-2">
                        {a.uploadedViaToken
                          ? t('uploadedByCustomer')
                          : a.uploadedBy
                            ? `${a.uploadedBy.firstName} ${a.uploadedBy.lastName}`
                            : t('uploadedByAdmin')}
                      </span>
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => remove(a.id)}>{t('delete')}</Button>
                </li>
              ))}
            </ul>}
      </CardContent></Card>
    </div>
  )
}
