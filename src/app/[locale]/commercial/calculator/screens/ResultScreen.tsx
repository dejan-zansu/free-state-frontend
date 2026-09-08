'use client'

import { Check, Copy, Upload } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'

import { trackFunnelEventOnce } from '@/lib/analytics/funnel-events'
import { commercialFlowMeta } from '@/lib/commercial-calculator-flow'
import {
  DEFAULT_SUBSIDY_TIER_MAX_KWP,
  type CommercialEstimate,
  type SubsidyTiers,
} from '@/lib/commercial-estimate'
import {
  COMPANY_MAIN_PHONE_DISPLAY,
  COMPANY_MAIN_PHONE_TEL_HREF,
} from '@/lib/company-contact'
import { chf, groupNumber } from '@/lib/format-chf'
import { cn } from '@/lib/utils'
import { commercialLeadService } from '@/services/commercial-lead.service'
import type { CommercialTariff } from '@/stores/commercial-calculator.store'

export interface ResultScreenProps {
  estimate: CommercialEstimate
  tariff: CommercialTariff | null
  subsidyRate: SubsidyTiers | null
  hasExistingPv: boolean
  addressLabel: string
  roofImage: string | null
  reference: string
  leadId: string
  uploadToken: string | null
  source: 'flow' | 'confirmation'
  onRestart?: () => void
}

type UploadState = 'idle' | 'uploading' | 'done' | 'error'
type UploadErrorKey = 'uploadError' | 'uploadTooLarge' | 'uploadUnsupported'

const UPLOAD_MAX_BYTES = 10 * 1024 * 1024
const UPLOAD_ACCEPT = '.pdf,.jpg,.jpeg,.png'
const UPLOAD_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
const COPIED_RESET_MS = 2000

const CARD =
  'rounded-[16px] border border-[#9CA9A6]/30 bg-white/40 backdrop-blur-[20px] p-5 sm:p-8'
const BUTTON_PRIMARY =
  'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-energy px-6 text-base font-medium text-white transition-colors hover:bg-energy/90 disabled:opacity-60'
const BUTTON_OUTLINE =
  'inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-[#062E25] bg-white px-5 text-base font-medium text-[#062E25] transition-colors hover:bg-[#062E25]/5'

