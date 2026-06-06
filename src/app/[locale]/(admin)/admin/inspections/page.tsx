'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
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
import {
  adminInspectionsService,
  type AdminInspectionRow,
  type InspectionStatus,
} from '@/services/admin-technical-inspections.service'

const ALL = '__all__'
const PAGE_SIZE = 50

const STATUSES: InspectionStatus[] = [
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
]

const STATUS_COLOR: Record<InspectionStatus, string> = {
  SCHEDULED: 'bg-[#062E25]/10 text-[#062E25]',
  IN_PROGRESS: 'bg-[#B7FE1A]/40 text-[#062E25]',
  COMPLETED: 'bg-[#036B53]/15 text-[#036B53]',
  CANCELLED: 'bg-[#062E25]/5 text-[#062E25]/50',
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function AdminInspectionsPage() {
  const t = useTranslations('admin.inspections')
  const tl = useTranslations('admin.statusLabels')
  const locale = useLocale()
  const [rows, setRows] = useState<AdminInspectionRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<InspectionStatus | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    setPage(1)
  }, [statusFilter, search])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    adminInspectionsService
      .list({
        status: statusFilter ?? undefined,
        search: search || undefined,
        page,
        pageSize: PAGE_SIZE,
      })
      .then(res => {
        if (cancelled) return
        setRows(res.rows)
        setTotal(res.total)
      })
      .catch(err => console.error(err))
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [statusFilter, search, page])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  if (!rows.length && loading) return <AdminPageLoader />

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#062E25] mb-2">
        {t('title')}
      </h1>
      <p className="text-base text-[#062E25]/60 mb-6">{t('subtitle')}</p>

      <Card className="border-[#062E25]/10">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Input
              placeholder={t('searchPlaceholder')}
              className="max-w-sm"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            <Select
              value={statusFilter ?? ALL}
              onValueChange={v =>
                setStatusFilter(
                  v === ALL ? null : (v as InspectionStatus),
                )
              }
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{t('allStatuses')}</SelectItem>
                {STATUSES.map(s => (
                  <SelectItem key={s} value={s}>
                    {tl(s)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('tableDate')}</TableHead>
                <TableHead>{t('tableCustomer')}</TableHead>
                <TableHead>{t('tableAddress')}</TableHead>
                <TableHead className="text-right">
                  {t('tablePreliminaryKwp')}
                </TableHead>
                <TableHead>{t('tableInspector')}</TableHead>
                <TableHead>{t('tableStatus')}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(r => {
                const user = r.lead.customer.user
                const fullName = `${user.firstName} ${user.lastName}`.trim()
                const inspectorName = r.inspector
                  ? `${r.inspector.firstName} ${r.inspector.lastName}`.trim()
                  : '—'
                const preliminaryKwp =
                  r.lead.project?.solarCalculation?.totalSystemCapacityKw
                return (
                  <TableRow key={r.id}>
                    <TableCell>{fmtDate(r.scheduledAt)}</TableCell>
                    <TableCell className="font-medium">{fullName}</TableCell>
                    <TableCell>{r.lead.propertyAddress}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {preliminaryKwp != null
                        ? Number(preliminaryKwp).toFixed(1)
                        : '—'}
                    </TableCell>
                    <TableCell>{inspectorName}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full text-sm px-2 py-0.5 ${STATUS_COLOR[r.status]}`}
                      >
                        {tl(r.status)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/${locale}/admin/inspections/${r.id}`}
                        className="text-sm text-[#062E25] underline underline-offset-4"
                      >
                        {t('open')}
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-[#062E25]/50 py-8"
                  >
                    {t('empty')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-[#062E25]/60">
              <span>{t('pagination', { page, totalPages, total })}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1 rounded border border-[#062E25]/20 disabled:opacity-30"
                >
                  {t('prev')}
                </button>
                <button
                  type="button"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-1 rounded border border-[#062E25]/20 disabled:opacity-30"
                >
                  {t('next')}
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
