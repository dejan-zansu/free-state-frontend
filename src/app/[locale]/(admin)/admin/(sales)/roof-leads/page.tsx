'use client'

import { useMutation, useQuery } from '@tanstack/react-query'
import {
  ArrowDown,
  ArrowUp,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useState } from 'react'

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
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAdminQuery } from '@/hooks/use-admin-query'
import { CANTON_CODES } from '@/lib/address/swiss-address'
import { useHasCapability } from '@/lib/capabilities'
import { adminRoofLeadService } from '@/services/admin-roof-lead.service'
import type { RoofLeadListItem } from '@/types/roof-lead'

import { RoofLeadDetailPanel } from './_components/roof-lead-detail-panel'
import { RoofRequestsTab } from './_components/roof-requests-tab'
import {
  formatNumber,
  ROOF_LEAD_FORMS,
  ROOF_LEAD_PV_STATES,
  ROOF_LEAD_SEGMENTS,
  ROOF_LEAD_STATUS_CLASS,
  ROOF_LEAD_STATUSES,
  ROOF_LEADS_QUERY_KEY,
  roofLeadAddress,
  roofLeadPvDetail,
  roofLeadYear,
} from './_components/roof-lead-format'

const ALL = '__all__'
const EXPORT_MAX_ROWS = 5000
const COLUMN_COUNT = 9
const CELL_CLASS = 'align-top text-base whitespace-normal'
const CHIP_CLASS =
  'inline-flex items-center gap-1 px-3 py-1 rounded-full text-base bg-[#062E25]/5 text-[#062E25]'

