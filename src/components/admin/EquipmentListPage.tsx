'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { ArrowLeft, ChevronLeft, ChevronRight, Plus } from 'lucide-react'

import { StatusBadge } from '@/components/admin/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAdminQuery } from '@/hooks/use-admin-query'
import type { ListQuery, PaginatedResponse } from '@/types/admin'

interface Column<T> {
  header: string
  accessor: (item: T) => React.ReactNode
  className?: string
}

interface EquipmentListPageProps<T> {
  title: string
  fetcher: (query: ListQuery) => Promise<PaginatedResponse<T>>
  columns: Column<T>[]
  getKey: (item: T) => string
  basePath: string
  createPath?: string
}

export function EquipmentListPage<T>({
  title,
  fetcher,
  columns,
  getKey,
  basePath,
  createPath,
}: EquipmentListPageProps<T>) {
  const locale = useLocale()
  const t = useTranslations('admin.equipment')
  const {
    data,
    isLoading,
    page,
    totalPages,
    total,
    setPage,
    setSearch,
    setFilter,
    filters,
  } = useAdminQuery<T>(fetcher)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/${locale}/admin/equipment`}>
              <ArrowLeft className="h-4 w-4 mr-1" /> {t('backToEquipment')}
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-[#062E25]">{title}</h1>
        </div>
        {createPath && (
          <Button asChild className="bg-[#062E25] hover:bg-[#062E25]/90 text-white">
            <Link href={`/${locale}${createPath}`}>
              <Plus className="h-4 w-4 mr-1" /> {t('addNew')}
            </Link>
          </Button>
        )}
      </div>

      <Card className="border-[#062E25]/10">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Input
              placeholder={t('search')}
              className="max-w-xs"
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select
              value={filters.isActive ?? ''}
              onValueChange={(v) => setFilter('isActive', v || undefined)}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder={t('allStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t('allStatus')}</SelectItem>
                <SelectItem value="true">{t('active')}</SelectItem>
                <SelectItem value="false">{t('inactive')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#062E25]" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((col) => (
                      <TableHead key={col.header} className={col.className}>{col.header}</TableHead>
                    ))}
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item) => (
                    <TableRow key={getKey(item)}>
                      {columns.map((col) => (
                        <TableCell key={col.header} className={col.className}>
                          {col.accessor(item)}
                        </TableCell>
                      ))}
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/${locale}${basePath}/${getKey(item)}`}>{t('edit')}</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {data.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={columns.length + 1} className="text-center py-8 text-[#062E25]/40">
                        {t('noItems')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#062E25]/10">
                <p className="text-sm text-[#062E25]/60">{t('items', { count: total })}</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-[#062E25]/60">{t('page', { page, totalPages })}</span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
