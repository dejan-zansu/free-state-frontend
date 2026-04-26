'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { adminProjectService, type SubsidyStatusValue, type UpdateSubsidyInput } from '@/services/admin-project.service'

const STATUSES: SubsidyStatusValue[] = [
  'NOT_STARTED',
  'DOCUMENTS_PENDING',
  'SUBMITTED_TO_CANTON',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
  'PAID_OUT',
]

interface Props {
  projectId: string
  initial: {
    subsidyStatus: SubsidyStatusValue
    subsidyAppliedAt: string | null
    subsidyApprovedAt: string | null
    subsidyPaidAmount: number | null
    subsidyReferenceNumber: string | null
    subsidyNotes: string | null
    estimatedSubsidyChf: number | null
  }
}

export function SubsidyCard({ projectId, initial }: Props) {
  const t = useTranslations('admin.contracts.subsidyCard')
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onSave() {
    setSaving(true)
    setError(null)
    try {
      const payload: UpdateSubsidyInput = {
        subsidyStatus: form.subsidyStatus,
        subsidyAppliedAt: form.subsidyAppliedAt,
        subsidyApprovedAt: form.subsidyApprovedAt,
        subsidyPaidAmount: form.subsidyPaidAmount,
        subsidyReferenceNumber: form.subsidyReferenceNumber,
        subsidyNotes: form.subsidyNotes,
      }
      await adminProjectService.updateSubsidy(projectId, payload)
      setSavedAt(new Date())
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5">
      <header className="flex items-center justify-between">
        <h3 className="text-base font-medium">{t('title')}</h3>
        {form.estimatedSubsidyChf !== null ? (
          <span className="text-sm text-slate-500">
            {t('estimated')}: CHF {form.estimatedSubsidyChf.toLocaleString('de-CH')}
          </span>
        ) : null}
      </header>

      <label className="flex flex-col gap-1 text-sm">
        <span>{t('status')}</span>
        <select
          value={form.subsidyStatus}
          onChange={(e) => setForm({ ...form, subsidyStatus: e.target.value as SubsidyStatusValue })}
          className="rounded-md border border-slate-300 px-2 py-1.5"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{t(`statusOptions.${s}`)}</option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <DateField
          label={t('appliedAt')}
          value={form.subsidyAppliedAt}
          onChange={(v) => setForm({ ...form, subsidyAppliedAt: v })}
        />
        <DateField
          label={t('approvedAt')}
          value={form.subsidyApprovedAt}
          onChange={(v) => setForm({ ...form, subsidyApprovedAt: v })}
        />
        <NumberField
          label={t('paidAmount')}
          value={form.subsidyPaidAmount}
          onChange={(v) => setForm({ ...form, subsidyPaidAmount: v })}
        />
        <TextField
          label={t('referenceNumber')}
          value={form.subsidyReferenceNumber}
          onChange={(v) => setForm({ ...form, subsidyReferenceNumber: v })}
        />
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span>{t('notes')}</span>
        <textarea
          rows={4}
          value={form.subsidyNotes ?? ''}
          onChange={(e) => setForm({ ...form, subsidyNotes: e.target.value || null })}
          className="rounded-md border border-slate-300 px-2 py-1.5"
        />
      </label>

      <footer className="flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {savedAt ? t('savedAt', { time: savedAt.toLocaleTimeString() }) : ' '}
        </span>
        <button
          onClick={onSave}
          disabled={saving}
          className="rounded-md bg-slate-900 px-4 py-1.5 text-sm text-white disabled:opacity-50"
        >
          {saving ? t('saving') : t('save')}
        </button>
      </footer>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </section>
  )
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string | null
  onChange: (v: string | null) => void
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span>{label}</span>
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="rounded-md border border-slate-300 px-2 py-1.5"
      />
    </label>
  )
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number | null
  onChange: (v: number | null) => void
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span>{label}</span>
      <input
        type="number"
        step="0.01"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        className="rounded-md border border-slate-300 px-2 py-1.5"
      />
    </label>
  )
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string | null
  onChange: (v: string | null) => void
}) {
  const dateValue = value ? value.slice(0, 10) : ''
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span>{label}</span>
      <input
        type="date"
        value={dateValue}
        onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : null)}
        className="rounded-md border border-slate-300 px-2 py-1.5"
      />
    </label>
  )
}
