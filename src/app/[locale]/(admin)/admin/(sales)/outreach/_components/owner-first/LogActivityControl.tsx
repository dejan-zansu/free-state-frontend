'use client'

// Manual logging on the prospect detail page (doc 69 W1-8 and W1-9b, build
// contract 4.12). Calls carry an Appendix A.9 outcome that the backend's
// recordCallOutcome acts on. Meetings name their evidence (an inbound mail or
// a logged call of this prospect), offers and held meetings are logged for the
// KPI line, and a QRL is recorded per building through POST
// /prospects/:id/leads. CallOutcomeDialog is shared with the call tab of the
// queue page.

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import type { AxiosError } from 'axios'
import { ChevronDown } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
import { adminOutreachService } from '@/services/admin-outreach.service'
import { outreachKpiService } from '@/services/outreach/kpi.service'
import type {
  OutboundManualActivityInput,
  OutboundProspectDetail,
} from '@/types/admin-outreach'
import type {
  CallOutcomeResult,
  OutboundActivityWithCallOutcome,
  RecordLeadResponse,
} from '@/types/outreach/kpi'
import {
  CALL_OUTCOMES,
  OUTBOUND_CHANNELS,
  QRL_CRITERIA,
  type CallOutcome,
  type OutboundChannel,
  type QrlCriterion,
} from '@/types/outreach/owner-first'

const NO_OUTCOME = '__none__'
const NO_EVIDENCE = '__none__'

type ApiError = AxiosError<{ error?: { code?: string } }>

