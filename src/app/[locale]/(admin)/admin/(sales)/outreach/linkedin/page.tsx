'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import type { AxiosError } from 'axios'
import { Check, Copy, ExternalLink, Send, UserPlus, X } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { StatusBadge } from '@/components/admin/StatusBadge'
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
  LinkedinEngagementItem,
  LinkedinFeatureMode,
  LinkedinPostItem,
  LinkedinProspectCard,
  LinkedinReplyOutcome,
  LinkedinRequestItem,
  LinkedinSenderInput,
  LinkedinSenderRow,
  LinkedinAgentLogItem,
  LinkedinTouchItem,
} from '@/types/admin-outreach'

type TabKey =
  | 'today'
  | 'messages'
  | 'pending'
  | 'posts'
  | 'engagement'
  | 'review'
  | 'senders'

const QUEUE_KEY = ['admin', 'outreach', 'linkedin']

const FEATURE_MODES: LinkedinFeatureMode[] = ['OFF', 'REHEARSAL', 'LIVE']

function effectiveMode(
  mode: LinkedinFeatureMode | undefined,
  rehearsal: boolean
): LinkedinFeatureMode | undefined {
  return mode === 'LIVE' && rehearsal ? 'REHEARSAL' : mode
}

function isLinkedinUrl(url: string | null): url is string {
  return Boolean(url && url.startsWith('https://www.linkedin.com/'))
}

