'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { CheckCircle2, Copy, Upload, RefreshCw, Mail, Phone } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useCommercialCalculatorStore } from '@/stores/commercial-calculator.store'
import { commercialLeadService } from '@/services/commercial-lead.service'
import { attachmentTypeLabel } from '@/lib/commercial-lead-labels'
import type { CommercialAttachmentType } from '@/types/commercial-lead'

const UPLOAD_TYPES: CommercialAttachmentType[] = [
  'ELECTRICITY_BILL',
  'PROPERTY_REGISTER',
  'BUILDING_PLANS',
  'SUPPLIER_CONTRACT',
]

interface UploadEntry {
  name: string
  progress: number
  done: boolean
  error?: string
}

export default function SonnendachStep7Confirmation() {
  const t = useTranslations('sonnendach.step7Confirmation')
  const submissionResult = useCommercialCalculatorStore((s) => s.submissionResult)
  const contactDetails = useCommercialCalculatorStore((s) => s.contactDetails)
  const reset = useCommercialCalculatorStore((s) => s.reset)

  const [uploadsByType, setUploadsByType] = useState<Record<string, UploadEntry[]>>({})
  const [copied, setCopied] = useState(false)

  if (!submissionResult) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-base text-[#062E25]/60">{t('noSubmission')}</p>
      </div>
    )
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(submissionResult.reference)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  const handleFile = async (type: CommercialAttachmentType, file: File) => {
    const current = uploadsByType[type] ?? []
    const entry: UploadEntry = { name: file.name, progress: 0, done: false }
    setUploadsByType({ ...uploadsByType, [type]: [...current, entry] })
    try {
      await commercialLeadService.uploadAttachment(
        submissionResult.id,
        submissionResult.uploadToken,
        type,
        file,
        (pct) => {
          setUploadsByType((u) => {
            const list = (u[type] ?? []).map((e) => e.name === file.name ? { ...e, progress: pct } : e)
            return { ...u, [type]: list }
          })
        },
      )
      setUploadsByType((u) => {
        const list = (u[type] ?? []).map((e) => e.name === file.name ? { ...e, progress: 100, done: true } : e)
        return { ...u, [type]: list }
      })
    } catch (err: any) {
      setUploadsByType((u) => {
        const list = (u[type] ?? []).map((e) => e.name === file.name ? { ...e, error: err?.message ?? 'Upload failed' } : e)
        return { ...u, [type]: list }
      })
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="mb-6">
          <CardContent className="pt-8 pb-6 text-center">
            <CheckCircle2 className="w-14 h-14 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#062E25]">
              {t('heading', { firstName: contactDetails.firstName })}
            </h1>
            <p className="text-base text-[#062E25]/70 mt-2">{t('subheading')}</p>

            <div className="mt-6 inline-flex items-center gap-3 bg-[#062E25]/5 px-4 py-2 rounded-lg">
              <span className="text-sm text-[#062E25]/60">{t('reference')}:</span>
              <span className="font-mono text-base font-semibold text-[#062E25]">{submissionResult.reference}</span>
              <button onClick={handleCopy} className="text-[#062E25]/60 hover:text-[#062E25]"
                      aria-label={t('copy')}>
                <Copy className="w-4 h-4" />
              </button>
              {copied && <span className="text-sm text-green-600">{t('copied')}</span>}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="pt-6 pb-6">
            <h2 className="text-base font-semibold text-[#062E25] mb-4">{t('timelineTitle')}</h2>
            <ol className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0">1</div>
                <div>
                  <p className="text-base text-[#062E25]">{t('step1', { email: contactDetails.email })}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#062E25]/10 text-[#062E25] flex items-center justify-center shrink-0">2</div>
                <div><p className="text-base text-[#062E25]">{t('step2')}</p></div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#062E25]/10 text-[#062E25] flex items-center justify-center shrink-0">3</div>
                <div><p className="text-base text-[#062E25]">{t('step3')}</p></div>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#062E25]/10 text-[#062E25] flex items-center justify-center shrink-0">4</div>
                <div><p className="text-base text-[#062E25]">{t('step4')}</p></div>
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="pt-6 pb-6">
            <h2 className="text-base font-semibold text-[#062E25]">{t('uploadTitle')}</h2>
            <p className="text-sm text-[#062E25]/60 mt-1 mb-4">{t('uploadSubtitle')}</p>

            <div className="grid sm:grid-cols-2 gap-4">
              {UPLOAD_TYPES.map((type) => (
                <div key={type} className="border border-[#062E25]/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-[#062E25]">{attachmentTypeLabel[type]}</p>
                    <label className="cursor-pointer text-[#062E25]/60 hover:text-[#062E25]">
                      <Upload className="w-4 h-4" />
                      <input
                        type="file" className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const f = e.target.files?.[0]
                          if (f) handleFile(type, f)
                          e.target.value = ''
                        }}
                      />
                    </label>
                  </div>
                  <ul className="space-y-1 mt-2">
                    {(uploadsByType[type] ?? []).map((u, idx) => (
                      <li key={idx} className="text-sm flex items-center justify-between gap-2">
                        <span className="truncate text-[#062E25]/70">{u.name}</span>
                        {u.error
                          ? <span className="text-red-600">{u.error}</span>
                          : u.done
                            ? <span className="text-green-600">{t('done')}</span>
                            : <span className="text-[#062E25]/50">{u.progress}%</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          <Button variant="outline" className="flex-1 gap-2" onClick={() => reset()}>
            <RefreshCw className="w-4 h-4" />
            {t('startOver')}
          </Button>
          <a
            href={`mailto:commercial@freestate.ag?subject=${encodeURIComponent(`Terminanfrage ${submissionResult.reference}`)}`}
            className="flex-1"
          >
            <Button variant="outline" className="w-full gap-2">
              <Mail className="w-4 h-4" />
              {t('bookCall')}
            </Button>
          </a>
        </div>

        <div className="mt-8 text-center text-sm text-[#062E25]/60">
          <p>{t('questions')}</p>
          <p className="mt-1">
            <a href="tel:+41000000000" className="hover:text-[#062E25] inline-flex items-center gap-1">
              <Phone className="w-4 h-4" /> +41 00 000 00 00
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
