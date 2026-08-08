'use client'

import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link } from '@/i18n/navigation'
import { getAttribution, trackFunnelEvent } from '@/lib/analytics/funnel-events'
import { flowVersionMeta } from '@/lib/calculator-flow'
import { cn } from '@/lib/utils'
import {
  residentialCalculatorService,
  type ManualCheckSource,
} from '@/services/residential-calculator.service'
import { useSolarAboCalculatorStore } from '@/stores/solar-abo-calculator.store'

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/

export interface ManualCheckPrefill {
  address?: string
  postalCode?: string
  city?: string
  lat?: number
  lng?: number
  systemSizeKwp?: number
}

interface FieldErrors {
  address?: string
  email?: string
  consent?: string
  submit?: string
}

export default function ManualCheckCapture({
  source,
  prefill,
  compact = false,
}: {
  source: ManualCheckSource
  prefill?: ManualCheckPrefill
  compact?: boolean
}) {
  const t = useTranslations('calculatorV2.manualCheck')
  const tErr = useTranslations('calculatorV2.screen5.errors')

  const manualCheckRequested = useSolarAboCalculatorStore(
    state => state.manualCheckRequested
  )
  const setManualCheckRequested = useSolarAboCalculatorStore(
    state => state.setManualCheckRequested
  )

  const [address, setAddress] = useState(prefill?.address ?? '')
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const idBase = `manual-check-${source}`
  const addressId = `${idBase}-address`
  const emailId = `${idBase}-email`
  const consentId = `${idBase}-consent`

  const headline =
    source === 'no_roof'
      ? t('noRoofHeadline')
      : source === 'places_unavailable'
        ? t('placesHeadline')
        : null

  const bodies =
    source === 'no_roof'
      ? [t('noRoofBody1'), t('noRoofBody2')]
      : source === 'places_unavailable'
        ? [t('placesBody1'), t('placesBody2')]
        : source === 'retry_blocked'
          ? [t('retryBlockedBody')]
          : [t('partialConsentNote')]

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return

    const trimmedAddress = address.trim()
    const trimmedEmail = email.trim()
    const nextErrors: FieldErrors = {}
    if (!trimmedAddress) nextErrors.address = tErr('required')
    if (!trimmedEmail) {
      nextErrors.email = tErr('required')
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      nextErrors.email = tErr('emailInvalid')
    }
    if (!consent) nextErrors.consent = tErr('consentRequired')
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    try {
      await residentialCalculatorService.requestManualCheck({
        email: trimmedEmail,
        address: trimmedAddress,
        privacy: true,
        source,
        postalCode: prefill?.postalCode || undefined,
        city: prefill?.city || undefined,
        lat: prefill?.lat,
        lng: prefill?.lng,
        systemSizeKwp: prefill?.systemSizeKwp,
        attribution: getAttribution(),
      })
      trackFunnelEvent('manual_check_requested', {
        meta: { source, ...flowVersionMeta },
      })
      setManualCheckRequested(source)
    } catch {
      setErrors({ submit: tErr('submitFailed') })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (manualCheckRequested === source) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-[#062E25]/15 bg-white/70 p-6">
        <p role="status" className="text-base text-[#062E25]">
          {t('success')}
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      {headline && (
        <h2
          className={cn(
            'font-medium text-[#062E25]',
            compact ? 'text-xl' : 'text-2xl sm:text-3xl'
          )}
        >
          {headline}
        </h2>
      )}
      {bodies.map((body, index) => (
        <p
          key={index}
          className="mt-3 text-base text-[#062E25] tracking-tight"
        >
          {body}
        </p>
      ))}

      <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
        <div>
          <label
            htmlFor={addressId}
            className="text-base text-[#062E25] tracking-tight"
          >
            {t('addressLabel')}
          </label>
          <Input
            id={addressId}
            type="text"
            value={address}
            onChange={event => setAddress(event.target.value)}
            autoComplete="street-address"
            aria-invalid={!!errors.address}
            aria-describedby={errors.address ? `${addressId}-error` : undefined}
            className="mt-1.5 h-12 rounded-xl border-[#062E25]/20 bg-white px-4 text-base md:text-base"
          />
          {errors.address && (
            <p
              id={`${addressId}-error`}
              role="alert"
              className="mt-1.5 text-base text-red-600"
            >
              {errors.address}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={emailId}
            className="text-base text-[#062E25] tracking-tight"
          >
            {t('emailLabel')}
          </label>
          <Input
            id={emailId}
            type="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            autoComplete="email"
            inputMode="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? `${emailId}-error` : undefined}
            className="mt-1.5 h-12 rounded-xl border-[#062E25]/20 bg-white px-4 text-base md:text-base"
          />
          {errors.email && (
            <p
              id={`${emailId}-error`}
              role="alert"
              className="mt-1.5 text-base text-red-600"
            >
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-start gap-2.5">
            <input
              id={consentId}
              type="checkbox"
              checked={consent}
              onChange={event => setConsent(event.target.checked)}
              aria-invalid={!!errors.consent}
              aria-describedby={
                errors.consent ? `${consentId}-error` : undefined
              }
              className="mt-1 h-5 w-5 shrink-0 rounded-[4px] border-[#062E25]/40 accent-[#062E25]"
            />
            <label
              htmlFor={consentId}
              className="text-base text-[#062E25] tracking-tight"
            >
              {t.rich('consent', {
                privacyLink: chunks => (
                  <Link
                    href="/privacy-policy"
                    target="_blank"
                    className="underline underline-offset-2 text-[#062E25] hover:text-[#062E25]"
                    onClick={event => event.stopPropagation()}
                  >
                    {chunks}
                  </Link>
                ),
              })}
            </label>
          </div>
          {errors.consent && (
            <p
              id={`${consentId}-error`}
              role="alert"
              className="mt-1.5 text-base text-red-600"
            >
              {errors.consent}
            </p>
          )}
        </div>

        {errors.submit && (
          <p role="alert" className="text-base text-red-600">
            {errors.submit}
          </p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full bg-[#062E25] text-base text-white hover:bg-[#062E25]/90"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {t('button')}
        </Button>

        <p className="text-base text-[#062E25] tracking-tight">
          {t('reassurance')}
        </p>
      </form>
    </div>
  )
}
