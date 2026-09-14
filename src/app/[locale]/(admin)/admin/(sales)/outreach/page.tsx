'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { ArrowDown, ArrowUp, BarChart3, ChevronLeft, ChevronRight, Database, Inbox, Play, Plus } from 'lucide-react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { adminOutreachService } from '@/services/admin-outreach.service'
import {
  OUTBOUND_PROSPECT_STATUSES,
  type OutboundConnectorName,
  type OutboundProspectStatus,
  type OutreachListQuery,
  type OutreachSort,
} from '@/types/admin-outreach'
import { PROSPECT_TABLE_COLSPAN, ProspectRowCells, ProspectTableHeadCells } from './prospect-table'

const PAGE_SIZE = 25

const ACTIVE_STATUSES: OutboundProspectStatus[] = [
  'DISCOVERED', 'ROOF_QUALIFIED', 'CONTACT_FOUND', 'DRAFTED', 'CONTACTED',
  'FOLLOW_UP_DUE', 'REPLIED', 'SNOOZED',
]
const CLOSED_STATUSES: OutboundProspectStatus[] = [
  'SCREENED_OUT', 'CONVERTED', 'NOT_INTERESTED', 'OPTED_OUT', 'BOUNCED', 'EXPIRED',
]

type View = 'active' | 'closed' | 'all'

