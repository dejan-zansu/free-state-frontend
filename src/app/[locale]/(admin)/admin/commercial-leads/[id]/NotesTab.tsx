'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { adminCommercialLeadService } from '@/services/admin-commercial-lead.service'
import type { CommercialLeadNote } from '@/types/commercial-lead'

export default function NotesTab({
  leadId, notes, onChange,
}: { leadId: string; notes: CommercialLeadNote[]; onChange: () => void }) {
  const t = useTranslations('admin.commercialLeads.detail')
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!body.trim()) return
    setSaving(true)
    try {
      await adminCommercialLeadService.addNote(leadId, body.trim())
      setBody('')
      onChange()
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-4">
      <Card><CardContent className="p-4">
        <Textarea rows={3} value={body} onChange={(e) => setBody(e.target.value)}
                  placeholder={t('noteInputPlaceholder')} />
        <div className="mt-3 flex justify-end">
          <Button onClick={submit} disabled={saving || !body.trim()}>
            {saving ? t('saving') : t('addNote')}
          </Button>
        </div>
      </CardContent></Card>
      <Card><CardContent className="p-0">
        {notes.length === 0
          ? <div className="p-6 text-[#062E25]/50">{t('noNotes')}</div>
          : <ul>
              {notes.map((n) => (
                <li key={n.id} className="px-4 py-3 border-b border-[#062E25]/5 last:border-0">
                  <div className="flex justify-between">
                    <p className="font-medium text-sm">{n.author.firstName} {n.author.lastName}</p>
                    <span className="text-sm text-[#062E25]/50">{new Date(n.createdAt).toLocaleString('de-CH')}</span>
                  </div>
                  <p className="text-sm text-[#062E25]/80 mt-1 whitespace-pre-wrap">{n.body}</p>
                </li>
              ))}
            </ul>}
      </CardContent></Card>
    </div>
  )
}
