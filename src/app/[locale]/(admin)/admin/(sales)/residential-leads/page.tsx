'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useEffect, useMemo, useRef } from 'react'

import { salesLeadService } from '@/services/sales-lead.service'
import { cn } from '@/lib/utils'

import { FilterBar } from './_components/filter-bar'
import { FocusToggles } from './_components/focus-toggles'
import { LeadCards } from './_components/lead-cards'
import { LeadTable } from './_components/lead-table'
import { EmptyState, ErrorState } from './_components/list-states'
import { PaginationBar } from './_components/pagination-bar'
import { StatusChips } from './_components/status-chips'
import { buildListQuery, useLeadFilters } from './_components/use-lead-filters'

export default function ResidentialLeadsPage() {
  const t = useTranslations('admin.salesLeads.list')
  const resultsRef = useRef<HTMLDivElement>(null)

  const {
    filters,
    hydrated,
    searchInput,
    setSearchInput,
    clearSearch,
    setStatus,
    toggleAssignee,
    toggleFollowUpDue,
    toggleOfferRequested,
    setSource,
    setSort,
    setIncludeInternal,
    setPage,
    reset,
    hasActiveFilters,
  } = useLeadFilters()

  const params = useMemo(() => buildListQuery(filters), [filters])

  const query = useQuery({
    queryKey: ['sales-leads', 'list', params],
    queryFn: () => salesLeadService.list(params),
    placeholderData: keepPreviousData,
    enabled: hydrated,
  })

  const leads = query.data?.data ?? []
  const summary = query.data?.summary
  const total = query.data?.meta?.total ?? 0
  const totalPages = query.data?.meta?.totalPages ?? 1
  const loading = !query.data && !query.isError
  const refreshing = query.isFetching && !loading
  const failedWithoutData = query.isError && !query.data

  useEffect(() => {
    if (query.isPlaceholderData || !query.data) return
    const pages = query.data.meta?.totalPages
    if (typeof pages === 'number' && pages > 0 && filters.page > pages) {
      setPage(pages)
    }
  }, [query.data, query.isPlaceholderData, filters.page, setPage])

  const handlePageChange = (page: number) => {
    setPage(page)
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const emptyVariant = hasActiveFilters
    ? 'filtered'
    : (summary?.total ?? 0) > 0
      ? 'noActive'
      : 'none'

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-[#062E25]">{t('title')}</h1>
        <p className="text-base text-[#062E25]/75">{t('subtitle')}</p>
      </header>

      <section className="flex flex-col gap-4 rounded-xl border border-[#062E25]/10 bg-white p-4 sm:p-5">
        <StatusChips
          value={filters.status}
          summary={summary}
          onChange={setStatus}
        />
        <FocusToggles
          assignee={filters.assignee}
          followUpDue={filters.followUpDue}
          offerRequested={filters.offerRequested}
          summary={summary}
          onToggleAssignee={toggleAssignee}
          onToggleFollowUpDue={toggleFollowUpDue}
          onToggleOfferRequested={toggleOfferRequested}
        />
        <FilterBar
          searchInput={searchInput}
          source={filters.source}
          sort={filters.sort}
          includeInternal={filters.includeInternal}
          onSearchChange={setSearchInput}
          onSearchClear={clearSearch}
          onSourceChange={setSource}
          onSortChange={setSort}
          onIncludeInternalChange={setIncludeInternal}
        />
      </section>

      <div
        ref={resultsRef}
        aria-busy={loading || refreshing}
        className="flex scroll-mt-4 flex-col gap-4"
      >
        {query.isError && query.data ? (
          <ErrorState
            compact
            retrying={query.isFetching}
            onRetry={() => query.refetch()}
          />
        ) : null}

        {failedWithoutData ? (
          <ErrorState
            retrying={query.isFetching}
            onRetry={() => query.refetch()}
          />
        ) : loading || leads.length > 0 ? (
          <>
            <div
              className={cn(
                'flex flex-col gap-4 transition-opacity',
                refreshing && 'opacity-60'
              )}
            >
              <LeadTable leads={leads} loading={loading} />
              <LeadCards leads={leads} loading={loading} />
            </div>
            {loading ? null : (
              <PaginationBar
                page={filters.page}
                totalPages={totalPages}
                total={total}
                onPageChange={handlePageChange}
              />
            )}
          </>
        ) : (
          <EmptyState
            variant={emptyVariant}
            onReset={reset}
            onShowAll={() => setStatus('ALL')}
          />
        )}
      </div>

      {loading ? <span className="sr-only">{t('loadingLabel')}</span> : null}
    </div>
  )
}
