'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useEffect, useMemo, useRef } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { adminOutreachService } from '@/services/admin-outreach.service'
import { outreachKpiService } from '@/services/outreach/kpi.service'

import { LeadCards } from './_components/lead-cards'
import {
  LeadFilterBar,
  LeadTabs,
  LeadToggles,
} from './_components/lead-list-controls'
import {
  LEAD_ASSIGNEES_QUERY_KEY,
  LEAD_LIST_QUERY_KEY,
  groupLeadsByState,
} from './_components/lead-list-model'
import {
  LeadEmptyState,
  LeadErrorState,
  LeadPagination,
} from './_components/lead-list-states'
import { LeadTable } from './_components/lead-table'
import { buildLeadListQuery, useLeadListFilters } from './use-lead-list-filters'

const ASSIGNEES_STALE_MS = 5 * 60 * 1000

export default function AdminOutreachLeadsPage() {
  const locale = useLocale()
  const t = useTranslations('admin.outreach.leads')
  const tw = useTranslations('admin.outreach.work')
  const resultsRef = useRef<HTMLDivElement>(null)
  const {
    filters,
    hydrated,
    searchInput,
    setSearchInput,
    moreOpen,
    toggleMore,
    setTab,
    setKind,
    setCriterion,
    setChannel,
    toggleAssignee,
    toggleDraftWaiting,
    toggleFollowUpDue,
    setPage,
    reset,
    hasActiveFilters,
  } = useLeadListFilters()

  const params = useMemo(() => buildLeadListQuery(filters), [filters])

  const query = useQuery({
    queryKey: [...LEAD_LIST_QUERY_KEY, params],
    queryFn: () => outreachKpiService.listLeadsPage(params),
    placeholderData: keepPreviousData,
    enabled: hydrated,
  })

  const assigneesQuery = useQuery({
    queryKey: LEAD_ASSIGNEES_QUERY_KEY,
    queryFn: () => adminOutreachService.listAssignees(),
    staleTime: ASSIGNEES_STALE_MS,
  })

  const data = query.data
  const summary = data?.summary
  const items = data?.items
  const groups = useMemo(() => groupLeadsByState(items ?? []), [items])
  const loading = !data && !query.isError
  const refreshing = query.isFetching && !loading
  const failedWithoutData = query.isError && !data

  useEffect(() => {
    if (query.isPlaceholderData || !data) return
    const pages = data.meta.totalPages
    if (pages > 0 && filters.page > pages) setPage(pages)
  }, [data, query.isPlaceholderData, filters.page, setPage])

  const assigneesFailed = assigneesQuery.isError
  useEffect(() => {
    if (assigneesFailed) toast.error(tw('errors.generic'))
  }, [assigneesFailed, tw])

  const handlePageChange = (page: number) => {
    setPage(page)
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex flex-col gap-3.5 text-base text-[#062E25]">
      <header className="mb-0.5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="text-[1.625rem] font-bold sm:text-[2rem]">
            {t('title')}
          </h1>
          {summary ? (
            <p className="text-lg text-[#062E25]/70">
              {t('headline', {
                waiting: summary.headline.waitingForAnswer,
                withUs: summary.headline.withUs,
                unassigned: summary.headline.withUsUnassigned,
              })}
            </p>
          ) : (
            <Skeleton className="h-7 w-[28rem] max-w-full" />
          )}
        </div>
        <Button
          variant="outline"
          asChild
          className="h-11 gap-2 border-[#062E25]/20 bg-white text-lg font-medium text-[#062E25] hover:bg-[#062E25]/5 max-sm:w-full"
        >
          <Link href={`/${locale}/admin/outreach`}>
            <ChevronLeft aria-hidden className="size-5" />
            {t('backToList')}
          </Link>
        </Button>
      </header>

      {data && !data.qrlPromotionConfigured ? (
        <p className="rounded-lg bg-amber-50 p-3 text-amber-800">
          {t('promotionMissing')}
        </p>
      ) : null}

      <LeadTabs value={filters.tab} summary={summary} onChange={setTab} />

      <LeadFilterBar
        filters={filters}
        summary={summary}
        searchInput={searchInput}
        moreOpen={moreOpen}
        hasActiveFilters={hasActiveFilters}
        onSearchChange={setSearchInput}
        onKindChange={setKind}
        onCriterionChange={setCriterion}
        onChannelChange={setChannel}
        onToggleMore={toggleMore}
        onReset={reset}
      />

      <LeadToggles
        filters={filters}
        summary={summary}
        onToggleAssignee={toggleAssignee}
        onToggleDraftWaiting={toggleDraftWaiting}
        onToggleFollowUpDue={toggleFollowUpDue}
      />

      <div
        ref={resultsRef}
        aria-busy={loading || refreshing}
        className="flex scroll-mt-4 flex-col gap-4"
      >
        {query.isError && data ? (
          <LeadErrorState
            compact
            retrying={query.isFetching}
            onRetry={() => query.refetch()}
          />
        ) : null}

        {failedWithoutData ? (
          <LeadErrorState
            retrying={query.isFetching}
            onRetry={() => query.refetch()}
          />
        ) : loading || (items?.length ?? 0) > 0 ? (
          <>
            <div
              className={cn(
                'flex flex-col gap-4 transition-opacity',
                refreshing && query.isPlaceholderData && 'opacity-60'
              )}
            >
              <LeadTable
                groups={groups}
                counts={summary?.byWorkState}
                loading={loading}
                assignees={assigneesQuery.data}
              />
              <LeadCards
                groups={groups}
                counts={summary?.byWorkState}
                loading={loading}
                assignees={assigneesQuery.data}
              />
            </div>
            {data ? (
              <LeadPagination
                page={data.meta.page}
                totalPages={data.meta.totalPages}
                total={data.meta.total}
                onPageChange={handlePageChange}
              />
            ) : null}
          </>
        ) : (
          <LeadEmptyState
            tab={filters.tab}
            filtered={hasActiveFilters}
            onReset={reset}
          />
        )}
      </div>
    </div>
  )
}
