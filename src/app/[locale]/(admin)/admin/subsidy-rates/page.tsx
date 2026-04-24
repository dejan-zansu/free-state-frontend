'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  adminSubsidyRatesService,
  type AdminSubsidyRateRow,
} from '@/services/admin-subsidy-rates.service'

function isActive(row: AdminSubsidyRateRow): boolean {
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
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export default function AdminSubsidyRatesPage() {
  const t = useTranslations('admin.resources.subsidyRates')
  const [rows, setRows] = useState<AdminSubsidyRateRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminSubsidyRatesService
      .list()
      .then(res => setRows(res.rows))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <AdminPageLoader />

  const active = rows.find(isActive)

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#062E25] mb-2">
        {t('title')}
      </h1>
      <p className="text-base text-[#062E25]/60 mb-6">
        {t('description')}
      </p>

      {active && (
        <Card className="border-[#062E25]/10 mb-6">
          <CardContent className="p-6">
            <p className="text-sm text-[#062E25]/50 uppercase tracking-wider mb-2">
              {t('currentTariff')}
            </p>
            <p className="text-xl font-semibold text-[#062E25]">
              {active.source}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              <div>
                <p className="text-sm text-[#062E25]/50">{t('tier1Max')}</p>
                <p className="text-base font-semibold text-[#062E25] tabular-nums">
                  {active.tier1MaxKwp}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#062E25]/50">{t('tier1Chf')}</p>
                <p className="text-base font-semibold text-[#062E25] tabular-nums">
                  {fmtChf(active.tier1ChfPerKwp)}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#062E25]/50">{t('tier2Max')}</p>
                <p className="text-base font-semibold text-[#062E25] tabular-nums">
                  {active.tier2MaxKwp}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#062E25]/50">{t('tier2Chf')}</p>
                <p className="text-base font-semibold text-[#062E25] tabular-nums">
                  {fmtChf(active.tier2ChfPerKwp)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-[#062E25]/10">
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('tableSource')}</TableHead>
                <TableHead>{t('tableValidFrom')}</TableHead>
                <TableHead>{t('tableValidTo')}</TableHead>
                <TableHead className="text-right">{t('tableTier1Limit')}</TableHead>
                <TableHead className="text-right">{t('tableTier1Chf')}</TableHead>
                <TableHead className="text-right">{t('tableTier2Limit')}</TableHead>
                <TableHead className="text-right">{t('tableTier2Chf')}</TableHead>
                <TableHead>{t('tableStatus')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.source}</TableCell>
                  <TableCell>{fmtDate(r.validFrom)}</TableCell>
                  <TableCell>{fmtDate(r.validTo)}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {r.tier1MaxKwp}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {fmtChf(r.tier1ChfPerKwp)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {r.tier2MaxKwp}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {fmtChf(r.tier2ChfPerKwp)}
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
              {rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
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