function FilterSelect({
  value,
  allLabel,
  options,
  onChange,
}: {
  value: string | undefined
  allLabel: string
  options: { value: string; label: string }[]
  onChange: (value: string | undefined) => void
}) {
  return (
    <Select
      value={value ?? ALL}
      onValueChange={next => onChange(next === ALL ? undefined : next)}
    >
      <SelectTrigger aria-label={allLabel} className="w-52 text-base">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL} className="text-base">
          {allLabel}
        </SelectItem>
        {options.map(option => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="text-base"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function ContactCell({ lead }: { lead: RoofLeadListItem }) {
  const t = useTranslations('admin.roofLeads')
  const lines = [lead.contactName, lead.contactEmail, lead.contactPhone].filter(
    Boolean
  )
  const shown = lines.length > 0 ? lines : [lead.ownerName ?? '-']
  const blockKey = `contactBlock.${lead.contactBlock}`

  return (
    <div className="space-y-1">
      {shown.map(line => (
        <p key={line} className="break-words">
          {line}
        </p>
      ))}
      {lead.contactBlock && (
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-base ${
            lead.contactBlock === 'never'
              ? 'bg-red-100 text-red-700'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {t.has(blockKey) ? t(blockKey) : lead.contactBlock}
        </span>
      )}
    </div>
  )
}

export default function AdminRoofLeadsPage() {
  const locale = useLocale()
  const t = useTranslations('admin.roofLeads')
  const tc = useTranslations('admin.common')
  const canOpenContacts = useHasCapability('users.manage')

  const {
    data,
    isLoading,
    error,
    page,
    totalPages,
    total,
    setPage,
    setSearch,
    setFilter,
    filters,
  } = useAdminQuery<RoofLeadListItem>(
    'roof-leads',
    adminRoofLeadService.list.bind(adminRoofLeadService)
  )

  const { data: summary } = useQuery({
    queryKey: [...ROOF_LEADS_QUERY_KEY, 'summary'],
    queryFn: () => adminRoofLeadService.summary(),
  })

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')

  const exportMutation = useMutation({
    mutationFn: () =>
      adminRoofLeadService.downloadCsv({
        ...filters,
        search: searchText || undefined,
      }),
  })

  const handleSearch = (value: string) => {
    const trimmed = value.trim()
    setSearchText(trimmed)
    setSearch(trimmed)
  }

  const handleMinScore = (value: string) => {
    const parsed = Number.parseInt(value, 10)
    setFilter('minScore', Number.isNaN(parsed) ? undefined : String(parsed))
  }

  const ascending = filters.sort === 'score'

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-[#062E25]">{t('title')}</h1>
        <div className="flex flex-wrap items-center gap-3">
          {canOpenContacts && (
            <Button variant="outline" className="text-base" asChild>
              <Link
                href={`/${locale}/admin/contacts?entityType=roof_renovation`}
              >
                {t('contactRequests')}
              </Link>
            </Button>
          )}
          <Button
            variant="outline"
            className="gap-2 text-base"
            disabled={exportMutation.isPending}
            onClick={() => exportMutation.mutate()}
          >
            <Download className="w-4 h-4" />
            {t('exportCsv')}
          </Button>
        </div>
      </div>

      {exportMutation.isError && (
        <p className="mb-4 text-base text-red-700" role="alert">
          {t('exportFailed')}
        </p>
      )}

      {exportMutation.isSuccess && total > EXPORT_MAX_ROWS && (
        <p className="mb-4 text-base text-[#062E25]" role="status">
          {t('exportCapped', { max: EXPORT_MAX_ROWS, total })}
        </p>
      )}

      {summary && (
        <div className="space-y-2 mb-4">
          <div className="flex flex-wrap gap-2">
            {ROOF_LEAD_STATUSES.filter(status => summary.byStatus[status]).map(
              status => (
                <span key={status} className={CHIP_CLASS}>
                  {t(`statusLabels.${status}`)}
                  <strong>{formatNumber(summary.byStatus[status] ?? 0)}</strong>
                </span>
              )
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {ROOF_LEAD_SEGMENTS.filter(
              segment => summary.bySegment[segment]
            ).map(segment => (
              <span key={segment} className={CHIP_CLASS}>
                {t(`segment.${segment}`)}
                <strong>{formatNumber(summary.bySegment[segment] ?? 0)}</strong>
              </span>
            ))}
          </div>
        </div>
      )}

      <Tabs defaultValue="leads">
        <TabsList className="mb-4">
          <TabsTrigger value="leads" className="text-base">
            {t('tabs.leads')}
          </TabsTrigger>
          <TabsTrigger value="requests" className="text-base">
            {t('tabs.requests')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="requests">
          <Card className="border-[#062E25]/10">
            <CardContent className="p-6">
              <RoofRequestsTab onOpenLead={setSelectedId} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="leads">
          <Card className="border-[#062E25]/10">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <Input
                  placeholder={t('searchPlaceholder')}
                  aria-label={t('searchPlaceholder')}
                  maxLength={200}
                  className="max-w-xs md:text-base"
                  onChange={e => handleSearch(e.target.value)}
                />
                <FilterSelect
                  value={filters.status}
                  allLabel={t('allStatuses')}
                  options={ROOF_LEAD_STATUSES.map(value => ({
                    value,
                    label: t(`statusLabels.${value}`),
                  }))}
                  onChange={value => setFilter('status', value)}
                />
                <FilterSelect
                  value={filters.segment}
                  allLabel={t('allSegments')}
                  options={ROOF_LEAD_SEGMENTS.map(value => ({
                    value,
                    label: t(`segment.${value}`),
                  }))}
                  onChange={value => setFilter('segment', value)}
                />
                <FilterSelect
                  value={filters.canton}
                  allLabel={t('allCantons')}
                  options={CANTON_CODES.map(value => ({ value, label: value }))}
                  onChange={value => setFilter('canton', value)}
                />
                <FilterSelect
                  value={filters.roofForm}
                  allLabel={t('allRoofForms')}
                  options={ROOF_LEAD_FORMS.map(value => ({
                    value,
                    label: t(`form.${value}`),
                  }))}
                  onChange={value => setFilter('roofForm', value)}
                />
                <FilterSelect
                  value={filters.pvState}
                  allLabel={t('allPvStates')}
                  options={ROOF_LEAD_PV_STATES.map(value => ({
                    value,
                    label: t(`pv.${value}`),
                  }))}
                  onChange={value => setFilter('pvState', value)}
                />
                <Input
                  type="number"
                  step={1}
                  placeholder={t('minScore')}
                  aria-label={t('minScore')}
                  className="w-40 md:text-base"
                  onChange={e => handleMinScore(e.target.value)}
                />
              </div>

              {isLoading ? (
                <AdminPageLoader />
              ) : error ? (
                <p className="text-base text-[#062E25]" role="alert">
                  {tc('failedToLoad')}
                </p>
              ) : (
                <>
                  <Table className="text-base">
                    <TableHeader>
                      <TableRow>
                        <TableHead>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 font-medium"
                            aria-label={t(
                              ascending ? 'sortScoreDesc' : 'sortScoreAsc'
                            )}
                            onClick={() =>
                              setFilter('sort', ascending ? undefined : 'score')
                            }
                          >
                            {t('colScore')}
                            {ascending ? (
                              <ArrowUp className="h-4 w-4" />
                            ) : (
                              <ArrowDown className="h-4 w-4" />
                            )}
                          </button>
                        </TableHead>
                        <TableHead>{t('colSegment')}</TableHead>
                        <TableHead>{t('colAddress')}</TableHead>
                        <TableHead>{t('colYear')}</TableHead>
                        <TableHead>{t('colRoof')}</TableHead>
                        <TableHead>{t('colPv')}</TableHead>
                        <TableHead>{t('colImagery')}</TableHead>
                        <TableHead>{t('colContact')}</TableHead>
                        <TableHead>{t('colStatus')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map(lead => (
                        <TableRow
                          key={lead.id}
                          className="cursor-pointer"
                          onClick={() => setSelectedId(lead.id)}
                        >
                          <TableCell className={`${CELL_CLASS} font-semibold`}>
                            {lead.score}
                          </TableCell>
                          <TableCell className={CELL_CLASS}>
                            {t(`segment.${lead.segment}`)}
                          </TableCell>
                          <TableCell className={CELL_CLASS}>
                            <button
                              type="button"
                              className="text-left font-medium text-[#062E25] hover:underline"
                            >
                              {lead.companyName && (
                                <span className="block">
                                  {lead.companyName}
                                </span>
                              )}
                              <span className="block">
                                {roofLeadAddress(lead) || lead.key}
                              </span>
                            </button>
                          </TableCell>
                          <TableCell className={CELL_CLASS}>
                            {roofLeadYear(lead)}
                          </TableCell>
                          <TableCell className={CELL_CLASS}>
                            <p>{t(`form.${lead.roofForm}`)}</p>
                            {lead.roofAreaM2 !== null && (
                              <p>{formatNumber(lead.roofAreaM2)} m²</p>
                            )}
                          </TableCell>
                          <TableCell className={CELL_CLASS}>
                            <p className="whitespace-nowrap">
                              {t(`pv.${lead.pvState}`)}
                            </p>
                            {roofLeadPvDetail(lead) && (
                              <p className="whitespace-nowrap">
                                {roofLeadPvDetail(lead)}
                              </p>
                            )}
                          </TableCell>
                          <TableCell className={CELL_CLASS}>
                            {lead.imageryVerdict
                              ? t(`imagery.${lead.imageryVerdict}`)
                              : '-'}
                          </TableCell>
                          <TableCell className={CELL_CLASS}>
                            <ContactCell lead={lead} />
                          </TableCell>
                          <TableCell className={CELL_CLASS}>
                            <StatusBadge
                              status={lead.status}
                              namespace="admin.roofLeads.statusLabels"
                              className={`text-base ${ROOF_LEAD_STATUS_CLASS[lead.status] ?? ''}`}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                      {data.length === 0 && (
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

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#062E25]/10">
                    <p className="text-base text-[#062E25]/75">
                      {t('total', { count: total })}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        aria-label={t('previousPage')}
                        disabled={page <= 1}
                        onClick={() => setPage(page - 1)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-base text-[#062E25]/75">
                        {tc('page', { page, totalPages })}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        aria-label={t('nextPage')}
                        disabled={page >= totalPages}
                        onClick={() => setPage(page + 1)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Sheet
        open={selectedId !== null}
        onOpenChange={open => {
          if (!open) setSelectedId(null)
        }}
      >
        <SheetContent
          side="right"
          className="w-full overflow-y-auto p-6 sm:max-w-xl"
          aria-describedby={undefined}
        >
          {selectedId && (
            <RoofLeadDetailPanel key={selectedId} id={selectedId} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
