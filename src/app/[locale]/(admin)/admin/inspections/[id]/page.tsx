'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  adminInspectionsService,
  type AdminInspectionDetail,
  type InspectionStatus,
} from '@/services/admin-technical-inspections.service'

const STATUS_LABEL: Record<InspectionStatus, string> = {
  SCHEDULED: 'Geplant',
  IN_PROGRESS: 'In Bearbeitung',
  COMPLETED: 'Abgeschlossen',
  CANCELLED: 'Storniert',
}

function num(v: string): number | null {
  const n = Number(v.replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('de-CH')
}

function toDateInputValue(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function AdminInspectionDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params.id

  const [inspection, setInspection] = useState<AdminInspectionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [scheduledAt, setScheduledAt] = useState('')
  const [kwp, setKwp] = useState('')
  const [production, setProduction] = useState('')
  const [consumption, setConsumption] = useState('')
  const [panelCount, setPanelCount] = useState('')
  const [shadingNotes, setShadingNotes] = useState('')
  const [accessNotes, setAccessNotes] = useState('')
  const [roofConditionNotes, setRoofConditionNotes] = useState('')
  const [inspectionNotes, setInspectionNotes] = useState('')
  const [photoUrlsDraft, setPhotoUrlsDraft] = useState('')

  useEffect(() => {
    if (!id) return
    adminInspectionsService
      .get(id)
      .then(data => {
        setInspection(data)
        setScheduledAt(toDateInputValue(data.scheduledAt))
        setKwp(
          data.verifiedSystemSizeKwp != null
            ? String(Number(data.verifiedSystemSizeKwp))
            : '',
        )
        setProduction(
          data.verifiedAnnualProductionKwh != null
            ? String(Number(data.verifiedAnnualProductionKwh))
            : '',
        )
        setConsumption(
          data.verifiedAnnualConsumptionKwh != null
            ? String(Number(data.verifiedAnnualConsumptionKwh))
            : '',
        )
        setPanelCount(
          data.verifiedPanelCount != null ? String(data.verifiedPanelCount) : '',
        )
        setShadingNotes(data.shadingNotes ?? '')
        setAccessNotes(data.accessNotes ?? '')
        setRoofConditionNotes(data.roofConditionNotes ?? '')
        setInspectionNotes(data.inspectionNotes ?? '')
        setPhotoUrlsDraft((data.photoUrls ?? []).join('\n'))
      })
      .catch(err => {
        console.error(err)
        setError('Besichtigung konnte nicht geladen werden.')
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading || !inspection) return <AdminPageLoader />

  const immutable =
    inspection.status === 'COMPLETED' || inspection.status === 'CANCELLED'
  const user = inspection.lead.customer.user
  const calc = inspection.lead.project?.solarCalculation
  const prelimKwp = calc?.totalSystemCapacityKw
  const prelimProd = calc?.annualProductionKwh
  const prelimCons = calc?.annualConsumptionKwh

  const parsedPhotoUrls = photoUrlsDraft
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0)

  const buildPayload = () => ({
    scheduledAt: scheduledAt
      ? new Date(scheduledAt).toISOString()
      : undefined,
    verifiedSystemSizeKwp: kwp ? num(kwp) : null,
    verifiedAnnualProductionKwh: production ? num(production) : null,
    verifiedAnnualConsumptionKwh: consumption ? num(consumption) : null,
    verifiedPanelCount: panelCount ? num(panelCount) : null,
    shadingNotes: shadingNotes || null,
    accessNotes: accessNotes || null,
    roofConditionNotes: roofConditionNotes || null,
    inspectionNotes: inspectionNotes || null,
    photoUrls: parsedPhotoUrls,
  })

  const saveDraft = async () => {
    setSaving(true)
    setError(null)
    try {
      const updated = await adminInspectionsService.update(id, buildPayload())
      setInspection(prev => (prev ? { ...prev, ...updated } : prev))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Speichern fehlgeschlagen')
    } finally {
      setSaving(false)
    }
  }

  const complete = async () => {
    setError(null)
    const kwpNum = num(kwp)
    const prodNum = num(production)
    if (!kwpNum || kwpNum <= 0) {
      setError('Verifizierte Systemgrösse (kWp) ist erforderlich.')
      return
    }
    if (!prodNum || prodNum <= 0) {
      setError('Verifizierter Jahresertrag (kWh) ist erforderlich.')
      return
    }

    setCompleting(true)
    try {
      const updated = await adminInspectionsService.complete(id, {
        verifiedSystemSizeKwp: kwpNum,
        verifiedAnnualProductionKwh: prodNum,
        verifiedAnnualConsumptionKwh: consumption ? num(consumption) : null,
        verifiedPanelCount: panelCount ? num(panelCount) : null,
        shadingNotes: shadingNotes || null,
        accessNotes: accessNotes || null,
        roofConditionNotes: roofConditionNotes || null,
        inspectionNotes: inspectionNotes || null,
        photoUrls: parsedPhotoUrls,
      })
      setInspection(prev => (prev ? { ...prev, ...updated } : prev))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Abschluss fehlgeschlagen')
    } finally {
      setCompleting(false)
    }
  }

  const cancelInspection = async () => {
    const reason = window.prompt('Grund für die Stornierung:')
    if (!reason || !reason.trim()) return
    setCancelling(true)
    setError(null)
    try {
      const updated = await adminInspectionsService.cancel(id, reason.trim())
      setInspection(prev => (prev ? { ...prev, ...updated } : prev))
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Stornierung fehlgeschlagen')
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div>
      <div className="mb-4">
        <Link
          href="/de/admin/inspections"
          className="text-sm text-[#062E25]/60 hover:text-[#062E25] underline underline-offset-4"
        >
          ← Zurück zur Liste
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-[#062E25] mb-2">
        Besichtigung · {user.firstName} {user.lastName}
      </h1>
      <p className="text-base text-[#062E25]/60 mb-6">
        {inspection.lead.propertyAddress} · Status:{' '}
        <strong>{STATUS_LABEL[inspection.status]}</strong>
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 text-red-800 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-[#062E25]/10">
          <CardContent className="p-6">
            <p className="text-sm text-[#062E25]/50 uppercase tracking-wider mb-3">
              Vorläufige Werte (aus Rechner)
            </p>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-[#062E25]/60">System (kWp)</dt>
              <dd className="tabular-nums text-right">
                {prelimKwp != null ? Number(prelimKwp).toFixed(2) : '—'}
              </dd>
              <dt className="text-[#062E25]/60">Jahresertrag (kWh)</dt>
              <dd className="tabular-nums text-right">
                {prelimProd != null ? Number(prelimProd).toFixed(0) : '—'}
              </dd>
              <dt className="text-[#062E25]/60">Jahresverbrauch (kWh)</dt>
              <dd className="tabular-nums text-right">
                {prelimCons != null ? Number(prelimCons).toFixed(0) : '—'}
              </dd>
            </dl>
            <div className="mt-4 pt-4 border-t border-[#062E25]/10">
              <p className="text-sm text-[#062E25]/50 uppercase tracking-wider mb-2">
                Kontakt
              </p>
              <p className="text-sm text-[#062E25]">
                <strong>{user.firstName} {user.lastName}</strong>
              </p>
              <p className="text-sm text-[#062E25]/70">{user.email}</p>
              {user.phone && (
                <p className="text-sm text-[#062E25]/70">{user.phone}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#062E25]/10">
          <CardContent className="p-6">
            <p className="text-sm text-[#062E25]/50 uppercase tracking-wider mb-3">
              Termin & Inspektor
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-[#062E25]/60 block mb-1">
                  Geplantes Datum / Uhrzeit
                </label>
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={e => setScheduledAt(e.target.value)}
                  disabled={immutable}
                />
              </div>
              {inspection.inspector && (
                <div>
                  <p className="text-sm text-[#062E25]/60">Inspektor</p>
                  <p className="text-sm text-[#062E25]">
                    {inspection.inspector.firstName}{' '}
                    {inspection.inspector.lastName}
                  </p>
                </div>
              )}
              {inspection.completedAt && (
                <p className="text-sm text-[#062E25]/60">
                  Abgeschlossen am {fmtDate(inspection.completedAt)}
                </p>
              )}
              {inspection.cancelledAt && (
                <div className="rounded bg-red-50 text-red-800 text-sm px-3 py-2">
                  Storniert am {fmtDate(inspection.cancelledAt)}
                  {inspection.cancellationReason && (
                    <p className="mt-1">
                      Grund: {inspection.cancellationReason}
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#062E25]/10 mt-4">
        <CardContent className="p-6">
          <p className="text-sm text-[#062E25]/50 uppercase tracking-wider mb-4">
            Verifizierte Werte
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-[#062E25]/60 block mb-1">
                System (kWp) *
              </label>
              <Input
                type="number"
                step="0.01"
                value={kwp}
                onChange={e => setKwp(e.target.value)}
                disabled={immutable}
              />
            </div>
            <div>
              <label className="text-sm text-[#062E25]/60 block mb-1">
                Jahresertrag (kWh) *
              </label>
              <Input
                type="number"
                value={production}
                onChange={e => setProduction(e.target.value)}
                disabled={immutable}
              />
            </div>
            <div>
              <label className="text-sm text-[#062E25]/60 block mb-1">
                Jahresverbrauch (kWh) — aus Stromrechnung
              </label>
              <Input
                type="number"
                value={consumption}
                onChange={e => setConsumption(e.target.value)}
                disabled={immutable}
              />
            </div>
            <div>
              <label className="text-sm text-[#062E25]/60 block mb-1">
                Anzahl Module
              </label>
              <Input
                type="number"
                value={panelCount}
                onChange={e => setPanelCount(e.target.value)}
                disabled={immutable}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#062E25]/10 mt-4">
        <CardContent className="p-6">
          <p className="text-sm text-[#062E25]/50 uppercase tracking-wider mb-4">
            Beobachtungen
          </p>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-[#062E25]/60 block mb-1">
                Verschattung
              </label>
              <textarea
                rows={2}
                className="w-full rounded-md border border-[#062E25]/20 px-3 py-2 text-sm"
                value={shadingNotes}
                onChange={e => setShadingNotes(e.target.value)}
                disabled={immutable}
              />
            </div>
            <div>
              <label className="text-sm text-[#062E25]/60 block mb-1">
                Zugang / Montagezugänglichkeit
              </label>
              <textarea
                rows={2}
                className="w-full rounded-md border border-[#062E25]/20 px-3 py-2 text-sm"
                value={accessNotes}
                onChange={e => setAccessNotes(e.target.value)}
                disabled={immutable}
              />
            </div>
            <div>
              <label className="text-sm text-[#062E25]/60 block mb-1">
                Dachzustand
              </label>
              <textarea
                rows={2}
                className="w-full rounded-md border border-[#062E25]/20 px-3 py-2 text-sm"
                value={roofConditionNotes}
                onChange={e => setRoofConditionNotes(e.target.value)}
                disabled={immutable}
              />
            </div>
            <div>
              <label className="text-sm text-[#062E25]/60 block mb-1">
                Allgemeine Bemerkungen
              </label>
              <textarea
                rows={3}
                className="w-full rounded-md border border-[#062E25]/20 px-3 py-2 text-sm"
                value={inspectionNotes}
                onChange={e => setInspectionNotes(e.target.value)}
                disabled={immutable}
              />
            </div>
            <div>
              <label className="text-sm text-[#062E25]/60 block mb-1">
                Fotos (eine URL pro Zeile)
              </label>
              <textarea
                rows={3}
                className="w-full rounded-md border border-[#062E25]/20 px-3 py-2 text-sm font-mono"
                value={photoUrlsDraft}
                onChange={e => setPhotoUrlsDraft(e.target.value)}
                placeholder="https://…"
                disabled={immutable}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {!immutable && (
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button onClick={saveDraft} disabled={saving} variant="outline">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Entwurf speichern
          </Button>
          <Button onClick={complete} disabled={completing}>
            {completing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="mr-2 h-4 w-4" />
            )}
            Besichtigung abschliessen
          </Button>
          <Button
            onClick={cancelInspection}
            disabled={cancelling}
            variant="outline"
            className="ml-auto border-red-200 text-red-700 hover:bg-red-50"
          >
            {cancelling ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="mr-2 h-4 w-4" />
            )}
            Stornieren
          </Button>
        </div>
      )}
    </div>
  )
}
