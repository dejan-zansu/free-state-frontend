'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { ArrowLeft, Phone } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { PROSPECT_TABLE_COLSPAN, ProspectRowCells, ProspectTableHeadCells } from '../prospect-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { adminOutreachService } from '@/services/admin-outreach.service'
import { outreachKpiService } from '@/services/outreach/kpi.service'
import { CallOutcomeDialog } from '../_components/owner-first/LogActivityControl'
import type {
  OutboundProspectListItem,
  OutboundProspectStatus,
  OutreachSort,
} from '@/types/admin-outreach'

const QUEUE_LIMIT = 100

type QueueTabKey = 'drafts' | 'followups' | 'replies' | 'calls'

type QueueTab = {
  key: Exclude<QueueTabKey, 'calls'>
  labelKey: 'queue.tabDrafts' | 'queue.tabFollowUps' | 'queue.tabReplies'
  emptyKey: 'queue.emptyDrafts' | 'queue.emptyFollowUps' | 'queue.emptyReplies'
  statuses: OutboundProspectStatus[]
  sort: OutreachSort
  order: 'asc' | 'desc'
}

// Each tab sorts by the date that makes it a queue: drafts in the order
// autosend takes them (referrals first, then roof yield), follow-ups by the
// longest silence since the last touch, replies newest first (the owner
// reads the tab like an inbox, 23.09.2026).
const QUEUE_TABS: QueueTab[] = [
  { key: 'drafts',    labelKey: 'queue.tabDrafts',    emptyKey: 'queue.emptyDrafts',    statuses: ['DRAFTED', 'FOLLOW_UP_DUE'], sort: 'sendOrder',   order: 'desc' },
  { key: 'followups', labelKey: 'queue.tabFollowUps', emptyKey: 'queue.emptyFollowUps', statuses: ['FOLLOW_UP_DUE'],            sort: 'lastSentAt',  order: 'asc' },
  { key: 'replies',   labelKey: 'queue.tabReplies',   emptyKey: 'queue.emptyReplies',   statuses: ['REPLIED'],                  sort: 'lastReplyAt', order: 'desc' },
]

function useQueueList(tab: QueueTab) {
  return useQuery({
    queryKey: ['admin', 'outreach', 'queue', tab.key],
    queryFn: () => adminOutreachService.listProspects({
      page: 1, limit: QUEUE_LIMIT, status: tab.statuses, sort: tab.sort, order: tab.order,
    }),
  })
}

function tabCount(key: Exclude<QueueTabKey, 'calls'>, byStatus: Partial<Record<OutboundProspectStatus, number>>) {
  if (key === 'drafts') return (byStatus.DRAFTED ?? 0) + (byStatus.FOLLOW_UP_DUE ?? 0)
  if (key === 'followups') return byStatus.FOLLOW_UP_DUE ?? 0
  return byStatus.REPLIED ?? 0
}

const RUN_STATE_KEY = {
  OK: 'queue.statusRunOk',
  ERROR: 'queue.statusRunError',
  RUNNING: 'queue.statusRunRunning',
} as const

function formatDay(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'
}

function formatRunTime(iso: string) {
  const d = new Date(iso)
  const day = d.toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const time = d.toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' })
  return `${day} ${time}`
}

