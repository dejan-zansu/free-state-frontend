import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CalendarDays, Mail, Sun, Zap } from 'lucide-react'
import { COMPANY_CALENDLY_URL } from '@/lib/company-contact'

export const metadata: Metadata = {
  title: 'Solarpotenzial Ihrer Dachfläche | Free State AG',
  robots: { index: false, follow: false },
}

type RoofSegment = {
  area: number | null
  tilt: number | null
  azimuthCardinal: string | null
  electricityYield: number | null
  suitabilityClass: number | null
}

type RoofData = {
  companyName: string
  addressStreet: string | null
  addressNumber: string | null
  addressPostalCode: string | null
  addressCity: string | null
  roofAreaM2: string | null
  roofKwhYear: number | null
  chfPerYear: string | null
  lv95E: number | null
  lv95N: number | null
  segments: RoofSegment[]
  suitableAggregation: { segmentCount: number; areaM2: number; kwhYear: number }
}

function formatSwissNumber(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, "'")
}

function wmsCropUrl(e: number, n: number, half: number, px: number): string {
  const bbox = `${e - half},${n - half},${e + half},${n + half}`
  return `https://wms.geo.admin.ch/?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=ch.swisstopo.swissimage&STYLES=&CRS=EPSG:2056&BBOX=${bbox}&WIDTH=${px}&HEIGHT=${px}&FORMAT=image/jpeg`
}

async function fetchRoofData(token: string): Promise<RoofData | null> {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
  try {
    const res = await fetch(`${base}/api/public/outreach/roof/${encodeURIComponent(token)}`, {
      cache: 'no-store',
    })
    if (!res.ok) return null
    const json = (await res.json()) as { success: boolean; data: RoofData }
    return json.success ? json.data : null
  } catch {
    return null
  }
}

const CALENDLY_URL = process.env.NEXT_PUBLIC_OUTBOUND_CALENDLY_URL || COMPANY_CALENDLY_URL

