'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import type { AxiosError } from 'axios'
import { Check, Copy, ExternalLink, Send, UserPlus, X } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useHasCapability } from '@/lib/capabilities'
import { cn } from '@/lib/utils'
import { adminLinkedinService } from '@/services/admin-linkedin.service'
import { adminOutreachService } from '@/services/admin-outreach.service'
import { useAuthStore } from '@/stores/auth.store'
import type {
  LinkedinProspectCard,
  LinkedinReplyOutcome,
  LinkedinRequestItem,
  LinkedinSenderRow,
  LinkedinTouchItem,
} from '@/types/admin-outreach'

type TabKey = 'today' | 'messages' | 'pending' | 'review' | 'senders'

const QUEUE_KEY = ['admin', 'outreach', 'linkedin']

function formatDate(iso: string | null) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function daysSince(iso: string) {
  return Math.floor(
    (Date.now() - new Date(iso).getTime()) / (24 * 60 * 60 * 1000)
  )
}

function useErrorToast() {
  const t = useTranslations('admin.outreach.linkedin')
  return (error: unknown) => {
    const code = (error as AxiosError<{ error?: { code?: string } }>)?.response
      ?.data?.error?.code
    const key = code ? `errors.${code}` : null
    toast.error(key && t.has(key) ? t(key) : t('errors.generic'))
  }
}

function ExternalAnchor({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-blue-600 hover:underline inline-flex items-center gap-1"
      onClick={e => e.stopPropagation()}
    >
      {children}
      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
    </a>
  )
}

function ProspectCells({ p }: { p: LinkedinProspectCard }) {
  const locale = useLocale()
  const t = useTranslations('admin.outreach.linkedin')
  return (
    <>
      <TableCell className="align-top">
        <Link
          href={`/${locale}/admin/outreach/${p.id}`}
          className="font-medium text-[#062E25] hover:underline"
        >
          {p.companyName}
        </Link>
        <p className="text-[#062E25]/60">
          {[
            p.addressStreet &&
              `${p.addressStreet} ${p.addressNumber ?? ''}`.trim(),
            p.addressCity,
            p.addressCanton,
          ]
            .filter(Boolean)
            .join(', ')}
        </p>
      </TableCell>
      <TableCell className="align-top">
        <p className="font-medium">
          {p.linkedinPersonName ?? p.contactName ?? '-'}
        </p>
        {p.linkedinPersonRole && (
          <p className="text-[#062E25]/60">{p.linkedinPersonRole}</p>
        )}
        <div className="flex flex-wrap gap-x-3">
          {p.linkedinProfileUrl && (
            <ExternalAnchor href={p.linkedinProfileUrl}>
              {t('openProfile')}
            </ExternalAnchor>
          )}
          {p.linkedinCompanyUrl && (
            <ExternalAnchor href={p.linkedinCompanyUrl}>
              {t('openCompanyPage')}
            </ExternalAnchor>
          )}
        </div>
      </TableCell>
      <TableCell className="align-top tabular-nums whitespace-nowrap">
        {p.roofKwhYear != null
          ? `${Math.round(p.roofKwhYear / 1000).toLocaleString('de-CH')} MWh`
          : '-'}
        {p.imageryVerdict === 'unclear' && (
          <p className="inline-flex px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
            {t('roofUnclear')}
          </p>
        )}
        {p.publicToken && (
          <div>
            <ExternalAnchor href={`/${locale}/dach/${p.publicToken}`}>
              {t('roofPage')}
            </ExternalAnchor>
          </div>
        )}
      </TableCell>
    </>
  )
}

