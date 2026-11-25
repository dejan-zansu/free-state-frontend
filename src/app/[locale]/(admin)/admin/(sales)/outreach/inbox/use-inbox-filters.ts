'use client'

import { useCallback, useEffect, useState } from 'react'

import {
  INBOX_SOURCES,
  INBOX_TABS,
  type InboxListQuery,
  type InboxSource,
  type InboxTab,
} from '@/types/outreach/inbox'
import type { LeadAssigneeFilter } from '@/types/outreach/kpi'

export interface InboxFilters {
  tab: InboxTab
  source: InboxSource | null
  assignee: LeadAssigneeFilter | null
  search: string
  page: number
}

export const INBOX_SEARCH_MAX_LENGTH = 200
export const INBOX_ASSIGNEE_FILTERS: readonly LeadAssigneeFilter[] = [
  'me',
  'unassigned',
]

const PAGE_SIZE = 25
const STORAGE_KEY = 'outreach-inbox:filters'
const SEARCH_DEBOUNCE_MS = 300

const DEFAULT_FILTERS: InboxFilters = {
  tab: 'waiting',
  source: null,
  assignee: null,
  search: '',
  page: 1,
}

function oneOf<T extends string>(
  value: unknown,
  allowed: readonly T[]
): T | null {
  return typeof value === 'string' &&
    (allowed as readonly string[]).includes(value)
    ? (value as T)
    : null
}

function parseStoredFilters(raw: unknown): InboxFilters | null {
  if (!raw || typeof raw !== 'object') return null
  const value = raw as Record<string, unknown>

  return {
    tab: oneOf(value.tab, INBOX_TABS) ?? DEFAULT_FILTERS.tab,
    source: oneOf(value.source, INBOX_SOURCES),
    assignee: oneOf(value.assignee, INBOX_ASSIGNEE_FILTERS),
    search:
      typeof value.search === 'string'
        ? value.search.slice(0, INBOX_SEARCH_MAX_LENGTH).trim()
        : '',
    page:
      typeof value.page === 'number' &&
      Number.isInteger(value.page) &&
      value.page >= 1
        ? value.page
        : 1,
  }
}

function readStoredFilters(): InboxFilters | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return parseStoredFilters(JSON.parse(raw))
  } catch {
    return null
  }
}

function writeStoredFilters(filters: InboxFilters): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(filters))
  } catch {
    return
  }
}

export function buildInboxQuery(filters: InboxFilters): InboxListQuery {
  const query: InboxListQuery = {
    tab: filters.tab,
    page: filters.page,
    limit: PAGE_SIZE,
  }
  if (filters.source) query.source = filters.source
  if (filters.assignee) query.assignee = filters.assignee
  if (filters.search) query.search = filters.search
  return query
}

export function useInboxFilters() {
  const [filters, setFilters] = useState<InboxFilters>(DEFAULT_FILTERS)
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

  const setTab = useCallback((tab: InboxTab) => {
    setFilters(prev => ({ ...prev, tab, page: 1 }))
  }, [])

  const setSource = useCallback((source: InboxSource | null) => {
    setFilters(prev => ({ ...prev, source, page: 1 }))
  }, [])

  const setAssignee = useCallback((assignee: LeadAssigneeFilter | null) => {
    setFilters(prev => ({ ...prev, assignee, page: 1 }))
  }, [])

  const setPage = useCallback((page: number) => {
    const next = Math.max(1, page)
    setFilters(prev => (prev.page === next ? prev : { ...prev, page: next }))
  }, [])

  const reset = useCallback(() => {
    setSearchInput('')
    setFilters(prev => ({ ...DEFAULT_FILTERS, tab: prev.tab }))
  }, [])

  const hasActiveFilters =
    filters.source !== null ||
    filters.assignee !== null ||
    filters.search !== '' ||
    searchInput.trim() !== ''

  return {
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
  }
}
