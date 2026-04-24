'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
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
import {
  adminFeedInTariffsService,
  type AdminFeedInTariffRow,
} from '@/services/admin-feed-in-tariffs.service'

function isActive(row: AdminFeedInTariffRow): boolean {
  const now = Date.now()
  const from = new Date(row.validFrom).getTime()
  const to = row.validTo ? new Date(row.validTo).getTime() : Infinity
  return from <= now && now <= to
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('de-CH')
}

function fmtChf(n: number): string {
  return n.toLocaleString('de-CH', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  })
}

function fmtRp(n: number): string {
  return (n * 100).toLocaleString('de-CH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export default function AdminFeedInTariffsPage() {
  const t = useTranslations('admin.resources.feedInTariffs')
  const [rows, setRows] = useState<AdminFeedInTariffRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const scope = (row: AdminFeedInTariffRow): string => {
    if (row.operatorName) return t('scopeOperator', { name: row.operatorName })
    if (row.bfsNumber != null) return t('scopeBfs', { bfs: row.bfsNumber })
    if (row.cantonCode) return t('scopeCanton', { canton: row.cantonCode })
    return t('scopeNational')
  }

  useEffect(() => {
    adminFeedInTariffsService
      .list()
      .then(res => setRows(res.rows))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(r => {
      return (
        r.source.toLowerCase().includes(q) ||
        (r.operatorName ?? '').toLowerCase().includes(q) ||
        (r.cantonCode ?? '').toLowerCase().includes(q) ||
        String(r.bfsNumber ?? '').includes(q)
      )
    })
  }, [rows, search])

  if (loading) return <AdminPageLoader />

  const nationalActive = rows.find(r =>
    isActive(r) && !r.operatorName && r.bfsNumber == null && !r.cantonCode,
  )

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#062E25] mb-2">
        {t('title')}
      </h1>
      <p className="text-base text-[#062E25]/60 mb-6">
        {t('description')}
      </p>

      {nationalActive && (
        <Card className="border-[#062E25]/10 mb-6">
          <CardContent className="p-6">
            <p className="text-sm text-[#062E25]/50 uppercase tracking-wider mb-2">
              {t('currentNational')}
            </p>
            <p className="text-xl font-semibold text-[#062E25]">
              {nationalActive.source}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
              <div>
                <p className="text-sm text-[#062E25]/50">{t('tariff')}</p>
                <p className="text-base font-semibold text-[#062E25] tabular-nums">
                  {fmtRp(nationalActive.chfPerKwh)} Rp/kWh
                </p>
                <p className="text-sm text-[#062E25]/50">
                  {fmtChf(nationalActive.chfPerKwh)} CHF/kWh
                </p>
              </div>
              <div>
                <p className="text-sm text-[#062E25]/50">{t('validFrom')}</p>
                <p className="text-base font-semibold text-[#062E25]">
                  {fmtDate(nationalActive.validFrom)}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#062E25]/50">{t('published')}</p>
                <p className="text-base font-semibold text-[#062E25]">
                  {fmtDate(nationalActive.publishedAt)}
                </p>
              </div>
            </div>
            {nationalActive.notes && (
              <p className="text-sm text-[#062E25]/60 mt-4">
                {nationalActive.notes}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="border-[#062E25]/10">
        <CardContent className="p-6">
          <div className="mb-4">
            <Input
              placeholder={t('searchPlaceholder')}
              className="max-w-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('tableSource')}</TableHead>
                <TableHead>{t('tableScope')}</TableHead>
                <TableHead>{t('tableValidFrom')}</TableHead>
                <TableHead>{t('tableValidTo')}</TableHead>
                <TableHead className="text-right">{t('tableRpKwh')}</TableHead>
                <TableHead className="text-right">{t('tableChfKwh')}</TableHead>
                <TableHead>{t('tableStatus')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.source}</TableCell>
                  <TableCell>{scope(r)}</TableCell>
                  <TableCell>{fmtDate(r.validFrom)}</TableCell>
                  <TableCell>{fmtDate(r.validTo)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {fmtRp(r.chfPerKwh)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {fmtChf(r.chfPerKwh)}
                  </TableCell>
                  <TableCell>
                    {isActive(r) ? (
                      <span className="inline-flex items-center rounded-full bg-[#B7FE1A]/30 text-[#062E25] text-sm px-2 py-0.5">
                        {t('active')}
                      </span>
                    ) : (
                      <span className="text-[#062E25]/50 text-sm">{t('inactive')}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
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
        </CardContent>
      </Card>
    </div>
  )
}
