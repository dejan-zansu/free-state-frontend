'use client'

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { MessageSquarePlus } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import {
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { Button } from '@/components/ui/button'
import {
  INBOX_LIST_QUERY_KEY,
  INBOX_POLL_MS,
  INBOX_QUERY_KEY,
  inboxConversationKey,
} from '@/lib/outbound-inbox'
import { cn } from '@/lib/utils'
import { outreachInboxService } from '@/services/outreach/inbox.service'
import type { OutboundProspectDetail } from '@/types/admin-outreach'
import type {
  InboxEntryResult,
  InboxItem,
  InboxSeenInput,
} from '@/types/outreach/inbox'

import { PRIMARY_BUTTON } from '../../residential-leads/[id]/leadUtils'
import { InboxFilterBar, InboxTabs } from './_components/InboxControls'
import { InboxConversation } from './_components/InboxConversation'
import { InboxEntryDialog } from './_components/InboxEntryDialog'
import {
  InboxEmpty,
  InboxError,
  InboxPagination,
  InboxRows,
} from './_components/InboxList'
import { buildInboxQuery, useInboxFilters } from './use-inbox-filters'

function InboxPage() {
  const t = useTranslations('admin.outreach.inbox')
  const queryClient = useQueryClient()
  const selectedKey = inboxConversationKey(useSearchParams().get('c'))
  const rowsRef = useRef<HTMLDivElement>(null)
  const listScroll = useRef<number | null>(null)
  const [savedKey, setSavedKey] = useState<string | null>(null)
  const [entry, setEntry] = useState<{
    prospect: OutboundProspectDetail | null
  } | null>(null)
  const {
    filters,
    hydrated,
    searchInput,
    setSearchInput,
    setTab,
    setSource,
    setAssignee,
    setPage,
    reset,
    hasActiveFilters,
  } = useInboxFilters()

  const params = useMemo(() => buildInboxQuery(filters), [filters])

  const query = useQuery({
    queryKey: [...INBOX_LIST_QUERY_KEY, params],
    queryFn: () => outreachInboxService.list(params),
    placeholderData: keepPreviousData,
    refetchInterval: INBOX_POLL_MS,
    enabled: hydrated,
  })

  const seen = useMutation({
    mutationFn: (input: InboxSeenInput) => outreachInboxService.markSeen(input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: INBOX_QUERY_KEY }),
  })

  const data = query.data
  const items = data?.items ?? []
  const loading = !data && !query.isError

  useEffect(() => {
    if (query.isPlaceholderData || !data) return
    if (filters.page > data.meta.totalPages) setPage(data.meta.totalPages)
  }, [data, query.isPlaceholderData, filters.page, setPage])

  useLayoutEffect(() => {
    if (selectedKey || listScroll.current === null) return
    window.scrollTo(0, listScroll.current)
    listScroll.current = null
  }, [selectedKey])

  const open = (key: string) => {
    const url = `${window.location.pathname}?c=${key}`
    if (selectedKey) {
      window.history.replaceState(null, '', url)
      return
    }
    listScroll.current = window.scrollY
    window.history.pushState(null, '', url)
  }

  const handleSelect = (item: InboxItem) => {
    setSavedKey(null)
    if (item.key !== selectedKey) {
      open(item.key)
      return
    }
    if (item.isNew && item.at) seen.mutate({ key: item.key, upTo: item.at })
  }

  const handleSaved = (result: InboxEntryResult) => {
    setEntry(null)
    setSavedKey(result.key)
    if (result.key !== selectedKey) open(result.key)
  }

  const handlePageChange = (page: number) => {
    setPage(page)
    rowsRef.current?.scrollTo({ top: 0 })
    rowsRef.current?.scrollIntoView({ block: 'nearest' })
  }

  return (
    <div className="flex flex-col gap-3 text-base text-[#062E25] lg:h-[calc(100dvh-6.5rem)] lg:min-h-[42rem]">
      <div
        className={cn('flex flex-col gap-3', selectedKey && 'max-lg:hidden')}
      >
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-[1.625rem] font-bold sm:text-[2rem]">
            {t('title')}
          </h1>
          <Button
            type="button"
            size="lg"
            onClick={() => setEntry({ prospect: null })}
            className={cn(PRIMARY_BUTTON, 'h-11 max-sm:w-full')}
          >
            <MessageSquarePlus aria-hidden />
            {t('enterAnswer')}
          </Button>
        </header>

        <InboxTabs
          value={filters.tab}
          summary={data?.summary}
          onChange={setTab}
        />

        <InboxFilterBar
          filters={filters}
          summary={data?.summary}
          searchInput={searchInput}
          hasActiveFilters={hasActiveFilters}
          onSearchChange={setSearchInput}
          onSourceChange={setSource}
          onAssigneeChange={setAssignee}
          onReset={reset}
        />
      </div>

      <div className="grid gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-[20rem_minmax(0,1fr)] xl:grid-cols-[26rem_minmax(0,1fr)]">
        <div
          aria-busy={query.isFetching}
          className={cn(
            'flex min-w-0 flex-col overflow-hidden rounded-xl border border-[#062E25]/10 bg-white lg:min-h-0',
            selectedKey && 'max-lg:hidden'
          )}
        >
          <div
            ref={rowsRef}
            className={cn(
              'scroll-mt-4 transition-opacity lg:min-h-0 lg:flex-1 lg:overflow-y-auto',
              query.isPlaceholderData && 'opacity-60'
            )}
          >
            {query.isError ? (
              <InboxError
                text={t('list.loadFailed')}
                retrying={query.isFetching}
                onRetry={() => query.refetch()}
              />
            ) : null}
            {loading || items.length > 0 ? (
              <InboxRows
                items={items}
                loading={loading}
                selectedKey={selectedKey}
                onSelect={handleSelect}
              />
            ) : data ? (
              <InboxEmpty
                tab={filters.tab}
                filtered={hasActiveFilters}
                onReset={reset}
              />
            ) : null}
          </div>
          {data && items.length > 0 ? (
            <InboxPagination
              page={data.meta.page}
              totalPages={data.meta.totalPages}
              total={data.meta.total}
              onPageChange={handlePageChange}
            />
          ) : null}
        </div>

        <div
          className={cn('min-w-0 lg:min-h-0', !selectedKey && 'max-lg:hidden')}
        >
          {selectedKey ? (
            <InboxConversation
              key={selectedKey}
              conversationKey={selectedKey}
              item={items.find(item => item.key === selectedKey)}
              markOnOpen={selectedKey !== savedKey}
              onSeen={upTo => seen.mutate({ key: selectedKey, upTo })}
              onBack={() =>
                window.history.replaceState(null, '', window.location.pathname)
              }
              onEnterAnswer={prospect => setEntry({ prospect })}
            />
          ) : (
            <div className="flex h-full items-center justify-center rounded-xl border border-[#062E25]/10 bg-white p-6 text-center text-[#062E25]/75">
              {t('conversation.pick')}
            </div>
          )}
        </div>
      </div>

      {entry ? (
        <InboxEntryDialog
          prospect={entry.prospect}
          onClose={() => setEntry(null)}
          onSaved={handleSaved}
        />
      ) : null}
    </div>
  )
}

export default function AdminOutreachInboxPage() {
  return (
    <Suspense fallback={<AdminPageLoader />}>
      <InboxPage />
    </Suspense>
  )
}