export default async function DachPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>
}) {
  const { token } = await params
  const data = await fetchRoofData(token)
  if (!data) notFound()

  const street = `${data.addressStreet ?? ''} ${data.addressNumber ?? ''}`.trim()
  const cityLine = `${data.addressPostalCode ?? ''} ${data.addressCity ?? ''}`.trim()
  const addressLine = [street, cityLine].filter(Boolean).join(', ')

  return (
    <div className="min-h-screen bg-white text-[#062E25]">
      <div className="border-b border-[#062E25]/10">
        <div className="mx-auto max-w-3xl px-5 py-4 flex items-center justify-between">
          <span className="font-semibold tracking-tight text-lg">Free State AG</span>
          <span className="text-base text-[#062E25]/60 hidden sm:block">Solarstrom vom eigenen Dach</span>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-5 py-10 space-y-10">
        <header className="space-y-2">
          <p className="text-base font-medium text-[#062E25]/60 uppercase tracking-wide">{data.companyName}</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Solarpotenzial Ihrer Dachfläche</h1>
          {addressLine && <p className="text-lg text-[#062E25]/75">{addressLine}</p>}
        </header>

        {data.lv95E != null && data.lv95N != null && (
          <figure>
            <img
              src={wmsCropUrl(data.lv95E, data.lv95N, 60, 800)}
              alt={`Luftbild der Dachfläche ${addressLine}`}
              className="w-full aspect-square sm:aspect-[4/3] object-cover rounded-2xl border border-[#062E25]/10"
            />
            <figcaption className="mt-2 text-base text-[#062E25]/60">
              Luftbild SWISSIMAGE, swisstopo
            </figcaption>
          </figure>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {data.roofAreaM2 != null && (
            <div className="rounded-2xl bg-[#062E25]/5 p-5">
              <Sun className="w-5 h-5 text-amber-500" />
              <p className="mt-2 text-2xl font-bold tabular-nums">
                {formatSwissNumber(Number(data.roofAreaM2))} m²
              </p>
              <p className="text-base text-[#062E25]/70">Gebäudegrundfläche gemäss Gebäuderegister des Bundes</p>
            </div>
          )}
          {data.roofKwhYear != null && (
            <div className="rounded-2xl bg-[#062E25]/5 p-5">
              <Zap className="w-5 h-5 text-amber-500" />
              <p className="mt-2 text-2xl font-bold tabular-nums">{formatSwissNumber(data.roofKwhYear)} kWh</p>
              <p className="text-base text-[#062E25]/70">Solarstrom pro Jahr gemäss sonnendach.ch</p>
            </div>
          )}
          {data.chfPerYear != null && (
            <div className="rounded-2xl bg-[#062E25] text-white p-5">
              <CalendarDays className="w-5 h-5 text-amber-300" />
              <p className="mt-2 text-2xl font-bold tabular-nums">CHF {data.chfPerYear}</p>
              <p className="text-base text-white/80">
                entspricht Stromkosten von rund CHF {data.chfPerYear} pro Jahr
              </p>
            </div>
          )}
        </section>

        {data.suitableAggregation.segmentCount > 0 && (
          <p className="text-base text-[#062E25]/75">
            {data.suitableAggregation.segmentCount === 1
              ? 'Eine gut geeignete Dachfläche'
              : `${data.suitableAggregation.segmentCount} gut geeignete Dachflächen`}{' '}
            mit zusammen rund {formatSwissNumber(data.suitableAggregation.areaM2)} m² und einem Potenzial von rund{' '}
            {formatSwissNumber(data.suitableAggregation.kwhYear)} kWh pro Jahr. Im Anlagenregister des Bundes ist für
            dieses Gebäude aktuell keine Photovoltaikanlage erfasst.
          </p>
        )}

        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Zwei Wege zur Nutzung dieser Dachfläche</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-[#062E25]/15 p-6 space-y-2">
              <h3 className="text-xl font-semibold">Kauf</h3>
              <p className="text-base text-[#062E25]/80">
                Sie investieren selbst, werden Eigentümerin oder Eigentümer der Anlage und profitieren direkt von
                tieferen Stromkosten.
              </p>
            </div>
            <div className="rounded-2xl border-2 border-[#062E25] p-6 space-y-2">
              <h3 className="text-xl font-semibold">Contracting</h3>
              <p className="text-base text-[#062E25]/80">
                Free State AG plant, baut und betreibt die Anlage auf eigene Kosten. Sie beziehen den Solarstrom vom
                eigenen Dach, bis zu 30 Prozent unter dem Netztarif, ohne Investition und ohne Betriebsrisiko.
              </p>
            </div>
          </div>
          <p className="text-base text-[#062E25]/75">
            Referenzdächer: Diggelmann Bau AG, Stiftung Wetterbaum, Bowling Five.
          </p>
        </section>

        <section className="rounded-2xl bg-[#062E25]/5 p-6 sm:p-8 text-center space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Erste Einschätzung in 30 Minuten</h2>
          <p className="text-base text-[#062E25]/75">
            Gerne auch vor Ort. Wählen Sie direkt einen Termin oder schreiben Sie uns.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={CALENDLY_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#062E25] px-8 py-3 text-base font-semibold text-white hover:bg-[#062E25]/90"
            >
              <CalendarDays className="w-5 h-5" />
              Termin vereinbaren
            </a>
            <a
              href="mailto:ivan.miric@freestate.ch"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#062E25]/25 px-8 py-3 text-base font-medium text-[#062E25] hover:bg-[#062E25]/5"
            >
              <Mail className="w-5 h-5" />
              ivan.miric@freestate.ch
            </a>
          </div>
          <p className="text-base text-[#062E25]/60">Ivan Miric, Geschäftsführer Free State AG</p>
        </section>
      </main>

      <footer className="border-t border-[#062E25]/10">
        <div className="mx-auto max-w-3xl px-5 py-8 space-y-2 text-base text-[#062E25]/70">
          <p className="font-semibold text-[#062E25]">Free State AG</p>
          <p>Stettemerstrasse 40, 8207 Schaffhausen, UID CHE-134.711.335</p>
          <p>Datengrundlage sonnendach.ch und Anlagenregister des Bundes, Luftbild swisstopo.</p>
          <Link href="/datenschutz" className="inline-block underline hover:text-[#062E25]">
            Datenschutzerklärung
          </Link>
        </div>
      </footer>
    </div>
  )
}
