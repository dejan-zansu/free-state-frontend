'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'

import { StatusBadge } from '@/components/admin/StatusBadge'
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
import type { AdminInquiry } from '@/types/admin'

export default function AdminSupportPage() {
  const locale = useLocale()
  const t = useTranslations('admin.support')
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
  } = useAdminQuery<AdminInquiry>('inquiries', adminService.listInquiries.bind(adminService))

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
              value={filters.status || '__all__'}
              onValueChange={v => setFilter('status', v === '__all__' ? undefined : v)}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder={t('allStatuses')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{t('allStatuses')}</SelectItem>
                <SelectItem value="OPEN">{t('statusOpen')}</SelectItem>
                <SelectItem value="IN_PROGRESS">{t('statusInProgress')}</SelectItem>
                <SelectItem value="RESOLVED">{t('statusResolved')}</SelectItem>
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
                    <TableHead>{t('message')}</TableHead>
                    <TableHead>{t('status')}</TableHead>
                    <TableHead>{t('created')}</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map(inquiry => (
                    <TableRow key={inquiry.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {inquiry.firstName} {inquiry.lastName}
                          </p>
                          <p className="text-sm text-[#062E25]/50">
                            {inquiry.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-[#062E25]/60 max-w-64 truncate">
                        {inquiry.message}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={inquiry.status} />
                      </TableCell>
                      <TableCell className="text-[#062E25]/60 text-sm">
                        {new Date(inquiry.createdAt).toLocaleDateString('de-CH')}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/${locale}/admin/support/${inquiry.id}`}>
                            {t('view')}
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {data.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-[#062E25]/40"
                      >
                        {t('noTickets')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#062E25]/10">
                <p className="text-sm text-[#062E25]/60">
                  {t('totalTickets', { count: total })}
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
