'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { Button } from '@/components/ui/button'
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
import { adminRoofLeadService } from '@/services/admin-roof-lead.service'
import type { RoofRequestListItem } from '@/types/roof-lead'

import { formatDate } from './roof-lead-format'

const COLUMN_COUNT = 6
const CELL_CLASS = 'align-top text-base whitespace-normal'

const STATUS_LABEL_KEYS = {
  NEW: 'statusNew',
  CONTACTED: 'statusContacted',
  QUALIFIED: 'statusQualified',
  CLOSED: 'statusClosed',
} as const

export function RoofRequestsTab({
  onOpenLead,
}: {
  onOpenLead: (id: string) => void
}) {
  const t = useTranslations('admin.roofLeads')
  const tContacts = useTranslations('admin.contacts')
  const tc = useTranslations('admin.common')
  const queryClient = useQueryClient()

  const {
    data,
    isLoading,
    error,
    page,
    totalPages,
    total,
    setPage,
    setSearch,
  } = useAdminQuery<RoofRequestListItem>(
    'roof-lead-requests',
    adminRoofLeadService.listRequests.bind(adminRoofLeadService)
  )

  const promoteMutation = useMutation({
    mutationFn: (id: string) => adminRoofLeadService.promoteRequest(id),
    onSuccess: promotion => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'roof-leads'] })
      queryClient.invalidateQueries({
        queryKey: ['admin', 'roof-lead-requests'],
      })
      onOpenLead(promotion.target.id)
    },
  })

  return (
    <div>
      <Input
        type="search"
        placeholder={t('requests.searchPlaceholder')}
        aria-label={t('requests.searchPlaceholder')}
        onChange={event => setSearch(event.target.value.trim())}
        className="mb-4 max-w-md text-base md:text-base"
      />
      {promoteMutation.isError && (
        <p className="mb-4 text-base text-red-700" role="alert">
          {t('requests.promoteFailed')}
        </p>
      )}

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
                <TableHead>{t('requests.colDate')}</TableHead>
                <TableHead>{t('requests.colName')}</TableHead>
                <TableHead>{t('requests.colPlace')}</TableHead>
                <TableHead>{t('requests.colMessage')}</TableHead>
                <TableHead>{t('requests.colStatus')}</TableHead>
                <TableHead>{t('requests.colLead')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map(request => {
                const status = request.status as keyof typeof STATUS_LABEL_KEYS
                const target = request.target
                return (
                  <TableRow key={request.id}>
                    <TableCell className={CELL_CLASS}>
                      {formatDate(request.createdAt)}
                    </TableCell>
                    <TableCell className={CELL_CLASS}>
                      <p className="font-medium">
                        {request.firstName} {request.lastName}
                      </p>
                      <p>{request.phone}</p>
                      {request.email && (
                        <p className="break-words">{request.email}</p>
                      )}
                    </TableCell>
                    <TableCell className={CELL_CLASS}>
                      {request.street && <p>{request.street}</p>}
                      <p>
                        {request.postalCode} {request.city}
                      </p>
                      {request.egid !== null && <p>EGID {request.egid}</p>}
                    </TableCell>
                    <TableCell className={`${CELL_CLASS} max-w-md`}>
                      <p className="whitespace-pre-line">
                        {request.message || t('requests.noMessage')}
                      </p>
                    </TableCell>
                    <TableCell className={CELL_CLASS}>
                      {STATUS_LABEL_KEYS[status]
                        ? tContacts(STATUS_LABEL_KEYS[status])
                        : request.status}
                    </TableCell>
                    <TableCell className={CELL_CLASS}>
                      {target ? (
                        <Button
                          variant="outline"
                          className="text-base"
                          onClick={() => onOpenLead(target.id)}
                        >
                          {t('requests.openLead')}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="text-base"
                          disabled={promoteMutation.isPending}
                          onClick={() => promoteMutation.mutate(request.id)}
                        >
                          {t('requests.promote')}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
              {data.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={COLUMN_COUNT}
                    className="text-center py-8 text-[#062E25]/75"
                  >
                    {t('requests.empty')}
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
    </div>
  )
}
