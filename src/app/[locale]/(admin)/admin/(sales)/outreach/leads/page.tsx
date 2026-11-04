'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import { outreachKpiService } from '@/services/outreach/kpi.service'
import type { OutboundLeadListItem } from '@/types/outreach/kpi'
import {
  OUTBOUND_CHANNELS,
  OUTBOUND_LEAD_CRITERIA,
  OUTBOUND_LEAD_KINDS,
  type OutboundChannel,
  type OutboundLeadCriterion,
  type OutboundLeadKind,
} from '@/types/outreach/owner-first'
import {
  LEAD_LIST_STATES,
  SEARCH_MAX_LENGTH,
  buildLeadListQuery,
  useLeadListFilters,
  type LeadListState,
} from './use-lead-list-filters'

const ALL_VALUE = '__all__'
const COLUMN_COUNT = 5

const STATE_LABELS: Record<LeadListState, string> = {
  open: 'viewOpen',
  in_crm: 'viewInCrm',
  closed: 'viewClosed',
  all: 'viewAll',
}

const KIND_TONE: Record<OutboundLeadKind, string> = {
  QRL: 'bg-green-100 text-green-800',
  EIGENTUEMER_HINWEIS: 'bg-amber-100 text-amber-800',
  HOMEOWNER: 'bg-blue-100 text-blue-700',
}

function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString('de-CH')
}

function isPast(iso: string): boolean {
  return new Date(iso).getTime() < Date.now()
}

function presentLines(lines: (string | null | undefined)[]): string[] {
  return lines.filter((line): line is string => Boolean(line))
}

function contactLines(lead: OutboundLeadListItem): string[] {
  const { prospect, residentialLead } = lead
  const fromProspect = presentLines([
    prospect?.contactName,
    prospect?.contactEmail,
    prospect?.contactPhone,
  ])
  if (fromProspect.length > 0) return fromProspect
  return presentLines([
    residentialLead?.contactName,
    residentialLead?.contactEmail,
    residentialLead?.contactPhone,
  ])
}

