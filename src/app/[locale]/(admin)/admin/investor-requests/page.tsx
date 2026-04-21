'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAdminQuery } from '@/hooks/use-admin-query'
import { adminService } from '@/services/admin.service'
import type { AdminInvestorRequest } from '@/types/admin'

const statusColors: Record<string, string> = {
  NEW: 'bg-blue-100 text-blue-700',
  CONTACTED: 'bg-yellow-100 text-yellow-700',
  DOCUMENTS_SENT: 'bg-green-100 text-green-700',
  CLOSED: 'bg-gray-100 text-gray-500',
}

export default function AdminInvestorRequestsPage() {
  const locale = useLocale()
  const t = useTranslations('admin.investorRequests')
  const tc = useTranslations('admin.common')
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
  } = useAdminQuery<AdminInvestorRequest>(
    'investor-requests',
    adminService.listInvestorRequests.bind(adminService)
  )

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#062E25] mb-6">{t('title')}</h1>

      <Card className="border-[#062E25]/10">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Input
              placeholder={t('searchPlaceholder')}
              className="max-w-xs"
              onChange={e => setSearch(e.target.value)}
            />
            <Select
              value={filters.status || 'all'}
              onValueChange={v =>
                setFilter('status', v === 'all' ? undefined : v)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('filterStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allStatuses')}</SelectItem>
                <SelectItem value="NEW">{t('statusNew')}</SelectItem>
                <SelectItem value="CONTACTED">
                  {t('statusContacted')}
                </SelectItem>
                <SelectItem value="DOCUMENTS_SENT">
                  {t('statusDocumentsSent')}
                </SelectItem>
                <SelectItem value="CLOSED">{t('statusClosed')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <AdminPageLoader />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('name')}</TableHead>
                    <TableHead>{t('email')}</TableHead>
                    <TableHead>{t('location')}</TableHead>
                    <TableHead>{t('type')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead>{t('created')}</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map(request => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <p className="font-medium">
                          {request.firstName} {request.lastName}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-[#062E25]/60">
                        {request.email}
                      </TableCell>
                      <TableCell className="text-sm text-[#062E25]/60">
                        {request.postalCode} {request.city}
                      </TableCell>
                      <TableCell className="text-sm text-[#062E25]/60 capitalize">
                        {request.entityType}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-sm font-medium ${statusColors[request.status] || ''}`}
                        >
                          {t(
                            `status${request.status.charAt(0)}${request.status
                              .slice(1)
                              .toLowerCase()
                              .replace(/_./g, m => m[1].toUpperCase())}`
                          )}
                        </span>
                      </TableCell>
                      <TableCell className="text-[#062E25]/60 text-sm">
                        {new Date(request.createdAt).toLocaleDateString(
                          'de-CH'
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link
                            href={`/${locale}/admin/investor-requests/${request.id}`}
                          >
                            {t('view')}
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {data.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-[#062E25]/40"
                      >
                        {t('noRequests')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#062E25]/10">
                <p className="text-sm text-[#062E25]/60">
                  {t('totalRequests', { count: total })}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-[#062E25]/60">
                    {tc('page', { page, totalPages })}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                  >
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
