'use client'

import { useMutation } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  formatLeadDate,
  leadDecisionToastKey,
  leadErrorKey,
  leadNamedOwnerText,
  zurichDatePlusDays,
} from '@/lib/outbound-lead-work'
import { telHref } from '@/lib/sales-lead'
import { cn } from '@/lib/utils'
import { adminOutreachService } from '@/services/admin-outreach.service'
import type {
  OutboundManualActivityInput,
  OutboundProspectDetail,
} from '@/types/admin-outreach'
import type {
  LeadDecisionResult,
  LeadNamedOwnerResult,
} from '@/types/outreach/kpi'
import { CALL_OUTCOMES, type CallOutcome } from '@/types/outreach/owner-first'

import {
  OUTLINE_BUTTON,
  PRIMARY_BUTTON,
} from '../../../residential-leads/[id]/leadUtils'
import {
  LEAD_INPUT_CLASS,
  LEAD_NO_ANSWER_OUTCOMES,
  useLeadCache,
} from './lead-shared'

const DIALOG_CLASS = 'sales-type-scale max-h-[90vh] overflow-y-auto sm:max-w-lg'
const REACHED = 'REACHED'
const CALL_OPTIONS = [...CALL_OUTCOMES, REACHED] as const

type CallOption = (typeof CALL_OPTIONS)[number]
type OwnerRole = 'OWNER' | 'MANAGER' | 'UNKNOWN'

type DialogProps = {
  prospect: OutboundProspectDetail
  onClose: () => void
}

function useErrorToast() {
  const t = useTranslations('admin.outreach.work')
  return (error: unknown) => toast.error(t(leadErrorKey(error)))
}

