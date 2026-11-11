'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { StatusBadge } from '@/components/admin/StatusBadge'
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
import { adminPvServiceService } from '@/services/admin-pv-service.service'
import {
  PV_SERVICE_REQUEST_STATUSES,
  type PvServiceRequestListItem,
} from '@/types/pv-service'

import {
  formatChf,
  formatDate,
  formatKw,
  PV_SERVICE_STATUS_CLASS,
} from './_components/pv-service-format'

const ALL = '__all__'
const COLUMN_COUNT = 7
const CELL_CLASS = 'align-top text-base whitespace-normal'

function PlantCell({ request }: { request: PvServiceRequestListItem }) {
  const t = useTranslations('admin.pvService')
  const kw = formatKw(request.plantKw)
  if (!kw && request.commissioningYear === null) return <>-</>
  return (
    <div className="space-y-1">
      {kw && <p className="whitespace-nowrap">{kw}</p>}
      {request.commissioningYear !== null && (
        <p className="whitespace-nowrap">
          {t('sinceYear', { year: request.commissioningYear })}
        </p>
      )}
    </div>
  )
}

function InterestsCell({ interests }: { interests: string[] }) {
  const t = useTranslations('admin.pvService')
  if (interests.length === 0) return <>-</>
  return (
    <p>
      {interests
        .map(interest => {
          const key = `interests.${interest}`
          return t.has(key) ? t(key) : interest
        })
        .join(', ')}
    </p>
  )
}

export default function AdminPvServicePage() {
  const locale = useLocale()
  const router = useRouter()
  const t = useTranslations('admin.pvService')
  const tc = useTranslations('admin.common')

  const {
    data,
    isLoading,
    error,
    page,
    totalPages,
    total,
    setPage,
    setSearch,
    setFilter,
    filters,
  } = useAdminQuery<PvServiceRequestListItem>(
    'pv-service',
    adminPvServiceService.list.bind(adminPvServiceService)
  )

  const detailHref = (id: string) => `/${locale}/admin/pv-service/${id}`

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#062E25] mb-6">{t('title')}</h1>

      <Card className="border-[#062E25]/10">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Input
              placeholder={t('searchPlaceholder')}
              aria-label={t('searchPlaceholder')}
              maxLength={200}
              className="max-w-xs md:text-base"
              onChange={e => setSearch(e.target.value.trim())}
            />
            <Select
              value={filters.status ?? ALL}
              onValueChange={next =>
                setFilter('status', next === ALL ? undefined : next)
              }
            >
              <SelectTrigger
                aria-label={t('allStatuses')}
                className="w-52 text-base"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL} className="text-base">
                  {t('allStatuses')}
                </SelectItem>
                {PV_SERVICE_REQUEST_STATUSES.map(status => (
                  <SelectItem key={status} value={status} className="text-base">
                    {t(`statusLabels.${status}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <AdminPageLoader />
          ) : error ? (
            <p className="text-base text-[#062E25]" role="alert">
              {tc('failedToLoad')}
            </p>
          ) : (
            <>
              <Table className="text-base">
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('colReceived')}</TableHead>
                    <TableHead>{t('colCompany')}</TableHead>
                    <TableHead>{t('colPlace')}</TableHead>
                    <TableHead>{t('colPlant')}</TableHead>
                    <TableHead>{t('colInterests')}</TableHead>
                    <TableHead>{t('colAnnualFee')}</TableHead>
                    <TableHead>{t('colStatus')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map(request => (
                    <TableRow
                      key={request.id}
                      className="cursor-pointer"
                      onClick={() => router.push(detailHref(request.id))}
                    >
                      <TableCell className={`${CELL_CLASS} whitespace-nowrap`}>
                        {formatDate(request.createdAt)}
                      </TableCell>
                      <TableCell className={CELL_CLASS}>
                        <Link
                          href={detailHref(request.id)}
                          onClick={e => e.stopPropagation()}
                          className="block font-medium text-[#062E25] hover:underline"
                        >
                          {request.companyName}
                        </Link>
                        <p className="break-words">{request.contactName}</p>
                        <p className="break-words text-[#062E25]/75">
                          {request.email}
                        </p>
                      </TableCell>
                      <TableCell className={CELL_CLASS}>
                        {request.postalCode} {request.city}
                      </TableCell>
                      <TableCell className={CELL_CLASS}>
                        <PlantCell request={request} />
                      </TableCell>
                      <TableCell className={CELL_CLASS}>
                        <InterestsCell interests={request.interests} />
                      </TableCell>
                      <TableCell className={`${CELL_CLASS} whitespace-nowrap`}>
                        {request.annualFeeChf !== null
                          ? formatChf(request.annualFeeChf)
                          : '-'}
                      </TableCell>
                      <TableCell className={CELL_CLASS}>
                        <StatusBadge
                          status={request.status}
                          namespace="admin.pvService.statusLabels"
                          className={`text-base ${PV_SERVICE_STATUS_CLASS[request.status] ?? ''}`}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {data.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={COLUMN_COUNT}
                        className="text-center py-8 text-[#062E25]/75"
                      >
                        {t('empty')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#062E25]/10">
                <p className="text-base text-[#062E25]/75">
                  {t('total', { count: total })}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label={t('previousPage')}
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-base text-[#062E25]/75">
                    {tc('page', { page, totalPages })}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    aria-label={t('nextPage')}
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