function swissNumber(value: number, digits = 0): string {
  return value.toLocaleString('de-CH', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

export default function ResultScreen({
  estimate,
  tariff,
  subsidyRate,
  hasExistingPv,
  addressLabel,
  roofImage,
  reference,
  leadId,
  uploadToken,
  source,
  onRestart,
}: ResultScreenProps) {
  const t = useTranslations('commercialCalculator.result')

  const [copied, setCopied] = useState(false)
  const copiedTimerRef = useRef<number | null>(null)

  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [uploadPct, setUploadPct] = useState(0)
  const [uploadErrorKey, setUploadErrorKey] = useState<UploadErrorKey | null>(
    null
  )
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    trackFunnelEventOnce('results_viewed', {
      meta: { ...commercialFlowMeta, source },
    })
  }, [source])

  useEffect(
    () => () => {
      if (copiedTimerRef.current !== null)
        window.clearTimeout(copiedTimerRef.current)
    },
    []
  )

  const copyReference = async () => {
    try {
      await navigator.clipboard.writeText(reference)
      setCopied(true)
      if (copiedTimerRef.current !== null)
        window.clearTimeout(copiedTimerRef.current)
      copiedTimerRef.current = window.setTimeout(() => {
        copiedTimerRef.current = null
        setCopied(false)
      }, COPIED_RESET_MS)
    } catch {}
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !uploadToken) return
    if (file.size > UPLOAD_MAX_BYTES) {
      setUploadState('error')
      setUploadErrorKey('uploadTooLarge')
      return
    }
    if (!UPLOAD_MIME_TYPES.includes(file.type)) {
      setUploadState('error')
      setUploadErrorKey('uploadUnsupported')
      return
    }
    setUploadErrorKey(null)
    setUploadPct(0)
    setUploadState('uploading')
    try {
      await commercialLeadService.uploadAttachment(
        leadId,
        uploadToken,
        'ELECTRICITY_BILL',
        file,
        pct => setUploadPct(pct)
      )
      setUploadState('done')
    } catch {
      setUploadState('error')
      setUploadErrorKey('uploadError')
    }
  }

  const headlineKey = estimate.isLowResult
    ? 'headlineLow'
    : hasExistingPv
      ? 'headlineExistingPv'
      : 'headline'

  const moneyAvailable = estimate.selfConsumptionValueChf != null

  const subsidyBody = (() => {
    if (hasExistingPv) return t('subsidyExistingPv')
    if (estimate.subsidyAboveTiers)
      return t('subsidyAboveTiers', {
        kwp: swissNumber(subsidyRate?.tier2MaxKwp ?? DEFAULT_SUBSIDY_TIER_MAX_KWP),
      })
    if (estimate.subsidyChf == null) return t('subsidyUnavailable')
    return null
  })()

  const tariffLine = (() => {
    if (!tariff) return null
    const rp = swissNumber(tariff.rpKwh, 1)
    if (tariff.fallback) return t('tariffFallback', { rp })
    return t('tariffLocal', {
      rp,
      cat: tariff.category,
      municipality: tariff.municipality,
      year: String(tariff.year),
    })
  })()

  const assumptionLine =
    !estimate.consumptionAssumed && estimate.consumptionKwh != null
      ? t('assumptionKnown', {
          pct: Math.round(estimate.selfConsumptionShare * 100),
          kwh: groupNumber(estimate.consumptionKwh),
        })
      : t('assumptionUnknown', {
          pct: Math.round(estimate.selfConsumptionShare * 100),
        })

  return (
    <div className="flex flex-col items-center px-4 py-6 sm:py-12">
      <div className="w-full max-w-2xl text-center">
        <h1 className="text-2xl sm:text-[34px] font-medium text-[#062E25]">
          {t(headlineKey)}
        </h1>
        <p className="mt-2 sm:mt-3 text-base sm:text-lg text-[#062E25]/80 tracking-tight">
          {t('subline', { address: addressLabel })}
        </p>
        {estimate.isLowResult && (
          <p className="mt-2 text-base text-[#062E25] tracking-tight">
            {t('lowBody')}
          </p>
        )}
      </div>

      <div className="mt-5 sm:mt-8 flex w-full max-w-2xl flex-col gap-4 sm:gap-6">
        {typeof roofImage === 'string' && (
          <figure className="order-3 sm:order-1">
            <Image
              src={roofImage}
              alt={t('roofImageAlt')}
              width={800}
              height={600}
              unoptimized
              className="h-auto w-full rounded-[16px] border border-[#9CA9A6]/30 object-cover"
            />
            <figcaption className="mt-2 text-base text-[#062E25]/70 tracking-tight">
              {addressLabel}
            </figcaption>
          </figure>
        )}

        <div className={cn(CARD, 'order-1 sm:order-2')}>
          <dl className="grid grid-cols-3 gap-3">
            <div>
              <dt className="text-base text-[#062E25]/70 tracking-tight">
                {t('area')}
              </dt>
              <dd className="mt-0.5 text-xl sm:text-2xl font-medium text-[#062E25] tabular-nums">
                {swissNumber(Math.round(estimate.usableAreaM2))}
                <span className="text-base font-normal"> m²</span>
              </dd>
            </div>
            <div>
              <dt className="text-base text-[#062E25]/70 tracking-tight">
                {t('kwp')}
              </dt>
              <dd className="mt-0.5 text-xl sm:text-2xl font-medium text-[#062E25] tabular-nums">
                {swissNumber(estimate.systemSizeKwp, 1)}
                <span className="text-base font-normal"> kWp</span>
              </dd>
            </div>
            <div>
              <dt className="text-base text-[#062E25]/70 tracking-tight">
                {t('production')}
              </dt>
              <dd className="mt-0.5 text-xl sm:text-2xl font-medium text-[#062E25] tabular-nums">
                {swissNumber(Math.round(estimate.productionKwh))}
                <span className="text-base font-normal"> kWh</span>
              </dd>
            </div>
            <div className="col-span-3 flex flex-wrap items-baseline gap-x-2 border-t border-[#9CA9A6]/30 pt-3">
              <dt className="text-base text-[#062E25]/70 tracking-tight">
                {t('co2')}
              </dt>
              <dd className="text-base font-medium text-[#062E25] tabular-nums">
                {swissNumber(Math.round(estimate.co2Kg))} kg
              </dd>
            </div>
          </dl>
        </div>

        <div className={cn(CARD, 'order-2 sm:order-3')}>
          {moneyAvailable ? (
            <dl className="flex flex-col gap-5">
              <div>
                <dt className="text-base text-[#062E25] tracking-tight">
                  {t('moneyA')}
                </dt>
                <dd className="mt-1 text-3xl sm:text-4xl font-medium text-[#062E25] tabular-nums">
                  {chf(estimate.selfConsumptionValueChf ?? 0)}
                </dd>
                <dd className="mt-1 text-base text-[#062E25]/70 tracking-tight">
                  {tariff && !tariff.fallback
                    ? t('moneyAFootnote', { municipality: tariff.municipality })
                    : t('moneyAFootnoteFallback')}
                </dd>
              </div>
              <div>
                <dt className="text-base text-[#062E25] tracking-tight">
                  {t('moneyB')}
                </dt>
                <dd className="mt-1 text-3xl sm:text-4xl font-medium text-[#062E25] tabular-nums">
                  {chf(estimate.ppaSavingsChf ?? 0)}
                </dd>
                <dd className="mt-1 text-base text-[#062E25]/70 tracking-tight">
                  {t('moneyBFootnote')}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="text-base text-[#062E25] tracking-tight">
              {t('moneyUnavailable')}
            </p>
          )}

          <div className="mt-5 border-t border-[#9CA9A6]/30 pt-4">
            <p className="text-base text-[#062E25] tracking-tight">
              {t('subsidy')}
            </p>
            {subsidyBody ? (
              <p className="mt-1 text-base text-[#062E25]/80 tracking-tight">
                {subsidyBody}
              </p>
            ) : (
              <p className="mt-1 text-xl sm:text-2xl font-medium text-[#062E25] tabular-nums">
                {chf(estimate.subsidyChf ?? 0)}
              </p>
            )}
          </div>
        </div>

        <div className="order-4 flex flex-col gap-2 px-1">
          <p className="text-base text-[#062E25]/70 tracking-tight">
            {assumptionLine}
          </p>
          {tariffLine && (
            <p className="text-base text-[#062E25]/70 tracking-tight">
              {tariffLine}
            </p>
          )}
          <p className="text-base text-[#062E25]/70 tracking-tight">
            {t('estimateNote')}
          </p>
        </div>

        <div
          className={cn(
            CARD,
            'order-5 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between'
          )}
        >
          <p className="text-base text-[#062E25] tracking-tight">
            {t('reference', { reference })}
          </p>
          <button
            type="button"
            onClick={copyReference}
            className={cn(BUTTON_OUTLINE, 'w-full sm:w-auto')}
          >
            {copied ? (
              <Check className="h-4 w-4" aria-hidden />
            ) : (
              <Copy className="h-4 w-4" aria-hidden />
            )}
            <span aria-live="polite">
              {copied ? t('copied') : t('copyReference')}
            </span>
          </button>
        </div>

        <div className={cn(CARD, 'order-6')}>
          <p className="text-base font-medium text-[#062E25] tracking-tight">
            {t('nextStep')}
          </p>

          {uploadToken && (
            <div className="mt-5 rounded-[12px] border border-dashed border-[#062E25]/30 bg-white/60 p-4 sm:p-5">
              <p className="text-base font-medium text-[#062E25] tracking-tight">
                {t('uploadTitle')}
              </p>
              <p className="mt-1 text-base text-[#062E25]/70 tracking-tight">
                {t('uploadHelper')}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept={UPLOAD_ACCEPT}
                onChange={handleFileChange}
                className="sr-only"
                tabIndex={-1}
                aria-hidden
              />
              {uploadState !== 'done' && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadState === 'uploading'}
                  className={cn(BUTTON_PRIMARY, 'mt-4 w-full sm:w-auto')}
                >
                  <Upload className="h-4 w-4" aria-hidden />
                  {t('uploadButton')}
                </button>
              )}
              <div aria-live="polite">
                {uploadState === 'uploading' && (
                  <p className="mt-3 text-base text-[#062E25] tracking-tight">
                    {t('uploadUploading', { pct: uploadPct })}
                  </p>
                )}
                {uploadState === 'done' && (
                  <p className="mt-3 flex items-center gap-2 text-base text-[#062E25] tracking-tight">
                    <Check className="h-4 w-4 shrink-0" aria-hidden />
                    {t('uploadDone')}
                  </p>
                )}
                {uploadState === 'error' && uploadErrorKey && (
                  <p
                    role="alert"
                    className="mt-3 text-base text-red-600 tracking-tight"
                  >
                    {t(uploadErrorKey)}
                  </p>
                )}
              </div>
            </div>
          )}

          <a
            href={COMPANY_MAIN_PHONE_TEL_HREF}
            className="mt-5 inline-flex min-h-[44px] items-center text-base text-[#062E25] underline underline-offset-4 tracking-tight"
          >
            {t('phoneLine', { phone: COMPANY_MAIN_PHONE_DISPLAY })}
          </a>
        </div>

        {onRestart && (
          <div className="order-7 flex justify-center">
            <button
              type="button"
              onClick={onRestart}
              className={cn(BUTTON_OUTLINE, 'w-full sm:w-auto')}
            >
              {t('restart')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