function errorCode(error: unknown): string | null {
  return (error as ApiError | null)?.response?.data?.error?.code ?? null
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// datetime-local and date inputs give local wall time, sent as ISO.
function toIso(value: string): string | undefined {
  if (!value) return undefined
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString()
}

// ---------------------------------------------------------------------------
// Call with an A.9 outcome
// ---------------------------------------------------------------------------

export function CallOutcomeDialog({
  prospectId,
  companyName,
  open,
  onOpenChange,
}: {
  prospectId: string
  companyName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const t = useTranslations('admin.outreach.callOutcome')
  const td = useTranslations('admin.outreach.detail')
  const tc = useTranslations('admin.common')
  const queryClient = useQueryClient()

  const [outcome, setOutcome] = useState<CallOutcome | typeof NO_OUTCOME>(
    NO_OUTCOME
  )
  const [note, setNote] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [ownerRole, setOwnerRole] = useState<'OWNER' | 'MANAGER' | 'UNKNOWN'>(
    'UNKNOWN'
  )
  const [ownerEmail, setOwnerEmail] = useState('')
  const [tenantConsent, setTenantConsent] = useState(false)
  const [meetingAt, setMeetingAt] = useState('')
  const [notNowUntil, setNotNowUntil] = useState('')
  const [result, setResult] = useState<CallOutcomeResult | null>(null)

  const reset = () => {
    setOutcome(NO_OUTCOME)
    setNote('')
    setOwnerName('')
    setOwnerRole('UNKNOWN')
    setOwnerEmail('')
    setTenantConsent(false)
    setMeetingAt('')
    setNotNowUntil('')
    setResult(null)
  }

  const mutation = useMutation({
    mutationFn: () => {
      const input: OutboundManualActivityInput = {
        type: 'CALL_LOGGED',
        note: note.trim() || undefined,
      }
      if (outcome !== NO_OUTCOME) {
        input.callOutcome = outcome
        if (outcome === 'TENANT_NAMED_OWNER') {
          input.ownerName = ownerName.trim() || undefined
          input.ownerRole = ownerRole
          input.ownerEmail = ownerEmail.trim() || undefined
          input.tenantConsent = tenantConsent
        }
        if (outcome === 'OWNER_INTERESTED_VISIT')
          input.meetingAt = toIso(meetingAt)
        if (outcome === 'OWNER_NOT_NOW') input.notNowUntil = toIso(notNowUntil)
      }
      return adminOutreachService.logActivity(
        prospectId,
        input
      ) as Promise<OutboundActivityWithCallOutcome>
    },
    onSuccess: activity => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'outreach'] })
      if (activity.callOutcome) setResult(activity.callOutcome)
      else onOpenChange(false)
    },
  })

  const needsOwnerName = outcome === 'TENANT_NAMED_OWNER' && !ownerName.trim()

  return (
    <Dialog
      open={open}
      onOpenChange={o => {
        if (!o) reset()
        onOpenChange(o)
      }}
    >
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{td('logCallTitle')}</DialogTitle>
          <DialogDescription>
            {t('description', { company: companyName })}
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-2">
            <p className="p-3 rounded bg-green-50 text-green-700 font-medium">
              {t('resultSaved')}
            </p>
            {result.leadId && <p>{t('resultLead')}</p>}
            {result.ownerProspectId && <p>{t('resultOwnerProspect')}</p>}
            {result.lookupId && <p>{t('resultLookup')}</p>}
            <DialogFooter>
              <Button
                onClick={() => {
                  reset()
                  onOpenChange(false)
                }}
              >
                {t('close')}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label>{t('title')}</Label>
              <Select
                value={outcome}
                onValueChange={v =>
                  setOutcome(v as CallOutcome | typeof NO_OUTCOME)
                }
              >
                <SelectTrigger className="mt-1 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_OUTCOME}>{t('noOutcome')}</SelectItem>
                  {CALL_OUTCOMES.map(value => (
                    <SelectItem key={value} value={value}>
                      {t(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {outcome === 'TENANT_NAMED_OWNER' && (
              <>
                <div>
                  <Label>{t('ownerName')}</Label>
                  <Input
                    value={ownerName}
                    onChange={e => setOwnerName(e.target.value)}
                    className="mt-1 text-base"
                  />
                </div>
                <div>
                  <Label>{t('ownerRole')}</Label>
                  <Select
                    value={ownerRole}
                    onValueChange={v =>
                      setOwnerRole(v as 'OWNER' | 'MANAGER' | 'UNKNOWN')
                    }
                  >
                    <SelectTrigger className="mt-1 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OWNER">{t('roleOwner')}</SelectItem>
                      <SelectItem value="MANAGER">
                        {t('roleManager')}
                      </SelectItem>
                      <SelectItem value="UNKNOWN">
                        {t('roleUnknown')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('ownerEmail')}</Label>
                  <Input
                    type="email"
                    value={ownerEmail}
                    onChange={e => setOwnerEmail(e.target.value)}
                    className="mt-1 text-base"
                  />
                </div>
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={tenantConsent}
                    onCheckedChange={v => setTenantConsent(v === true)}
                  />
                  {t('tenantConsent')}
                </label>
              </>
            )}
            {outcome === 'OWNER_INTERESTED_VISIT' && (
              <div>
                <Label>{t('meetingAt')}</Label>
                <Input
                  type="datetime-local"
                  value={meetingAt}
                  onChange={e => setMeetingAt(e.target.value)}
                  className="mt-1 text-base"
                />
                {!meetingAt && (
                  <p className="mt-1 text-[#062E25]/75">
                    {t('visitNeedsDate')}
                  </p>
                )}
              </div>
            )}
            {outcome === 'OWNER_NOT_NOW' && (
              <div>
                <Label>{t('notNowUntil')}</Label>
                <Input
                  type="date"
                  value={notNowUntil}
                  onChange={e => setNotNowUntil(e.target.value)}
                  className="mt-1 text-base"
                />
              </div>
            )}
            {outcome === 'NOT_INTERESTED' && (
              <p className="text-[#062E25]/75">{t('notInterestedHint')}</p>
            )}
            {outcome === 'WRONG_NUMBER' && (
              <p className="text-[#062E25]/75">{t('wrongNumberHint')}</p>
            )}
            {outcome === 'TENANT_NO_NAME' && (
              <p className="text-[#062E25]/75">{t('tenantNoNameHint')}</p>
            )}

            <div>
              <Label>{td('logCallNote')}</Label>
              <Textarea
                rows={3}
                value={note}
                onChange={e => setNote(e.target.value)}
                className="mt-1 text-base"
              />
            </div>
            {mutation.isError && (
              <p className="text-red-600">{td('logFailed')}</p>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={mutation.isPending}
              >
                {tc('cancel')}
              </Button>
              <Button
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending || needsOwnerName}
              >
                {mutation.isPending ? td('saving') : td('logCallConfirm')}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Meetings, offers and QRL
// ---------------------------------------------------------------------------

type ActivityKind = 'MEETING_BOOKED' | 'MEETING_HELD' | 'OFFER_SENT' | 'QRL'

type EvidenceOption = { value: string; label: string; channel: OutboundChannel }

function useEvidenceOptions(
  prospect: OutboundProspectDetail,
  kind: ActivityKind | null
): EvidenceOption[] {
  const t = useTranslations('admin.outreach.callOutcome.log')
  return useMemo(() => {
    if (!kind) return []
    const mails: EvidenceOption[] = prospect.emails
      .filter(mail => mail.direction === 'INBOUND')
      .map(mail => ({
        value: `email:${mail.id}`,
        label: t('evidenceEmail', {
          date: formatDate(mail.receivedAt ?? mail.createdAt),
          from: mail.fromAddress ?? '-',
        }),
        channel: 'EMAIL' as const,
      }))
    const allowed =
      kind === 'MEETING_HELD'
        ? ['CALL_LOGGED', 'MEETING_BOOKED']
        : ['CALL_LOGGED']
    const activities: EvidenceOption[] = prospect.activities
      .filter(activity => allowed.includes(activity.type))
      .map(activity => ({
        value: `activity:${activity.id}`,
        label: t(
          activity.type === 'MEETING_BOOKED'
            ? 'evidenceMeeting'
            : 'evidenceCall',
          {
            date: formatDate(activity.createdAt),
          }
        ),
        channel: 'PHONE' as const,
      }))
    return [...mails, ...activities]
  }, [prospect.emails, prospect.activities, kind, t])
}

function evidenceIds(value: string): {
  sourceEmailId?: string
  sourceActivityId?: string
} {
  if (value.startsWith('email:'))
    return { sourceEmailId: value.slice('email:'.length) }
  if (value.startsWith('activity:'))
    return { sourceActivityId: value.slice('activity:'.length) }
  return {}
}

function ActivityDialog({
  prospect,
  kind,
  onClose,
}: {
  prospect: OutboundProspectDetail
  kind: ActivityKind | null
  onClose: () => void
}) {
  const t = useTranslations('admin.outreach.callOutcome.log')
  const tk = useTranslations('admin.outreach.kpi')
  const td = useTranslations('admin.outreach.detail')
  const tc = useTranslations('admin.common')
  const queryClient = useQueryClient()
  const options = useEvidenceOptions(prospect, kind)

  const [evidence, setEvidence] = useState(NO_EVIDENCE)
  const [note, setNote] = useState('')
  const [countAsQrl, setCountAsQrl] = useState(true)
  const [criterion, setCriterion] = useState<QrlCriterion>('OFFER_REQUEST')
  const [channel, setChannel] = useState<OutboundChannel>('EMAIL')
  const [lead, setLead] = useState<RecordLeadResponse | null>(null)

  const meeting = kind === 'MEETING_BOOKED' || kind === 'MEETING_HELD'
  const evidenceChannel = options.find(o => o.value === evidence)?.channel

  // A QRL counts with its channel of origin (doc 69 §10), so the channel
  // follows the evidence: a call is PHONE, an inbound mail EMAIL. The person
  // can still change it afterwards.
  const chooseEvidence = (value: string) => {
    setEvidence(value)
    const picked = options.find(o => o.value === value)?.channel
    if (kind === 'QRL' && picked) setChannel(picked)
  }

  const close = () => {
    setEvidence(NO_EVIDENCE)
    setNote('')
    setCountAsQrl(true)
    setCriterion('OFFER_REQUEST')
    setChannel('EMAIL')
    setLead(null)
    mutation.reset()
    onClose()
  }

  const mutation = useMutation({
    mutationFn: async (): Promise<RecordLeadResponse | null> => {
      const ids = evidenceIds(evidence)
      const trimmed = note.trim() || undefined
      if (kind === 'QRL') {
        return outreachKpiService.recordLead(prospect.id, {
          criterion,
          channel,
          note: trimmed,
          ...ids,
        })
      }
      const activity = await adminOutreachService.logActivity(prospect.id, {
        type: kind!,
        note: trimmed,
        ...ids,
        ...(kind === 'MEETING_BOOKED' && countAsQrl
          ? { qrlCriterion: 'MEETING_DATED' as const }
          : {}),
      })
      // A booked meeting with a fixed date is a QRL (doc 69 §10, condition 1).
      if (kind === 'MEETING_BOOKED' && countAsQrl) {
        return outreachKpiService.recordLead(prospect.id, {
          criterion: 'MEETING_DATED',
          channel: evidenceChannel ?? 'OTHER',
          sourceEmailId: ids.sourceEmailId,
          sourceActivityId: activity.id,
          note: trimmed,
        })
      }
      return null
    },
    onSuccess: recorded => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'outreach'] })
      if (recorded) setLead(recorded)
      else close()
    },
  })

  const needsEvidence = meeting && evidence === NO_EVIDENCE
  const title =
    kind === 'MEETING_BOOKED'
      ? t('meetingBooked')
      : kind === 'MEETING_HELD'
        ? t('meetingHeld')
        : kind === 'OFFER_SENT'
          ? t('offerSent')
          : t('qrl')

  const promotionText = (value: RecordLeadResponse['promotion']) => {
    if (value === 'promoted') return t('promoted')
    if (value === 'no_assignee') return t('noAssignee')
    if (value === 'not_qrl') return null
    return t('refused', { reason: value.slice('refused:'.length) })
  }

  return (
    <Dialog
      open={kind !== null}
      onOpenChange={o => {
        if (!o) close()
      }}
    >
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {meeting
              ? t('meetingDescription')
              : kind === 'QRL'
                ? t('qrlDescription')
                : t('offerDescription')}
          </DialogDescription>
        </DialogHeader>

        {lead ? (
          <div className="space-y-2">
            <p className="p-3 rounded bg-green-50 text-green-700 font-medium">
              {!lead.created
                ? t('leadExisting')
                : lead.kind === 'QRL'
                  ? t('leadQrl')
                  : t('leadHint')}
            </p>
            {promotionText(lead.promotion) && (
              <p>{promotionText(lead.promotion)}</p>
            )}
            <DialogFooter>
              <Button onClick={close}>{t('close')}</Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-3">
            {kind !== 'OFFER_SENT' && (
              <div>
                <Label>{meeting ? t('evidence') : t('evidenceOptional')}</Label>
                {meeting && options.length === 0 ? (
                  <p className="mt-1 p-3 rounded bg-amber-50 text-amber-800">
                    {t('evidenceNone')}
                  </p>
                ) : (
                  <Select value={evidence} onValueChange={chooseEvidence}>
                    <SelectTrigger className="mt-1 text-base">
                      <SelectValue placeholder={t('evidencePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_EVIDENCE}>
                        {t('noEvidence')}
                      </SelectItem>
                      {options.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}
            {kind === 'MEETING_BOOKED' && (
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={countAsQrl}
                  onCheckedChange={v => setCountAsQrl(v === true)}
                />
                {t('meetingQrl')}
              </label>
            )}
            {kind === 'QRL' && (
              <>
                <div>
                  <Label>{t('criterion')}</Label>
                  <Select
                    value={criterion}
                    onValueChange={v => setCriterion(v as QrlCriterion)}
                  >
                    <SelectTrigger className="mt-1 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {QRL_CRITERIA.map(value => (
                        <SelectItem key={value} value={value}>
                          {tk(`criterion.${value}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('channel')}</Label>
                  <Select
                    value={channel}
                    onValueChange={v => setChannel(v as OutboundChannel)}
                  >
                    <SelectTrigger className="mt-1 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {OUTBOUND_CHANNELS.map(value => (
                        <SelectItem key={value} value={value}>
                          {tk(`channel.${value}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            <div>
              <Label>{t('note')}</Label>
              <Textarea
                rows={3}
                value={note}
                onChange={e => setNote(e.target.value)}
                className="mt-1 text-base"
              />
            </div>
            {mutation.isError && (
              <p className="text-red-600">
                {errorCode(mutation.error) === 'MEETING_NEEDS_EVIDENCE'
                  ? t('needsEvidence')
                  : td('logFailed')}
              </p>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={close}
                disabled={mutation.isPending}
              >
                {tc('cancel')}
              </Button>
              <Button
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending || needsEvidence}
              >
                {mutation.isPending ? td('saving') : t('confirm')}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function LogActivityControl({
  prospect,
}: {
  prospect: OutboundProspectDetail
}) {
  const t = useTranslations('admin.outreach.detail')
  const tl = useTranslations('admin.outreach.callOutcome.log')
  const locale = useLocale()
  const queryClient = useQueryClient()
  const [callOpen, setCallOpen] = useState(false)
  const [kind, setKind] = useState<ActivityKind | null>(null)

  const letterMutation = useMutation({
    mutationFn: () =>
      adminOutreachService.logActivity(prospect.id, { type: 'LETTER_SENT' }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['admin', 'outreach'] }),
  })

  return (
    <>
      <Button variant="outline" onClick={() => setCallOpen(true)}>
        {t('logCall')}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-1">
            {tl('menu')}
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => setKind('MEETING_BOOKED')}>
            {tl('meetingBooked')}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setKind('MEETING_HELD')}>
            {tl('meetingHeld')}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setKind('OFFER_SENT')}>
            {tl('offerSent')}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setKind('QRL')}>
            {tl('qrl')}
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => letterMutation.mutate()}
            disabled={letterMutation.isPending}
          >
            {t('logLetter')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button variant="outline" asChild>
        <Link href={`/${locale}/admin/outreach/${prospect.id}/letter`}>
          {t('letterLink')}
        </Link>
      </Button>
      {letterMutation.isError && (
        <span className="text-red-600">{t('logFailed')}</span>
      )}

      <CallOutcomeDialog
        prospectId={prospect.id}
        companyName={prospect.companyName}
        open={callOpen}
        onOpenChange={setCallOpen}
      />
      <ActivityDialog
        prospect={prospect}
        kind={kind}
        onClose={() => setKind(null)}
      />
    </>
  )
}