function DialogShell({
  title,
  description,
  onClose,
  children,
}: {
  title: string
  description?: React.ReactNode
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <Dialog
      open
      onOpenChange={open => {
        if (!open) onClose()
      }}
    >
      <DialogContent className={DIALOG_CLASS}>
        <DialogHeader>
          <DialogTitle className="text-lg">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-base">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}

function Actions({
  cancel,
  save,
  pending,
  disabled,
  danger,
  onCancel,
  onSave,
}: {
  cancel: string
  save: string
  pending: boolean
  disabled?: boolean
  danger?: boolean
  onCancel: () => void
  onSave: () => void
}) {
  return (
    <DialogFooter>
      <Button
        variant="outline"
        size="lg"
        onClick={onCancel}
        disabled={pending}
        className={OUTLINE_BUTTON}
      >
        {cancel}
      </Button>
      <Button
        size="lg"
        onClick={onSave}
        disabled={pending || disabled}
        className={
          danger
            ? 'bg-red-700 text-base text-white hover:bg-red-700/90'
            : PRIMARY_BUTTON
        }
      >
        {pending && <Loader2 className="animate-spin" />}
        {save}
      </Button>
    </DialogFooter>
  )
}

function OwnerRoleSelect({
  value,
  onChange,
}: {
  value: OwnerRole
  onChange: (value: OwnerRole) => void
}) {
  const t = useTranslations('admin.outreach.work')
  return (
    <div>
      <Label className="text-base">{t('ownerDialog.role')}</Label>
      <Select value={value} onValueChange={v => onChange(v as OwnerRole)}>
        <SelectTrigger className="mt-1 w-full text-base text-[#062E25]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="sales-type-scale">
          <SelectItem value="OWNER" className="text-base">
            {t('ownerDialog.roleOwner')}
          </SelectItem>
          <SelectItem value="MANAGER" className="text-base">
            {t('ownerDialog.roleManager')}
          </SelectItem>
          <SelectItem value="UNKNOWN" className="text-base">
            {t('ownerDialog.roleUnknown')}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

function dateTimeToIso(value: string): string | undefined {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

export function LeadCallDialog({ prospect, onClose }: DialogProps) {
  const t = useTranslations('admin.outreach.work')
  const showError = useErrorToast()
  const { refresh } = useLeadCache(prospect.id)

  const [outcome, setOutcome] = useState<CallOption | ''>('')
  const [note, setNote] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [ownerRole, setOwnerRole] = useState<OwnerRole>('UNKNOWN')
  const [ownerEmail, setOwnerEmail] = useState('')
  const [tenantConsent, setTenantConsent] = useState(false)
  const [meetingAt, setMeetingAt] = useState('')
  const [notNowUntil, setNotNowUntil] = useState('')

  const mutation = useMutation({
    mutationFn: () => {
      const input: OutboundManualActivityInput = {
        type: 'CALL_LOGGED',
        note: note.trim() || undefined,
      }
      if (outcome && outcome !== REACHED) {
        const chosen: CallOutcome = outcome
        input.callOutcome = chosen
        if (chosen === 'TENANT_NAMED_OWNER') {
          input.ownerName = ownerName.trim() || undefined
          input.ownerRole = ownerRole
          input.ownerEmail = ownerEmail.trim() || undefined
          input.tenantConsent = tenantConsent
        }
        if (chosen === 'OWNER_INTERESTED_VISIT') {
          input.meetingAt = dateTimeToIso(meetingAt)
        }
        if (chosen === 'OWNER_NOT_NOW') {
          input.notNowUntil = dateTimeToIso(notNowUntil)
        }
      }
      return adminOutreachService.logActivity(prospect.id, input)
    },
    onSuccess: () => {
      toast.success(
        LEAD_NO_ANSWER_OUTCOMES.includes(outcome)
          ? t('toast.callNoAnswer')
          : t('toast.callLogged')
      )
      refresh()
      onClose()
    },
    onError: showError,
  })

  const needsOwnerName = outcome === 'TENANT_NAMED_OWNER' && !ownerName.trim()
  const phone = prospect.contactPhone

  return (
    <DialogShell
      title={t('callDialog.title')}
      description={
        phone
          ? t.rich('callDialog.number', {
              phone,
              tel: chunks => (
                <a
                  href={telHref(phone)}
                  className="font-semibold text-[#062E25] underline underline-offset-2"
                >
                  {chunks}
                </a>
              ),
            })
          : t('callDialog.noNumber')
      }
      onClose={onClose}
    >
      <div className="space-y-3">
        <div>
          <Label htmlFor="lead-call-outcome" className="text-base">
            {t('callDialog.outcome')}
          </Label>
          <Select
            value={outcome}
            onValueChange={value => setOutcome(value as CallOption)}
          >
            <SelectTrigger
              id="lead-call-outcome"
              className="mt-1 w-full text-base text-[#062E25]"
            >
              <SelectValue placeholder={t('callDialog.outcomePlaceholder')} />
            </SelectTrigger>
            <SelectContent className="sales-type-scale">
              {CALL_OPTIONS.map(option => (
                <SelectItem key={option} value={option} className="text-base">
                  {t(`callOutcome.${option}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {outcome === 'TENANT_NAMED_OWNER' && (
          <>
            <div>
              <Label htmlFor="lead-call-owner" className="text-base">
                {t('callDialog.ownerName')}
              </Label>
              <Input
                id="lead-call-owner"
                value={ownerName}
                onChange={event => setOwnerName(event.target.value)}
                className={LEAD_INPUT_CLASS}
              />
            </div>
            <OwnerRoleSelect value={ownerRole} onChange={setOwnerRole} />
            <div>
              <Label htmlFor="lead-call-owner-email" className="text-base">
                {t('ownerDialog.email')}
              </Label>
              <Input
                id="lead-call-owner-email"
                type="email"
                value={ownerEmail}
                onChange={event => setOwnerEmail(event.target.value)}
                className={LEAD_INPUT_CLASS}
              />
            </div>
            <label className="flex items-center gap-2 text-base text-[#062E25]">
              <Checkbox
                checked={tenantConsent}
                onCheckedChange={value => setTenantConsent(value === true)}
              />
              {t('ownerDialog.consent')}
            </label>
          </>
        )}
        {outcome === 'OWNER_INTERESTED_VISIT' && (
          <div>
            <Label htmlFor="lead-call-meeting" className="text-base">
              {t('callDialog.meetingAt')}
            </Label>
            <Input
              id="lead-call-meeting"
              type="datetime-local"
              value={meetingAt}
              onChange={event => setMeetingAt(event.target.value)}
              className={LEAD_INPUT_CLASS}
            />
            {!meetingAt && (
              <p className="mt-1 text-[#062E25]/75">
                {t('callDialog.visitNeedsDate')}
              </p>
            )}
          </div>
        )}
        {outcome === 'OWNER_NOT_NOW' && (
          <div>
            <Label htmlFor="lead-call-until" className="text-base">
              {t('callDialog.notNowUntil')}
            </Label>
            <Input
              id="lead-call-until"
              type="date"
              min={zurichDatePlusDays(1)}
              value={notNowUntil}
              onChange={event => setNotNowUntil(event.target.value)}
              className={LEAD_INPUT_CLASS}
            />
          </div>
        )}
        {outcome === 'NOT_INTERESTED' && (
          <p className="text-[#062E25]/75">
            {t('callDialog.notInterestedHint')}
          </p>
        )}
        {outcome === 'WRONG_NUMBER' && (
          <p className="text-[#062E25]/75">{t('callDialog.wrongNumberHint')}</p>
        )}
        {outcome === 'TENANT_NO_NAME' && (
          <p className="text-[#062E25]/75">
            {t('callDialog.tenantNoNameHint')}
          </p>
        )}

        <div>
          <Label htmlFor="lead-call-note" className="text-base">
            {t('callDialog.note')}
          </Label>
          <Textarea
            id="lead-call-note"
            rows={3}
            maxLength={2000}
            value={note}
            onChange={event => setNote(event.target.value)}
            className={LEAD_INPUT_CLASS}
          />
        </div>
      </div>
      <Actions
        cancel={t('callDialog.cancel')}
        save={t('callDialog.save')}
        pending={mutation.isPending}
        disabled={!outcome || needsOwnerName}
        onCancel={onClose}
        onSave={() => mutation.mutate()}
      />
    </DialogShell>
  )
}

function ownerResultTone(outcome: LeadNamedOwnerResult['outcome']): string {
  if (outcome === 'blocked') return 'bg-amber-50 text-amber-800'
  if (outcome === 'lookup_queued') return 'bg-blue-50 text-blue-800'
  return 'bg-green-50 text-green-700'
}

export function LeadOwnerDialog({ prospect, onClose }: DialogProps) {
  const t = useTranslations('admin.outreach.work')
  const locale = useLocale()
  const showError = useErrorToast()
  const { applySnapshot } = useLeadCache(prospect.id)

  const [name, setName] = useState(prospect.owner?.name ?? '')
  const [role, setRole] = useState<OwnerRole>('OWNER')
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [result, setResult] = useState<LeadNamedOwnerResult | null>(null)

  const mutation = useMutation({
    mutationFn: () =>
      adminOutreachService.recordNamedOwner(prospect.id, {
        name: name.trim(),
        role,
        tenantConsent: consent,
        ...(email.trim() ? { email: email.trim() } : {}),
      }),
    onSuccess: data => {
      setResult(data)
      applySnapshot(data)
    },
    onError: showError,
  })

  if (result) {
    const text = leadNamedOwnerText(result.outcome, result.reason, name.trim())
    return (
      <DialogShell title={t('ownerDialog.title')} onClose={onClose}>
        <div className="space-y-3">
          <p
            className={cn(
              'rounded p-3 text-base font-medium',
              ownerResultTone(result.outcome)
            )}
          >
            {t(text.key, text.values)}
          </p>
          {result.outcome === 'blocked' && result.lead && (
            <p className="text-[#062E25]/75">{t('namedOwner.stillOpen')}</p>
          )}
          {result.ownerProspectId && (
            <Link
              href={`/${locale}/admin/outreach/${result.ownerProspectId}`}
              className="block text-base underline underline-offset-2"
            >
              {t('owner.openOwner')}
            </Link>
          )}
        </div>
        <DialogFooter>
          <Button size="lg" onClick={onClose} className={PRIMARY_BUTTON}>
            {t('ownerDialog.close')}
          </Button>
        </DialogFooter>
      </DialogShell>
    )
  }

  return (
    <DialogShell title={t('ownerDialog.title')} onClose={onClose}>
      <div className="space-y-3">
        <div>
          <Label htmlFor="lead-owner-name" className="text-base">
            {t('ownerDialog.name')}
          </Label>
          <Input
            id="lead-owner-name"
            value={name}
            maxLength={200}
            onChange={event => setName(event.target.value)}
            className={LEAD_INPUT_CLASS}
          />
        </div>
        <OwnerRoleSelect value={role} onChange={setRole} />
        <div>
          <Label htmlFor="lead-owner-email" className="text-base">
            {t('ownerDialog.email')}
          </Label>
          <Input
            id="lead-owner-email"
            type="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            className={LEAD_INPUT_CLASS}
          />
        </div>
        <label className="flex items-center gap-2 text-base text-[#062E25]">
          <Checkbox
            checked={consent}
            onCheckedChange={value => setConsent(value === true)}
          />
          {t('ownerDialog.consent')}
        </label>
        <p className="text-[#062E25]/75">{t('ownerDialog.explain')}</p>
      </div>
      <Actions
        cancel={t('ownerDialog.cancel')}
        save={t('ownerDialog.save')}
        pending={mutation.isPending}
        disabled={!name.trim()}
        onCancel={onClose}
        onSave={() => mutation.mutate()}
      />
    </DialogShell>
  )
}

function decisionToast(
  t: ReturnType<typeof useTranslations>,
  result: LeadDecisionResult
): string {
  if (result.outcome === 'NOT_NOW') {
    return t(leadDecisionToastKey(result.outcome), {
      date: formatLeadDate(result.snoozedUntil),
    })
  }
  if (result.outcome === 'NOT_INTERESTED' && !result.suppressed) {
    return t('toast.declinedNoAddress')
  }
  return t(leadDecisionToastKey(result.outcome))
}

export function LeadLaterDialog({ prospect, onClose }: DialogProps) {
  const t = useTranslations('admin.outreach.work')
  const showError = useErrorToast()
  const { applySnapshot } = useLeadCache(prospect.id)
  const earliest = zurichDatePlusDays(1)
  const [until, setUntil] = useState(zurichDatePlusDays(30))
  const [note, setNote] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      adminOutreachService.recordDecision(prospect.id, {
        outcome: 'NOT_NOW',
        until,
        ...(note.trim() ? { note: note.trim() } : {}),
      }),
    onSuccess: result => {
      toast.success(decisionToast(t, result))
      applySnapshot(result)
      onClose()
    },
    onError: showError,
  })

  return (
    <DialogShell title={t('laterDialog.title')} onClose={onClose}>
      <div className="space-y-3">
        <div>
          <Label htmlFor="lead-later-until" className="text-base">
            {t('laterDialog.until')}
          </Label>
          <Input
            id="lead-later-until"
            type="date"
            min={earliest}
            value={until}
            onChange={event => setUntil(event.target.value)}
            className={LEAD_INPUT_CLASS}
          />
        </div>
        <div>
          <Label htmlFor="lead-later-note" className="text-base">
            {t('laterDialog.note')}
          </Label>
          <Textarea
            id="lead-later-note"
            rows={3}
            value={note}
            onChange={event => setNote(event.target.value)}
            className={LEAD_INPUT_CLASS}
          />
        </div>
      </div>
      <Actions
        cancel={t('laterDialog.cancel')}
        save={t('laterDialog.save')}
        pending={mutation.isPending}
        disabled={!until || until < earliest}
        onCancel={onClose}
        onSave={() => mutation.mutate()}
      />
    </DialogShell>
  )
}

export function LeadDecisionDialog({
  prospect,
  outcome,
  onClose,
}: DialogProps & { outcome: 'NOT_INTERESTED' | 'HINT_DONE' }) {
  const t = useTranslations('admin.outreach.work')
  const showError = useErrorToast()
  const { applySnapshot } = useLeadCache(prospect.id)
  const [note, setNote] = useState('')
  const decline = outcome === 'NOT_INTERESTED'

  const mutation = useMutation({
    mutationFn: () =>
      adminOutreachService.recordDecision(prospect.id, {
        outcome,
        ...(note.trim() ? { note: note.trim() } : {}),
      }),
    onSuccess: result => {
      toast.success(decisionToast(t, result))
      applySnapshot(result)
      onClose()
    },
    onError: showError,
  })

  return (
    <DialogShell
      title={
        decline
          ? t('decisionDialog.declineTitle')
          : t('decisionDialog.hintDoneTitle')
      }
      description={
        decline
          ? t('decisionDialog.declineText')
          : t('decisionDialog.hintDoneText')
      }
      onClose={onClose}
    >
      <div>
        <Label htmlFor="lead-decision-note" className="text-base">
          {t('decisionDialog.note')}
        </Label>
        <Textarea
          id="lead-decision-note"
          rows={3}
          value={note}
          onChange={event => setNote(event.target.value)}
          className={LEAD_INPUT_CLASS}
        />
      </div>
      <Actions
        cancel={t('decisionDialog.cancel')}
        save={
          decline
            ? t('decisionDialog.confirmDecline')
            : t('decisionDialog.confirmHintDone')
        }
        pending={mutation.isPending}
        danger={decline}
        onCancel={onClose}
        onSave={() => mutation.mutate()}
      />
    </DialogShell>
  )
}
