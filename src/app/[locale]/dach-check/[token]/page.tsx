import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Calculator, Sun, Zap } from 'lucide-react'

import CallbackForm from './_components/CallbackForm'

// Homeowner roof report, the QR target of a homeowner or farm letter (doc 69
// §13.2). The token is LetterTarget.publicToken. The page shows the roof,
// sends homeowners into the calculator with the address prefilled and the
// letter's UTM tag carried on (the homeowner-attribution connector matches
// the signup by utm_content lt_<token>), and takes a call-back request.
// Rendered inside the normal site header and footer.

export const metadata: Metadata = {
  title: 'Ihr Dach-Check | Free State AG',
  robots: { index: false, follow: false },
}

type RoofSegment = {
  area: number | null
  tilt: number | null
  azimuthCardinal: string | null
  electricityYield: number | null
  suitabilityClass: number | null
}

type HomeownerData = {
  kind: 'HOMEOWNER' | 'FARM'
  addressStreet: string | null
  addressNumber: string | null
  addressPostalCode: string | null
  addressCity: string | null
  roofAreaM2: string | null
  roofKwhYear: number | null
  lv95E: number | null
  lv95N: number | null
  segments: RoofSegment[]
  suitableAggregation: { segmentCount: number; areaM2: number; kwhYear: number }
  registerNoHit: boolean
  responded: boolean
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

async function fetchHomeownerData(
  token: string
): Promise<HomeownerData | null> {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
  try {
    const res = await fetch(
      `${base}/api/public/outreach/homeowner/${encodeURIComponent(token)}`,
      {
        cache: 'no-store',
      }
    )
    if (!res.ok) return null
    const json = (await res.json()) as { success: boolean; data: HomeownerData }
    return json.success ? json.data : null
  } catch {
    return null
  }
}

// Same tag the letter's QR code carries (M12), so the signup is attributed
// to this letter even when the visitor's session already held other UTM data.
function calculatorHref(token: string, address: string): string {
  const params = new URLSearchParams({
    adresse: address,
    utm_source: 'freestate_letter',
    utm_medium: 'letter',
    utm_campaign: 'homeowner',
    utm_content: `lt_${token}`,
  })
  return `/calculator?${params.toString()}`
}

export default async function DachCheckPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>
}) {
  const { token } = await params
  const data = await fetchHomeownerData(token)
  if (!data) notFound()

  const street =
    `${data.addressStreet ?? ''} ${data.addressNumber ?? ''}`.trim()
  const cityLine =
    `${data.addressPostalCode ?? ''} ${data.addressCity ?? ''}`.trim()
  const addressLine = [street, cityLine].filter(Boolean).join(', ')
  const suitable = data.suitableAggregation
  const showCalculator =
    data.kind === 'HOMEOWNER' && street !== '' && cityLine !== ''

  return (
    <main className="bg-white text-[#062E25]">
      <div className="mx-auto max-w-3xl px-5 py-10 space-y-10">
        <header className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Solarpotenzial Ihres Dachs
          </h1>
          {addressLine && (
            <p className="text-lg text-[#062E25]/75">{addressLine}</p>
          )}
        </header>

        {data.lv95E != null && data.lv95N != null && (
          <figure>
            <img
              src={wmsCropUrl(data.lv95E, data.lv95N, 30, 800)}
              alt={`Luftbild des Dachs ${addressLine}`}
              className="w-full aspect-square sm:aspect-[4/3] object-cover rounded-2xl border border-[#062E25]/10"
            />
            <figcaption className="mt-2 text-base text-[#062E25]/60">
              Luftbild SWISSIMAGE, swisstopo
            </figcaption>
          </figure>
        )}

        {(suitable.segmentCount > 0 || data.roofKwhYear != null) && (
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {suitable.segmentCount > 0 && (
              <div className="rounded-2xl bg-[#062E25]/5 p-5">
                <Sun className="w-5 h-5 text-amber-500" />
                <p className="mt-2 text-2xl font-bold tabular-nums">
                  {formatSwissNumber(suitable.areaM2)} m²
                </p>
                <p className="text-base text-[#062E25]/70">
                  gut geeignete Dachfläche gemäss sonnendach.ch
                </p>
              </div>
            )}
            {data.roofKwhYear != null && (
              <div className="rounded-2xl bg-[#062E25]/5 p-5">
                <Zap className="w-5 h-5 text-amber-500" />
                <p className="mt-2 text-2xl font-bold tabular-nums">
                  {formatSwissNumber(data.roofKwhYear)} kWh
                </p>
                <p className="text-base text-[#062E25]/70">
                  Solarstrom pro Jahr gemäss sonnendach.ch
                </p>
              </div>
            )}
          </section>
        )}

        {data.registerNoHit && (
          <p className="text-base text-[#062E25]/75">
            Im Anlagenregister des Bundes ist für dieses Gebäude aktuell keine
            Photovoltaikanlage erfasst.
          </p>
        )}

        {showCalculator && (
          <section className="rounded-2xl bg-[#062E25]/5 p-6 sm:p-8 space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Ihre Anlage im Solarrechner
            </h2>
            <p className="text-base text-[#062E25]/75">
              Der Rechner übernimmt Ihre Adresse.
            </p>
            <Link
              href={calculatorHref(token, addressLine)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#062E25] px-8 py-3 text-base font-semibold text-white hover:bg-[#062E25]/90"
            >
              <Calculator className="w-5 h-5" />
              Zum Solarrechner mit Ihrer Adresse
            </Link>
          </section>
        )}

        <section className="rounded-2xl border border-[#062E25]/15 p-6 sm:p-8 space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            Lieber persönlich?
          </h2>
          <p className="text-base text-[#062E25]/75">
            Hinterlassen Sie Ihre Nummer oder E-Mail, wir melden uns bei Ihnen.
          </p>
          <CallbackForm token={token} alreadyResponded={data.responded} />
        </section>

        <p className="text-base text-[#062E25]/60">
          Datengrundlage sonnendach.ch und Anlagenregister des Bundes, Luftbild
          swisstopo.
        </p>
      </div>
    </main>
  )
}
