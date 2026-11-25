'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { useTranslations } from 'next-intl'
import { useEffect, useId, useState, type ReactNode } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  INBOX_MATCHES_QUERY_KEY,
  inboxChannelKey,
  inboxSuppressionKey,
  localDateTimeInput,
} from '@/lib/outbound-inbox'
import {
  assigneeName,
  formatLeadDate,
  leadErrorKey,
  zurichDatePlusDays,
} from '@/lib/outbound-lead-work'
import { cn } from '@/lib/utils'
import { outreachInboxService } from '@/services/outreach/inbox.service'
import type { OutboundProspectDetail } from '@/types/admin-outreach'
import {
  INBOX_ANSWERS,
  type InboxAnswer,
  type InboxEntryHit,
  type InboxEntryInput,
  type InboxEntryMatchQuery,
  type InboxEntryResult,
} from '@/types/outreach/inbox'
import {
  LEAD_MANUAL_CHANNELS,
  type LeadManualChannel,
} from '@/types/outreach/kpi'

import { OUTLINE_BUTTON } from '../../../residential-leads/[id]/leadUtils'
import {
  LEAD_DECISION_TERMINAL_STATUSES,
  LEAD_INPUT_CLASS,
} from '../../[id]/_lead/lead-shared'
import { Actions } from '../../[id]/_lead/LeadDialogs'

const NEW_PROSPECT = 'new'
const NO_QUERY = '{}'
const MATCH_DELAY_MS = 400
const FUTURE_TOLERANCE_MS = 5 * 60 * 1000
const EARLIEST_RECEIVED = '2020-01-01T00:00'
const PLAUSIBLE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

interface EntryForm {
  channel: LeadManualChannel
  company: string
  postalCode: string
  person: string
  email: string
  phone: string
  website: string
  street: string
  number: string
  city: string
  receivedAt: string
  text: string
  answer: InboxAnswer | ''
  until: string
  note: string
}

type SubmitError = 'exists' | 'idTaken'

function emptyForm(prospect: OutboundProspectDetail | null): EntryForm {
  return {
    channel: prospect
      ? (prospect.work.lastCustomerTouch?.channel ?? 'phone')
      : 'explee',
    company: '',
    postalCode: '',
    person: '',
    email: '',
    phone: '',
    website: '',
    street: '',
    number: '',
    city: '',
    receivedAt: localDateTimeInput(new Date()),
    text: '',
    answer: '',
    until: '',
    note: '',
  }
}

function optional(value: string): string | undefined {
  return value.trim() || undefined
}

function matchQuery(form: EntryForm): InboxEntryMatchQuery {
  const query = {
    email: optional(form.email),
    website: optional(form.website),
    companyName: optional(form.company),
    postalCode: optional(form.postalCode),
  }
  const named = query.companyName && query.postalCode
  return query.email || query.website || named ? query : {}
}

function errorCode(error: unknown): string | null {
  if (!isAxiosError<{ error?: { code?: string } }>(error)) return null
  return error.response?.data?.error?.code ?? null
}

function prospectIsWithSales(prospect: OutboundProspectDetail): boolean {
  return (
    prospect.status === 'CONVERTED' ||
    !!prospect.commercialLeadId ||
    prospect.leads.some(lead => lead.commercialLeadId || lead.residentialLeadId)
  )
}

function Field({
  label,
  required,
  error,
  className,
  children,
}: {
  label: string
  required?: boolean
  error?: string | null
  className?: string
  children: (id: string) => ReactNode
}) {
  const id = useId()
  return (
    <div className={cn('min-w-0', className)}>
      <Label htmlFor={id} className="text-base">
        {required ? `${label} *` : label}
      </Label>
      {children(id)}
      {error ? <p className="mt-1 text-base text-red-700">{error}</p> : null}
    </div>
  )
}

