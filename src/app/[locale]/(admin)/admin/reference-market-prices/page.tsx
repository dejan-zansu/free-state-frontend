'use client'

import { useEffect, useMemo, useState } from 'react'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { Card, CardContent } from '@/components/ui/card'
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
  adminReferenceMarketPricesService,
  type AdminReferenceMarketPriceRow,
} from '@/services/admin-reference-market-prices.service'

const ALL = '__all__'

const TECH_LABELS: Record<string, string> = {
  photovoltaik: 'Photovoltaik',
  wasserkraft: 'Wasserkraft',
  windenergie: 'Windenergie',
  biomasse: 'Biomasse',
}

function fmtRp(chfPerMwh: number): string {
  return (chfPerMwh / 10).toLocaleString('de-CH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function fmtChfMwh(n: number): string {
  return n.toLocaleString('de-CH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function fmtVolume(n: number | null): string {
  if (n == null) return '—'
  return Math.round(n).toLocaleString('de-CH')
}

export default function AdminReferenceMarketPricesPage() {
  const [rows, setRows] = useState<AdminReferenceMarketPriceRow[]>([])
  const [technologies, setTechnologies] = useState<string[]>([])
  const [years, setYears] = useState<number[]>([])
  const [technology, setTechnology] = useState<string>('photovoltaik')
  const [year, setYear] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    adminReferenceMarketPricesService
      .list({
        technology: technology || undefined,
        year: year ?? undefined,
      })
      .then(res => {
        setRows(res.rows)
        setTechnologies(res.summary.technologies)
        setYears(res.summary.years)
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [technology, year])

  const latestPv = useMemo(
    () =>
      rows.find(r => r.technology === 'photovoltaik') ??
      rows[0] ??
      null,
    [rows],
  )

  if (loading && rows.length === 0) return <AdminPageLoader />

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#062E25] mb-2">
        Referenz-Marktpreise (BFE, Art. 15 EnFV)
      </h1>
      <p className="text-base text-[#062E25]/60 mb-6">
        Quartalsweise publizierte Referenz-Marktpreise des BFE — ab 2026
        Grundlage für die Rückliefervergütung nach Art. 15 EnG. Quelle:{' '}
        <a
          href="https://opendata.swiss/de/dataset/referenz-marktpreise-gemass-art-15-enfv"
          target="_blank"
          rel="noreferrer"
          className="underline"
        >
          opendata.swiss (BFE-DS-0020)
        </a>
        . Import via{' '}
        <code className="text-sm bg-[#062E25]/5 px-1 rounded">
          scripts/import-bfe-reference-market-prices.ts
        </code>
        .
      </p>

      {latestPv && (
        <Card className="border-[#062E25]/10 mb-6">
          <CardContent className="p-6">
            <p className="text-sm text-[#062E25]/50 uppercase tracking-wider mb-2">
              Jüngster Wert ({TECH_LABELS[latestPv.technology] ?? latestPv.technology})
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <p className="text-sm text-[#062E25]/50">Quartal</p>
                <p className="text-base font-semibold text-[#062E25]">
                  {latestPv.year} {latestPv.period}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#062E25]/50">Preis</p>
                <p className="text-base font-semibold text-[#062E25] tabular-nums">
                  {fmtRp(latestPv.priceChfPerMwh)} Rp/kWh
                </p>
                <p className="text-sm text-[#062E25]/50 tabular-nums">
                  {fmtChfMwh(latestPv.priceChfPerMwh)} CHF/MWh
                </p>
              </div>
              <div>
                <p className="text-sm text-[#062E25]/50">Volumen</p>
                <p className="text-base font-semibold text-[#062E25] tabular-nums">
                  {fmtVolume(latestPv.volumeMwh)} MWh
                </p>
              </div>
              <div>
                <p className="text-sm text-[#062E25]/50">Importiert</p>
                <p className="text-base font-semibold text-[#062E25]">
                  {new Date(latestPv.importedAt).toLocaleDateString('de-CH')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-[#062E25]/10">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Select
              value={technology || ALL}
              onValueChange={v => setTechnology(v === ALL ? '' : v)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Technologie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Alle Technologien</SelectItem>
                {technologies.map(t => (
                  <SelectItem key={t} value={t}>
                    {TECH_LABELS[t] ?? t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={year ? String(year) : ALL}
              onValueChange={v => setYear(v === ALL ? null : Number(v))}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Jahr" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Alle Jahre</SelectItem>
                {years.map(y => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Jahr</TableHead>
                <TableHead>Quartal</TableHead>
                <TableHead>Technologie</TableHead>
                <TableHead className="text-right">Rp/kWh</TableHead>
                <TableHead className="text-right">CHF/MWh</TableHead>
                <TableHead className="text-right">Volumen (MWh)</TableHead>
                <TableHead className="text-right">Tage</TableHead>
                <TableHead>Importiert</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="tabular-nums">{r.year}</TableCell>
                  <TableCell>{r.period}</TableCell>
                  <TableCell>
                    {TECH_LABELS[r.technology] ?? r.technology}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {fmtRp(r.priceChfPerMwh)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {fmtChfMwh(r.priceChfPerMwh)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {fmtVolume(r.volumeMwh)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {r.days ?? '—'}
                  </TableCell>
                  <TableCell className="text-sm text-[#062E25]/60">
                    {new Date(r.importedAt).toLocaleDateString('de-CH')}
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center text-[#062E25]/50 py-8"
                  >
                    Keine Daten
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
