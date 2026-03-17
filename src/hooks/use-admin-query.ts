'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import type { ListQuery, PaginatedResponse } from '@/types/admin'

interface UseAdminQueryOptions {
  initialPage?: number
  initialLimit?: number
  initialFilters?: Record<string, string | undefined>
}

export function useAdminQuery<T>(
  fetcher: (query: ListQuery) => Promise<PaginatedResponse<T>>,
  options: UseAdminQueryOptions = {}
) {
  const { initialPage = 1, initialLimit = 25, initialFilters = {} } = options

  const [data, setData] = useState<T[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(initialPage)
  const [limit, setLimit] = useState(initialLimit)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [search, setSearchValue] = useState('')
  const [filters, setFilters] = useState<Record<string, string | undefined>>(initialFilters)

  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const query: ListQuery = { page, limit }
      if (search) query.search = search
      Object.entries(filters).forEach(([key, value]) => {
        if (value) query[key] = value
      })

      const result = await fetcher(query)
      setData(result.data)
      setTotal(result.meta.total)
      setTotalPages(result.meta.totalPages)
    } catch (err) {
      const message = (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message || 'Failed to load data'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [fetcher, page, limit, search, filters])

  useEffect(() => {
    fetchData()
  }, [fetchData])

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

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    isLoading,
    error,
    page,
    limit,
    total,
    totalPages,
    setPage,
    setLimit,
    setSearch,
    setFilter,
    filters,
    refetch,
  }
}
