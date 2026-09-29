'use client'

// Manual print page of the letter track (doc 69 W2-11a and W2-12). The text,
// the recipient block and the QR code come from the backend preview, built
// from the same letter template and slots as the Pingen PDF: the body follows
// the prospect's segment, the recipient block uses the owner's postal address
// when one is stored, and neither the {chf} production-value sentence nor the
// reference line is part of any letter template.

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { ChevronLeft, Printer } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { Button } from '@/components/ui/button'
import { outreachLettersService } from '@/services/outreach/letters.service'

const KNOWN_BLOCKERS = new Set([
  'no_letter_template_for_segment',
  'no_postal_address',
  'prospect_closed',
  'confirmed_tenant',
  'suppressed',
  'do_not_pitch',
  'no_landing_url',
  'template_inactive',
  'missing_slot',
])

function formatSwissNumber(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, "'")
}

export default function OutreachLetterPage() {
  const params = useParams<{ id: string }>()
  const locale = useLocale()
  const t = useTranslations('admin.outreach.detail')
  const tl = useTranslations('admin.outreach.letters')

  const {
    data: letter,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['admin', 'outreach', 'letter-preview', params.id],
    queryFn: () => outreachLettersService.preview(params.id),
  })

  // Known blocker codes have a label, anything else is shown as sent.
  const blockerLabel = (blocker: string): string => {
    const code = blocker.split(':')[0]
    return KNOWN_BLOCKERS.has(code) ? tl(`blocker.${code}`) : blocker
  }

  if (isLoading) return <AdminPageLoader />
  if (isError || !letter) {
    return (
      <p className="p-3 rounded bg-red-50 text-red-700">
        {tl('previewFailed')}
      </p>
    )
  }

  const today = new Date(letter.date).toLocaleDateString('de-CH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

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
          href={`/${locale}/admin/outreach/${letter.prospectId}`}
          className="inline-flex items-center gap-1 text-[#062E25]/60 hover:text-[#062E25]"
        >
          <ChevronLeft className="w-4 h-4" />
          {t('back')}
        </Link>
        <Button
          onClick={() => window.print()}
          className="bg-[#062E25] hover:bg-[#062E25]/90"
        >
          <Printer className="w-4 h-4" />
          Drucken
        </Button>
      </div>

      {letter.blockers.length > 0 && (
        <div className="print-hide mb-4 p-3 rounded bg-amber-50 text-amber-800">
          <p className="font-medium">{tl('blockersTitle')}</p>
          <ul className="list-disc pl-5">
            {letter.blockers.map(blocker => (
              <li key={blocker}>
                {blockerLabel(blocker)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div
        id="outbound-letter"
        className="bg-white border border-[#062E25]/10 rounded-lg p-10 text-[#062E25] text-base"
      >
        <p className="text-base text-[#062E25]/70 border-b border-[#062E25]/20 pb-1 inline-block">
          Free State AG, Stettemerstrasse 40, 8207 Schaffhausen
        </p>

        <div className="mt-8">
          {letter.recipientLines.map((line, i) => (
            <p key={i} className={i === 0 ? 'font-medium' : undefined}>
              {line}
            </p>
          ))}
        </div>

        <p className="mt-8 text-right">Schaffhausen, {today}</p>

        {letter.subject && <p className="mt-8 font-bold">{letter.subject}</p>}

        {letter.paragraphs.map((paragraph, i) => (
          <p key={i} className="mt-4 whitespace-pre-line">
            {paragraph}
          </p>
        ))}

        <div className="mt-6 flex flex-wrap items-start gap-6">
          {letter.imageUrl && (
            <figure>
              <img
                src={letter.imageUrl}
                alt="Luftbild des Gebäudes"
                className="w-[60mm] aspect-square object-cover border border-[#062E25]/20"
              />
              <figcaption className="mt-1 text-base text-[#062E25]/60">
                {letter.imageCredit}
                {letter.roofKwhYear != null &&
                  `, rund ${formatSwissNumber(letter.roofKwhYear)} kWh pro Jahr nach sonnendach.ch`}
              </figcaption>
            </figure>
          )}
          {letter.qrSvg && (
            <div className="flex items-center gap-4">
              <img
                src={`data:image/svg+xml;utf8,${encodeURIComponent(letter.qrSvg)}`}
                alt="QR-Code zur Dachseite"
                className="w-[30mm] h-[30mm]"
              />
              <div>
                <p className="font-bold">Ihr Dach online</p>
                {letter.displayUrl && (
                  <p className="break-all">{letter.displayUrl}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