export default function AdminOutreachPage() {
  const locale = useLocale()
  const router = useRouter()
  const t = useTranslations('admin.outreach')
  const tc = useTranslations('admin.common')
  const ts = useTranslations('admin.statusLabels')
  const queryClient = useQueryClient()

  const [view, setView] = useState<View>('active')
  const [statusFilter, setStatusFilter] = useState<OutboundProspectStatus | undefined>(undefined)
  const [query, setQuery] = useState<Omit<OutreachListQuery, 'status'>>({
    page: 1, limit: PAGE_SIZE, sort: 'roofKwhYear', order: 'desc',
  })
  const [runFeedback, setRunFeedback] = useState<string | null>(null)

  const effectiveStatus: OutboundProspectStatus[] | undefined = statusFilter
    ? [statusFilter]
    : view === 'active'
      ? ACTIVE_STATUSES
      : view === 'closed'
        ? CLOSED_STATUSES
        : undefined

  const listQuery: OutreachListQuery = { ...query, status: effectiveStatus }

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'outreach', 'prospects', listQuery],
    queryFn: () => adminOutreachService.listProspects(listQuery),
    placeholderData: keepPreviousData,
  })

  const { data: stats } = useQuery({
    queryKey: ['admin', 'outreach', 'stats'],
    queryFn: () => adminOutreachService.getStats(),
  })

  const runMutation = useMutation({
    mutationFn: (connector: OutboundConnectorName) => adminOutreachService.runConnector(connector),
    onSuccess: (res) => setRunFeedback(res.started ? t('runStarted') : t('runInFlight')),
    onError: () => setRunFeedback(t('runFailed')),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'outreach'] })
    },
  })

  const updateFilter = <K extends keyof Omit<OutreachListQuery, 'status'>>(
    key: K,
    value: OutreachListQuery[K],
  ) => {
    setQuery((q) => ({ ...q, page: 1, [key]: value }))
  }

  const selectView = (v: View) => {
    setStatusFilter(undefined)
    setView(v)
    setQuery((q) => ({ ...q, page: 1 }))
  }

  const summary = data?.summary
  const activeCount = summary
    ? ACTIVE_STATUSES.reduce((n, s) => n + (summary.byStatus[s] ?? 0), 0)
    : 0
  const closedCount = summary
    ? CLOSED_STATUSES.reduce((n, s) => n + (summary.byStatus[s] ?? 0), 0)
    : 0
  const chipStatuses = view === 'closed' ? CLOSED_STATUSES : ACTIVE_STATUSES

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold text-[#062E25]">{t('title')}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Button className="gap-2 bg-[#062E25] hover:bg-[#062E25]/90"
                  onClick={() => router.push(`/${locale}/admin/outreach/queue`)}>
            <Inbox className="w-4 h-4" />{t('queuesButton')}
          </Button>
          <Button variant="outline" className="gap-2"
                  onClick={() => router.push(`/${locale}/admin/outreach/new`)}>
            <Plus className="w-4 h-4" />{t('newProspect')}
          </Button>
          <Button variant="outline" className="gap-2"
                  onClick={() => router.push(`/${locale}/admin/outreach/stats`)}>
            <BarChart3 className="w-4 h-4" />{t('statsButton')}
          </Button>
          <Button variant="outline" className="gap-2" disabled={runMutation.isPending}
                  onClick={() => runMutation.mutate('outbound-discovery')}>
            <Play className="w-4 h-4" />{t('runDiscovery')}
          </Button>
          <Button variant="outline" className="gap-2" disabled={runMutation.isPending}
                  onClick={() => runMutation.mutate('outbound-pv-import')}>
            <Database className="w-4 h-4" />{t('runPvImport')}
          </Button>
        </div>
      </div>

      {runFeedback && <p className="mb-3 text-[#062E25]">{runFeedback}</p>}

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="inline-flex rounded-lg border border-[#062E25]/15 p-0.5 bg-white">
          {(['active', 'closed', 'all'] as const).map((v) => (
            <button key={v} onClick={() => selectView(v)}
                    className={cn(
                      'px-3 py-1.5 rounded-md',
                      view === v && !statusFilter
                        ? 'bg-[#062E25] text-white'
                        : 'text-[#062E25]/70 hover:bg-[#062E25]/5',
                    )}>
              {t(v === 'active' ? 'viewActive' : v === 'closed' ? 'viewClosed' : 'viewAll')}
              {summary && (
                <span className="ml-1.5 tabular-nums opacity-75">
                  {v === 'active' ? activeCount : v === 'closed' ? closedCount : summary.total}
                </span>
              )}
            </button>
          ))}
        </div>
        {summary && chipStatuses.map((s) => {
          const n = summary.byStatus[s]
          if (!n) return null
          return (
            <button key={s}
                    onClick={() => {
                      setStatusFilter(statusFilter === s ? undefined : s)
                      setQuery((q) => ({ ...q, page: 1 }))
                    }}
                    className={cn(
                      'inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#062E25]/5 hover:bg-[#062E25]/10',
                      statusFilter === s && 'ring-2 ring-[#062E25]',
                    )}>
            {ts(s)}: <strong className="tabular-nums">{n}</strong>
            </button>
          )
        })}
      </div>

      <Card className="border-[#062E25]/10">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-wrap gap-3 mb-4">
            <Input className="max-w-xs text-base"
                   placeholder={t('searchPlaceholder')}
                   onChange={(e) => updateFilter('search', e.target.value || undefined)} />

            <Select value={query.municipalityBfs != null ? String(query.municipalityBfs) : '__all__'}
                    onValueChange={(v) => updateFilter('municipalityBfs', v === '__all__' ? undefined : Number(v))}>
              <SelectTrigger className="w-48 text-base"><SelectValue placeholder={t('allMunicipalities')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{t('allMunicipalities')}</SelectItem>
                {(stats?.byMunicipality ?? []).map((m) => (
                  <SelectItem key={m.municipalityBfs} value={String(m.municipalityBfs)}>
                    {t('municipalityOption', { bfs: m.municipalityBfs, count: m.count })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={query.sort ?? 'roofKwhYear'}
                    onValueChange={(v) => updateFilter('sort', v as OutreachSort)}>
              <SelectTrigger className="w-48 text-base"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="roofKwhYear">{t('sortRoofKwh')}</SelectItem>
                <SelectItem value="roofAreaM2">{t('sortRoofArea')}</SelectItem>
                <SelectItem value="createdAt">{t('sortCreatedAt')}</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline"
                    onClick={() => updateFilter('order', query.order === 'asc' ? 'desc' : 'asc')}>
              {query.order === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            </Button>
          </div>

          {isLoading ? <AdminPageLoader /> : data && (
            <>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <Table className="text-base min-w-[960px]">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <ProspectTableHeadCells />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.items.map((p) => (
                      <TableRow key={p.id}
                                className={cn(
                                  'cursor-pointer',
                                  p.status === 'REPLIED' && 'bg-purple-50/60 hover:bg-purple-50',
                                  p.emailSummary.hasUnsentDraft && 'bg-amber-50/50 hover:bg-amber-50',
                                )}
                                onClick={() => router.push(`/${locale}/admin/outreach/${p.id}`)}>
                        <ProspectRowCells p={p} />
                      </TableRow>
                    ))}
                    {data.items.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={PROSPECT_TABLE_COLSPAN} className="text-center py-8 text-[#062E25]/75">
                          {t('empty')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#062E25]/10">
                <p className="text-[#062E25]">{t('total', { count: data.meta.total })}</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm"
                          disabled={data.meta.page <= 1}
                          onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) - 1 }))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-[#062E25]">
                    {tc('page', { page: data.meta.page, totalPages: data.meta.totalPages })}
                  </span>
                  <Button variant="outline" size="sm"
                          disabled={data.meta.page >= data.meta.totalPages}
                          onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) + 1 }))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
