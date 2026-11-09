'use client'

// Letter page of one prospect (doc 69 W2-11a and W2-12). Shows the PDF the
// backend renders for this prospect with the same template, slots, aerial
// image and layout as the letter Pingen prints, so what is seen here is what
// goes into the envelope. Printing by hand works from the PDF. The blockers
// above it name what keeps the letter from being queued or rendered.

import { useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { ChevronLeft, FileText } from 'lucide-react'
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

export default function OutreachLetterPage() {
  const params = useParams<{ id: string }>()
  const locale = useLocale()
  const t = useTranslations('admin.outreach.detail')
  const tl = useTranslations('admin.outreach.letters')

  const preview = useQuery({
    queryKey: ['admin', 'outreach', 'letter-preview', params.id],
    queryFn: () => outreachLettersService.preview(params.id),
  })
  const pdf = useQuery({
    queryKey: ['admin', 'outreach', 'letter-preview-pdf', params.id],
    queryFn: () => outreachLettersService.previewPdfUrl(params.id),
    retry: false,
    staleTime: Infinity,
    gcTime: 0,
  })

  const pdfUrl = pdf.data
  useEffect(() => {
    if (!pdfUrl) return
    return () => URL.revokeObjectURL(pdfUrl)
  }, [pdfUrl])

  // Known blocker codes have a label, anything else is shown as sent.
  const blockerLabel = (blocker: string): string => {
    const code = blocker.split(':')[0]
    return KNOWN_BLOCKERS.has(code) ? tl(`blocker.${code}`) : blocker
  }

  if (preview.isLoading) return <AdminPageLoader />
  if (preview.isError || !preview.data) {
    return (
      <p className="p-3 rounded bg-red-50 text-red-700">
        {tl('previewFailed')}
      </p>
    )
  }
  const letter = preview.data

  return (
    <div className="max-w-[860px]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          href={`/${locale}/admin/outreach/${letter.prospectId}`}
          className="inline-flex items-center gap-1 text-[#062E25]/60 hover:text-[#062E25]"
        >
          <ChevronLeft className="w-4 h-4" />
          {t('back')}
        </Link>
        {pdfUrl && (
          <Button asChild className="bg-[#062E25] hover:bg-[#062E25]/90 gap-2">
            <a href={pdfUrl} target="_blank" rel="noopener">
              <FileText className="w-4 h-4" />
              {tl('pdf')}
            </a>
          </Button>
        )}
      </div>

      {letter.blockers.length > 0 && (
        <div className="mb-4 p-3 rounded bg-amber-50 text-amber-800">
          <p className="font-medium">{tl('blockersTitle')}</p>
          <ul className="list-disc pl-5">
            {letter.blockers.map(blocker => (
              <li key={blocker}>{blockerLabel(blocker)}</li>
            ))}
          </ul>
        </div>
      )}

      {pdf.isLoading ? (
        <AdminPageLoader />
      ) : pdf.isError || !pdfUrl ? (
        <p className="p-3 rounded bg-red-50 text-red-700">
          {tl('previewFailed')}
        </p>
      ) : (
        <iframe
          src={pdfUrl}
          title={tl('previewTitle')}
          className="w-full aspect-[210/297] rounded-lg border border-[#062E25]/10 bg-white"
        />
      )}
    </div>
  )
}
