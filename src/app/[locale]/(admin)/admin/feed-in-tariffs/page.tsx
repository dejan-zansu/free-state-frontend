'use client'

import { useEffect, useMemo, useState } from 'react'

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

function scope(row: AdminFeedInTariffRow): string {
  if (row.operatorName) return `Operator: ${row.operatorName}`
  if (row.bfsNumber != null) return `BFS ${row.bfsNumber}`
  if (row.cantonCode) return `Kanton ${row.cantonCode}`
  return 'National'
}

export default function AdminFeedInTariffsPage() {
  const [rows, setRows] = useState<AdminFeedInTariffRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

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
        Rückliefertarife (Einspeisevergütung)
      </h1>
      <p className="text-base text-[#062E25]/60 mb-6">
        Schweizer Rückliefertarife pro Netzbetreiber / Kanton / national.
        Grundlage für die Berechnung der Rücklieferungsvergütung. Ab 2026 nach
        dem quartalsweisen BFE-Referenzmarktpreis (Art. 15 EnG). Änderungen
        erfolgen über Seed-Skripte.
      </p>

      {nationalActive && (
        <Card className="border-[#062E25]/10 mb-6">
          <CardContent className="p-6">
            <p className="text-sm text-[#062E25]/50 uppercase tracking-wider mb-2">
              Aktueller nationaler Standardtarif
            </p>
            <p className="text-xl font-semibold text-[#062E25]">
              {nationalActive.source}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
              <div>
                <p className="text-sm text-[#062E25]/50">Tarif</p>
                <p className="text-base font-semibold text-[#062E25] tabular-nums">
                  {fmtRp(nationalActive.chfPerKwh)} Rp/kWh
                </p>
                <p className="text-sm text-[#062E25]/50">
                  {fmtChf(nationalActive.chfPerKwh)} CHF/kWh
                </p>
              </div>
              <div>
                <p className="text-sm text-[#062E25]/50">Gültig ab</p>
                <p className="text-base font-semibold text-[#062E25]">
                  {fmtDate(nationalActive.validFrom)}
                </p>
              </div>
              <div>
                <p className="text-sm text-[#062E25]/50">Publiziert</p>
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
              placeholder="Suche (Quelle, Operator, Kanton, BFS)…"
              className="max-w-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quelle</TableHead>
                <TableHead>Geltungsbereich</TableHead>
                <TableHead>Gültig ab</TableHead>
                <TableHead>Gültig bis</TableHead>
                <TableHead className="text-right">Rp/kWh</TableHead>
                <TableHead className="text-right">CHF/kWh</TableHead>
                <TableHead>Status</TableHead>
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
                        aktiv
                      </span>
                    ) : (
                      <span className="text-[#062E25]/50 text-sm">inaktiv</span>
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