function formatDate(iso: string | null) {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('de-CH', {
    hour: '2-digit',
    minute: '2-digit',
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
  senderId,
}: {
  items: LinkedinRequestItem[]
  canRequest: boolean
  senderId?: string
}) {
  const t = useTranslations('admin.outreach.linkedin')
  const queryClient = useQueryClient()
  const onError = useErrorToast()
  const [opened, setOpened] = useState<Set<string>>(new Set())

  const request = useMutation({
    mutationFn: (id: string) =>
      adminLinkedinService.recordRequest(id, senderId),
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
  senderId,
}: {
  touch: LinkedinTouchItem | null
  onClose: () => void
  senderId?: string
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
        note.trim() || undefined,
        senderId
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
  senderId,
}: {
  touch: LinkedinTouchItem
  onReply: (t: LinkedinTouchItem) => void
  senderId?: string
}) {
  const t = useTranslations('admin.outreach.linkedin')
  const queryClient = useQueryClient()
  const onError = useErrorToast()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const message = useQuery({
    queryKey: [...QUEUE_KEY, 'message', touch.id, touch.status],
    queryFn: () => adminLinkedinService.getMessage(touch.id, senderId),
    enabled: open,
  })
  const [text, setText] = useState<string | null>(null)
  const shown = text ?? message.data?.text ?? ''

  const sent = useMutation({
    mutationFn: () =>
      adminLinkedinService.markMessaged(
        touch.id,
        message.data?.templateId,
        senderId
      ),
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

function RepliesList({
  items,
  onClassify,
}: {
  items: LinkedinTouchItem[]
  onClassify: (t: LinkedinTouchItem) => void
}) {
  const t = useTranslations('admin.outreach.linkedin.agent')
  if (items.length === 0) return null
  return (
    <div className="space-y-3 mb-6">
      <p className="font-medium">
        {t('repliesTitle', { count: items.length })}
      </p>
      {items.map(touch => (
        <div
          key={touch.id}
          className="rounded-md border border-[#062E25]/10 p-4 space-y-2"
        >
          <p className="font-medium">
            {touch.prospect.companyName}
            {touch.prospect.linkedinPersonName && (
              <span className="text-[#062E25]/60">
                {' '}
                {touch.prospect.linkedinPersonName}
              </span>
            )}
          </p>
          <p className="whitespace-pre-wrap">{touch.replyText}</p>
          <Button size="sm" onClick={() => onClassify(touch)}>
            {t('classify')}
          </Button>
        </div>
      ))}
    </div>
  )
}

function ExistingContactsList({ items }: { items: LinkedinTouchItem[] }) {
  const t = useTranslations('admin.outreach.linkedin')
  if (items.length === 0) return null
  return (
    <div className="space-y-3 mb-6">
      <p className="font-medium">
        {t('agent.existingContactsTitle', { count: items.length })}
      </p>
      <p className="text-[#062E25]/75">{t('agent.existingContactsHint')}</p>
      {items.map(touch => (
        <div
          key={touch.id}
          className="rounded-md border border-[#062E25]/10 p-4 space-y-1"
        >
          <p className="font-medium">
            {touch.prospect.companyName}
            {touch.prospect.linkedinPersonName && (
              <span className="text-[#062E25]/60">
                {' '}
                {touch.prospect.linkedinPersonName}
              </span>
            )}
          </p>
          {touch.prospect.linkedinPersonRole && (
            <p className="text-[#062E25]/60">
              {touch.prospect.linkedinPersonRole}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-x-3">
            <span className="tabular-nums text-[#062E25]/60">
              {formatDate(touch.closedAt ?? touch.requestedAt)}
            </span>
            <ExternalAnchor href={touch.profileUrl}>
              {t('openProfile')}
            </ExternalAnchor>
          </div>
        </div>
      ))}
    </div>
  )
}

function AgentLog({ senderId }: { senderId?: string }) {
  const t = useTranslations('admin.outreach.linkedin.agent')
  const locale = useLocale()
  const log = useQuery({
    queryKey: [...QUEUE_KEY, 'agent-log', senderId ?? 'self'],
    queryFn: () => adminLinkedinService.getAgentLog(senderId),
    refetchInterval: 60000,
  })
  if (log.isLoading) return <AdminPageLoader />
  const items: LinkedinAgentLogItem[] = log.data ?? []
  return (
    <div className="overflow-x-auto">
      <Table className="text-base min-w-[720px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>{t('colTime')}</TableHead>
            <TableHead>{t('colAction')}</TableHead>
            <TableHead>{t('colCompany')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(item => (
            <TableRow key={item.id}>
              <TableCell className="whitespace-nowrap tabular-nums">
                {formatTime(item.createdAt)}
              </TableCell>
              <TableCell>
                {item.jobType && (
                  <span className="mr-2 px-2 rounded bg-[#062E25]/10">
                    {t.has(`jobTypes.${item.jobType}`)
                      ? t(`jobTypes.${item.jobType}`)
                      : item.jobType}
                  </span>
                )}
                {t.has(`actions.${item.action}`)
                  ? t(`actions.${item.action}`)
                  : item.action}
                {item.code && (
                  <span className="text-[#062E25]/60"> ({item.code})</span>
                )}
                {item.rehearsal && (
                  <span className="ml-2 px-2 rounded bg-amber-100 text-amber-900">
                    {t('rehearsalBadge')}
                  </span>
                )}
              </TableCell>
              <TableCell>
                {item.prospect ? (
                  <Link
                    href={`/${locale}/admin/outreach/${item.prospect.id}`}
                    className="hover:underline"
                  >
                    {item.prospect.companyName}
                  </Link>
                ) : (
                  <span className="text-[#062E25]/60">-</span>
                )}
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={3}
                className="text-center py-8 text-[#062E25]/75"
              >
                {t('emptyLog')}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function MessagesTab({
  items,
  onReply,
  senderId,
}: {
  items: LinkedinTouchItem[]
  onReply: (t: LinkedinTouchItem) => void
  senderId?: string
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
            <MessageRow
              key={touch.id}
              touch={touch}
              onReply={onReply}
              senderId={senderId}
            />
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
  senderId,
  auto,
}: {
  pending: LinkedinTouchItem[]
  waiting: LinkedinTouchItem[]
  onReply: (t: LinkedinTouchItem) => void
  senderId?: string
  auto: boolean
}) {
  const t = useTranslations('admin.outreach.linkedin')
  const queryClient = useQueryClient()
  const onError = useErrorToast()
  const accepted = useMutation({
    mutationFn: (id: string) => adminLinkedinService.markAccepted(id, senderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUEUE_KEY }),
    onError,
  })
  const withdrawn = useMutation({
    mutationFn: (id: string) =>
      adminLinkedinService.markWithdrawn(id, senderId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUEUE_KEY }),
    onError,
  })

  return (
    <div className="space-y-6">
      <p className="text-[#062E25]/75">
        {auto ? t('agent.pendingAutoHint') : t('pendingHint')}
      </p>
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
                  {!auto && (
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
                  )}
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

function PostsTab({
  senderId,
  mode,
}: {
  senderId?: string
  mode?: LinkedinFeatureMode
}) {
  const t = useTranslations('admin.outreach.linkedin')
  const queryClient = useQueryClient()
  const onError = useErrorToast()
  const posts = useQuery({
    queryKey: [...QUEUE_KEY, 'posts', senderId ?? 'self'],
    queryFn: () => adminLinkedinService.listPosts(senderId),
    refetchInterval: 60000,
  })
  const cancel = useMutation({
    mutationFn: (id: string) => adminLinkedinService.cancelPost(id, senderId),
    onSuccess: () => {
      toast.success(t('posts.cancelled'))
      queryClient.invalidateQueries({ queryKey: QUEUE_KEY })
    },
    onError: error => {
      onError(error)
      queryClient.invalidateQueries({ queryKey: QUEUE_KEY })
    },
  })

  if (posts.isLoading) return <AdminPageLoader />
  if (posts.isError)
    return <p className="text-red-700">{t('errors.generic')}</p>
  const scheduled = posts.data?.scheduled ?? []
  const recent = posts.data?.recent ?? []
  const lastError = (code: string | null) =>
    code
      ? t.has(`posts.lastErrors.${code}`)
        ? t(`posts.lastErrors.${code}`)
        : code
      : '-'
  const stat = (post: LinkedinPostItem, value: number | null) =>
    post.status === 'PUBLISHED' && value !== null
      ? value.toLocaleString('de-CH')
      : '-'

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-[#062E25]/75">{t('posts.hint')}</p>
        {mode && <p className="font-medium">{t(`posts.modeStatus.${mode}`)}</p>}
      </div>

      <div>
        <h3 className="font-semibold text-[#062E25] mb-2">
          {t('posts.scheduledTitle')}
        </h3>
        {scheduled.length === 0 ? (
          <p className="text-[#062E25]/75">{t('posts.emptyScheduled')}</p>
        ) : (
          <div className="space-y-3">
            {scheduled.map(post => (
              <div
                key={post.id}
                className="rounded-md border border-[#062E25]/10 p-4 flex flex-col gap-4 sm:flex-row"
              >
                {post.imageUrl && (
                  <div className="relative w-40 h-40 shrink-0 rounded-md overflow-hidden bg-[#062E25]/5">
                    <Image
                      src={post.imageUrl}
                      alt=""
                      fill
                      sizes="160px"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium tabular-nums">
                      {formatDateTime(post.scheduledFor)}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 text-base"
                      disabled={
                        cancel.isPending || Boolean(post.publishClickedAt)
                      }
                      onClick={() => {
                        if (window.confirm(t('posts.cancelConfirm')))
                          cancel.mutate(post.id)
                      }}
                    >
                      <X className="w-4 h-4" />
                      {t('posts.cancel')}
                    </Button>
                  </div>
                  {post.lastError && (
                    <p className="text-[#062E25]/60">
                      {t('posts.lastError', {
                        error: lastError(post.lastError),
                      })}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap break-words">{post.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-[#062E25] mb-2">
          {t('posts.recentTitle')}
        </h3>
        <p className="text-[#062E25]/75 mb-2">{t('posts.commentsHint')}</p>
        <div className="overflow-x-auto">
          <Table className="text-base min-w-[1120px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>{t('posts.colTime')}</TableHead>
                <TableHead>{t('posts.colStatus')}</TableHead>
                <TableHead className="text-right">
                  {t('posts.colReactions')}
                </TableHead>
                <TableHead className="text-right">
                  {t('posts.colComments')}
                </TableHead>
                <TableHead className="text-right">
                  {t('posts.colReposts')}
                </TableHead>
                <TableHead className="text-right">
                  {t('posts.colImpressions')}
                </TableHead>
                <TableHead>{t('posts.colLink')}</TableHead>
                <TableHead>{t('posts.colLastError')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recent.map(post => (
                <TableRow key={post.id}>
                  <TableCell className="tabular-nums">
                    {formatDateTime(post.publishedAt ?? post.scheduledFor)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={post.status}
                      namespace="admin.outreach.linkedin.postStatus"
                      className="text-base"
                    />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {stat(post, post.reactions)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {stat(post, post.comments)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {stat(post, post.reposts)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {stat(post, post.impressions)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {isLinkedinUrl(post.postUrl) ? (
                        <ExternalAnchor href={post.postUrl}>
                          {t('posts.openPost')}
                        </ExternalAnchor>
                      ) : (
                        '-'
                      )}
                      {post.status === 'PUBLISHED' && post.statsAt && (
                        <span className="text-[#062E25]/60 tabular-nums">
                          {t('posts.statsAt', {
                            time: formatDateTime(post.statsAt),
                          })}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{lastError(post.lastError)}</TableCell>
                </TableRow>
              ))}
              {recent.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-[#062E25]/75"
                  >
                    {t('posts.emptyRecent')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

function engagementStateKey(item: LinkedinEngagementItem) {
  if (item.closedAt) return `engagement.closeReasons.${item.closeReason}`
  if (item.decision === 'PENDING') return 'engagement.states.waiting'
  if (item.decision === 'COMMENT')
    return item.commentSubmittedAt
      ? 'engagement.states.verifying'
      : 'engagement.states.commentPlanned'
  if (item.decision === 'LIKE') return 'engagement.states.likePlanned'
  return 'engagement.states.open'
}

function EngagementTab({
  senderId,
  mode,
}: {
  senderId?: string
  mode?: LinkedinFeatureMode
}) {
  const t = useTranslations('admin.outreach.linkedin')
  const locale = useLocale()
  const engagement = useQuery({
    queryKey: [...QUEUE_KEY, 'engagement', senderId ?? 'self'],
    queryFn: () => adminLinkedinService.getEngagement(senderId),
    refetchInterval: 60000,
  })

  if (engagement.isLoading) return <AdminPageLoader />
  if (engagement.isError)
    return <p className="text-red-700">{t('errors.generic')}</p>
  const data = engagement.data
  const items = data?.items ?? []
  const label = (key: string, fallback: string | null) =>
    t.has(key) ? t(key) : (fallback ?? '-')

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-[#062E25]/75">{t('engagement.hint')}</p>
        {mode && (
          <p className="font-medium">{t(`engagement.modeStatus.${mode}`)}</p>
        )}
      </div>

      {data && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-[#062E25]/60">{t('engagement.likesToday')}</p>
            <p className="font-medium tabular-nums">
              {data.likesToday} / {data.likeLimit}
            </p>
          </div>
          <div>
            <p className="text-[#062E25]/60">{t('engagement.commentsToday')}</p>
            <p className="font-medium tabular-nums">
              {data.commentsToday} / {data.commentLimit}
            </p>
          </div>
          <div>
            <p className="text-[#062E25]/60">
              {t('engagement.pendingDecisions')}
            </p>
            <p className="font-medium tabular-nums">{data.pendingDecisions}</p>
          </div>
        </div>
      )}

      <div>
        <h3 className="font-semibold text-[#062E25] mb-2">
          {t('engagement.recentTitle')}
        </h3>
        <div className="overflow-x-auto">
          <Table className="text-base min-w-[960px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>{t('engagement.colCompany')}</TableHead>
                <TableHead>{t('engagement.colPostedAt')}</TableHead>
                <TableHead>{t('engagement.colDecision')}</TableHead>
                <TableHead>{t('engagement.colReason')}</TableHead>
                <TableHead>{t('engagement.colComment')}</TableHead>
                <TableHead>{t('engagement.colState')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="align-top">
                    <Link
                      href={`/${locale}/admin/outreach/${item.prospect.id}`}
                      className="font-medium text-[#062E25] hover:underline"
                    >
                      {item.prospect.companyName}
                    </Link>
                  </TableCell>
                  <TableCell className="align-top tabular-nums">
                    {formatDate(item.postedAt)}
                  </TableCell>
                  <TableCell className="align-top">
                    {label(
                      `engagement.decisions.${item.decision}`,
                      item.decision
                    )}
                  </TableCell>
                  <TableCell className="align-top">
                    {item.decisionReason
                      ? label(
                          `engagement.reasons.${item.decisionReason}`,
                          item.decisionReason
                        )
                      : '-'}
                  </TableCell>
                  <TableCell className="align-top whitespace-pre-wrap min-w-[280px]">
                    {item.commentText ?? '-'}
                  </TableCell>
                  <TableCell className="align-top">
                    {label(engagementStateKey(item), item.closeReason)}
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-[#062E25]/75"
                  >
                    {t('engagement.empty')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
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

function FeatureModeSelect({
  id,
  label,
  value,
  disabled,
  onChange,
}: {
  id: string
  label: string
  value: LinkedinFeatureMode
  disabled: boolean
  onChange: (mode: LinkedinFeatureMode) => void
}) {
  const t = useTranslations('admin.outreach.linkedin.agent')
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-base">
        {label}
      </Label>
      <Select
        value={value}
        disabled={disabled}
        onValueChange={v => onChange(v as LinkedinFeatureMode)}
      >
        <SelectTrigger id={id} className="w-48 text-base">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FEATURE_MODES.map(mode => (
            <SelectItem key={mode} value={mode} className="text-base">
              {t(`featureMode.${mode}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function AgentPanel({
  s,
  checkedAt,
}: {
  s: LinkedinSenderRow
  checkedAt: number
}) {
  const t = useTranslations('admin.outreach.linkedin.agent')
  const queryClient = useQueryClient()
  const onError = useErrorToast()
  const [key, setKey] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const refresh = () => queryClient.invalidateQueries({ queryKey: QUEUE_KEY })
  const update = useMutation({
    mutationFn: (
      input: Pick<
        LinkedinSenderInput,
        'mode' | 'rehearsal' | 'engagementMode' | 'postMode'
      >
    ) => adminLinkedinService.updateSender(s.id, input),
    onSuccess: refresh,
    onError,
  })
  const createKey = useMutation({
    mutationFn: () => adminLinkedinService.createAgentKey(s.id),
    onSuccess: data => {
      setKey(data.key)
      refresh()
    },
    onError,
  })
  const revokeKey = useMutation({
    mutationFn: () => adminLinkedinService.revokeAgentKey(s.id),
    onSuccess: refresh,
    onError,
  })
  const resume = useMutation({
    mutationFn: () => adminLinkedinService.resumeSender(s.id),
    onSuccess: refresh,
    onError,
  })
  const online =
    s.agentLastSeenAt !== null &&
    checkedAt - new Date(s.agentLastSeenAt).getTime() < 6 * 60 * 1000
  const reason =
    s.pauseReason && t.has(`reasons.${s.pauseReason}`)
      ? t(`reasons.${s.pauseReason}`)
      : (s.pauseReason ?? '')
  const offReasons = [
    { feature: t('engagementMode'), reason: s.engagementOffReason },
    { feature: t('postMode'), reason: s.postOffReason },
  ].filter((row): row is { feature: string; reason: string } => !!row.reason)
  const copy = async () => {
    if (!key) return
    await navigator.clipboard.writeText(key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="border-[#062E25]/10">
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-medium">
            {t('title', {
              name: `${s.user.firstName} ${s.user.lastName}`.trim(),
            })}
          </p>
          <p className="flex items-center gap-2">
            <span
              className={cn(
                'inline-block w-2.5 h-2.5 rounded-full',
                online ? 'bg-green-600' : 'bg-[#062E25]/30'
              )}
            />
            {s.agentLastSeenAt
              ? t('lastSeen', { time: formatDateTime(s.agentLastSeenAt) })
              : t('neverSeen')}
            {s.agentVersion && (
              <span className="text-[#062E25]/60">v{s.agentVersion}</span>
            )}
          </p>
        </div>
        {s.pausedAt && (
          <div className="px-4 py-3 rounded-md bg-red-100 text-red-800 space-y-2">
            <p className="font-medium">{t('paused', { reason })}</p>
            {s.pauseDetail?.message && <p>{s.pauseDetail.message}</p>}
            {s.pauseDetail?.url && (
              <p className="break-all">{s.pauseDetail.url}</p>
            )}
            {s.pauseDetail?.excerpt && <p>{s.pauseDetail.excerpt}</p>}
            <Button
              size="sm"
              disabled={resume.isPending}
              onClick={() => resume.mutate()}
            >
              {t('resume')}
            </Button>
          </div>
        )}
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2">
            <Switch
              checked={s.mode === 'AUTO'}
              disabled={update.isPending}
              onCheckedChange={auto =>
                update.mutate({ mode: auto ? 'AUTO' : 'MANUAL' })
              }
            />
            {t('auto')}
          </label>
          <label className="flex items-center gap-2">
            <Switch
              checked={s.rehearsal}
              disabled={update.isPending}
              onCheckedChange={rehearsal => update.mutate({ rehearsal })}
            />
            {t('rehearsal')}
          </label>
        </div>
        <p className="text-[#062E25]/60">
          {s.rehearsal ? t('rehearsalHint') : t('liveHint')}
        </p>
        <div className="flex flex-wrap gap-6">
          <FeatureModeSelect
            id={`linkedin-engagement-mode-${s.id}`}
            label={t('engagementMode')}
            value={s.engagementMode}
            disabled={update.isPending}
            onChange={engagementMode => update.mutate({ engagementMode })}
          />
          <FeatureModeSelect
            id={`linkedin-post-mode-${s.id}`}
            label={t('postMode')}
            value={s.postMode}
            disabled={update.isPending}
            onChange={postMode => update.mutate({ postMode })}
          />
        </div>
        {offReasons.map(row => {
          const code = row.reason.replace(/^auto_off:/, '')
          return (
            <p
              key={row.feature}
              className="px-4 py-3 rounded-md bg-amber-100 text-amber-900"
            >
              {t('offReason', {
                feature: row.feature,
                reason: t.has(`reasons.${code}`) ? t(`reasons.${code}`) : code,
              })}
            </p>
          )
        })}
        <p className="text-[#062E25]/60">{t('featureModeHint')}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={createKey.isPending}
            onClick={() => {
              if (
                !s.agentKeyCreatedAt ||
                window.confirm(t('replaceKeyConfirm'))
              )
                createKey.mutate()
            }}
          >
            {s.agentKeyCreatedAt ? t('replaceKey') : t('createKey')}
          </Button>
          {s.agentKeyCreatedAt && (
            <>
              <span className="text-[#062E25]/60">
                {t('keyCreated', { date: formatDate(s.agentKeyCreatedAt) })}
              </span>
              <Button
                size="sm"
                variant="ghost"
                disabled={revokeKey.isPending}
                onClick={() => {
                  if (window.confirm(t('revokeKeyConfirm'))) revokeKey.mutate()
                }}
              >
                {t('revokeKey')}
              </Button>
            </>
          )}
        </div>
        <Dialog
          open={key !== null}
          onOpenChange={open => {
            if (!open) setKey(null)
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('keyTitle')}</DialogTitle>
              <DialogDescription>{t('keyHint')}</DialogDescription>
            </DialogHeader>
            <Input readOnly value={key ?? ''} className="font-mono" />
            <DialogFooter>
              <Button variant="outline" className="gap-2" onClick={copy}>
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? t('copied') : t('copy')}
              </Button>
              <Button onClick={() => setKey(null)}>{t('done')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

function SendersTab({ isAdmin }: { isAdmin: boolean }) {
  const t = useTranslations('admin.outreach.linkedin')
  const queryClient = useQueryClient()
  const onError = useErrorToast()
  const senders = useQuery({
    queryKey: [...QUEUE_KEY, 'senders'],
    queryFn: () => adminLinkedinService.listSenders(),
    refetchInterval: 60000,
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

      {isAdmin &&
        rows
          .filter(r => r.active)
          .map(r => (
            <AgentPanel key={r.id} s={r} checkedAt={senders.dataUpdatedAt} />
          ))}

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
  const myUserId = useAuthStore(state => state.user?.id)
  const canUseSales = useHasCapability('sales.tools')
  const [tab, setTab] = useState<TabKey>('today')
  const [replyTouch, setReplyTouch] = useState<LinkedinTouchItem | null>(null)
  const [pickedSenderId, setPickedSenderId] = useState<string>()

  const senders = useQuery({
    queryKey: [...QUEUE_KEY, 'senders'],
    queryFn: () => adminLinkedinService.listSenders(),
    enabled: canUseSales && isAdmin,
  })
  const activeSenders = (senders.data ?? []).filter(s => s.active)
  const senderId = isAdmin
    ? (activeSenders.find(s => s.id === pickedSenderId)?.id ??
      activeSenders.find(s => s.user.id === myUserId)?.id ??
      activeSenders[0]?.id)
    : undefined

  const queue = useQuery({
    queryKey: [...QUEUE_KEY, 'queue', senderId ?? 'self'],
    queryFn: () => adminLinkedinService.getQueue(senderId),
    enabled: canUseSales && !senders.isLoading,
    refetchInterval: 60000,
  })
  const overview = useQuery({
    queryKey: [...QUEUE_KEY, 'overview'],
    queryFn: () => adminLinkedinService.getOverview(),
    enabled: canUseSales,
    refetchInterval: 60000,
  })

  if (queue.isLoading || senders.isLoading) return <AdminPageLoader />
  const q = queue.data
  const hasSender = Boolean(q?.sender)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold text-[#062E25]">{t('title')}</h1>
        {isAdmin && activeSenders.length > 0 && (
          <div className="flex items-center gap-2">
            <Label htmlFor="linkedin-acting-sender">{t('colSender')}</Label>
            <Select value={senderId} onValueChange={setPickedSenderId}>
              <SelectTrigger id="linkedin-acting-sender" className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {activeSenders.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {`${s.user.firstName} ${s.user.lastName}`.trim()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
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
            {hasSender && q?.sender?.mode !== 'AUTO' && (
              <span className="tabular-nums">({q?.requests?.length ?? 0})</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="messages" className="px-4 py-2 text-base">
            {t('tabMessages')}
            {hasSender && (
              <span className="tabular-nums">
                (
                {q?.sender?.mode === 'AUTO'
                  ? (q?.replies?.length ?? 0)
                  : (q?.messages?.length ?? 0) + (q?.replies?.length ?? 0)}
                )
              </span>
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
          <TabsTrigger value="posts" className="px-4 py-2 text-base">
            {t('tabPosts')}
          </TabsTrigger>
          <TabsTrigger value="engagement" className="px-4 py-2 text-base">
            {t('tabEngagement')}
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
              {hasSender && q?.sender?.mode === 'AUTO' ? (
                <>
                  <p className="text-[#062E25]/75">
                    {t('agent.todayAutoHint')}
                  </p>
                  <AgentLog senderId={senderId} />
                </>
              ) : (
                <>
                  <p className="text-[#062E25]/75">{t('todayHint')}</p>
                  {hasSender ? (
                    <RequestsTab
                      items={q?.requests ?? []}
                      canRequest={
                        (q?.remaining ?? 0) > 0 && !q?.blockedByPending
                      }
                      senderId={senderId}
                    />
                  ) : (
                    <p className="text-[#062E25]/75">{t('noSenderHint')}</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="messages">
          <Card className="border-[#062E25]/10">
            <CardContent className="p-6">
              {hasSender ? (
                <>
                  <RepliesList
                    items={q?.replies ?? []}
                    onClassify={setReplyTouch}
                  />
                  <ExistingContactsList items={q?.existingContacts ?? []} />
                  {q?.sender?.mode === 'AUTO' ? (
                    <p className="text-[#062E25]/75">
                      {t('agent.messagesAutoHint')}
                    </p>
                  ) : (
                    <MessagesTab
                      items={q?.messages ?? []}
                      onReply={setReplyTouch}
                      senderId={senderId}
                    />
                  )}
                </>
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
                  senderId={senderId}
                  auto={q?.sender?.mode === 'AUTO'}
                />
              ) : (
                <p className="text-[#062E25]/75">{t('noSenderHint')}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="posts">
          <Card className="border-[#062E25]/10">
            <CardContent className="p-6">
              {hasSender && q?.sender ? (
                <PostsTab
                  senderId={senderId}
                  mode={effectiveMode(q.sender.postMode, q.sender.rehearsal)}
                />
              ) : (
                <p className="text-[#062E25]/75">{t('noSenderHint')}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="engagement">
          <Card className="border-[#062E25]/10">
            <CardContent className="p-6">
              {hasSender && q?.sender ? (
                <EngagementTab
                  senderId={senderId}
                  mode={effectiveMode(
                    q.sender.engagementMode,
                    q.sender.rehearsal
                  )}
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

      <ReplyDialog
        touch={replyTouch}
        onClose={() => setReplyTouch(null)}
        senderId={senderId}
      />
    </div>
  )
}
