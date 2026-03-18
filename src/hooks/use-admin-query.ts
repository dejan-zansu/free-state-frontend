'use client'

import { useCallback, useRef, useState } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'

import type { ListQuery, PaginatedResponse } from '@/types/admin'

interface UseAdminQueryOptions {
  initialPage?: number
  initialLimit?: number
  initialFilters?: Record<string, string | undefined>
}

export function useAdminQuery<T>(
  queryKey: string,
  fetcher: (query: ListQuery) => Promise<PaginatedResponse<T>>,
  options: UseAdminQueryOptions = {}
) {
  const { initialPage = 1, initialLimit = 25, initialFilters = {} } = options

  const [page, setPage] = useState(initialPage)
  const [limit, setLimit] = useState(initialLimit)
  const [search, setSearchValue] = useState('')
  const [filters, setFilters] = useState<Record<string, string | undefined>>(initialFilters)

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const buildQuery = (): ListQuery => {
    const query: ListQuery = { page, limit }
    if (search) query.search = search
    Object.entries(filters).forEach(([key, value]) => {
      if (value) query[key] = value
    })
    return query
  }

  const { data: result, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', queryKey, 'list', { page, limit, search, filters }],
    queryFn: () => fetcherRef.current(buildQuery()),
    placeholderData: keepPreviousData,
  })

  const setSearch = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setSearchValue(value)
      setPage(1)
    }, 300)
  }, [])

  const setFilter = useCallback((key: string, value: string | undefined) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }, [])

  return {
    data: result?.data ?? [],
    isLoading,
    error: error?.message ?? null,
    page,
    limit,
    total: result?.meta?.total ?? 0,
    totalPages: result?.meta?.totalPages ?? 0,
    setPage,
    setLimit,
    setSearch,
    setFilter,
    filters,
    refetch,
  }
}