function SubjectCell({ lead }: { lead: OutboundLeadListItem }) {
  const locale = useLocale()
  const { prospect, letterTarget } = lead

  if (prospect) {
    const place = presentLines([
      prospect.addressPostalCode,
      prospect.addressCity,
    ]).join(' ')
    return (
      <>
        <Link
          href={`/${locale}/admin/outreach/${prospect.id}`}
          title={prospect.companyName}
          className="block max-w-[175px] truncate font-medium text-blue-600 hover:underline"
        >
          {prospect.companyName}
        </Link>
        <p className="font-mono text-[#062E25]/60">{prospect.reference}</p>
        {place && <p className="text-[#062E25]/60">{place}</p>}
      </>
    )
  }

  const address = presentLines([
    presentLines([
      letterTarget?.addressStreet,
      letterTarget?.addressNumber,
    ]).join(' '),
    presentLines([
      letterTarget?.addressPostalCode,
      letterTarget?.addressCity,
    ]).join(' '),
  ])
  if (address.length > 0) {
    return (
      <>
        {address.map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </>
    )
  }

  return (
    <p className="max-w-[175px] whitespace-normal break-all font-mono">
      {lead.buildingKey}
    </p>
  )
}

function ContactCell({ lead }: { lead: OutboundLeadListItem }) {
  const t = useTranslations('admin.outreach.leads')
  const lines = contactLines(lead)

  if (lines.length === 0) {
    return <span className="text-[#062E25]/60">{t('noContact')}</span>
  }
  return (
    <>
      {lines.map((line, index) => (
        <p key={index} className="max-w-[170px] truncate" title={line}>
          {line}
        </p>
      ))}
    </>
  )
}

function LeadCell({ lead }: { lead: OutboundLeadListItem }) {
  const t = useTranslations('admin.outreach.leads')
  return (
    <>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 max-w-[190px]">
        <span
          className={cn(
            'inline-flex rounded-full px-2 py-0.5 font-medium',
            KIND_TONE[lead.kind]
          )}
        >
          {t(`kind.${lead.kind}`)}
        </span>
        <span
          className="tabular-nums text-[#062E25]/60"
          title={t('colQualified')}
        >
          {formatDay(lead.qualifiedAt)}
        </span>
      </div>
      <p className="mt-1">{t(`criterion.${lead.criterion}`)}</p>
      <p className="text-[#062E25]/60">{t(`channel.${lead.channel}`)}</p>
      {lead.note && (
        <p
          className="max-w-[190px] truncate text-[#062E25]/60"
          title={lead.note}
        >
          {lead.note}
        </p>
      )}
    </>
  )
}

function CrmState({ lead }: { lead: OutboundLeadListItem }) {
  const t = useTranslations('admin.outreach.leads')
  const locale = useLocale()
  const { commercialLead, residentialLead } = lead

  if (commercialLead) {
    return (
      <>
        <Link
          href={`/${locale}/admin/commercial-leads/${commercialLead.id}`}
          className="text-blue-600 hover:underline"
        >
          {commercialLead.reference}
        </Link>
        <StatusBadge status={commercialLead.status} className="text-base" />
      </>
    )
  }
  if (residentialLead) {
    return (
      <>
        <Link
          href={`/${locale}/admin/residential-leads/${residentialLead.id}`}
          className="text-blue-600 hover:underline"
        >
          {t('crmCalculator')}
        </Link>
        <StatusBadge status={residentialLead.status} className="text-base" />
      </>
    )
  }
  return (
    <>
      <p
        className={lead.kind === 'QRL' ? 'text-amber-800' : 'text-[#062E25]/60'}
      >
        {t('notInCrm')}
      </p>
      {lead.promotionNote && (
        <p className="max-w-[170px] whitespace-normal break-words text-[#062E25]/60">
          {lead.promotionNote}
        </p>
      )}
    </>
  )
}

function StatusCell({ lead }: { lead: OutboundLeadListItem }) {
  return (
    <div className="flex flex-col items-start gap-1">
      {lead.prospect && (
        <StatusBadge
          status={lead.prospect.status}
          namespace="admin.outreach.statusLabels"
          className="text-base"
        />
      )}
      <CrmState lead={lead} />
    </div>
  )
}

function OwnerCell({ lead }: { lead: OutboundLeadListItem }) {
  const t = useTranslations('admin.outreach.leads')
  const { prospect, commercialLead, residentialLead } = lead
  const owner =
    commercialLead?.assignedTo ??
    residentialLead?.assignedTo ??
    prospect?.assignedTo ??
    null
  const followUpAt =
    commercialLead?.nextFollowUpAt ??
    residentialLead?.nextFollowUp ??
    prospect?.nextActionAt ??
    null

  return (
    <div className="max-w-[140px] whitespace-normal">
      <p>{owner ? `${owner.firstName} ${owner.lastName}` : t('unassigned')}</p>
      {!followUpAt ? (
        <p className="text-[#062E25]/60">{t('noFollowUp')}</p>
      ) : isPast(followUpAt) ? (
        <p className="text-red-700">
          {t('followUpOverdue', { date: formatDay(followUpAt) })}
        </p>
      ) : (
        <p>{t('followUp', { date: formatDay(followUpAt) })}</p>
      )}
    </div>
  )
}

export default function AdminOutreachLeadsPage() {
  const locale = useLocale()
  const t = useTranslations('admin.outreach.leads')
  const tc = useTranslations('admin.common')
  const {
    filters,
    hydrated,
    searchInput,
    setSearchInput,
    setState,
    toggleKind,
    setCriterion,
    setChannel,
    setPage,
    reset,
    hasActiveFilters,
  } = useLeadListFilters()

  const params = buildLeadListQuery(filters)
  const { data, isPending, isFetching, isPlaceholderData, refetch } = useQuery({
    queryKey: ['admin', 'outreach', 'leads', 'list', params],
    queryFn: () => outreachKpiService.listLeadsPage(params),
    placeholderData: keepPreviousData,
    enabled: hydrated,
  })

  const meta = data?.meta
  useEffect(() => {
    if (!meta || isPlaceholderData) return
    if (meta.page > meta.totalPages) setPage(meta.totalPages)
  }, [meta, isPlaceholderData, setPage])

  const summary = data?.summary

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold text-[#062E25]">{t('title')}</h1>
        <Button variant="outline" asChild className="gap-2 text-base">
          <Link href={`/${locale}/admin/outreach`}>
            <ChevronLeft className="w-4 h-4" />
            {t('backToList')}
          </Link>
        </Button>
      </div>

      {data && !data.qrlPromotionConfigured && (
        <p className="mb-4 p-3 rounded bg-amber-50 text-amber-800">
          {t('promotionMissing')}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="inline-flex flex-wrap rounded-lg border border-[#062E25]/15 p-0.5 bg-white">
          {LEAD_LIST_STATES.map(state => (
            <button
              key={state}
              onClick={() => setState(state)}
              className={cn(
                'px-3 py-1.5 rounded-md',
                filters.state === state
                  ? 'bg-[#062E25] text-white'
                  : 'text-[#062E25]/70 hover:bg-[#062E25]/5'
              )}
            >
              {t(STATE_LABELS[state])}
              {summary && (
                <span className="ml-1.5 tabular-nums opacity-75">
                  {state === 'all' ? summary.total : summary.byState[state]}
                </span>
              )}
            </button>
          ))}
        </div>
        {summary &&
          OUTBOUND_LEAD_KINDS.map(kind => {
            const count = summary.byKind[kind] ?? 0
            if (count === 0 && filters.kind !== kind) return null
            return (
              <button
                key={kind}
                onClick={() => toggleKind(kind)}
                className={cn(
                  'inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#062E25]/5 hover:bg-[#062E25]/10',
                  filters.kind === kind && 'ring-2 ring-[#062E25]'
                )}
              >
                {t(`kind.${kind}`)}:{' '}
                <strong className="tabular-nums">{count}</strong>
              </button>
            )
          })}
      </div>

      <Card className="border-[#062E25]/10">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-wrap gap-3 mb-4">
            <Input
              className="max-w-sm text-base md:text-base"
              placeholder={t('searchPlaceholder')}
              value={searchInput}
              maxLength={SEARCH_MAX_LENGTH}
              onChange={e => setSearchInput(e.target.value)}
            />

            <Select
              value={filters.criterion ?? ALL_VALUE}
              onValueChange={v =>
                setCriterion(
                  v === ALL_VALUE ? null : (v as OutboundLeadCriterion)
                )
              }
            >
              <SelectTrigger className="w-56 text-base">
                <SelectValue placeholder={t('allCriteria')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE} className="text-base">
                  {t('allCriteria')}
                </SelectItem>
                {OUTBOUND_LEAD_CRITERIA.map(criterion => (
                  <SelectItem
                    key={criterion}
                    value={criterion}
                    className="text-base"
                  >
                    {t(`criterion.${criterion}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.channel ?? ALL_VALUE}
              onValueChange={v =>
                setChannel(v === ALL_VALUE ? null : (v as OutboundChannel))
              }
            >
              <SelectTrigger className="w-56 text-base">
                <SelectValue placeholder={t('allChannels')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_VALUE} className="text-base">
                  {t('allChannels')}
                </SelectItem>
                {OUTBOUND_CHANNELS.map(channel => (
                  <SelectItem
                    key={channel}
                    value={channel}
                    className="text-base"
                  >
                    {t(`channel.${channel}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="outline" className="text-base" onClick={reset}>
                {t('reset')}
              </Button>
            )}
          </div>

          {isPending ? (
            <AdminPageLoader />
          ) : !data ? (
            <div className="py-8 text-center">
              <p className="mb-3 text-red-700">{t('loadFailed')}</p>
              <Button
                variant="outline"
                className="text-base"
                disabled={isFetching}
                onClick={() => refetch()}
              >
                {t('retry')}
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <Table className="text-base min-w-[900px]">
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>{t('colSubject')}</TableHead>
                      <TableHead>{t('colContact')}</TableHead>
                      <TableHead>{t('colLead')}</TableHead>
                      <TableHead>{t('colStatus')}</TableHead>
                      <TableHead className="whitespace-normal">
                        {t('colOwner')}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.items.map(lead => (
                      <TableRow
                        key={lead.id}
                        className={cn(
                          lead.kind === 'QRL' &&
                            lead.state === 'open' &&
                            'bg-amber-50/50 hover:bg-amber-50'
                        )}
                      >
                        <TableCell className="align-top">
                          <SubjectCell lead={lead} />
                        </TableCell>
                        <TableCell className="align-top">
                          <ContactCell lead={lead} />
                        </TableCell>
                        <TableCell className="align-top">
                          <LeadCell lead={lead} />
                        </TableCell>
                        <TableCell className="align-top">
                          <StatusCell lead={lead} />
                        </TableCell>
                        <TableCell className="align-top">
                          <OwnerCell lead={lead} />
                        </TableCell>
                      </TableRow>
                    ))}
                    {data.items.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={COLUMN_COUNT}
                          className="text-center py-8 text-[#062E25]/75"
                        >
                          {t('empty')}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#062E25]/10">
                <p className="text-[#062E25]">
                  {t('total', { count: data.meta.total })}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={data.meta.page <= 1}
                    onClick={() => setPage(filters.page - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-[#062E25]">
                    {tc('page', {
                      page: data.meta.page,
                      totalPages: data.meta.totalPages,
                    })}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={data.meta.page >= data.meta.totalPages}
                    onClick={() => setPage(filters.page + 1)}
                  >
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
