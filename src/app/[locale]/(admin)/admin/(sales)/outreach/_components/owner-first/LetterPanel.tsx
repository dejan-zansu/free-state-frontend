'use client'

// Letters of this prospect on the detail page (prospect.letters), with
// status, call-due date, the PDF and the print page for the manual path
// (backend docs/outbound-owner-first-build.md section 3, M12).

import { useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { FileText, Printer } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { outreachLettersService } from '@/services/outreach/letters.service'
import type { OutboundProspectDetail } from '@/types/admin-outreach'

const CANCELLABLE = new Set(['QUEUED', 'RENDERED', 'SUBMITTED'])

function day(value: string | null): string {
  return value ? new Date(value).toLocaleDateString('de-CH') : '-'
}

export function LetterPanel(props: { prospect: OutboundProspectDetail }) {
  const { prospect } = props
  const t = useTranslations('admin.outreach.letters')
  const locale = useLocale()
  const queryClient = useQueryClient()
  const [error, setError] = useState<string | null>(null)

  const cancel = useMutation({
    mutationFn: (letterId: string) => outreachLettersService.cancel(letterId),
    onSuccess: () => {
      setError(null)
      queryClient.invalidateQueries({
        queryKey: ['admin', 'outreach', 'prospect', prospect.id],
      })
      queryClient.invalidateQueries({
        queryKey: ['admin', 'outreach', 'letters'],
      })
      queryClient.invalidateQueries({
        queryKey: ['admin', 'outreach', 'letter-targets'],
      })
    },
    onError: () => setError(t('cancelFailed')),
  })

  const openPdf = async (letterId: string) => {
    try {
      const url = await outreachLettersService.pdfUrl(letterId)
      window.open(url, '_blank', 'noopener')
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch {
      setError(t('pdfFailed'))
    }
  }

  const letters = prospect.letters ?? []

  return (
    <Card className="border-[#062E25]/10">
      <CardContent className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h3 className="font-semibold text-[#062E25]/75 uppercase tracking-wide">
            {t('title')}
          </h3>
          <Button variant="outline" size="sm" asChild className="gap-2">
            <Link href={`/${locale}/admin/outreach/${prospect.id}/letter`}>
              <Printer className="w-4 h-4" />
              {t('printPage')}
            </Link>
          </Button>
        </div>
        {error && (
          <p className="mb-3 p-2 rounded bg-red-50 text-red-700">{error}</p>
        )}
        {letters.length === 0 ? (
          <p className="text-[#062E25]/75">{t('panelEmpty')}</p>
        ) : (
          <ul className="space-y-3">
            {letters.map(letter => (
              <li
                key={letter.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-[#062E25]/10 pb-2"
              >
                <div>
                  <p className="font-medium text-[#062E25]">
                    {t(`kind.${letter.kind}`)} · {t(`status.${letter.status}`)}
                  </p>
                  <p className="text-[#062E25]/75">
                    {t('createdOn', { date: day(letter.createdAt) })}
                    {letter.sentAt &&
                      ` · ${t('sentOn', { date: day(letter.sentAt) })}`}
                    {letter.callDueAt &&
                      ` · ${t('callDueOn', { date: day(letter.callDueAt) })}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => openPdf(letter.id)}
                  >
                    <FileText className="w-4 h-4" />
                    {t('pdf')}
                  </Button>
                  {CANCELLABLE.has(letter.status) && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={cancel.isPending}
                      onClick={() => {
                        if (window.confirm(t('cancelConfirm')))
                          cancel.mutate(letter.id)
                      }}
                    >
                      {t('cancel')}
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
