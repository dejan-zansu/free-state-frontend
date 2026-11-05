'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { LEAD_LIST_TABS } from '@/lib/outbound-lead-work'
import type {
  LeadAssigneeFilter,
  LeadWorkTabFilter,
  OutboundLeadListQuery,
} from '@/types/outreach/kpi'
import {
  OUTBOUND_CHANNELS,
  OUTBOUND_LEAD_CRITERIA,
  OUTBOUND_LEAD_KINDS,
  type OutboundChannel,
  type OutboundLeadCriterion,
  type OutboundLeadKind,
} from '@/types/outreach/owner-first'

export interface LeadListFilters {
  tab: LeadWorkTabFilter
  kind: OutboundLeadKind | null
  criterion: OutboundLeadCriterion | null
  channel: OutboundChannel | null
  assignee: LeadAssigneeFilter | null
  draftWaiting: boolean
  followUpDue: boolean
  search: string
  page: number
}

export const SEARCH_MAX_LENGTH = 200

const PAGE_SIZE = 25
const STORAGE_KEY = 'outreach-leads:list-filters'
const SEARCH_DEBOUNCE_MS = 300
const ASSIGNEE_FILTERS: readonly LeadAssigneeFilter[] = ['me', 'unassigned']

const DEFAULT_FILTERS: LeadListFilters = {
  tab: 'us',
  kind: null,
  criterion: null,
  channel: null,
  assignee: null,
  draftWaiting: false,
  followUpDue: false,
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
    tab: oneOf(value.tab, LEAD_LIST_TABS) ?? DEFAULT_FILTERS.tab,
    kind: oneOf(value.kind, OUTBOUND_LEAD_KINDS),
    criterion: oneOf(value.criterion, OUTBOUND_LEAD_CRITERIA),
    channel: oneOf(value.channel, OUTBOUND_CHANNELS),
    assignee: oneOf(value.assignee, ASSIGNEE_FILTERS),
    draftWaiting: value.draftWaiting === true,
    followUpDue: value.followUpDue === true,
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
  const query: OutboundLeadListQuery = {
    page: filters.page,
    limit: PAGE_SIZE,
    tab: filters.tab,
  }
  if (filters.search) query.search = filters.search
  if (filters.kind) query.kind = filters.kind
  if (filters.criterion) query.criterion = filters.criterion
  if (filters.channel) query.channel = filters.channel
  if (filters.assignee) query.assignee = filters.assignee
  if (filters.draftWaiting) query.draftWaiting = true
  if (filters.followUpDue) query.followUpDue = true
  return query
}

export function useLeadListFilters() {
  const [filters, setFilters] = useState<LeadListFilters>(DEFAULT_FILTERS)
  const [searchInput, setSearchInput] = useState('')
  const [hydrated, setHydrated] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)

  useEffect(() => {
    const stored = readStoredFilters()
    if (stored) {
      setFilters(stored)
      setSearchInput(stored.search)
      if (stored.criterion || stored.channel) setMoreOpen(true)
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

  const setTab = useCallback((tab: LeadWorkTabFilter) => {
    setFilters(prev => ({ ...prev, tab, page: 1 }))
  }, [])

  const setKind = useCallback((kind: OutboundLeadKind | null) => {
    setFilters(prev => ({ ...prev, kind, page: 1 }))
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

  const toggleAssignee = useCallback((assignee: LeadAssigneeFilter) => {
    setFilters(prev => ({
      ...prev,
      assignee: prev.assignee === assignee ? null : assignee,
      page: 1,
    }))
  }, [])

  const toggleDraftWaiting = useCallback(() => {
    setFilters(prev => ({ ...prev, draftWaiting: !prev.draftWaiting, page: 1 }))
  }, [])

  const toggleFollowUpDue = useCallback(() => {
    setFilters(prev => ({ ...prev, followUpDue: !prev.followUpDue, page: 1 }))
  }, [])

  const setPage = useCallback((page: number) => {
    const next = Math.max(1, page)
    setFilters(prev => (prev.page === next ? prev : { ...prev, page: next }))
  }, [])

  const toggleMore = useCallback(() => {
    setMoreOpen(prev => !prev)
  }, [])

  const reset = useCallback(() => {
    setSearchInput('')
    setFilters(prev => ({ ...DEFAULT_FILTERS, tab: prev.tab }))
  }, [])

  const hasActiveFilters = useMemo(
    () =>
      filters.kind !== null ||
      filters.criterion !== null ||
      filters.channel !== null ||
      filters.assignee !== null ||
      filters.draftWaiting ||
      filters.followUpDue ||
      filters.search !== '' ||
      searchInput.trim() !== '',
    [filters, searchInput]
  )

  return {
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
  }
}
