'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { ChevronLeft, Printer } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { adminOutreachService } from '@/services/admin-outreach.service'

type PublicRoofData = {
  chfPerYear: string | null
  roofKwhYear: number | null
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

export default function OutreachLetterPage() {
  const params = useParams<{ id: string }>()
  const locale = useLocale()
  const t = useTranslations('admin.outreach.detail')
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const { data: prospect, isLoading } = useQuery({
    queryKey: ['admin', 'outreach', 'prospect', params.id],
    queryFn: () => adminOutreachService.getProspect(params.id),
  })

  const { data: roof } = useQuery({
    queryKey: ['admin', 'outreach', 'public-roof', prospect?.publicToken],
    queryFn: async () => {
      const res = await api.get<{ success: boolean; data: PublicRoofData }>(
        `/public/outreach/roof/${prospect!.publicToken}`,
      )
      return res.data.data
    },
    enabled: !!prospect?.publicToken,
    retry: false,
  })

  if (isLoading || !prospect) return <AdminPageLoader />

  const street = `${prospect.addressStreet ?? ''} ${prospect.addressNumber ?? ''}`.trim()
  const cityLine = `${prospect.addressPostalCode ?? ''} ${prospect.addressCity ?? ''}`.trim()
  const anrede = prospect.contactName?.trim()
    ? `Guten Tag ${prospect.contactName.trim()}`
    : 'Sehr geehrte Damen und Herren'
  const kwh = prospect.roofKwhYear != null ? formatSwissNumber(prospect.roofKwhYear) : null
  const chf = roof?.chfPerYear ?? null
  const onePagerUrl = origin && prospect.publicToken ? `${origin}/dach/${prospect.publicToken}` : null
  const today = new Date().toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="max-w-[820px]">
      <style>{`
        @page { size: A4; margin: 20mm; }
        @media print {
          body * { visibility: hidden; }
          #outbound-letter, #outbound-letter * { visibility: visible; }
          #outbound-letter {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            border: none;
            box-shadow: none;
          }
          .print-hide { display: none !important; }
        }
      `}</style>

      <div className="print-hide mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/${locale}/admin/outreach/${prospect.id}`}
          className="inline-flex items-center gap-1 text-[#062E25]/60 hover:text-[#062E25]"
        >
          <ChevronLeft className="w-4 h-4" />
          {t('back')}
        </Link>
        <Button onClick={() => window.print()} className="bg-[#062E25] hover:bg-[#062E25]/90">
          <Printer className="w-4 h-4" />
          Drucken
        </Button>
      </div>

      <div
        id="outbound-letter"
        className="bg-white border border-[#062E25]/10 rounded-lg p-10 text-[#062E25] text-base"
      >
        <p className="text-base text-[#062E25]/70 border-b border-[#062E25]/20 pb-1 inline-block">
          Free State AG, Stettemerstrasse 40, 8207 Schaffhausen
        </p>

        <div className="mt-8">
          <p className="font-medium">{prospect.companyName}</p>
          {street && <p>{street}</p>}
          {cityLine && <p>{cityLine}</p>}
        </div>

        <p className="mt-8 text-right">Schaffhausen, {today}</p>

        <p className="mt-8 font-bold">Nutzung Ihrer Dachfläche für Photovoltaik</p>

        <p className="mt-6">{anrede}</p>

        <p className="mt-4">
          Ihr Gebäude an der {street || 'Ihrer Adresse'} in {prospect.addressCity ?? ''} hat gemäss den Daten des
          Bundes (sonnendach.ch) ein Solarpotenzial von rund {kwh ?? ''} kWh pro Jahr. Im Anlagenregister des Bundes
          ist für dieses Gebäude aktuell keine Photovoltaikanlage erfasst.
          {chf && (
            <>
              {' '}
              Das entspricht beim üblichen Gewerbetarif einem Stromwert von rund CHF {chf} pro Jahr.
            </>
          )}
        </p>

        <p className="mt-4">Für die Nutzung dieser Dachfläche gibt es zwei Wege:</p>

        <p className="mt-4">
          1. Kauf: Sie investieren selbst, werden Eigentümerin oder Eigentümer der Anlage und profitieren direkt von
          tieferen Stromkosten.
        </p>

        <p className="mt-4">
          2. Contracting: Free State AG plant, baut und betreibt die Anlage auf eigene Kosten. Sie beziehen den
          Solarstrom vom eigenen Dach, bis zu 30 Prozent unter dem Netztarif, ohne Investition und ohne
          Betriebsrisiko.
        </p>

        <p className="mt-4">Referenzdächer: Diggelmann Bau AG, Stiftung Wetterbaum, Bowling Five.</p>

        {prospect.lv95E != null && prospect.lv95N != null && (
          <figure className="mt-6">
            <img
              src={wmsCropUrl(prospect.lv95E, prospect.lv95N, 60, 640)}
              alt={`Luftbild ${street}`}
              className="w-[70mm] aspect-square object-cover border border-[#062E25]/20"
            />
            <figcaption className="mt-1 text-base text-[#062E25]/60">
              Luftbild Ihres Gebäudes (SWISSIMAGE, swisstopo)
            </figcaption>
          </figure>
        )}

        {onePagerUrl && (
          <p className="mt-6">
            Alle Zahlen und das Luftbild zu Ihrem Dach finden Sie online unter:
            <br />
            <span className="font-medium break-all">{onePagerUrl}</span>
          </p>
        )}

        <p className="mt-4">
          Für eine erste Einschätzung genügt ein Termin von 30 Minuten, gerne auch vor Ort. Sie erreichen mich unter
          ivan.miric@freestate.ch.
        </p>

        <p className="mt-8">Freundliche Grüsse</p>

        <div className="mt-12">
          <p className="font-medium">Ivan Miric</p>
          <p>Geschäftsführer</p>
          <p>Free State AG</p>
        </div>
      </div>
    </div>
  )
}