function RequestsTab({
  items,
  canRequest,
}: {
  items: LinkedinRequestItem[]
  canRequest: boolean
}) {
  const t = useTranslations('admin.outreach.linkedin')
  const queryClient = useQueryClient()
  const onError = useErrorToast()
  const [opened, setOpened] = useState<Set<string>>(new Set())

  const request = useMutation({
    mutationFn: (id: string) => adminLinkedinService.recordRequest(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUEUE_KEY }),
    onError,
  })
  const skip = useMutation({
    mutationFn: (id: string) =>
      adminLinkedinService.setProfile(id, { profileUrl: null }),
    onSuccess: () => {
      toast.success(t('skipped'))
      queryClient.invalidateQueries({ queryKey: QUEUE_KEY })
    },
    onError,
  })

  return (
    <div className="overflow-x-auto">
      <Table className="text-base min-w-[960px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>{t('colCompany')}</TableHead>
            <TableHead>{t('colPerson')}</TableHead>
            <TableHead>{t('colRoof')}</TableHead>
            <TableHead>{t('colEmail')}</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(p => (
            <TableRow key={p.id}>
              <ProspectCells p={p} />
              <TableCell className="align-top whitespace-nowrap">
                {p.firstEmailAt
                  ? t('emailSentOn', {
                      date: formatDate(p.firstEmailAt),
                      count: p.emailsSent,
                    })
                  : t('noEmail')}
              </TableCell>
              <TableCell className="align-top">
                <div className="flex flex-col gap-2 items-stretch">
                  <Button asChild variant="outline" size="sm" className="gap-2">
                    <a
                      href={p.linkedinProfileUrl ?? '#'}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setOpened(s => new Set(s).add(p.id))}
                    >
                      <ExternalLink className="w-4 h-4" />
                      {t('openProfile')}
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    className="gap-2"
                    disabled={
                      !canRequest || !opened.has(p.id) || request.isPending
                    }
                    onClick={() => request.mutate(p.id)}
                  >
                    <UserPlus className="w-4 h-4" />
                    {t('requestSent')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2"
                    disabled={skip.isPending}
                    onClick={() => {
                      if (window.confirm(t('skipConfirm'))) skip.mutate(p.id)
                    }}
                  >
                    <X className="w-4 h-4" />
                    {t('skip')}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-8 text-[#062E25]/75"
              >
                {t('emptyToday')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function ReplyDialog({
  touch,
  onClose,
}: {
  touch: LinkedinTouchItem | null
  onClose: () => void
}) {
  const t = useTranslations('admin.outreach.linkedin')
  const queryClient = useQueryClient()
  const onError = useErrorToast()
  const [outcome, setOutcome] = useState<LinkedinReplyOutcome>('interested')
  const [note, setNote] = useState('')

  const reply = useMutation({
    mutationFn: () =>
      adminLinkedinService.markReplied(
        touch!.id,
        outcome,
        note.trim() || undefined
      ),
    onSuccess: () => {
      toast.success(t('replySaved'))
      queryClient.invalidateQueries({ queryKey: ['admin', 'outreach'] })
      setNote('')
      onClose()
    },
    onError,
  })

  return (
    <Dialog
      open={touch !== null}
      onOpenChange={open => {
        if (!open) onClose()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('replyTitle')}</DialogTitle>
          <DialogDescription>{touch?.prospect.companyName}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t('replyOutcome')}</Label>
            <Select
              value={outcome}
              onValueChange={v => setOutcome(v as LinkedinReplyOutcome)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(
                  ['interested', 'other', 'not_interested', 'opt_out'] as const
                ).map(o => (
                  <SelectItem key={o} value={o}>
                    {t(`outcomes.${o}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[#062E25]/60">{t(`outcomeHints.${outcome}`)}</p>
          </div>
          <div className="space-y-2">
            <Label>{t('replyNote')}</Label>
            <Textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button disabled={reply.isPending} onClick={() => reply.mutate()}>
            {t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function MessageRow({
  touch,
  onReply,
}: {
  touch: LinkedinTouchItem
  onReply: (t: LinkedinTouchItem) => void
}) {
  const t = useTranslations('admin.outreach.linkedin')
  const queryClient = useQueryClient()
  const onError = useErrorToast()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const message = useQuery({
    queryKey: [...QUEUE_KEY, 'message', touch.id, touch.status],
    queryFn: () => adminLinkedinService.getMessage(touch.id),
    enabled: open,
  })
  const [text, setText] = useState<string | null>(null)
  const shown = text ?? message.data?.text ?? ''

  const sent = useMutation({
    mutationFn: () =>
      adminLinkedinService.markMessaged(touch.id, message.data?.templateId),
    onSuccess: () => {
      setOpen(false)
      setText(null)
      queryClient.invalidateQueries({ queryKey: QUEUE_KEY })
    },
    onError,
  })

  const copy = async () => {
    await navigator.clipboard.writeText(shown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <TableRow>
        <ProspectCells p={touch.prospect} />
        <TableCell className="align-top whitespace-nowrap">
          <p className="font-medium">
            {touch.step === 'followup' ? t('stepFollowup') : t('stepMessage')}
          </p>
          <p className="text-[#062E25]/60">
            {touch.step === 'followup'
              ? t('messagedOn', { date: formatDate(touch.messagedAt) })
              : t('acceptedOn', { date: formatDate(touch.acceptedAt) })}
          </p>
        </TableCell>
        <TableCell className="align-top">
          <div className="flex flex-col gap-2 items-stretch">
            <Button
              size="sm"
              variant={open ? 'secondary' : 'default'}
              onClick={() => setOpen(v => !v)}
            >
              {open ? t('hideText') : t('showText')}
            </Button>
            <Button size="sm" variant="outline" onClick={() => onReply(touch)}>
              {t('gotReply')}
            </Button>
          </div>
        </TableCell>
      </TableRow>
      {open && (
        <TableRow className="hover:bg-transparent">
          <TableCell colSpan={5} className="bg-[#062E25]/5">
            {message.isLoading ? (
              <AdminPageLoader />
            ) : message.isError ? (
              <p className="text-red-700">{t('errors.LINKEDIN_NO_TEMPLATE')}</p>
            ) : (
              <div className="space-y-3">
                <Textarea
                  value={shown}
                  onChange={e => setText(e.target.value)}
                  rows={12}
                  className="bg-white"
                />
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" className="gap-2" onClick={copy}>
                    {copied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copied ? t('copied') : t('copy')}
                  </Button>
                  <Button asChild variant="outline" className="gap-2">
                    <a href={touch.profileUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="w-4 h-4" />
                      {t('openProfile')}
                    </a>
                  </Button>
                  <Button
                    className="gap-2"
                    disabled={sent.isPending}
                    onClick={() => sent.mutate()}
                  >
                    <Send className="w-4 h-4" />
                    {t('messageSent')}
                  </Button>
                </div>
                <p className="text-[#062E25]/60">{t('messageHint')}</p>
              </div>
            )}
          </TableCell>
        </TableRow>
      )}
    </>
  )
}

function MessagesTab({
  items,
  onReply,
}: {
  items: LinkedinTouchItem[]
  onReply: (t: LinkedinTouchItem) => void
}) {
  const t = useTranslations('admin.outreach.linkedin')
  return (
    <div className="overflow-x-auto">
      <Table className="text-base min-w-[960px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>{t('colCompany')}</TableHead>
            <TableHead>{t('colPerson')}</TableHead>
            <TableHead>{t('colRoof')}</TableHead>
            <TableHead>{t('colStep')}</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(touch => (
            <MessageRow key={touch.id} touch={touch} onReply={onReply} />
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-8 text-[#062E25]/75"
              >
                {t('emptyMessages')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function PendingTab({
  pending,
  waiting,
  onReply,
}: {
  pending: LinkedinTouchItem[]
  waiting: LinkedinTouchItem[]
  onReply: (t: LinkedinTouchItem) => void
}) {
  const t = useTranslations('admin.outreach.linkedin')
  const queryClient = useQueryClient()
  const onError = useErrorToast()
  const accepted = useMutation({
    mutationFn: (id: string) => adminLinkedinService.markAccepted(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUEUE_KEY }),
    onError,
  })
  const withdrawn = useMutation({
    mutationFn: (id: string) => adminLinkedinService.markWithdrawn(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUEUE_KEY }),
    onError,
  })

  return (
    <div className="space-y-6">
      <p className="text-[#062E25]/75">{t('pendingHint')}</p>
      <div className="overflow-x-auto">
        <Table className="text-base min-w-[960px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{t('colCompany')}</TableHead>
              <TableHead>{t('colPerson')}</TableHead>
              <TableHead>{t('colRoof')}</TableHead>
              <TableHead>{t('colRequested')}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pending.map(touch => (
              <TableRow
                key={touch.id}
                className={cn(touch.withdrawDue && 'bg-amber-50')}
              >
                <ProspectCells p={touch.prospect} />
                <TableCell className="align-top whitespace-nowrap">
                  <p>{formatDate(touch.requestedAt)}</p>
                  <p className="text-[#062E25]/60">
                    {t('daysAgo', { count: daysSince(touch.requestedAt) })}
                  </p>
                  {touch.withdrawDue && (
                    <p className="text-amber-800 font-medium">
                      {t('withdrawDue')}
                    </p>
                  )}
                </TableCell>
                <TableCell className="align-top">
                  <div className="flex flex-col gap-2 items-stretch">
                    <Button
                      size="sm"
                      className="gap-2"
                      disabled={accepted.isPending}
                      onClick={() => accepted.mutate(touch.id)}
                    >
                      <Check className="w-4 h-4" />
                      {t('accepted')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={withdrawn.isPending}
                      onClick={() => withdrawn.mutate(touch.id)}
                    >
                      {t('withdrawn')}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {pending.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-[#062E25]/75"
                >
                  {t('emptyPending')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {waiting.length > 0 && (
        <div>
          <h3 className="font-semibold text-[#062E25] mb-2">
            {t('waitingTitle')}
          </h3>
          <div className="overflow-x-auto">
            <Table className="text-base min-w-[960px]">
              <TableBody>
                {waiting.map(touch => (
                  <TableRow key={touch.id}>
                    <ProspectCells p={touch.prospect} />
                    <TableCell className="align-top whitespace-nowrap">
                      {touch.status === 'FOLLOWED_UP'
                        ? t('followedUpOn', {
                            date: formatDate(touch.followedUpAt),
                          })
                        : t('messagedOn', {
                            date: formatDate(touch.messagedAt),
                          })}
                    </TableCell>
                    <TableCell className="align-top">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onReply(touch)}
                      >
                        {t('gotReply')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}

function ReviewTab() {
  const t = useTranslations('admin.outreach.linkedin')
  const queryClient = useQueryClient()
  const onError = useErrorToast()
  const review = useQuery({
    queryKey: [...QUEUE_KEY, 'review'],
    queryFn: () => adminLinkedinService.listReview(),
  })
  const decide = useMutation({
    mutationFn: ({
      id,
      decision,
    }: {
      id: string
      decision: 'confirm' | 'reject'
    }) => adminLinkedinService.review(id, decision),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUEUE_KEY }),
    onError,
  })

  if (review.isLoading) return <AdminPageLoader />
  const items = review.data ?? []

  return (
    <div className="space-y-4">
      <p className="text-[#062E25]/75">{t('reviewHint')}</p>
      <div className="overflow-x-auto">
        <Table className="text-base min-w-[960px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{t('colCompany')}</TableHead>
              <TableHead>{t('colPerson')}</TableHead>
              <TableHead>{t('colRoof')}</TableHead>
              <TableHead>{t('colSource')}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map(p => (
              <TableRow key={p.id}>
                <ProspectCells p={p} />
                <TableCell className="align-top">
                  {p.linkedinSource && t.has(`sources.${p.linkedinSource}`)
                    ? t(`sources.${p.linkedinSource}`)
                    : p.linkedinSource}
                </TableCell>
                <TableCell className="align-top">
                  <div className="flex flex-col gap-2 items-stretch">
                    <Button
                      size="sm"
                      className="gap-2"
                      disabled={decide.isPending}
                      onClick={() =>
                        decide.mutate({ id: p.id, decision: 'confirm' })
                      }
                    >
                      <Check className="w-4 h-4" />
                      {t('confirm')}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2"
                      disabled={decide.isPending}
                      onClick={() =>
                        decide.mutate({ id: p.id, decision: 'reject' })
                      }
                    >
                      <X className="w-4 h-4" />
                      {t('reject')}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-[#062E25]/75"
                >
                  {t('emptyReview')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function SenderRow({ s, isAdmin }: { s: LinkedinSenderRow; isAdmin: boolean }) {
  const t = useTranslations('admin.outreach.linkedin')
  const queryClient = useQueryClient()
  const onError = useErrorToast()
  const [limit, setLimit] = useState(String(s.dailyLimit))
  const update = useMutation({
    mutationFn: (input: { dailyLimit?: number; active?: boolean }) =>
      adminLinkedinService.updateSender(s.id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUEUE_KEY }),
    onError,
  })
  const acceptRate =
    s.stats.requested - s.stats.pending > 0
      ? Math.round(
          (s.stats.accepted / (s.stats.requested - s.stats.pending)) * 100
        )
      : null
  const replyRate =
    s.stats.messaged > 0
      ? Math.round((s.stats.replied / s.stats.messaged) * 100)
      : null

  return (
    <TableRow>
      <TableCell className="align-top">
        <p className="font-medium">
          {s.user.firstName} {s.user.lastName}
        </p>
        {s.profileUrl && (
          <ExternalAnchor href={s.profileUrl}>
            {t('openProfile')}
          </ExternalAnchor>
        )}
      </TableCell>
      <TableCell className="align-top tabular-nums">
        {s.today} / {s.effectiveLimit}
        {s.effectiveLimit < s.dailyLimit && (
          <p className="text-[#062E25]/60">{t('warmup')}</p>
        )}
      </TableCell>
      <TableCell className="align-top tabular-nums">
        {s.stats.requested}
      </TableCell>
      <TableCell className="align-top tabular-nums">
        {s.stats.pending}
      </TableCell>
      <TableCell className="align-top tabular-nums">
        {s.stats.accepted}
        {acceptRate !== null && (
          <span className="text-[#062E25]/60"> ({acceptRate}%)</span>
        )}
      </TableCell>
      <TableCell className="align-top tabular-nums">
        {s.stats.replied}
        {replyRate !== null && (
          <span className="text-[#062E25]/60"> ({replyRate}%)</span>
        )}
      </TableCell>
      <TableCell className="align-top">
        {isAdmin ? (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              max={30}
              value={limit}
              onChange={e => setLimit(e.target.value)}
              className="w-20"
            />
            <Button
              size="sm"
              variant="outline"
              disabled={update.isPending || Number(limit) === s.dailyLimit}
              onClick={() => update.mutate({ dailyLimit: Number(limit) })}
            >
              {t('save')}
            </Button>
          </div>
        ) : (
          s.dailyLimit
        )}
      </TableCell>
      <TableCell className="align-top">
        <Switch
          checked={s.active}
          disabled={!isAdmin || update.isPending}
          onCheckedChange={active => update.mutate({ active })}
        />
      </TableCell>
    </TableRow>
  )
}

function SendersTab({ isAdmin }: { isAdmin: boolean }) {
  const t = useTranslations('admin.outreach.linkedin')
  const queryClient = useQueryClient()
  const onError = useErrorToast()
  const senders = useQuery({
    queryKey: [...QUEUE_KEY, 'senders'],
    queryFn: () => adminLinkedinService.listSenders(),
  })
  const assignees = useQuery({
    queryKey: ['admin', 'outreach', 'assignees'],
    queryFn: () => adminOutreachService.listAssignees(),
    enabled: isAdmin,
  })
  const [userId, setUserId] = useState('')
  const [profileUrl, setProfileUrl] = useState('')
  const [dailyLimit, setDailyLimit] = useState('20')

  const create = useMutation({
    mutationFn: () =>
      adminLinkedinService.createSender({
        userId,
        ...(profileUrl.trim() ? { profileUrl: profileUrl.trim() } : {}),
        dailyLimit: Number(dailyLimit),
      }),
    onSuccess: () => {
      toast.success(t('senderAdded'))
      setUserId('')
      setProfileUrl('')
      queryClient.invalidateQueries({ queryKey: QUEUE_KEY })
    },
    onError,
  })

  if (senders.isLoading) return <AdminPageLoader />
  const rows = senders.data ?? []
  const taken = new Set(rows.map(r => r.user.id))

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <Table className="text-base min-w-[960px]">
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{t('colSender')}</TableHead>
              <TableHead>{t('colToday')}</TableHead>
              <TableHead>{t('colRequestedTotal')}</TableHead>
              <TableHead>{t('colPending')}</TableHead>
              <TableHead>{t('colAccepted')}</TableHead>
              <TableHead>{t('colReplied')}</TableHead>
              <TableHead>{t('colLimit')}</TableHead>
              <TableHead>{t('colActive')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map(s => (
              <SenderRow key={s.id} s={s} isAdmin={isAdmin} />
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-[#062E25]/75"
                >
                  {t('emptySenders')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {isAdmin && (
        <div className="grid gap-4 sm:grid-cols-4 items-end">
          <div className="space-y-2">
            <Label>{t('senderUser')}</Label>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger>
                <SelectValue placeholder={t('senderUserPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {(assignees.data ?? [])
                  .filter(a => !taken.has(a.id))
                  .map(a => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{t('senderProfile')}</Label>
            <Input
              value={profileUrl}
              onChange={e => setProfileUrl(e.target.value)}
              placeholder="https://www.linkedin.com/in/..."
            />
          </div>
          <div className="space-y-2">
            <Label>{t('colLimit')}</Label>
            <Input
              type="number"
              min={1}
              max={30}
              value={dailyLimit}
              onChange={e => setDailyLimit(e.target.value)}
            />
          </div>
          <Button
            disabled={!userId || create.isPending}
            onClick={() => create.mutate()}
          >
            {t('addSender')}
          </Button>
        </div>
      )}
      <p className="text-[#062E25]/60">{t('sendersHint')}</p>
    </div>
  )
}

export default function AdminOutreachLinkedinPage() {
  const t = useTranslations('admin.outreach.linkedin')
  const isAdmin = useAuthStore(state => state.user?.role === 'ADMIN')
  const canUseSales = useHasCapability('sales.tools')
  const [tab, setTab] = useState<TabKey>('today')
  const [replyTouch, setReplyTouch] = useState<LinkedinTouchItem | null>(null)

  const queue = useQuery({
    queryKey: [...QUEUE_KEY, 'queue'],
    queryFn: () => adminLinkedinService.getQueue(),
    enabled: canUseSales,
  })
  const overview = useQuery({
    queryKey: [...QUEUE_KEY, 'overview'],
    queryFn: () => adminLinkedinService.getOverview(),
    enabled: canUseSales,
  })

  if (queue.isLoading) return <AdminPageLoader />
  const q = queue.data
  const hasSender = Boolean(q?.sender)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold text-[#062E25]">{t('title')}</h1>
      </div>
      <p className="mb-4 text-[#062E25]/75 max-w-3xl">{t('intro')}</p>

      <Card className="border-[#062E25]/10 mb-4">
        <CardContent className="p-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {hasSender && q ? (
            <>
              <div>
                <p className="text-[#062E25]/60">{t('statToday')}</p>
                <p className="font-medium tabular-nums">
                  {q.sentToday} / {q.sender!.effectiveLimit}
                </p>
                {q.sender!.effectiveLimit < q.sender!.dailyLimit && (
                  <p className="text-[#062E25]/60">
                    {t('warmupActive', { limit: q.sender!.dailyLimit })}
                  </p>
                )}
              </div>
              <div>
                <p className="text-[#062E25]/60">{t('statPending')}</p>
                <p
                  className={cn(
                    'font-medium tabular-nums',
                    q.blockedByPending && 'text-red-700'
                  )}
                >
                  {q.pending} / {q.pendingBlock}
                </p>
              </div>
            </>
          ) : (
            <div className="sm:col-span-2">
              <p className="font-medium">{t('noSender')}</p>
              <p className="text-[#062E25]/60">{t('noSenderHint')}</p>
            </div>
          )}
          {overview.data && (
            <>
              <div>
                <p className="text-[#062E25]/60">{t('statEligible')}</p>
                <p className="font-medium tabular-nums">
                  {overview.data.eligibleNow}
                </p>
              </div>
              <div>
                <p className="text-[#062E25]/60">{t('statProfiles')}</p>
                <p className="font-medium tabular-nums">
                  {t('statProfilesValue', {
                    profiles: overview.data.withProfile,
                    review: overview.data.review,
                    touched: overview.data.touched,
                  })}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {hasSender && q && !q.withinBusinessHours && (
        <p className="mb-4 px-4 py-3 rounded-md bg-amber-100 text-amber-900">
          {t('outsideHours')}
        </p>
      )}
      {hasSender && q?.blockedByPending && (
        <p className="mb-4 px-4 py-3 rounded-md bg-red-100 text-red-800">
          {t('pendingBlocked')}
        </p>
      )}

      <Tabs value={tab} onValueChange={v => setTab(v as TabKey)}>
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="today" className="px-4 py-2 text-base">
            {t('tabToday')}
            {hasSender && (
              <span className="tabular-nums">({q?.requests?.length ?? 0})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="messages" className="px-4 py-2 text-base">
            {t('tabMessages')}
            {hasSender && (
              <span className="tabular-nums">({q?.messages?.length ?? 0})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending" className="px-4 py-2 text-base">
            {t('tabPending')}
            {hasSender && (
              <span className="tabular-nums">
                ({q?.pendingRequests?.length ?? 0})
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="review" className="px-4 py-2 text-base">
            {t('tabReview')}
            {overview.data && (
              <span className="tabular-nums">({overview.data.review})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="senders" className="px-4 py-2 text-base">
            {t('tabSenders')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today">
          <Card className="border-[#062E25]/10">
            <CardContent className="p-6 space-y-4">
              <p className="text-[#062E25]/75">{t('todayHint')}</p>
              {hasSender ? (
                <RequestsTab
                  items={q?.requests ?? []}
                  canRequest={(q?.remaining ?? 0) > 0 && !q?.blockedByPending}
                />
              ) : (
                <p className="text-[#062E25]/75">{t('noSenderHint')}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="messages">
          <Card className="border-[#062E25]/10">
            <CardContent className="p-6">
              {hasSender ? (
                <MessagesTab
                  items={q?.messages ?? []}
                  onReply={setReplyTouch}
                />
              ) : (
                <p className="text-[#062E25]/75">{t('noSenderHint')}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pending">
          <Card className="border-[#062E25]/10">
            <CardContent className="p-6">
              {hasSender ? (
                <PendingTab
                  pending={q?.pendingRequests ?? []}
                  waiting={q?.waiting ?? []}
                  onReply={setReplyTouch}
                />
              ) : (
                <p className="text-[#062E25]/75">{t('noSenderHint')}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="review">
          <Card className="border-[#062E25]/10">
            <CardContent className="p-6">
              <ReviewTab />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="senders">
          <Card className="border-[#062E25]/10">
            <CardContent className="p-6">
              <SendersTab isAdmin={isAdmin} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ReplyDialog touch={replyTouch} onClose={() => setReplyTouch(null)} />
    </div>
  )
}
