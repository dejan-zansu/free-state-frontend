'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import type {
  OutboundLeadListQuery,
  OutboundLeadState,
} from '@/types/outreach/kpi'
import {
  OUTBOUND_CHANNELS,
  OUTBOUND_LEAD_CRITERIA,
  OUTBOUND_LEAD_KINDS,
  type OutboundChannel,
  type OutboundLeadCriterion,
  type OutboundLeadKind,
} from '@/types/outreach/owner-first'

export type LeadListState = OutboundLeadState | 'all'

export interface LeadListFilters {
  state: LeadListState
  kind: OutboundLeadKind | null
  criterion: OutboundLeadCriterion | null
  channel: OutboundChannel | null
  search: string
  page: number
}

export const LEAD_LIST_STATES = ['open', 'in_crm', 'closed', 'all'] as const
export const SEARCH_MAX_LENGTH = 200

const PAGE_SIZE = 25
const STORAGE_KEY = 'outreach-leads:list-filters'
const SEARCH_DEBOUNCE_MS = 300

const DEFAULT_FILTERS: LeadListFilters = {
  state: 'open',
  kind: null,
  criterion: null,
  channel: null,
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

function parseStoredFilters(raw: unknown): LeadListFilters | null {
  if (!raw || typeof raw !== 'object') return null
  const value = raw as Record<string, unknown>

  return {
    state: oneOf(value.state, LEAD_LIST_STATES) ?? DEFAULT_FILTERS.state,
    kind: oneOf(value.kind, OUTBOUND_LEAD_KINDS),
    criterion: oneOf(value.criterion, OUTBOUND_LEAD_CRITERIA),
    channel: oneOf(value.channel, OUTBOUND_CHANNELS),
    search:
      typeof value.search === 'string'
        ? value.search.slice(0, SEARCH_MAX_LENGTH).trim()
        : '',
    page:
      typeof value.page === 'number' &&
      Number.isInteger(value.page) &&
      value.page >= 1
        ? value.page
        : 1,
  }
}

function readStoredFilters(): LeadListFilters | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return parseStoredFilters(JSON.parse(raw))
  } catch {
    return null
  }
}

function writeStoredFilters(filters: LeadListFilters): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(filters))
  } catch {
    return
  }
}

export function buildLeadListQuery(
  filters: LeadListFilters
): OutboundLeadListQuery {
  const query: OutboundLeadListQuery = { page: filters.page, limit: PAGE_SIZE }
  if (filters.state !== 'all') query.state = filters.state
  if (filters.search) query.search = filters.search
  if (filters.kind) query.kind = filters.kind
  if (filters.criterion) query.criterion = filters.criterion
  if (filters.channel) query.channel = filters.channel
  return query
}

export function useLeadListFilters() {
  const [filters, setFilters] = useState<LeadListFilters>(DEFAULT_FILTERS)
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

  const setState = useCallback((state: LeadListState) => {
    setFilters(prev => ({ ...prev, state, page: 1 }))
  }, [])

  const toggleKind = useCallback((kind: OutboundLeadKind) => {
    setFilters(prev => ({
      ...prev,
      kind: prev.kind === kind ? null : kind,
      page: 1,
    }))
  }, [])

  const setCriterion = useCallback(
    (criterion: OutboundLeadCriterion | null) => {
      setFilters(prev => ({ ...prev, criterion, page: 1 }))
    },
    []
  )

  const setChannel = useCallback((channel: OutboundChannel | null) => {
    setFilters(prev => ({ ...prev, channel, page: 1 }))
  }, [])

  const setPage = useCallback((page: number) => {
    const next = Math.max(1, page)
    setFilters(prev => (prev.page === next ? prev : { ...prev, page: next }))
  }, [])

  const reset = useCallback(() => {
    setSearchInput('')
    setFilters(DEFAULT_FILTERS)
  }, [])

  const hasActiveFilters = useMemo(
    () =>
      filters.state !== DEFAULT_FILTERS.state ||
      filters.kind !== null ||
      filters.criterion !== null ||
      filters.channel !== null ||
      filters.search !== '' ||
      searchInput.trim() !== '',
    [filters, searchInput]
  )

  return {
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
  }
}
