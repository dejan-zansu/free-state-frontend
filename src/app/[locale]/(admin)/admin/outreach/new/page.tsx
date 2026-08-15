'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { ChevronLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { adminOutreachService } from '@/services/admin-outreach.service'
import type { OutboundProspectCreateInput } from '@/types/admin-outreach'

const OPTIONAL_FIELDS = [
  'uid', 'website', 'addressStreet', 'addressNumber', 'addressPostalCode',
  'addressCity', 'addressCanton', 'contactEmail', 'contactName',
  'contactRole', 'contactPhone', 'note',
] as const

type FormState = Record<'companyName' | (typeof OPTIONAL_FIELDS)[number], string>

const EMPTY_FORM: FormState = {
  companyName: '', uid: '', website: '', addressStreet: '', addressNumber: '',
  addressPostalCode: '', addressCity: '', addressCanton: '', contactEmail: '',
  contactName: '', contactRole: '', contactPhone: '', note: '',
}

function Field({
  label, value, onChange, type = 'text', className,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  className?: string
}) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 text-base" />
    </div>
  )
}

export default function AdminOutreachNewPage() {
  const locale = useLocale()
  const router = useRouter()
  const t = useTranslations('admin.outreach.new')

  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [error, setError] = useState<'duplicate' | 'failed' | null>(null)
  const [saving, setSaving] = useState(false)

  const set = (key: keyof FormState) => (v: string) => setForm((f) => ({ ...f, [key]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.companyName.trim() || saving) return
    setSaving(true)
    setError(null)
    try {
      const payload: OutboundProspectCreateInput = { companyName: form.companyName.trim() }
      for (const key of OPTIONAL_FIELDS) {
        const value = form[key].trim()
        if (value) payload[key] = value
      }
      const created = await adminOutreachService.createProspect(payload)
      router.push(`/${locale}/admin/outreach/${created.id}`)
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status
      setError(status === 409 ? 'duplicate' : 'failed')
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-4">
        <Button variant="ghost" asChild className="gap-2">
          <Link href={`/${locale}/admin/outreach`}>
            <ChevronLeft className="w-4 h-4" />{t('back')}
          </Link>
        </Button>
      </div>
      <h1 className="text-2xl font-bold text-[#062E25] mb-6">{t('title')}</h1>

      <form onSubmit={submit}>
        <Card><CardContent className="p-6 space-y-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-[#062E25]/75 uppercase tracking-wide">{t('companySection')}</h3>
            <Field label={t('companyName')} value={form.companyName} onChange={set('companyName')} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label={t('uid')} value={form.uid} onChange={set('uid')} />
              <Field label={t('website')} value={form.website} onChange={set('website')} />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-[#062E25]/75 uppercase tracking-wide">{t('addressSection')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-3">
              <Field label={t('street')} value={form.addressStreet} onChange={set('addressStreet')} />
              <Field label={t('number')} value={form.addressNumber} onChange={set('addressNumber')} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr_120px] gap-3">
              <Field label={t('postalCode')} value={form.addressPostalCode} onChange={set('addressPostalCode')} />
              <Field label={t('city')} value={form.addressCity} onChange={set('addressCity')} />
              <Field label={t('canton')} value={form.addressCanton} onChange={set('addressCanton')} />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-[#062E25]/75 uppercase tracking-wide">{t('contactSection')}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label={t('contactName')} value={form.contactName} onChange={set('contactName')} />
              <Field label={t('contactRole')} value={form.contactRole} onChange={set('contactRole')} />
              <Field label={t('contactEmail')} value={form.contactEmail} onChange={set('contactEmail')} type="email" />
              <Field label={t('contactPhone')} value={form.contactPhone} onChange={set('contactPhone')} />
            </div>
          </div>

          <div>
            <Label>{t('note')}</Label>
            <Textarea rows={3} value={form.note} onChange={(e) => set('note')(e.target.value)} className="mt-1 text-base" />
          </div>

          {error && (
            <p className="text-red-600">{error === 'duplicate' ? t('duplicate') : t('failed')}</p>
          )}

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={!form.companyName.trim() || saving}>
              {saving ? t('submitting') : t('submit')}
            </Button>
            <Button type="button" variant="outline" asChild>
              <Link href={`/${locale}/admin/outreach`}>{t('cancel')}</Link>
            </Button>
          </div>
        </CardContent></Card>
      </form>
    </div>
  )
}
