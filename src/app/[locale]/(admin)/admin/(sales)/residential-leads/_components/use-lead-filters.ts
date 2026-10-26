'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { ALL_SOURCES, ALL_STATUSES } from '@/lib/sales-lead'
import type {
  SalesLeadListQuery,
  SalesLeadSort,
  SalesLeadSource,
  SalesLeadStatus,
} from '@/types/sales-lead'

export type StatusFilter = 'ACTIVE' | 'ALL' | SalesLeadStatus
export type AssigneeFilter = 'me' | 'unassigned' | null

export interface LeadFilters {
  status: StatusFilter
  assignee: AssigneeFilter
  followUpDue: boolean
  offerRequested: boolean
  search: string
  source: SalesLeadSource | null
  sort: SalesLeadSort
  includeInternal: boolean
  page: number
}

export const PAGE_SIZE = 20

export const DEFAULT_FILTERS: LeadFilters = {
  status: 'ACTIVE',
  assignee: null,
  followUpDue: false,
  offerRequested: false,
  search: '',
  source: null,
  sort: 'newest',
  includeInternal: false,
  page: 1,
}

export const SORT_OPTIONS: SalesLeadSort[] = [
  'newest',
  'oldest',
  'followUp',
  'updated',
]

const STORAGE_KEY = 'sales-leads:list-filters'
const SEARCH_DEBOUNCE_MS = 300

function parseStoredFilters(raw: unknown): LeadFilters | null {
  if (!raw || typeof raw !== 'object') return null
  const value = raw as Record<string, unknown>

  const status =
    value.status === 'ACTIVE' ||
    value.status === 'ALL' ||
    (typeof value.status === 'string' &&
      (ALL_STATUSES as string[]).includes(value.status))
      ? (value.status as StatusFilter)
      : DEFAULT_FILTERS.status

  const assignee =
    value.assignee === 'me' || value.assignee === 'unassigned'
      ? value.assignee
      : null

  const source =
    typeof value.source === 'string' &&
    (ALL_SOURCES as string[]).includes(value.source)
      ? (value.source as SalesLeadSource)
      : null

  const sort =
    typeof value.sort === 'string' &&
    (SORT_OPTIONS as string[]).includes(value.sort)
      ? (value.sort as SalesLeadSort)
      : DEFAULT_FILTERS.sort

  const page =
    typeof value.page === 'number' &&
    Number.isInteger(value.page) &&
    value.page >= 1
      ? value.page
      : 1

  return {
    status,
    assignee,
    followUpDue: value.followUpDue === true,
    offerRequested: value.offerRequested === true,
    search: typeof value.search === 'string' ? value.search : '',
    source,
    sort,
    includeInternal: value.includeInternal === true,
    page,
  }
}

function readStoredFilters(): LeadFilters | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return parseStoredFilters(JSON.parse(raw))
  } catch {
    return null
  }
}

function writeStoredFilters(filters: LeadFilters): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filters))
  } catch {
    return
  }
}

export function buildListQuery(filters: LeadFilters): SalesLeadListQuery {
  const query: SalesLeadListQuery = {
    page: filters.page,
    limit: PAGE_SIZE,
    sort: filters.sort,
  }
  if (filters.status !== 'ALL') query.status = filters.status
  if (filters.search) query.search = filters.search
  if (filters.source) query.source = filters.source
  if (filters.assignee) query.assignee = filters.assignee
  if (filters.followUpDue) query.followUp = 'due'
  if (filters.offerRequested) query.offerRequested = 'true'
  if (filters.includeInternal) query.includeInternal = 'true'
  return query
}

export function useLeadFilters() {
  const [filters, setFilters] = useState<LeadFilters>(DEFAULT_FILTERS)
  const [searchInput, setSearchInput] = useState('')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = readStoredFilters()
    if (stored) {
      setFilters(stored)
      setSearchInput(stored.search)
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (hydrated) writeStoredFilters(filters)
  }, [filters, hydrated])

  useEffect(() => {
    if (!hydrated) return
    const next = searchInput.trim()
    const handle = setTimeout(() => {
      setFilters(prev =>
        prev.search === next ? prev : { ...prev, search: next, page: 1 }
      )
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(handle)
  }, [searchInput, hydrated])

  const setStatus = useCallback((status: StatusFilter) => {
    setFilters(prev => ({ ...prev, status, page: 1 }))
  }, [])

  const toggleAssignee = useCallback((assignee: 'me' | 'unassigned') => {
    setFilters(prev => ({
      ...prev,
      assignee: prev.assignee === assignee ? null : assignee,
      page: 1,
    }))
  }, [])

  const toggleFollowUpDue = useCallback(() => {
    setFilters(prev => ({ ...prev, followUpDue: !prev.followUpDue, page: 1 }))
  }, [])

  const toggleOfferRequested = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      offerRequested: !prev.offerRequested,
      page: 1,
    }))
  }, [])

  const setSource = useCallback((source: SalesLeadSource | null) => {
    setFilters(prev => ({ ...prev, source, page: 1 }))
  }, [])

  const setSort = useCallback((sort: SalesLeadSort) => {
    setFilters(prev => ({ ...prev, sort, page: 1 }))
  }, [])

  const setIncludeInternal = useCallback((includeInternal: boolean) => {
    setFilters(prev => ({ ...prev, includeInternal, page: 1 }))
  }, [])

  const setPage = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page: Math.max(1, page) }))
  }, [])

  const clearSearch = useCallback(() => {
    setSearchInput('')
    setFilters(prev => (prev.search ? { ...prev, search: '', page: 1 } : prev))
  }, [])

  const reset = useCallback(() => {
    setSearchInput('')
    setFilters(prev => ({ ...DEFAULT_FILTERS, sort: prev.sort }))
  }, [])

  const hasActiveFilters = useMemo(
    () =>
      filters.status !== DEFAULT_FILTERS.status ||
      filters.assignee !== null ||
      filters.followUpDue ||
      filters.offerRequested ||
      filters.search !== '' ||
      searchInput.trim() !== '' ||
      filters.source !== null ||
      filters.includeInternal,
    [filters, searchInput]
  )

  return {
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
  }
}