function Hit({ hit }: { hit: InboxEntryHit }) {
  const t = useTranslations('admin.outreach.inbox')
  const ts = useTranslations('admin.outreach.statusLabels')
  const tw = useTranslations('admin.outreach.work')
  const details = [
    hit.person,
    hit.email,
    hit.city,
    hit.reference,
    assigneeName(hit.assignedTo),
  ].filter(Boolean)
  return (
    <span className="min-w-0 break-words">
      <span className="block font-semibold">{hit.companyName}</span>
      <span className="block text-[#062E25]/75">{details.join(' · ')}</span>
      <span className="block text-[#062E25]/75">
        {[
          t(`entry.matches.reason.${hit.match}`),
          hit.withSales ? tw('state.IM_VERKAUF') : ts(hit.status),
        ].join(' · ')}
      </span>
    </span>
  )
}

export function InboxEntryDialog({
  prospect,
  onClose,
  onSaved,
}: {
  prospect: OutboundProspectDetail | null
  onClose: () => void
  onSaved: (result: InboxEntryResult) => void
}) {
  const t = useTranslations('admin.outreach.inbox')
  const tn = useTranslations('admin.outreach.new')
  const to = useTranslations('admin.outreach')
  const tl = useTranslations('admin.outreach.leads')
  const tw = useTranslations('admin.outreach.work')
  const queryClient = useQueryClient()

  const [entryId, setEntryId] = useState(() => crypto.randomUUID())
  const [form, setForm] = useState(() => emptyForm(prospect))
  const [choice, setChoice] = useState<string | null>(null)
  const [seenHits, setSeenHits] = useState<string[]>([])
  const [submitError, setSubmitError] = useState<SubmitError | null>(null)

  const set =
    <K extends keyof EntryForm>(key: K) =>
    (value: EntryForm[K]) =>
      setForm(current => ({ ...current, [key]: value }))

  const wanted = JSON.stringify(prospect ? {} : matchQuery(form))
  const [searched, setSearched] = useState(NO_QUERY)

  useEffect(() => {
    setSubmitError(null)
    const handle = setTimeout(() => setSearched(wanted), MATCH_DELAY_MS)
    return () => clearTimeout(handle)
  }, [wanted])

  const searching = searched !== NO_QUERY
  const matches = useQuery({
    queryKey: [...INBOX_MATCHES_QUERY_KEY, searched],
    queryFn: () =>
      outreachInboxService.entryMatches(
        JSON.parse(searched) as InboxEntryMatchQuery
      ),
    enabled: searching,
    staleTime: 0,
  })
  const hits = matches.data?.hits ?? []
  const newAllowed = matches.data?.newAllowed ?? true
  const suppression = matches.data?.suppression ?? null
  const searchFailed = searching && matches.isError && !matches.isFetching
  const settled =
    wanted === searched &&
    (!searching || (matches.isSuccess && !matches.isFetching))

  const chosen = hits.find(hit => hit.prospectId === choice) ?? null
  const asNew =
    hits.length === 0 ||
    (choice === NEW_PROSPECT &&
      newAllowed &&
      hits.every(hit => seenHits.includes(hit.prospectId)))
  const targetReady =
    prospect !== null || (settled && (chosen !== null || asNew))

  const withSales = prospect
    ? prospectIsWithSales(prospect)
    : (chosen?.withSales ?? false)
  const terminal = prospect
    ? LEAD_DECISION_TERMINAL_STATUSES.includes(prospect.status)
    : (chosen?.terminal ?? false)
  const notNowBlocked = withSales || terminal

  const earliestUntil = zurichDatePlusDays(1)
  const receivedMs = Date.parse(form.receivedAt)
  const receivedInFuture = receivedMs > Date.now() + FUTURE_TOLERANCE_MS
  const receivedOk =
    !Number.isNaN(receivedMs) &&
    !receivedInFuture &&
    form.receivedAt >= EARLIEST_RECEIVED
  const email = form.email.trim()
  const emailOk = !email || PLAUSIBLE_EMAIL.test(email)
  const answerOk =
    form.answer !== '' &&
    (form.answer !== 'NOT_NOW' ||
      (!notNowBlocked && form.until >= earliestUntil))
  const companyOk =
    prospect !== null || chosen !== null || form.company.trim() !== ''

  const reachable =
    email ||
    form.website.trim() ||
    chosen?.email ||
    prospect?.contactEmail ||
    prospect?.website
  const stopsMail =
    form.answer === 'UNSUBSCRIBE' ||
    (form.answer === 'NOT_INTERESTED' && !withSales)

  const mutation = useMutation({
    mutationFn: (input: InboxEntryInput) =>
      outreachInboxService.createEntry(input),
    onSuccess: (result, input) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'outreach'] })
      if (result.decision === 'skipped_with_sales') {
        toast.warning(
          t('entry.toast.skippedWithSales', { answer: input.answer })
        )
      } else if (result.decision === 'skipped_closed') {
        toast.warning(t('entry.toast.skippedClosed'))
      } else {
        toast.success(t('entry.toast.saved'))
      }
      onSaved(result)
    },
    onError: error => {
      const code = errorCode(error)
      if (code === 'PROSPECT_EXISTS') {
        setChoice(null)
        setSubmitError('exists')
        matches.refetch()
      } else if (code === 'ENTRY_ID_TAKEN') {
        setEntryId(crypto.randomUUID())
        setSubmitError('idTaken')
      } else {
        toast.error(tw(leadErrorKey(error)))
      }
    },
  })

  const save = () => {
    if (!form.answer) return
    const existingId = prospect?.id ?? chosen?.prospectId
    setSubmitError(null)
    mutation.mutate({
      entryId,
      channel: form.channel,
      prospectId: existingId,
      contactName: optional(form.person),
      contactEmail: optional(form.email),
      contactPhone: optional(form.phone),
      website: optional(form.website),
      receivedAt: new Date(form.receivedAt).toISOString(),
      text: form.text.trim(),
      answer: form.answer,
      until: form.answer === 'NOT_NOW' ? form.until : undefined,
      note: optional(form.note),
      ...(existingId
        ? {}
        : {
            companyName: optional(form.company),
            addressStreet: optional(form.street),
            addressNumber: optional(form.number),
            addressPostalCode: optional(form.postalCode),
            addressCity: optional(form.city),
          }),
    })
  }

  const textField = (
    key:
      | 'company'
      | 'postalCode'
      | 'person'
      | 'phone'
      | 'website'
      | 'street'
      | 'number'
      | 'city',
    label: string,
    maxLength: number,
    options: {
      required?: boolean
      className?: string
      placeholder?: string | null
    } = {}
  ) => (
    <Field
      label={label}
      required={options.required}
      className={options.className}
    >
      {id => (
        <Input
          id={id}
          autoComplete="off"
          maxLength={maxLength}
          value={form[key]}
          placeholder={options.placeholder ?? undefined}
          onChange={event => set(key)(event.target.value)}
          className={LEAD_INPUT_CLASS}
        />
      )}
    </Field>
  )

  const chooseMatch = (value: string) => {
    setChoice(value)
    setSubmitError(null)
    if (value === NEW_PROSPECT) setSeenHits(hits.map(hit => hit.prospectId))
  }

  const matchBlock = () => {
    if (wanted === NO_QUERY) {
      return form.company.trim() ? (
        <p className="text-base text-[#062E25]/75">
          {t('entry.matches.needMore')}
        </p>
      ) : null
    }
    return (
      <section
        aria-live="polite"
        className="space-y-3 rounded-lg border border-[#062E25]/15 p-3 text-base text-[#062E25]"
      >
        <p className="font-semibold">{t('entry.matches.title')}</p>
        {suppression ? (
          <p className="text-red-700">
            {t('entry.suppressed', {
              date: formatLeadDate(suppression.createdAt),
              key: suppression.key,
              reason: to(inboxSuppressionKey(suppression.reason)),
            })}
          </p>
        ) : null}
        {searchFailed ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-red-700">{t('entry.matches.failed')}</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => matches.refetch()}
              className={OUTLINE_BUTTON}
            >
              {tl('retry')}
            </Button>
          </div>
        ) : !settled ? (
          <p className="text-[#062E25]/75">{t('entry.matches.searching')}</p>
        ) : hits.length === 0 ? (
          <p className="text-[#062E25]/75">{t('entry.matches.none')}</p>
        ) : (
          <>
            <p
              className={
                submitError === 'exists' ? 'text-red-700' : 'text-[#062E25]/75'
              }
            >
              {submitError === 'exists'
                ? t('entry.errors.exists')
                : newAllowed
                  ? t('entry.matches.pick')
                  : t('entry.matches.pickExisting')}
            </p>
            <RadioGroup
              value={chosen?.prospectId ?? (asNew ? NEW_PROSPECT : '')}
              onValueChange={chooseMatch}
              aria-label={t('entry.matches.title')}
              className="gap-2"
            >
              {hits.map(hit => (
                <label
                  key={hit.prospectId}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-[#062E25]/15 p-3 hover:bg-[#F5F7EE]"
                >
                  <RadioGroupItem value={hit.prospectId} className="mt-1" />
                  <Hit hit={hit} />
                </label>
              ))}
              {newAllowed ? (
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[#062E25]/15 p-3 hover:bg-[#F5F7EE]">
                  <RadioGroupItem value={NEW_PROSPECT} className="mt-1" />
                  <span className="font-semibold">
                    {t('entry.matches.createNew')}
                  </span>
                </label>
              ) : null}
            </RadioGroup>
          </>
        )}
      </section>
    )
  }

  return (
    <Dialog
      open
      onOpenChange={open => {
        if (!open && !mutation.isPending) onClose()
      }}
    >
      <DialogContent
        onInteractOutside={event => event.preventDefault()}
        className="sales-type-scale max-h-[90vh] overflow-y-auto sm:max-w-2xl"
      >
        <DialogHeader>
          <DialogTitle className="text-lg">{t('entry.title')}</DialogTitle>
          <DialogDescription className="text-base">
            {prospect ? (
              <span className="block font-semibold text-[#062E25]">
                {`${prospect.companyName} · ${prospect.reference}`}
              </span>
            ) : null}
            {t('entry.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-base text-[#062E25]">
          <Field label={t('entry.channel')} required>
            {id => (
              <Select
                value={form.channel}
                onValueChange={value =>
                  set('channel')(value as LeadManualChannel)
                }
              >
                <SelectTrigger
                  id={id}
                  className="mt-1 w-full text-base text-[#062E25]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="sales-type-scale">
                  {LEAD_MANUAL_CHANNELS.map(channel => (
                    <SelectItem
                      key={channel}
                      value={channel}
                      className="text-base"
                    >
                      {t(inboxChannelKey(channel))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </Field>

          {prospect ? null : (
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_9rem]">
              {textField('company', tw('company.companyTitle'), 300, {
                required: chosen === null,
              })}
              {textField('postalCode', tn('postalCode'), 10)}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {textField('person', tw('company.person'), 200, {
              placeholder: prospect?.contactName,
            })}
            <Field
              label={tw('company.email')}
              error={emailOk ? null : t('entry.errors.email')}
            >
              {id => (
                <Input
                  id={id}
                  type="email"
                  autoComplete="off"
                  maxLength={320}
                  aria-invalid={!emailOk}
                  value={form.email}
                  placeholder={prospect?.contactEmail ?? undefined}
                  onChange={event => set('email')(event.target.value)}
                  className={LEAD_INPUT_CLASS}
                />
              )}
            </Field>
            {textField('phone', tw('company.phone'), 50, {
              placeholder: prospect?.contactPhone,
            })}
            {textField('website', tw('company.website'), 500, {
              placeholder: prospect?.website,
            })}
          </div>

          {prospect ? null : matchBlock()}

          {prospect || chosen ? null : (
            <fieldset>
              <legend className="text-base font-medium">
                {t('entry.address')}
              </legend>
              <div className="mt-2 grid gap-4 sm:grid-cols-[minmax(0,1fr)_6rem_minmax(0,1fr)]">
                {textField('street', tn('street'), 200)}
                {textField('number', tn('number'), 20)}
                {textField('city', tn('city'), 120)}
              </div>
            </fieldset>
          )}

          <Field
            label={t('entry.receivedAt')}
            required
            error={receivedInFuture ? t('entry.errors.receivedAt') : null}
          >
            {id => (
              <Input
                id={id}
                type="datetime-local"
                min={EARLIEST_RECEIVED}
                aria-invalid={receivedInFuture}
                value={form.receivedAt}
                onChange={event => set('receivedAt')(event.target.value)}
                className={cn(LEAD_INPUT_CLASS, 'sm:w-64')}
              />
            )}
          </Field>

          <Field label={t('entry.text')} required>
            {id => (
              <Textarea
                id={id}
                rows={6}
                maxLength={20000}
                value={form.text}
                onChange={event => set('text')(event.target.value)}
                className={cn(LEAD_INPUT_CLASS, 'max-h-80')}
              />
            )}
          </Field>

          <Field label={t('entry.answer')} required>
            {id => (
              <>
                <Select
                  value={form.answer}
                  onValueChange={value => set('answer')(value as InboxAnswer)}
                >
                  <SelectTrigger
                    id={id}
                    className="mt-1 w-full text-base text-[#062E25]"
                  >
                    <SelectValue
                      placeholder={tw('callDialog.outcomePlaceholder')}
                    />
                  </SelectTrigger>
                  <SelectContent className="sales-type-scale">
                    {INBOX_ANSWERS.map(answer => (
                      <SelectItem
                        key={answer}
                        value={answer}
                        disabled={answer === 'NOT_NOW' && notNowBlocked}
                        className="text-base"
                      >
                        {t(`entry.answers.${answer}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {notNowBlocked ? (
                  <p className="mt-1 text-[#062E25]/75">
                    {withSales
                      ? t('entry.consequence.notNowWithSales')
                      : tw('errors.PROSPECT_TERMINAL')}
                  </p>
                ) : null}
              </>
            )}
          </Field>

          {form.answer === 'NOT_NOW' && !notNowBlocked ? (
            <Field label={tw('laterDialog.until')} required>
              {id => (
                <Input
                  id={id}
                  type="date"
                  min={earliestUntil}
                  value={form.until}
                  onChange={event => set('until')(event.target.value)}
                  className={cn(LEAD_INPUT_CLASS, 'sm:w-64')}
                />
              )}
            </Field>
          ) : null}

          <Field label={tw('laterDialog.note')}>
            {id => (
              <Textarea
                id={id}
                rows={2}
                maxLength={2000}
                value={form.note}
                onChange={event => set('note')(event.target.value)}
                className={LEAD_INPUT_CLASS}
              />
            )}
          </Field>

          {stopsMail || reachable ? (
            <div className="space-y-1 rounded-lg bg-amber-50 p-3 text-amber-800">
              {stopsMail ? <p>{t('entry.consequence.stopsMail')}</p> : null}
              {reachable ? <p>{t('entry.consequence.noColdMail')}</p> : null}
            </div>
          ) : null}

          {submitError === 'idTaken' ? (
            <p role="alert" className="text-red-700">
              {t('entry.errors.idTaken')}
            </p>
          ) : null}
        </div>

        <Actions
          cancel={tw('laterDialog.cancel')}
          save={tw('callDialog.save')}
          pending={mutation.isPending}
          disabled={
            !targetReady ||
            !companyOk ||
            !answerOk ||
            !receivedOk ||
            !emailOk ||
            !form.text.trim()
          }
          onCancel={onClose}
          onSave={save}
        />
      </DialogContent>
    </Dialog>
  )
}
