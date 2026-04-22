'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'

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
import {
  adminElectricityPricesService,
  type AdminSwissTariffListResponse,
  type AdminSwissTariffRow,
} from '@/services/admin-electricity-prices.service'

const PAGE_SIZE = 50
const ALL = '__all__'

function formatRp(value: number): string {
  return value.toFixed(2)
}

function formatChf(value: number): string {
  return (value / 100).toFixed(4)
}

export default function AdminElectricityPricesPage() {
  const [data, setData] = useState<AdminSwissTariffListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [year, setYear] = useState<number | null>(null)
  const [category, setCategory] = useState<string>('H4')
  const [cantonCode, setCantonCode] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300)
    return () => clearTimeout(t)
  }, [searchInput])

  useEffect(() => {
    setPage(1)
  }, [search, year, category, cantonCode])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    adminElectricityPricesService
      .list({
        year: year ?? undefined,
        category: category || undefined,
        cantonCode: cantonCode ?? undefined,
        search: search || undefined,
        page,
        pageSize: PAGE_SIZE,
      })
      .then(res => {
        if (cancelled) return
        setData(res)
        if (!year && res.summary.years[0]) {
          setYear(res.summary.years[0])
        }
      })
      .catch(err => {
        console.error(err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [search, year, category, cantonCode, page])

  const rows: AdminSwissTariffRow[] = data?.rows ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const summary = data?.summary

  const avgChf = useMemo(
    () => (summary ? (summary.avgRpKwh / 100).toFixed(4) : '—'),
    [summary],
  )

  if (!data && loading) return <AdminPageLoader />

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#062E25] mb-2">
        Strompreise nach Gemeinde
      </h1>
      <p className="text-base text-[#062E25]/60 mb-6">
        Offizielle ElCom-Tarife pro Gemeinde, Betreiber und Tarifkategorie — informativ.
        Quelle: <a href="https://www.strompreis.elcom.admin.ch/" target="_blank" rel="noreferrer" className="underline">strompreis.elcom.admin.ch</a> (LINDAS).
      </p>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="border-[#062E25]/10">
            <CardContent className="p-4">
              <p className="text-sm text-[#062E25]/50 uppercase tracking-wider">
                Einträge
              </p>
              <p className="text-xl font-semibold text-[#062E25] tabular-nums">
                {total.toLocaleString('de-CH')}
              </p>
            </CardContent>
          </Card>
          <Card className="border-[#062E25]/10">
            <CardContent className="p-4">
              <p className="text-sm text-[#062E25]/50 uppercase tracking-wider">
                Ø Tarif
              </p>
              <p className="text-xl font-semibold text-[#062E25] tabular-nums">
                {formatRp(summary.avgRpKwh)} Rp
              </p>
              <p className="text-sm text-[#062E25]/50">{avgChf} CHF/kWh</p>
            </CardContent>
          </Card>
          <Card className="border-[#062E25]/10">
            <CardContent className="p-4">
              <p className="text-sm text-[#062E25]/50 uppercase tracking-wider">
                Tiefster
              </p>
              <p className="text-xl font-semibold text-[#062E25] tabular-nums">
                {formatRp(summary.minRpKwh)} Rp
              </p>
            </CardContent>
          </Card>
          <Card className="border-[#062E25]/10">
            <CardContent className="p-4">
              <p className="text-sm text-[#062E25]/50 uppercase tracking-wider">
                Höchster
              </p>
              <p className="text-xl font-semibold text-[#062E25] tabular-nums">
                {formatRp(summary.maxRpKwh)} Rp
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="border-[#062E25]/10">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Input
              placeholder="Suche Gemeinde, Betreiber, BFS…"
              className="max-w-sm"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            {summary?.years && (
              <Select
                value={year ? String(year) : ALL}
                onValueChange={v => setYear(v === ALL ? null : Number(v))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Jahr" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Alle Jahre</SelectItem>
                  {summary.years.map(y => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {summary?.categories && (
              <Select value={category} onValueChange={v => setCategory(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Kategorie" />
                </SelectTrigger>
                <SelectContent>
                  {summary.categories.map(c => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {summary?.cantons && summary.cantons.length > 0 && (
              <Select
                value={cantonCode ?? ALL}
                onValueChange={v => setCantonCode(v === ALL ? null : v)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Kanton" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Alle Kantone</SelectItem>
                  {summary.cantons.map(c => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {loading && <Loader2 className="h-4 w-4 animate-spin text-[#062E25]/40" />}
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>BFS</TableHead>
                  <TableHead>Gemeinde</TableHead>
                  <TableHead>Kanton</TableHead>
                  <TableHead>Betreiber</TableHead>
                  <TableHead className="text-right">Total Rp/kWh</TableHead>
                  <TableHead className="text-right">CHF/kWh</TableHead>
                  <TableHead className="text-right">Energie</TableHead>
                  <TableHead className="text-right">Netz</TableHead>
                  <TableHead className="text-right">Abgaben</TableHead>
                  <TableHead className="text-right">Grundgebühr</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, i) => (
                  <TableRow key={`${r.bfsNumber}-${r.operatorName}-${r.productCode}-${r.year}-${r.category}-${i}`}>
                    <TableCell className="font-medium tabular-nums">{r.bfsNumber}</TableCell>
                    <TableCell>{r.municipalityName}</TableCell>
                    <TableCell>{r.cantonCode ?? '—'}</TableCell>
                    <TableCell className="max-w-xs truncate" title={r.operatorName}>
                      {r.operatorName}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-semibold">
                      {formatRp(r.totalRpKwh)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-[#062E25]/60">
                      {formatChf(r.totalRpKwh)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-[#062E25]/60">
                      {formatRp(r.energyRpKwh)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-[#062E25]/60">
                      {formatRp(r.gridusageRpKwh)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-[#062E25]/60">
                      {formatRp(r.aidfeeRpKwh + r.chargeRpKwh)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums text-[#062E25]/60">
                      {r.fixcostsChf != null ? r.fixcostsChf.toFixed(0) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
                {rows.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-[#062E25]/50 py-8">
                      Keine Tarife gefunden.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-6">
            <p className="text-sm text-[#062E25]/50">
              Seite {page} von {totalPages} · {total.toLocaleString('de-CH')} Einträge
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Zurück
              </Button>
              <Button
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Weiter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
