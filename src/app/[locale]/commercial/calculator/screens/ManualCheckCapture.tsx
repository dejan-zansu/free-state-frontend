'use client'

import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Link } from '@/i18n/navigation'
import { getAttribution, trackFunnelEvent } from '@/lib/analytics/funnel-events'
import { commercialFlowMeta } from '@/lib/commercial-calculator-flow'
import { cn } from '@/lib/utils'
import {
  commercialLeadService,
  type CommercialManualCheckSource,
} from '@/services/commercial-lead.service'
import { useCommercialCalculatorStore } from '@/stores/commercial-calculator.store'

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/

export interface CommercialManualCheckPrefill {
  address?: string
  postalCode?: string
  city?: string
  lat?: number
  lng?: number
  systemSizeKwp?: number
  companyName?: string
}

export interface ManualCheckCaptureProps {
  source: CommercialManualCheckSource
  prefill?: CommercialManualCheckPrefill
  compact?: boolean
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
}: ManualCheckCaptureProps) {
  const t = useTranslations('commercialCalculator.manualCheck')
  const tErr = useTranslations('commercialCalculator.manualCheck.errors')

  const manualCheckRequested = useCommercialCalculatorStore(
    state => state.manualCheckRequested
  )
  const setManualCheckRequested = useCommercialCalculatorStore(
    state => state.setManualCheckRequested
  )
  const storedCompanyName = useCommercialCalculatorStore(
    state => state.contact.companyName
  )

  const [address, setAddress] = useState(prefill?.address ?? '')
  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState(
    prefill?.companyName ?? storedCompanyName
  )
  const [consent, setConsent] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const showCompany = source !== 'partial_contact'

  const idBase = `commercial-manual-check-${source}`
  const addressId = `${idBase}-address`
  const emailId = `${idBase}-email`
  const companyId = `${idBase}-company`
  const consentId = `${idBase}-consent`

  const headline =
    source === 'no_roof'
      ? t('noRoofHeadline')
      : source === 'places_unavailable'
        ? t('placesHeadline')
        : source === 'address_not_found'
          ? t('addressHeadline')
          : null

  const bodies =
    source === 'no_roof'
      ? [t('noRoofBody1'), t('noRoofBody2')]
      : source === 'places_unavailable'
        ? [t('placesBody1'), t('placesBody2')]
        : source === 'address_not_found'
          ? [t('addressBody1'), t('addressBody2')]
          : source === 'retry_blocked'
          ? [t('retryBlockedBody')]
          : []

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return

    const trimmedAddress = address.trim()
    const trimmedEmail = email.trim()
    const trimmedCompany = companyName.trim()
    const nextErrors: FieldErrors = {}
    if (!trimmedAddress) nextErrors.address = tErr('addressRequired')
    if (!trimmedEmail || !EMAIL_PATTERN.test(trimmedEmail)) {
      nextErrors.email = tErr('emailInvalid')
    }
    if (!consent) nextErrors.consent = tErr('consentRequired')
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    try {
      await commercialLeadService.requestManualCheck({
        email: trimmedEmail,
        address: trimmedAddress,
        privacy: true,
        source,
        companyName: trimmedCompany || undefined,
        postalCode: prefill?.postalCode || undefined,
        city: prefill?.city || undefined,
        lat: prefill?.lat,
        lng: prefill?.lng,
        systemSizeKwp: prefill?.systemSizeKwp,
        attribution: getAttribution(),
      })
      trackFunnelEvent('manual_check_requested', {
        meta: { ...commercialFlowMeta, source },
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
            'font-medium text-white',
            compact ? 'text-xl' : 'text-2xl sm:text-3xl'
          )}
        >
          {headline}
        </h2>
      )}
      {bodies.map((body, index) => (
        <p key={index} className="mt-3 text-base text-[#062E25] tracking-tight">
          {body}
        </p>
      ))}

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-6 flex flex-col gap-4"
      >
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

        {showCompany && (
          <div>
            <label
              htmlFor={companyId}
              className="text-base text-[#062E25] tracking-tight"
            >
              {t('companyLabel')}
            </label>
            <Input
              id={companyId}
              type="text"
              value={companyName}
              onChange={event => setCompanyName(event.target.value)}
              autoComplete="organization"
              className="mt-1.5 h-12 rounded-xl border-[#062E25]/20 bg-white px-4 text-base md:text-base"
            />
          </div>
        )}

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
          className="h-12 w-full bg-energy text-base text-white hover:bg-energy/90"
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
