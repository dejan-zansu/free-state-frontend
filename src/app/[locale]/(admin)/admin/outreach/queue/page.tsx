'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { ArrowLeft, Phone } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { PROSPECT_TABLE_COLSPAN, ProspectRowCells, ProspectTableHeadCells } from '../prospect-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { adminOutreachService } from '@/services/admin-outreach.service'
import type {
  OutboundProspectListItem,
  OutboundProspectStatus,
} from '@/types/admin-outreach'

const QUEUE_LIMIT = 100

type QueueTabKey = 'drafts' | 'followups' | 'replies' | 'calls'

const QUEUE_TABS: {
  key: Exclude<QueueTabKey, 'calls'>
  labelKey: 'queue.tabDrafts' | 'queue.tabFollowUps' | 'queue.tabReplies'
  emptyKey: 'queue.emptyDrafts' | 'queue.emptyFollowUps' | 'queue.emptyReplies'
  statuses: OutboundProspectStatus[]
}[] = [
  { key: 'drafts',    labelKey: 'queue.tabDrafts',    emptyKey: 'queue.emptyDrafts',    statuses: ['DRAFTED', 'FOLLOW_UP_DUE'] },
  { key: 'followups', labelKey: 'queue.tabFollowUps', emptyKey: 'queue.emptyFollowUps', statuses: ['FOLLOW_UP_DUE'] },
  { key: 'replies',   labelKey: 'queue.tabReplies',   emptyKey: 'queue.emptyReplies',   statuses: ['REPLIED'] },
]

function useQueueList(key: QueueTabKey, statuses: OutboundProspectStatus[]) {
  return useQuery({
    queryKey: ['admin', 'outreach', 'queue', key],
    queryFn: () => adminOutreachService.listProspects({
      page: 1, limit: QUEUE_LIMIT, status: statuses, sort: 'createdAt', order: 'desc',
    }),
  })
}

function tabCount(key: Exclude<QueueTabKey, 'calls'>, byStatus: Partial<Record<OutboundProspectStatus, number>>) {
  if (key === 'drafts') return (byStatus.DRAFTED ?? 0) + (byStatus.FOLLOW_UP_DUE ?? 0)
  if (key === 'followups') return byStatus.FOLLOW_UP_DUE ?? 0
  return byStatus.REPLIED ?? 0
}

export default function AdminOutreachQueuePage() {
  const locale = useLocale()
  const router = useRouter()
  const queryClient = useQueryClient()
  const t = useTranslations('admin.outreach')

  const [activeTab, setActiveTab] = useState<QueueTabKey>('drafts')
  const [focusIndex, setFocusIndex] = useState(-1)

  const drafts = useQueueList('drafts', QUEUE_TABS[0].statuses)
  const followups = useQueueList('followups', QUEUE_TABS[1].statuses)
  const replies = useQueueList('replies', QUEUE_TABS[2].statuses)
  const calls = useQuery({
    queryKey: ['admin', 'outreach', 'queue', 'calls'],
    queryFn: () => adminOutreachService.listCallQueue(),
  })

  const queries = { drafts, followups, replies }
  const byStatus =
    drafts.data?.summary.byStatus
    ?? followups.data?.summary.byStatus
    ?? replies.data?.summary.byStatus

  const callItems = calls.data?.items ?? []
  const activeItems = activeTab === 'calls' ? callItems : (queries[activeTab].data?.items ?? [])

  const logCallMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note?: string }) =>
      adminOutreachService.logActivity(id, { type: 'CALL_LOGGED', ...(note ? { note } : {}) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'outreach'] })
    },
  })

  const logCall = (id: string) => {
    const note = window.prompt(t('queue.callNotePrompt'))
    if (note === null) return
    logCallMutation.mutate({ id, note: note.trim() || undefined })
  }

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
                  disabled={logCallMutation.isPending}
                  onClick={(e) => {
                    e.stopPropagation()
                    logCall(p.id)
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
