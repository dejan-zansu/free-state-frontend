'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import type { AdminCareerSubscription } from '@/types/admin'

export default function AdminCareerSubscriptionsPage() {
  const t = useTranslations('admin.careerSubscriptions')
  const tc = useTranslations('admin.common')
  const {
    data,
    isLoading,
    page,
    totalPages,
    total,
    setPage,
    setSearch,
  } = useAdminQuery<AdminCareerSubscription>(
    'career-subscriptions',
    adminService.listCareerSubscriptions.bind(adminService)
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
                    <TableHead>{t('role')}</TableHead>
                    <TableHead>{t('comment')}</TableHead>
                    <TableHead>{t('locale')}</TableHead>
                    <TableHead>{t('subscribed')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map(sub => (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <p className="font-medium text-base">
                          {sub.firstName} {sub.lastName}
                        </p>
                      </TableCell>
                      <TableCell className="text-base text-[#062E25]/60">
                        {sub.email}
                      </TableCell>
                      <TableCell className="text-base text-[#062E25]/60">
                        {sub.role}
                      </TableCell>
                      <TableCell className="text-base text-[#062E25]/60 max-w-xs">
                        <p className="truncate" title={sub.comment ?? ''}>
                          {sub.comment ?? '—'}
                        </p>
                      </TableCell>
                      <TableCell className="text-base text-[#062E25]/60 uppercase">
                        {sub.locale}
                      </TableCell>
                      <TableCell className="text-[#062E25]/60 text-base">
                        {new Date(sub.createdAt).toLocaleDateString('de-CH')}
                      </TableCell>
                    </TableRow>
                  ))}
                  {data.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-[#062E25]/40"
                      >
                        {t('noSubscribers')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#062E25]/10">
                <p className="text-base text-[#062E25]/60">
                  {t('totalSubscribers', { count: total })}
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
                  <span className="text-base text-[#062E25]/60">
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
