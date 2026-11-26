import type { Metadata, ResolvingMetadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CalendarDays, Check, Mail, Phone, Sun, Zap } from 'lucide-react'
import LogoDark from '@/components/icons/LogoDark'
import { PARTNER_LOGOS } from '@/components/OurPartners'
import {
  formatSwissNumber as formatReferenceNumber,
  pickReferenceTranslation,
} from '@/components/references/reference-utils'
import { COMPANY_CALENDLY_URL } from '@/lib/company-contact'
import type { AdminReference, ReferenceCategory } from '@/types/admin'

import type { SonnendachBuilding } from '@/types/sonnendach'

import LandingActions from './_components/LandingActions'
import RoofView from './_components/RoofView'
import type { RoofPagePanels } from './_components/roof-panels'

const PAGE_TITLE = 'Solarpotenzial Ihrer Dachfläche'
const PAGE_DESCRIPTION =
  'Luftbild, Dachflächen und die Werte aus dem Solarkataster für Ihr Dach. SolarFree, unsere Dachvermietung ohne Investition, mit Solarstrom ca.\u00a030\u00a0% unter dem Netztarif.'

export async function generateMetadata(
  _props: { params: Promise<{ locale: string; token: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const previous = await parent
  return {
    title: `${PAGE_TITLE} | Free State AG`,
    description: PAGE_DESCRIPTION,
    robots: { index: false, follow: false },
    openGraph: {
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      siteName: previous.openGraph?.siteName ?? undefined,
      type: 'website',
      images: previous.openGraph?.images ?? [],
    },
    twitter: {
      card: 'summary_large_image',
      title: PAGE_TITLE,
      description: PAGE_DESCRIPTION,
      images: previous.twitter?.images ?? [],
    },
  }
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
  lv95E: number | null
  lv95N: number | null
  segments: RoofSegment[]
  suitableAggregation: { segmentCount: number; areaM2: number; kwhYear: number }
  // True only where the federal register was checked and had no hit.
  registerNoHit: boolean
  // OUTBOUND_LANDING_REFERENCES on the API, set once the claims-register rows exist.
  showReferences: boolean
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
    const res = await fetch(
      `${base}/api/public/outreach/roof/${encodeURIComponent(token)}`,
      {
        cache: 'no-store',
      }
    )
    if (!res.ok) return null
    const json = (await res.json()) as { success: boolean; data: RoofData }
    return json.success ? json.data : null
  } catch {
    return null
  }
}

async function fetchPanels(token: string): Promise<RoofPagePanels | null> {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
  try {
    const res = await fetch(
      `${base}/api/public/outreach/roof/${encodeURIComponent(token)}/panels`,
      {
        cache: 'no-store',
        signal: AbortSignal.timeout(5000),
      }
    )
    if (!res.ok) return null
    const json = (await res.json()) as {
      success: boolean
      data: RoofPagePanels | null
    }
    return json.success && json.data && json.data.modules.length > 0
      ? json.data
      : null
  } catch {
    return null
  }
}

// The Sonnendach building at the prospect's coordinates, the same lookup the
// calculator makes when an address is picked. Server-side, so the map renders
// without a browser round trip. The API reads x as northing and y as easting.
async function fetchPointBuilding(
  lv95E: number,
  lv95N: number
): Promise<SonnendachBuilding | null> {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
  const params = new URLSearchParams({ x: String(lv95N), y: String(lv95E) })
  try {
    const res = await fetch(`${base}/api/sonnendach/building-data?${params}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null
    const json = (await res.json()) as {
      success: boolean
      data?: SonnendachBuilding | null
    }
    return json.success && json.data && json.data.roofSegments.length > 0
      ? json.data
      : null
  } catch {
    return null
  }
}

async function fetchBuilding(
  token: string,
  lv95E: number,
  lv95N: number
): Promise<SonnendachBuilding | null> {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
  try {
    const res = await fetch(
      `${base}/api/public/outreach/roof/${encodeURIComponent(token)}/building`,
      {
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      }
    )
    if (res.status === 404) return fetchPointBuilding(lv95E, lv95N)
    if (!res.ok) return null
    const json = (await res.json()) as {
      success: boolean
      data?: SonnendachBuilding | null
    }
    return json.success && json.data && json.data.roofSegments.length > 0
      ? json.data
      : null
  } catch {
    return null
  }
}

const COMMERCIAL_CATEGORIES: ReferenceCategory[] = [
  'INDUSTRIEDACH',
  'GEWERBE',
  'LANDWIRTSCHAFT',
  'OEFFENTLICHE_GEBAEUDE',
]

async function fetchCommercialReferences(): Promise<AdminReference[]> {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
  try {
    const res = await fetch(`${base}/api/references/public?page=1&limit=50`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5000),
    })
    if (!res.ok) return []
    const json = (await res.json()) as {
      success: boolean
      data?: AdminReference[]
    }
    const items = json.success && Array.isArray(json.data) ? json.data : []
    return items
      .filter(
        reference =>
          COMMERCIAL_CATEGORIES.includes(reference.category) &&
          referencePhoto(reference) !== null &&
          reference.installedKwp !== null &&
          reference.moduleCount !== null
      )
      .sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) ||
          a.sortOrder - b.sortOrder ||
          (b.installedKwp ?? 0) - (a.installedKwp ?? 0)
      )
      .slice(0, 3)
  } catch {
    return []
  }
}

const REFERENCE_IMAGE_HOST = 'pub-4c6192458b6640b4882edb8106c3751f.r2.dev'
const WEB_IMAGE = /\.(jpe?g|png|webp)$/i

function isWebPhoto(url: string | null | undefined): url is string {
  if (!url) return false
  try {
    const parsed = new URL(url)
    return (
      parsed.protocol === 'https:' &&
      parsed.hostname === REFERENCE_IMAGE_HOST &&
      WEB_IMAGE.test(parsed.pathname)
    )
  } catch {
    return false
  }
}

function referencePhoto(reference: AdminReference): string | null {
  const gallery = [...reference.images]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .find(image => isWebPhoto(image.url))
  if (gallery) return gallery.url
  return isWebPhoto(reference.coverImageUrl) ? reference.coverImageUrl : null
}

const SOLARFREE_POINTS = [
  'Wir planen, finanzieren, bauen und betreiben die Anlage.',
  'Sie zahlen nur den Solarstrom, den Sie verbrauchen, ca.\u00a030\u00a0% unter dem Netztarif.',
  'Betrieb, Wartung, Monitoring und Versicherung gehen auf unsere Kosten.',
  'Nach Ablauf des Vertrags geht die Anlage kostenlos an Sie.',
  'Liefert das Dach mehr Strom, als Sie brauchen, ist auch eine jährliche Dachpacht möglich.',
]

const CALENDLY_URL =
  process.env.NEXT_PUBLIC_OUTBOUND_CALENDLY_URL || COMPANY_CALENDLY_URL

export default async function DachPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; token: string }>
  searchParams: Promise<{ v?: string | string[] }>
}) {
  const { token } = await params
  const { v } = await searchParams
  const inContact = v === 'kontakt'
  const data = await fetchRoofData(token)
  if (!data) notFound()

  const street =
    `${data.addressStreet ?? ''} ${data.addressNumber ?? ''}`.trim()
  const cityLine =
    `${data.addressPostalCode ?? ''} ${data.addressCity ?? ''}`.trim()
  const addressLine = [street, cityLine].filter(Boolean).join(', ')
  const [building, panels, references] = await Promise.all([
    data.lv95E != null && data.lv95N != null
      ? fetchBuilding(token, data.lv95E, data.lv95N)
      : null,
    fetchPanels(token),
    inContact ? fetchCommercialReferences() : [],
  ])

  return (
    <div className="min-h-screen bg-white text-[#062E25]">
      <div className="border-b border-[#062E25]/10">
        <div className="mx-auto max-w-3xl px-5 py-4 flex items-center justify-between">
          <Link href="/" aria-label="Free State AG, zur Startseite">
            <LogoDark className="h-6 sm:h-7.25 w-auto" />
          </Link>
          <span className="text-base text-[#062E25]/60 hidden sm:block">
            Solarstrom vom eigenen Dach
          </span>
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-5 py-10 space-y-10">
        <header className="space-y-2">
          <p className="text-base font-medium text-[#062E25]/60 uppercase tracking-wide">
            {data.companyName}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Solarpotenzial Ihrer Dachfläche
          </h1>
          {addressLine && (
            <p className="text-lg text-[#062E25]/75">{addressLine}</p>
          )}
        </header>

        {data.lv95E != null && data.lv95N != null && (
          <figure>
            <div className="relative w-full aspect-square sm:aspect-[4/3] overflow-hidden rounded-2xl border border-[#062E25]/10">
              {building ? (
                <RoofView
                  building={building}
                  panels={panels}
                  ariaLabel={`Luftbild der Dachfläche ${addressLine}`}
                />
              ) : (
                <>
                  <img
                    src={wmsCropUrl(data.lv95E, data.lv95N, 60, 800)}
                    alt={`Luftbild der Dachfläche ${addressLine}`}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  {/* The crop is centred on the building's coordinates. */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[#F2C6CD] bg-[#3D3858]/40 shadow-[0_0_0_2px_rgba(0,0,0,0.35)]"
                  />
                </>
              )}
            </div>
            <figcaption className="mt-2 text-base text-[#062E25]/60">
              {building
                ? panels
                  ? `Luftbild SWISSIMAGE, ©swisstopo${panels.groundAltitudeM !== null ? ', 3D-Ansicht ©Google' : ''}, Dachflächen nach sonnendach.ch. Die Solarmodule sind eine schematische Darstellung und keine Planung.`
                  : 'Luftbild SWISSIMAGE, ©swisstopo. Die Dachflächen Ihres Gebäudes sind markiert, nach sonnendach.ch.'
                : 'Luftbild SWISSIMAGE, ©swisstopo. Ihr Gebäude liegt in der Bildmitte.'}
            </figcaption>
          </figure>
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.roofAreaM2 != null && (
            <div className="rounded-2xl bg-[#062E25]/5 p-5">
              <Sun className="w-5 h-5 text-amber-500" />
              <p className="mt-2 text-2xl font-bold tabular-nums">
                {formatSwissNumber(Number(data.roofAreaM2))} m²
              </p>
              <p className="text-base text-[#062E25]/70">
                Gebäudegrundfläche gemäss Gebäuderegister des Bundes
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
                Theoretisches Potenzial pro Jahr bei vollständiger Belegung der
                Dachfläche, gemäss sonnendach.ch
              </p>
            </div>
          )}
        </section>

        {(data.suitableAggregation.segmentCount > 0 || data.registerNoHit) && (
          <p className="text-base text-[#062E25]/75">
            {data.suitableAggregation.segmentCount > 0 && (
              <>
                {data.suitableAggregation.segmentCount === 1
                  ? 'Eine gut geeignete Dachfläche'
                  : `${data.suitableAggregation.segmentCount} gut geeignete Dachflächen`}{' '}
                mit zusammen rund{' '}
                {formatSwissNumber(data.suitableAggregation.areaM2)} m². Bei
                vollständiger Belegung liegt das theoretische Potenzial laut
                sonnendach.ch bei rund{' '}
                {formatSwissNumber(data.suitableAggregation.kwhYear)} kWh pro
                Jahr. Eine reale Anlage ist kleiner, das hängt von Aufbau,
                Reihenabständen und Hindernissen ab.{' '}
              </>
            )}
            {data.registerNoHit &&
              'Im Anlagenregister des Bundes ist für dieses Gebäude aktuell keine Photovoltaikanlage erfasst.'}
          </p>
        )}

        {!inContact && <LandingActions token={token} />}

        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            SolarFree für Ihr Dach
          </h2>
          <div className="rounded-2xl border-2 border-[#062E25] p-6 space-y-4">
            <p className="text-lg font-semibold">
              Unsere Dachvermietung ohne Investition
            </p>
            <ul className="space-y-3">
              {SOLARFREE_POINTS.map(point => (
                <li
                  key={point}
                  className="flex gap-3 text-base text-[#062E25]/80"
                >
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-[#062E25]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
          {!inContact && data.showReferences && (
            <p className="text-base text-[#062E25]/75">
              Referenzdächer: Diggelmann Bau AG, Stiftung Wetterbaum, Bowling
              Five.
            </p>
          )}
        </section>

        {inContact && references.length > 0 && (
          <section className="space-y-5">
            <h2 className="text-2xl font-bold tracking-tight">
              Anlagen, die wir gebaut haben
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {references.map(reference => {
                const translation = pickReferenceTranslation(reference, 'de')
                const title = translation?.title.trim() || reference.slug
                const meta = [
                  reference.location,
                  reference.installedKwp !== null
                    ? `${formatReferenceNumber(reference.installedKwp)} kWp`
                    : null,
                ]
                  .filter(Boolean)
                  .join(' · ')
                return (
                  <div
                    key={reference.id}
                    className="rounded-2xl border border-[#062E25]/10 overflow-hidden"
                  >
                    <div className="relative aspect-[4/3] bg-[#062E25]/5">
                      <Image
                        src={referencePhoto(reference) as string}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, 360px"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4 space-y-1">
                      <p className="text-lg font-semibold">{title}</p>
                      {meta && (
                        <p className="text-base text-[#062E25]/70">{meta}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        <section className="space-y-5">
          <h2 className="text-2xl font-bold tracking-tight">Unsere Partner</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 items-center justify-items-center gap-x-8 gap-y-7">
            {PARTNER_LOGOS.map(logo => (
              <Image
                key={logo.src}
                src={logo.src}
                alt={logo.alt}
                width={logo.width}
                height={logo.height}
                className="h-auto max-h-11 w-auto max-w-full object-contain"
              />
            ))}
          </div>
        </section>

        {inContact ? (
          <section className="rounded-2xl bg-[#062E25]/5 p-6 sm:p-8 text-center space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Ihr Ansprechpartner
            </h2>
            <p className="text-base text-[#062E25]/75">
              Ivan Miric, Geschäftsführer Free State AG
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="tel:+41763647775"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#062E25] px-8 py-3 text-base font-semibold text-white hover:bg-[#062E25]/90"
              >
                <Phone className="w-5 h-5" />
                +41 76 364 77 75
              </a>
              <a
                href="mailto:ivan.m@freestate.ch"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#062E25]/25 px-8 py-3 text-base font-medium text-[#062E25] hover:bg-[#062E25]/5"
              >
                <Mail className="w-5 h-5" />
                ivan.m@freestate.ch
              </a>
            </div>
          </section>
        ) : (
          <section className="rounded-2xl bg-[#062E25]/5 p-6 sm:p-8 text-center space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Erste Einschätzung in einem kurzen Gespräch
            </h2>
            <p className="text-base text-[#062E25]/75">
              Gerne auch vor Ort. Wählen Sie direkt einen Termin oder schreiben
              Sie uns.
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
            <p className="text-base text-[#062E25]/60">
              Ivan Miric, Geschäftsführer Free State AG
            </p>
          </section>
        )}
      </main>

      <footer className="border-t border-[#062E25]/10">
        <div className="mx-auto max-w-3xl px-5 py-8 space-y-2 text-base text-[#062E25]/70">
          <p className="font-semibold text-[#062E25]">Free State AG</p>
          <p>Stettemerstrasse 40, 8207 Schaffhausen, UID CHE-134.711.335</p>
          <p>
            Datengrundlage sonnendach.ch und Anlagenregister des Bundes,
            Luftbild ©swisstopo.
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-1">
            <Link href="/" className="underline hover:text-[#062E25]">
              www.freestate.ch
            </Link>
            <Link href="/portfolio" className="underline hover:text-[#062E25]">
              Referenzen
            </Link>
            <Link
              href="/datenschutz"
              className="underline hover:text-[#062E25]"
            >
              Datenschutzerklärung
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
