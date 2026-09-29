'use client'

// Mailbox pool (doc 69 §13): every sending mailbox with its warm-up limit,
// today's sends, the 7-day bounce rate and its queue. Anyone on the sales
// team can pause or resume a mailbox, an admin creates and edits them. The
// legacy Hostpoint box is listed for comparison and keeps sending from the
// laptop autosend.

import { Fragment, useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import type { AxiosError } from 'axios'
import { ChevronLeft } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { outreachMailboxesService } from '@/services/outreach/mailboxes.service'
import { useAuthStore } from '@/stores/auth.store'
import type {
  CreateMailboxRequest,
  MailboxOverview,
  UpdateMailboxRequest,
} from '@/types/outreach/mailboxes'
import {
  OUTBOUND_MAILBOX_PROVIDERS,
  type OutboundMailboxProvider,
  type OutboundMailboxStatus,
} from '@/types/outreach/owner-first'

const QUERY_KEY = ['admin', 'outreach', 'mailboxes']

const STATUS_STYLE: Record<OutboundMailboxStatus, string> = {
  SETUP: 'bg-gray-100 text-gray-700',
  WARMING: 'bg-amber-100 text-amber-800',
  ACTIVE: 'bg-green-100 text-green-700',
  PAUSED: 'bg-red-100 text-red-700',
  RETIRED: 'bg-gray-200 text-gray-600',
}

const EDITABLE_STATUSES = ['SETUP', 'WARMING', 'ACTIVE', 'RETIRED'] as const

function formatTime(value: string | null): string {
  if (!value) return '-'
  return new Date(value).toLocaleString('de-CH', {
    timeZone: 'Europe/Zurich',
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function useErrorToast() {
  const t = useTranslations('admin.outreach.mailboxes')
  return (error: unknown) => {
    const code = (error as AxiosError<{ error?: { code?: string } }>)?.response
      ?.data?.error?.code
    const key = code ? `errors.${code}` : null
    toast.error(key && t.has(key) ? t(key) : t('errors.generic'))
  }
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-1">
      <Label className="text-base">{label}</Label>
      <Input
        type="number"
        min={0}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-28 text-base"
      />
    </div>
  )
}

function EditPanel({
  mailbox,
  onDone,
}: {
  mailbox: MailboxOverview
  onDone: () => void
}) {
  const t = useTranslations('admin.outreach.mailboxes')
  const queryClient = useQueryClient()
  const onError = useErrorToast()
  const [signatureName, setSignatureName] = useState(mailbox.signatureName)
  const [displayName, setDisplayName] = useState(mailbox.displayName)
  const [status, setStatus] = useState<UpdateMailboxRequest['status']>(
    mailbox.status === 'PAUSED' ? undefined : mailbox.status
  )
  const [maxPerDay, setMaxPerDay] = useState(String(mailbox.maxPerDay))
  const [startPerDay, setStartPerDay] = useState(
    String(mailbox.warmupStartPerDay)
  )
  const [stepPerWeek, setStepPerWeek] = useState(
    String(mailbox.warmupStepPerWeek)
  )
  const [spacing, setSpacing] = useState(String(mailbox.minSpacingSec))

  const save = useMutation({
    mutationFn: () =>
      outreachMailboxesService.update(mailbox.id, {
        displayName,
        signatureName,
        ...(status && status !== mailbox.status ? { status } : {}),
        maxPerDay: Number(maxPerDay),
        warmupStartPerDay: Number(startPerDay),
        warmupStepPerWeek: Number(stepPerWeek),
        minSpacingSec: Number(spacing),
      }),
    onSuccess: () => {
      toast.success(t('saved'))
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      onDone()
    },
    onError,
  })

  return (
    <div className="flex flex-wrap items-end gap-4 p-4 bg-[#F5F7F6] rounded">
      <div className="space-y-1">
        <Label className="text-base">{t('displayName')}</Label>
        <Input
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          className="w-48 text-base"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-base">{t('signatureName')}</Label>
        <Input
          value={signatureName}
          onChange={e => setSignatureName(e.target.value)}
          className="w-48 text-base"
        />
      </div>
      {mailbox.status !== 'PAUSED' && (
        <div className="space-y-1">
          <Label className="text-base">{t('colStatus')}</Label>
          <Select
            value={status}
            onValueChange={v => setStatus(v as UpdateMailboxRequest['status'])}
          >
            <SelectTrigger className="w-44 text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EDITABLE_STATUSES.map(value => (
                <SelectItem key={value} value={value}>
                  {t(`status.${value}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <NumberField
        label={t('maxPerDay')}
        value={maxPerDay}
        onChange={setMaxPerDay}
      />
      <NumberField
        label={t('warmupStartPerDay')}
        value={startPerDay}
        onChange={setStartPerDay}
      />
      <NumberField
        label={t('warmupStepPerWeek')}
        value={stepPerWeek}
        onChange={setStepPerWeek}
      />
      <NumberField
        label={t('minSpacingSec')}
        value={spacing}
        onChange={setSpacing}
      />
      <Button
        className="text-base"
        disabled={save.isPending}
        onClick={() => save.mutate()}
      >
        {t('save')}
      </Button>
      <Button variant="outline" className="text-base" onClick={onDone}>
        {t('cancel')}
      </Button>
    </div>
  )
}

function StatsPanel({ mailbox }: { mailbox: MailboxOverview }) {
  const t = useTranslations('admin.outreach.mailboxes')
  const stats = useQuery({
    queryKey: [...QUERY_KEY, 'stats', mailbox.id],
    queryFn: () => outreachMailboxesService.stats(mailbox.id, 14),
  })
  if (stats.isLoading) return <AdminPageLoader />
  if (stats.isError || !stats.data)
    return <p className="p-3 text-red-700">{t('loadFailed')}</p>
  const { days, ramp, consecutiveTransportErrors } = stats.data
  return (
    <div className="p-4 bg-[#F5F7F6] rounded space-y-3">
      {ramp.length > 0 && (
        <p>
          {t('rampLine', {
            ramp: ramp.map(r => `${r.week}: ${r.limit}`).join(', '),
          })}
        </p>
      )}
      <p>{t('transportErrors', { count: consecutiveTransportErrors })}</p>
      {days.length === 0 ? (
        <p className="text-[#062E25]/75">{t('noStats')}</p>
      ) : (
        <div className="overflow-x-auto">
          <Table className="text-base">
            <TableHeader>
              <TableRow>
                <TableHead>{t('statDay')}</TableHead>
                <TableHead>{t('statSent')}</TableHead>
                <TableHead>{t('statHardBounces')}</TableHead>
                <TableHead>{t('statSoftBounces')}</TableHead>
                <TableHead>{t('statComplaints')}</TableHead>
                <TableHead>{t('statOptOuts')}</TableHead>
                <TableHead>{t('statReplies')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {days.map(day => (
                <TableRow key={day.day}>
                  <TableCell className="tabular-nums">{day.day}</TableCell>
                  <TableCell className="tabular-nums">{day.sent}</TableCell>
                  <TableCell className="tabular-nums">
                    {day.hardBounces}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {day.softBounces}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {day.complaints}
                  </TableCell>
                  <TableCell className="tabular-nums">{day.optOuts}</TableCell>
                  <TableCell className="tabular-nums">
                    {day.humanReplies}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

function MailboxRow({
  mailbox,
  isAdmin,
}: {
  mailbox: MailboxOverview
  isAdmin: boolean
}) {
  const t = useTranslations('admin.outreach.mailboxes')
  const queryClient = useQueryClient()
  const onError = useErrorToast()
  const [open, setOpen] = useState<'edit' | 'stats' | null>(null)
  const refresh = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY })

  const pause = useMutation({
    mutationFn: () => outreachMailboxesService.pause(mailbox.id),
    onSuccess: result => {
      toast.success(
        t('pausedToast', { moved: result.moved, stayed: result.stayed })
      )
      refresh()
    },
    onError,
  })
  const resume = useMutation({
    mutationFn: () => outreachMailboxesService.resume(mailbox.id),
    onSuccess: () => {
      toast.success(t('resumedToast'))
      refresh()
    },
    onError,
  })

  const limit =
    mailbox.dailyLimit === null ? t('legacyCap') : String(mailbox.dailyLimit)

  return (
    <Fragment>
      <TableRow className="align-top">
        <TableCell className="text-base max-w-[18rem]">
          <p className="font-medium break-words">{mailbox.address}</p>
          <p className="text-[#062E25]/75">
            {mailbox.displayName}, {t('signedBy')} {mailbox.signatureName}
          </p>
          <p className="text-[#062E25]/75">
            {t(`provider.${mailbox.provider}`)}, {t('ref')}{' '}
            {mailbox.credentialRef}
          </p>
          {mailbox.isLegacyHostpoint && (
            <span className="inline-block mt-1 px-2 rounded bg-blue-100 text-blue-800">
              {t('legacyBadge')}
            </span>
          )}
        </TableCell>
        <TableCell className="text-base">
          <span
            className={cn(
              'px-2 py-0.5 rounded whitespace-nowrap',
              STATUS_STYLE[mailbox.status]
            )}
          >
            {t(`status.${mailbox.status}`)}
          </span>
          {mailbox.pauseReason && (
            <p className="mt-1 text-[#062E25]/75 break-words max-w-[14rem]">
              {mailbox.pauseReason}
            </p>
          )}
          {mailbox.configured === false && (
            <p className="mt-1 text-red-700">{t('notConfigured')}</p>
          )}
        </TableCell>
        <TableCell className="text-base tabular-nums whitespace-nowrap">
          {mailbox.sentToday} / {limit}
        </TableCell>
        <TableCell className="text-base tabular-nums whitespace-nowrap">
          <p>{t('sent7d', { count: mailbox.sent7d })}</p>
          <p
            className={cn(
              mailbox.hardBounces7d > 0 && 'text-red-700 font-medium'
            )}
          >
            {t('bounces7d', {
              count: mailbox.hardBounces7d,
              rate: mailbox.bounceRate7d,
            })}
          </p>
        </TableCell>
        <TableCell className="text-base">
          <p>{t('queueFirstTouch', { count: mailbox.queued.firstTouch })}</p>
          <p>{t('queueFollowUp', { count: mailbox.queued.followUp })}</p>
          <p>{t('queueReply', { count: mailbox.queued.reply })}</p>
          {mailbox.queued.heldForHuman > 0 && (
            <p className="text-orange-700">
              {t('queueHeld', { count: mailbox.queued.heldForHuman })}
            </p>
          )}
        </TableCell>
        <TableCell className="text-base whitespace-nowrap">
          {formatTime(mailbox.lastSentAt)}
        </TableCell>
        <TableCell className="text-base">
          <div className="flex flex-col gap-2">
            {!mailbox.isLegacyHostpoint &&
              (mailbox.status === 'PAUSED' ? (
                <Button
                  variant="outline"
                  className="text-base"
                  disabled={resume.isPending}
                  onClick={() => resume.mutate()}
                >
                  {t('resume')}
                </Button>
              ) : (
                (mailbox.status === 'ACTIVE' ||
                  mailbox.status === 'WARMING') && (
                  <Button
                    variant="outline"
                    className="text-base"
                    disabled={pause.isPending}
                    onClick={() => {
                      if (window.confirm(t('pauseConfirm'))) pause.mutate()
                    }}
                  >
                    {t('pause')}
                  </Button>
                )
              ))}
            <Button
              variant="ghost"
              className="text-base"
              onClick={() => setOpen(open === 'stats' ? null : 'stats')}
            >
              {t('stats')}
            </Button>
            {isAdmin && !mailbox.isLegacyHostpoint && (
              <Button
                variant="ghost"
                className="text-base"
                onClick={() => setOpen(open === 'edit' ? null : 'edit')}
              >
                {t('edit')}
              </Button>
            )}
          </div>
        </TableCell>
      </TableRow>
      {open && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={7}>
            {open === 'edit' ? (
              <EditPanel mailbox={mailbox} onDone={() => setOpen(null)} />
            ) : (
              <StatsPanel mailbox={mailbox} />
            )}
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  )
}

function CreateForm() {
  const t = useTranslations('admin.outreach.mailboxes')
  const queryClient = useQueryClient()
  const onError = useErrorToast()
  const [address, setAddress] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [signatureName, setSignatureName] = useState('')
  const [provider, setProvider] = useState<OutboundMailboxProvider>('GMAIL_API')
  const [credentialRef, setCredentialRef] = useState('')

  const create = useMutation({
    mutationFn: () => {
      const input: CreateMailboxRequest = {
        address: address.trim(),
        displayName: displayName.trim(),
        signatureName: signatureName.trim(),
        provider,
        credentialRef: credentialRef.trim(),
      }
      return outreachMailboxesService.create(input)
    },
    onSuccess: () => {
      toast.success(t('created'))
      setAddress('')
      setDisplayName('')
      setSignatureName('')
      setCredentialRef('')
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
    onError,
  })

  const ready =
    address.includes('@') &&
    displayName.trim() &&
    signatureName.trim() &&
    credentialRef.trim()

  return (
    <div className="mt-8 space-y-3">
      <h2 className="text-xl font-semibold text-[#062E25]">
        {t('createTitle')}
      </h2>
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <Label className="text-base">{t('address')}</Label>
          <Input
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="ivan@beispiel-dach.ch"
            className="w-64 text-base"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-base">{t('displayName')}</Label>
          <Input
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            className="w-48 text-base"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-base">{t('signatureName')}</Label>
          <Input
            value={signatureName}
            onChange={e => setSignatureName(e.target.value)}
            className="w-48 text-base"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-base">{t('providerLabel')}</Label>
          <Select
            value={provider}
            onValueChange={v => setProvider(v as OutboundMailboxProvider)}
          >
            <SelectTrigger className="w-48 text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OUTBOUND_MAILBOX_PROVIDERS.map(value => (
                <SelectItem key={value} value={value}>
                  {t(`provider.${value}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-base">{t('credentialRef')}</Label>
          <Input
            value={credentialRef}
            onChange={e => setCredentialRef(e.target.value)}
            placeholder="DACH1"
            className="w-36 text-base"
          />
        </div>
        <Button
          className="text-base"
          disabled={!ready || create.isPending}
          onClick={() => create.mutate()}
        >
          {t('create')}
        </Button>
      </div>
      <p className="text-[#062E25]/75">{t('createHint')}</p>
    </div>
  )
}

export default function AdminOutreachMailboxesPage() {
  const locale = useLocale()
  const t = useTranslations('admin.outreach.mailboxes')
  const isAdmin = useAuthStore(state => state.user?.role === 'ADMIN')
  const list = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => outreachMailboxesService.list(),
  })

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <h1 className="text-2xl font-bold text-[#062E25]">{t('title')}</h1>
        <Button variant="outline" asChild className="gap-2">
          <Link href={`/${locale}/admin/outreach`}>
            <ChevronLeft className="w-4 h-4" />
            {t('backToList')}
          </Link>
        </Button>
      </div>
      <p className="mb-2 text-[#062E25]/75">{t('subtitle')}</p>
      {list.data && (
        <p
          className={cn(
            'mb-4 p-3 rounded',
            list.data.poolEnabled
              ? 'bg-green-50 text-green-800'
              : 'bg-amber-50 text-amber-800'
          )}
        >
          {list.data.poolEnabled
            ? t('poolOn', {
                window: list.data.sendWindow,
                pct: list.data.bouncePausePct,
              })
            : t('poolOff')}
        </p>
      )}

      {list.isLoading ? (
        <AdminPageLoader />
      ) : list.isError ? (
        <p className="p-3 rounded bg-red-50 text-red-700">{t('loadFailed')}</p>
      ) : (list.data?.mailboxes.length ?? 0) === 0 ? (
        <p className="p-3 text-[#062E25]/75">{t('empty')}</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-base">{t('colMailbox')}</TableHead>
                <TableHead className="text-base">{t('colStatus')}</TableHead>
                <TableHead className="text-base">{t('colToday')}</TableHead>
                <TableHead className="text-base">{t('colHealth')}</TableHead>
                <TableHead className="text-base">{t('colQueue')}</TableHead>
                <TableHead className="text-base">{t('colLastSent')}</TableHead>
                <TableHead className="text-base">{t('colActions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.data!.mailboxes.map(mailbox => (
                <MailboxRow
                  key={mailbox.id}
                  mailbox={mailbox}
                  isAdmin={isAdmin}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {isAdmin && <CreateForm />}
    </div>
  )
}