export default function AdminOutreachQueuePage() {
  const locale = useLocale()
  const router = useRouter()
  const t = useTranslations('admin.outreach')
  const tf = useTranslations('admin.outreach.callFlag')

  const [activeTab, setActiveTab] = useState<QueueTabKey>('drafts')
  const [focusIndex, setFocusIndex] = useState(-1)
  // W1-9b: cold calls only to numbers listed without the star.
  const [listedOnly, setListedOnly] = useState(false)
  const [callTarget, setCallTarget] = useState<{ id: string; companyName: string } | null>(null)

  const drafts = useQueueList(QUEUE_TABS[0])
  const followups = useQueueList(QUEUE_TABS[1])
  const replies = useQueueList(QUEUE_TABS[2])
  const calls = useQuery({
    queryKey: ['admin', 'outreach', 'queue', 'calls', listedOnly],
    queryFn: () => adminOutreachService.listCallQueue({ listedOnly }),
  })
  // Letters whose follow-up call is due (letter dispatch sets callDueAt).
  const callDueLetters = useQuery({
    queryKey: ['admin', 'outreach', 'queue', 'call-due-letters', listedOnly],
    queryFn: () => outreachKpiService.listCallDueLetters({ listedOnly }),
  })
  const queueStatus = useQuery({
    queryKey: ['admin', 'outreach', 'queue', 'status'],
    queryFn: () => adminOutreachService.getQueueStatus(),
    refetchInterval: 60_000,
  })
  const overview = queueStatus.data

  const queries = { drafts, followups, replies }
  const byStatus =
    drafts.data?.summary.byStatus
    ?? followups.data?.summary.byStatus
    ?? replies.data?.summary.byStatus

  const callItems = calls.data?.items ?? []
  const activeItems = activeTab === 'calls' ? callItems : (queries[activeTab].data?.items ?? [])

  const dueLetters = callDueLetters.data?.items ?? []

  const openProspect = (id: string) => {
    router.push(`/${locale}/admin/outreach/${id}`)
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) return

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (activeItems.length === 0) return
        e.preventDefault()
        setFocusIndex((i) => {
          if (e.key === 'ArrowDown') return Math.min(i + 1, activeItems.length - 1)
          return Math.max(i - 1, 0)
        })
      } else if (e.key === 'Enter') {
        if (focusIndex >= 0 && focusIndex < activeItems.length) {
          e.preventDefault()
          router.push(`/${locale}/admin/outreach/${activeItems[focusIndex].id}`)
        }
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeItems, focusIndex, locale, router])

  useEffect(() => {
    if (focusIndex < 0) return
    document
      .querySelector(`[data-queue-row="${activeTab}-${focusIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [focusIndex, activeTab])

  const renderRows = (tabKey: QueueTabKey, items: OutboundProspectListItem[], emptyText: string) => (
    <TableBody>
      {items.map((p, idx) => (
        <TableRow
          key={p.id}
          data-queue-row={`${tabKey}-${idx}`}
          className={cn(
            'cursor-pointer',
            activeTab === tabKey && focusIndex === idx && 'bg-[#062E25]/10 hover:bg-[#062E25]/10'
          )}
          onClick={() => openProspect(p.id)}
        >
          <ProspectRowCells p={p} />
          {tabKey === 'calls' && (
            <>
              <TableCell className="align-top whitespace-nowrap">
                {p.contactPhone ? (
                  <a
                    href={`tel:${p.contactPhone.replace(/\s/g, '')}`}
                    className="tabular-nums text-[#062E25] underline underline-offset-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {p.contactPhone}
                  </a>
                ) : (
                  <span className="text-[#062E25]/40">-</span>
                )}
              </TableCell>
              <TableCell className="align-top">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 whitespace-nowrap"
                  onClick={(e) => {
                    e.stopPropagation()
                    setCallTarget({ id: p.id, companyName: p.companyName })
                  }}
                >
                  <Phone className="w-4 h-4" />{t('queue.logCall')}
                </Button>
              </TableCell>
            </>
          )}
        </TableRow>
      ))}
      {items.length === 0 && (
        <TableRow>
          <TableCell
            colSpan={tabKey === 'calls' ? PROSPECT_TABLE_COLSPAN + 2 : PROSPECT_TABLE_COLSPAN}
            className="text-center py-8 text-[#062E25]/75"
          >
            {emptyText}
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  )

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold text-[#062E25]">{t('queue.title')}</h1>
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => router.push(`/${locale}/admin/outreach`)}
        >
          <ArrowLeft className="w-4 h-4" />{t('queue.backToList')}
        </Button>
      </div>

      <p className="mb-4 text-[#062E25]/75">{t('queue.keyboardHint')}</p>

      {overview && (
        <Card className="border-[#062E25]/10 mb-4">
          <CardContent className="p-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-[#062E25]/60">{t('queue.statusSentToday')}</p>
              <p className="font-medium tabular-nums">{overview.sentToday} / {overview.dailyCap}</p>
            </div>
            <div>
              <p className="text-[#062E25]/60">{t('queue.statusLastRun')}</p>
              <p className="font-medium tabular-nums">
                {overview.lastAutosend
                  ? `${formatRunTime(overview.lastAutosend.startedAt)} (${t(RUN_STATE_KEY[overview.lastAutosend.status])})`
                  : t('queue.statusNoRun')}
              </p>
              {overview.lastAutosend?.status === 'ERROR' && overview.lastAutosend.error && (
                <p className="text-red-600 break-words">{overview.lastAutosend.error}</p>
              )}
            </div>
            <div>
              <p className="text-[#062E25]/60">{t('queue.statusDrafts')}</p>
              <p className="font-medium tabular-nums">
                {t('queue.statusDraftsValue', {
                  waiting: overview.drafts.waiting,
                  gated: overview.drafts.gated,
                  replies: overview.drafts.replies,
                })}
              </p>
            </div>
            <div>
              <p className="text-[#062E25]/60">{t('queue.statusRepliesOpen')}</p>
              <p className="font-medium tabular-nums">{overview.repliesOpen}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v as QueueTabKey)
          setFocusIndex(-1)
        }}
      >
        <TabsList className="h-auto">
          {QUEUE_TABS.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key} className="px-4 py-2 text-base">
              {t(tab.labelKey)}
              {byStatus && (
                <span className="tabular-nums">({tabCount(tab.key, byStatus)})</span>
              )}
            </TabsTrigger>
          ))}
          <TabsTrigger value="calls" className="px-4 py-2 text-base">
            {t('queue.tabCalls')}
            {calls.data && (
              <span className="tabular-nums">({callItems.length})</span>
            )}
          </TabsTrigger>
        </TabsList>

        {QUEUE_TABS.map((tab) => {
          const q = queries[tab.key]
          return (
            <TabsContent key={tab.key} value={tab.key}>
              <Card className="border-[#062E25]/10">
                <CardContent className="p-6">
                  {q.isLoading ? <AdminPageLoader /> : (
                    <>
                      <div className="overflow-x-auto">
                        <Table className="text-base min-w-[960px]">
                          <TableHeader>
                            <TableRow className="hover:bg-transparent">
                              <ProspectTableHeadCells />
                            </TableRow>
                          </TableHeader>
                          {renderRows(tab.key, q.data?.items ?? [], t(tab.emptyKey))}
                        </Table>
                      </div>
                      {q.data && q.data.meta.total > 0 && (
                        <p className="mt-4 pt-4 border-t border-[#062E25]/10 text-[#062E25]">
                          {t('total', { count: q.data.meta.total })}
                        </p>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )
        })}

        <TabsContent value="calls">
          <Card className="border-[#062E25]/10">
            <CardContent className="p-6">
              <label className="flex items-center gap-2 mb-4">
                <Checkbox checked={listedOnly} onCheckedChange={(v) => setListedOnly(v === true)} />
                {tf('queueListedOnly')}
              </label>
              {calls.isLoading ? <AdminPageLoader /> : (
                <>
                  <div className="overflow-x-auto">
                    <Table className="text-base min-w-[1100px]">
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <ProspectTableHeadCells />
                          <TableHead className="whitespace-nowrap">{t('queue.phone')}</TableHead>
                          <TableHead />
                        </TableRow>
                      </TableHeader>
                      {renderRows('calls', callItems, t('queue.emptyCalls'))}
                    </Table>
                  </div>
                  {callItems.length > 0 && (
                    <p className="mt-4 pt-4 border-t border-[#062E25]/10 text-[#062E25]">
                      {t('total', { count: callItems.length })}
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-[#062E25]/10 mt-4">
            <CardContent className="p-6">
              <h3 className="font-semibold text-[#062E25]/75 uppercase tracking-wide mb-3">{tf('lettersTitle')}</h3>
              {callDueLetters.isLoading ? <AdminPageLoader /> : dueLetters.length === 0 ? (
                <p className="text-[#062E25]/75">{tf('lettersEmpty')}</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table className="text-base min-w-[900px]">
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>{tf('colCompany')}</TableHead>
                        <TableHead>{tf('colLetter')}</TableHead>
                        <TableHead className="whitespace-nowrap">{tf('colSent')}</TableHead>
                        <TableHead className="whitespace-nowrap">{tf('colDue')}</TableHead>
                        <TableHead className="whitespace-nowrap">{t('queue.phone')}</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dueLetters.map((letter) => (
                        <TableRow key={letter.id} className="cursor-pointer" onClick={() => openProspect(letter.prospect.id)}>
                          <TableCell className="align-top">
                            <p className="font-medium">{letter.prospect.companyName}</p>
                            <p className="text-[#062E25]/75">
                              {[letter.prospect.addressStreet, letter.prospect.addressNumber].filter(Boolean).join(' ')}
                              {letter.prospect.addressCity ? `, ${letter.prospect.addressCity}` : ''}
                            </p>
                          </TableCell>
                          <TableCell className="align-top">
                            <p>{letter.recipientName}</p>
                            <p className="font-mono text-[#062E25]/75">{letter.templateKey}</p>
                          </TableCell>
                          <TableCell className="align-top tabular-nums whitespace-nowrap">
                            {formatDay(letter.sentAt ?? letter.submittedAt)}
                          </TableCell>
                          <TableCell className="align-top tabular-nums whitespace-nowrap">{formatDay(letter.callDueAt)}</TableCell>
                          <TableCell className="align-top whitespace-nowrap">
                            {letter.prospect.contactPhone ? (
                              <a
                                href={`tel:${letter.prospect.contactPhone.replace(/\s/g, '')}`}
                                className="tabular-nums text-[#062E25] underline underline-offset-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {letter.prospect.contactPhone}
                              </a>
                            ) : (
                              <span className="text-[#062E25]/40">-</span>
                            )}
                          </TableCell>
                          <TableCell className="align-top">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2 whitespace-nowrap"
                              onClick={(e) => {
                                e.stopPropagation()
                                setCallTarget({ id: letter.prospect.id, companyName: letter.prospect.companyName })
                              }}
                            >
                              <Phone className="w-4 h-4" />{t('queue.logCall')}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {callTarget && (
        <CallOutcomeDialog
          prospectId={callTarget.id}
          companyName={callTarget.companyName}
          open
          onOpenChange={(open) => { if (!open) setCallTarget(null) }}
        />
      )}
    </div>
  )
}
