import type { ReactNode } from 'react'
import { Banknote, Sun, Users, Zap } from 'lucide-react'

import { type RoofRentEstimate, formatSwissNumber } from './roof-rent-api'

// Result of the roof check. The rent and the tenant saving appear only when
// the API returns them, which it does once the owner has set the rates.
// Without them the page shows the roof and its yield only.

type Ok = Extract<RoofRentEstimate, { status: 'ok' }>

function wmsCropUrl(e: number, n: number, half: number, px: number): string {
  const bbox = `${e - half},${n - half},${e + half},${n + half}`
  return `https://wms.geo.admin.ch/?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=ch.swisstopo.swissimage&STYLES=&CRS=EPSG:2056&BBOX=${bbox}&WIDTH=${px}&HEIGHT=${px}&FORMAT=image/jpeg`
}

function formatDecimal(value: number): string {
  return value.toLocaleString('de-CH', { maximumFractionDigits: 1 })
}

function Tile({
  icon,
  value,
  label,
}: {
  icon: ReactNode
  value: string
  label: string
}) {
  return (
    <div className="rounded-2xl bg-white p-5">
      {icon}
      <p className="mt-2 text-2xl font-bold tabular-nums">{value}</p>
      <p className="text-base text-[#062E25]/70">{label}</p>
    </div>
  )
}

function OkResult({ estimate }: { estimate: Ok }) {
  const { address, assumptions } = estimate
  const street = `${address.street ?? ''} ${address.number ?? ''}`.trim()
  const place = `${address.postalCode ?? ''} ${address.city ?? ''}`.trim()
  const addressLine =
    [street, place].filter(Boolean).join(', ') || address.label

  return (
    <div className="space-y-6">
      <div>
        <p className="text-base font-medium uppercase tracking-wide text-[#062E25]/60">
          Ihre Liegenschaft
        </p>
        <p className="text-xl font-semibold">{addressLine}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <figure>
          <img
            src={wmsCropUrl(estimate.lv95E, estimate.lv95N, 60, 800)}
            alt={`Luftbild der Liegenschaft ${addressLine}`}
            className="aspect-square w-full rounded-2xl border border-[#062E25]/10 object-cover"
          />
          <figcaption className="mt-2 text-base text-[#062E25]/60">
            Luftbild SWISSIMAGE, ©swisstopo
          </figcaption>
        </figure>

        <div className="space-y-4">
          {estimate.roofAreaM2 != null && (
            <Tile
              icon={<Sun className="h-5 w-5 text-amber-500" />}
              value={`${formatSwissNumber(estimate.roofAreaM2)} m²`}
              label="gut geeignete Dachfläche gemäss sonnendach.ch"
            />
          )}
          {estimate.kwhYear != null ? (
            <Tile
              icon={<Zap className="h-5 w-5 text-amber-500" />}
              value={`${formatSwissNumber(estimate.kwhYear)} kWh`}
              label="Solarstrom pro Jahr gemäss sonnendach.ch"
            />
          ) : (
            <p className="rounded-2xl bg-white p-5 text-base">
              Für dieses Gebäude liefert sonnendach.ch keinen eindeutigen Wert.
              Wir prüfen das Dach gerne für Sie.
            </p>
          )}
          {estimate.yearlyRentChf != null && (
            <Tile
              icon={<Banknote className="h-5 w-5 text-amber-500" />}
              value={`CHF ${formatSwissNumber(estimate.yearlyRentChf)}`}
              label="Dachmiete pro Jahr, Richtwert"
            />
          )}
        </div>
      </div>

      <p className="text-base text-[#062E25]/75">
        Im Anlagenregister des Bundes ist für dieses Gebäude aktuell keine
        Photovoltaikanlage erfasst.
      </p>

      {estimate.yearlyRentChf != null &&
        estimate.kwp != null &&
        assumptions.chfPerKwp != null && (
          <p className="text-base text-[#062E25]/75">
            Richtwert für eine Anlage von rund {formatDecimal(estimate.kwp)} kWp
            bei CHF {formatDecimal(assumptions.chfPerKwp)} pro kWp und Jahr. Die
            verbindliche Dachmiete steht in der Offerte.
          </p>
        )}

      {estimate.tenantSavingChf != null && (
        <div className="flex gap-4 rounded-2xl bg-white p-5">
          <Users className="mt-1 h-5 w-5 shrink-0 text-amber-500" />
          <p className="text-base">
            Statt der Dachmiete kann der Solarstrom auch an die Mietflächen
            gehen. Die Mieterschaft spart damit zusammen rund CHF{' '}
            {formatSwissNumber(estimate.tenantSavingChf)} pro Jahr
            {assumptions.selfConsumption != null &&
              assumptions.savingRappenPerKwh != null && (
                <>
                  {' '}
                  (Richtwert bei{' '}
                  {formatSwissNumber(assumptions.selfConsumption * 100)} Prozent
                  Eigenverbrauch und{' '}
                  {formatDecimal(assumptions.savingRappenPerKwh)} Rappen pro
                  kWh)
                </>
              )}
            .
          </p>
        </div>
      )}

      {estimate.yearlyRentChf == null && (
        <p className="text-base text-[#062E25]/75">
          Die Dachmiete berechnen wir für jedes Dach einzeln. Fordern Sie unten
          eine Richtofferte an.
        </p>
      )}
    </div>
  )
}

export default function EstimateResult({
  estimate,
}: {
  estimate: RoofRentEstimate
}) {
  if (estimate.status === 'ok') return <OkResult estimate={estimate} />

  const message =
    estimate.status === 'has_pv'
      ? 'Für dieses Gebäude ist im Anlagenregister des Bundes bereits eine Photovoltaikanlage erfasst. Falls das nicht stimmt, senden Sie uns unten eine Anfrage.'
      : estimate.status === 'not_found'
        ? 'Zu dieser Adresse finden wir im Gebäuderegister kein eindeutiges Gebäude. Bitte wählen Sie die Adresse aus der Liste oder prüfen Sie Strasse, Hausnummer und PLZ.'
        : 'Die Prüfung ist im Moment nicht möglich. Sie können uns unten trotzdem eine Anfrage senden.'

  return (
    <p role="status" className="rounded-2xl bg-white p-5 text-base">
      {message}
    </p>
  )
}
