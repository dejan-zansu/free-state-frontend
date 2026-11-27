import { Banknote, Car, House, MapPin, Sun, Truck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { formatSwissNumber } from '@/components/references/reference-utils'

import { equivalentsFor } from './roof-equivalents'

export type RoofNeighbours = {
  postCode: string
  place: string
  count: number
  nearest: { distanceM: number; kw: number | null } | null
}

export type RoofFactsData = {
  plant: { kwp: number; kwhYear: number; panelCount: number } | null
  value: {
    chfPerYear: number
    rpKwh: number
    year: number
    municipalityName: string
  } | null
  neighbours: RoofNeighbours | null
  monthlyKwh: number[] | null
}

type Equivalent = {
  key: string
  icon: LucideIcon
  big: string
  text: string
}

const EQUIVALENT_GRID: Record<number, string> = {
  1: 'grid grid-cols-1 gap-4',
  2: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
  3: 'grid grid-cols-1 sm:grid-cols-3 gap-4',
}

function equivalentTiles(kwhYear: number): Equivalent[] {
  const { laps, km, vans, houses } = equivalentsFor(kwhYear)
  const tiles: Equivalent[] = []
  if (laps >= 1) {
    tiles.push({
      key: 'laps',
      icon: Car,
      big: `${formatSwissNumber(Math.round(laps))}-mal um die Erde`,
      text: `mit einem Elektroauto, rund ${formatSwissNumber(Math.round(km / 1000) * 1000)} km`,
    })
  }
  if (vans >= 1) {
    tiles.push({
      key: 'vans',
      icon: Truck,
      big: `${formatSwissNumber(Math.round(vans))} Elektro-Lieferwagen`,
      text: 'ein ganzes Jahr unterwegs',
    })
  }
  if (houses >= 1) {
    const count = Math.round(houses)
    tiles.push({
      key: 'houses',
      icon: House,
      big: `${formatSwissNumber(count)} ${count === 1 ? 'Einfamilienhaus' : 'Einfamilienhäuser'}`,
      text: 'mit einer Wärmepumpe beheizt',
    })
  }
  return tiles
}

export default function RoofFacts({
  plant,
  value,
}: {
  plant: NonNullable<RoofFactsData['plant']>
  value: RoofFactsData['value']
}) {
  const equivalents = equivalentTiles(plant.kwhYear)
  return (
    <>
      <section className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-[#062E25]/5 p-5">
            <Sun className="w-5 h-5 text-amber-500" />
            <p className="mt-2 text-2xl font-bold tabular-nums">
              {formatSwissNumber(plant.kwp)} kWp
            </p>
            <p className="text-base text-[#062E25]/70">
              Realistische Anlage auf Ihrem Dach mit rund{' '}
              {formatSwissNumber(plant.kwhYear)} kWh Solarstrom pro Jahr
            </p>
          </div>
          {value && (
            <div className="rounded-2xl bg-[#062E25]/5 p-5">
              <Banknote className="w-5 h-5 text-amber-500" />
              <p className="mt-2 text-2xl font-bold tabular-nums">
                CHF {formatSwissNumber(value.chfPerYear)}
              </p>
              <p className="text-base text-[#062E25]/70">
                Wert dieses Solarstroms pro Jahr zum Gewerbetarif von{' '}
                {value.municipalityName} ({value.rpKwh.toFixed(2)} Rp./kWh,
                ElCom {value.year})
              </p>
            </div>
          )}
        </div>
        {value && (
          <p className="text-base font-medium text-[#062E25]/80">
            Mit SolarFree zahlen Sie für den Solarstrom, den Sie selbst
            verbrauchen, ca.{' '}30{' '}% weniger.
          </p>
        )}
      </section>

      {equivalents.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            So viel Strom liefert Ihr Dach in einem Jahr
          </h2>
          <div className={EQUIVALENT_GRID[equivalents.length]}>
            {equivalents.map(tile => {
              const Icon = tile.icon
              return (
                <div
                  key={tile.key}
                  className="rounded-2xl border border-[#062E25]/10 p-5"
                >
                  <Icon className="w-6 h-6 text-amber-500" />
                  <p className="mt-3 text-xl font-bold tabular-nums">
                    {tile.big}
                  </p>
                  <p className="text-base text-[#062E25]/70">{tile.text}</p>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </>
  )
}

export function RoofNeighboursNote({
  neighbours,
}: {
  neighbours: RoofNeighbours
}) {
  if (neighbours.count < 1) return null
  const where = [neighbours.postCode, neighbours.place]
    .filter(Boolean)
    .join(' ')
  const distance =
    neighbours.nearest && neighbours.nearest.distanceM >= 1
      ? `, die nächste ${formatSwissNumber(neighbours.nearest.distanceM)} m von Ihrem Gebäude entfernt`
      : ''
  return (
    <div className="flex gap-3 rounded-2xl bg-[#062E25]/5 p-5">
      <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
      <p className="text-base text-[#062E25]/80">
        {neighbours.count === 1 ? (
          <>
            In {where} ist bereits{' '}
            <span className="font-semibold">eine Solaranlage</span> beim Bund
            gemeldet
          </>
        ) : (
          <>
            In {where} sind bereits{' '}
            <span className="font-semibold tabular-nums">
              {formatSwissNumber(neighbours.count)} Solaranlagen
            </span>{' '}
            beim Bund gemeldet
          </>
        )}
        {distance}.
      </p>
    </div>
  )
}
