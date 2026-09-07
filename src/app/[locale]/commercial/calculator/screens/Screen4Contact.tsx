'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useCallback, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Link as LocaleLink } from '@/i18n/navigation'
import { getAttribution, trackFunnelEvent } from '@/lib/analytics/funnel-events'
import { trackLead } from '@/lib/analytics/track-lead'
import { commercialFlowMeta } from '@/lib/commercial-calculator-flow'
import { cn } from '@/lib/utils'
import { commercialLeadService } from '@/services/commercial-lead.service'
import { useCommercialCalculatorStore } from '@/stores/commercial-calculator.store'

import ManualCheckCapture from './ManualCheckCapture'

const inputBase =
  'w-full h-12 rounded-[5px] border border-[#E5E5E5] bg-white/20 backdrop-blur-[65px] px-3 text-base text-[#062E25] placeholder:text-[#062E25]/50 focus:outline-none focus:border-[#062E25]/60'

const labelBase = 'text-base text-[#062E25] tracking-tight'

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/
const PHONE_PATTERN = /^\+?[\d\s\-()]{7,}$/
const POSTAL_CODE_PATTERN = /^\d{4}$/

function useContactSchema(
  tErr: (key: string) => string,
  needsAddressFallback: boolean
) {
  return useMemo(
    () =>
      z
        .object({
          email: z
            .string()
            .trim()
            .min(1, tErr('required'))
            .regex(EMAIL_PATTERN, tErr('emailInvalid')),
          consent: z.literal(true, { message: tErr('consentRequired') }),
          companyName: z.string().trim().min(1, tErr('required')),
          name: z.string().trim().min(1, tErr('required')),
          phone: z
            .string()
            .trim()
            .min(1, tErr('required'))
            .regex(PHONE_PATTERN, tErr('phoneInvalid')),
          postalCode: z.string().trim(),
          city: z.string().trim(),
        })
        .superRefine((data, ctx) => {
          if (!needsAddressFallback) return
          if (!POSTAL_CODE_PATTERN.test(data.postalCode)) {
            ctx.addIssue({
              code: 'custom',
              path: ['postalCode'],
              message: tErr('required'),
            })
          }
          if (!data.city) {
            ctx.addIssue({
              code: 'custom',
              path: ['city'],
              message: tErr('required'),
            })
          }
        }),
    [tErr, needsAddressFallback]
  )
}

type ContactFormData = z.infer<ReturnType<typeof useContactSchema>>

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="mt-1 text-base text-destructive">
      {message}
    </p>
  )
}

export default function Screen4Contact() {
  const t = useTranslations('commercialCalculator.screen4')
  const tErr = useTranslations('commercialCalculator.screen4.errors')
  const locale = useLocale()

  const contact = useCommercialCalculatorStore(state => state.contact)
  const consent = useCommercialCalculatorStore(state => state.consent)
  const submission = useCommercialCalculatorStore(state => state.submission)
  const address = useCommercialCalculatorStore(state => state.address)
  const storePostalCode = useCommercialCalculatorStore(
    state => state.postalCode
  )
  const storeCity = useCommercialCalculatorStore(state => state.city)
  const lat = useCommercialCalculatorStore(state => state.lat)
  const lng = useCommercialCalculatorStore(state => state.lng)
  const setContact = useCommercialCalculatorStore(state => state.setContact)
  const setConsent = useCommercialCalculatorStore(state => state.setConsent)
  const setAddressFallback = useCommercialCalculatorStore(
    state => state.setAddressFallback
  )
  const setPartialCaptured = useCommercialCalculatorStore(
    state => state.setPartialCaptured
  )
  const submitLead = useCommercialCalculatorStore(state => state.submitLead)
  const goToStep = useCommercialCalculatorStore(state => state.goToStep)
  const prevStep = useCommercialCalculatorStore(state => state.prevStep)
  const getEstimate = useCommercialCalculatorStore(state => state.getEstimate)

  const estimate = getEstimate()
  const usableAreaM2 = Math.round(estimate.usableAreaM2)
  const systemSizeKwp = estimate.systemSizeKwp
  const productionKwh = Math.round(estimate.productionKwh)
  const showTeaser =
    estimate.usableAreaM2 > 0 &&
    estimate.systemSizeKwp > 0 &&
    estimate.productionKwh > 0
  const swissNumber = (value: number, digits = 0) =>
    value.toLocaleString('de-CH', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    })

  const [needsAddressFallback] = useState(
    () => !storePostalCode || !storeCity
  )

  const schema = useContactSchema(tErr, needsAddressFallback)

  const {
    register,
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: contact.email,
      consent: consent ? true : undefined,
      companyName: contact.companyName,
      name: contact.name,
      phone: contact.phone,
      postalCode: storePostalCode,
      city: storeCity,
    },
  })

  const maybeCapturePartial = useCallback(
    (consentOverride?: boolean) => {
      const state = useCommercialCalculatorStore.getState()
      if (state.partialCaptured) return
      if (state.submission.status === 'done') return
      const email = getValues('email')?.trim() ?? ''
      const consentTicked = consentOverride ?? getValues('consent') === true
      if (!consentTicked || !EMAIL_PATTERN.test(email)) return
      setPartialCaptured(true)
      const kwp = state.getEstimate().systemSizeKwp
      const companyName = getValues('companyName')?.trim() ?? ''
      commercialLeadService
        .requestManualCheck({
          email,
          address: state.address,
          privacy: true,
          source: 'partial_contact',
          companyName: companyName || undefined,
          postalCode: state.postalCode || undefined,
          city: state.city || undefined,
          lat: state.lat ?? undefined,
          lng: state.lng ?? undefined,
          systemSizeKwp: kwp > 0 ? kwp : undefined,
          attribution: getAttribution(),
        })
        .then(() => {
          trackFunnelEvent('manual_check_requested', {
            step: 4,
            meta: { ...commercialFlowMeta, source: 'partial_contact' },
          })
        })
        .catch(() => {
          setPartialCaptured(false)
        })
    },
    [getValues, setPartialCaptured]
  )

  const onSubmit = useCallback(
    async (data: ContactFormData) => {
      if (needsAddressFallback) {
        setAddressFallback({
          postalCode: data.postalCode.trim(),
          city: data.city.trim(),
        })
      }
      setContact({
        companyName: data.companyName.trim(),
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
      })
      setConsent(true)
      const result = await submitLead(locale)
      if (!result) return
      const finalEstimate = useCommercialCalculatorStore
        .getState()
        .getEstimate()
      trackLead({
        form: 'commercial_calculator',
        locale,
        value: Math.round(finalEstimate.selfConsumptionValueChf ?? 0),
      })
      trackFunnelEvent('commercial_lead_created', {
        step: 4,
        meta: {
          ...commercialFlowMeta,
          reference: result.reference,
          systemSizeKwp: finalEstimate.systemSizeKwp,
        },
      })
      goToStep(5)
    },
    [
      needsAddressFallback,
      setAddressFallback,
      setContact,
      setConsent,
      submitLead,
      locale,
      goToStep,
    ]
  )

  if (submission.status === 'done') return null

  const isSubmitting = submission.status === 'submitting'

  if (submission.status === 'error' && submission.errorCode === 'rate_limited') {
    return (
      <div className="h-full overflow-y-auto" data-hj-suppress data-cs-mask>
        <div className="container mx-auto px-4 pt-8 pb-24">
          <div className="flex flex-col items-center py-8">
            <ManualCheckCapture
              source="retry_blocked"
              prefill={{
                address,
                postalCode: storePostalCode || undefined,
                city: storeCity || undefined,
                lat: lat ?? undefined,
                lng: lng ?? undefined,
                systemSizeKwp: systemSizeKwp > 0 ? systemSizeKwp : undefined,
                companyName: contact.companyName || undefined,
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  const submitErrorMessage =
    submission.status === 'error'
      ? submission.errorCode === 'server'
        ? tErr('serverFailed')
        : tErr('submitFailed')
      : null

  return (
    <div className="h-full overflow-y-auto" data-hj-suppress data-cs-mask>
      <div className="container mx-auto px-4 pt-8 pb-24">
        <div className="mx-auto w-full max-w-xl text-center">
          <h1 className="text-3xl sm:text-[45px] font-medium text-[#062E25]">
            {t('headline')}
          </h1>
          <p className="mt-4 text-base sm:text-[22px] text-[#062E25] tracking-tight">
            {t('helper')}
          </p>
        </div>

        {showTeaser && (
          <div className="mx-auto mt-8 w-full max-w-md rounded-[16px] border border-[#9CA9A6]/30 bg-white/40 backdrop-blur-[20px] p-6 sm:p-8">
            <p className="text-base font-medium text-[#062E25] tracking-tight">
              {t('teaserTitle')}
            </p>
            <dl className="mt-4 grid grid-cols-3 gap-3">
              <div>
                <dt className="text-base text-[#062E25]/70 tracking-tight">
                  {t('teaserArea')}
                </dt>
                <dd className="mt-0.5 text-xl font-medium text-[#062E25] tabular-nums">
                  {swissNumber(usableAreaM2)}
                  <span className="text-base font-normal"> m²</span>
                </dd>
              </div>
              <div>
                <dt className="text-base text-[#062E25]/70 tracking-tight">
                  {t('teaserKwp')}
                </dt>
                <dd className="mt-0.5 text-xl font-medium text-[#062E25] tabular-nums">
                  {swissNumber(systemSizeKwp, 1)}
                  <span className="text-base font-normal"> kWp</span>
                </dd>
              </div>
              <div>
                <dt className="text-base text-[#062E25]/70 tracking-tight">
                  {t('teaserProduction')}
                </dt>
                <dd className="mt-0.5 text-xl font-medium text-[#062E25] tabular-nums">
                  {swissNumber(productionKwh)}
                  <span className="text-base font-normal"> kWh</span>
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-base text-[#062E25]/70 tracking-tight">
              {t('teaserSource')}
            </p>
            <p className="mt-3 text-base text-[#062E25] tracking-tight">
              {t('teaserNext')}
            </p>
          </div>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mx-auto mt-8 flex w-full max-w-md flex-col gap-5 rounded-[16px] border border-[#9CA9A6]/30 bg-white/40 backdrop-blur-[20px] p-6 text-left sm:p-8"
        >
          <div>
            <label htmlFor="commercial-email" className={labelBase}>
              {t('email')}
            </label>
            <input
              id="commercial-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              {...register('email', { onBlur: () => maybeCapturePartial() })}
              aria-invalid={!!errors.email}
              aria-describedby={
                errors.email ? 'commercial-email-error' : undefined
              }
              className={cn(
                inputBase,
                'mt-1',
                errors.email && 'border-destructive'
              )}
            />
            <FieldError
              id="commercial-email-error"
              message={errors.email?.message}
            />
          </div>

          {needsAddressFallback && (
            <div>
              <p className="text-base text-[#062E25] tracking-tight">
                {t('addressFallbackHelper')}
              </p>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="commercial-postal-code"
                    className={labelBase}
                  >
                    {t('postalCode')}
                  </label>
                  <input
                    id="commercial-postal-code"
                    autoComplete="postal-code"
                    inputMode="numeric"
                    maxLength={4}
                    {...register('postalCode')}
                    aria-invalid={!!errors.postalCode}
                    aria-describedby={
                      errors.postalCode
                        ? 'commercial-postal-code-error'
                        : undefined
                    }
                    className={cn(
                      inputBase,
                      'mt-1',
                      errors.postalCode && 'border-destructive'
                    )}
                  />
                  <FieldError
                    id="commercial-postal-code-error"
                    message={errors.postalCode?.message}
                  />
                </div>
                <div>
                  <label htmlFor="commercial-city" className={labelBase}>
                    {t('city')}
                  </label>
                  <input
                    id="commercial-city"
                    autoComplete="address-level2"
                    {...register('city')}
                    aria-invalid={!!errors.city}
                    aria-describedby={
                      errors.city ? 'commercial-city-error' : undefined
                    }
                    className={cn(
                      inputBase,
                      'mt-1',
                      errors.city && 'border-destructive'
                    )}
                  />
                  <FieldError
                    id="commercial-city-error"
                    message={errors.city?.message}
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <Controller
              name="consent"
              control={control}
              render={({ field }) => {
                const checked = field.value === true
                return (
                  <button
                    type="button"
                    aria-pressed={checked}
                    onClick={() => {
                      const next = checked ? undefined : true
                      field.onChange(next)
                      if (next === true) maybeCapturePartial(true)
                    }}
                    className="flex items-start gap-2.5 text-left"
                  >
                    <span
                      className={cn(
                        'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border transition-colors',
                        checked
                          ? 'bg-[#B7FE1A] border-[#B7FE1A]'
                          : 'border-[#062E25]/40'
                      )}
                    >
                      {checked && (
                        <svg
                          width="13"
                          height="10"
                          viewBox="0 0 8 6"
                          fill="none"
                        >
                          <path
                            d="M1 3L3 5L7 1"
                            stroke="#062E25"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                    <span className="text-base text-[#062E25] tracking-tight">
                      {t.rich('consent', {
                        privacyLink: chunks => (
                          <LocaleLink
                            href="/privacy-policy"
                            target="_blank"
                            className="underline underline-offset-2 text-[#062E25] hover:text-[#062E25]"
                            onClick={event => event.stopPropagation()}
                          >
                            {chunks}
                          </LocaleLink>
                        ),
                      })}
                    </span>
                  </button>
                )
              }}
            />
            {errors.consent && (
              <p role="alert" className="mt-2 text-base text-destructive">
                {errors.consent.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="commercial-company" className={labelBase}>
              {t('company')}
            </label>
            <input
              id="commercial-company"
              autoComplete="organization"
              {...register('companyName')}
              aria-invalid={!!errors.companyName}
              aria-describedby={
                errors.companyName ? 'commercial-company-error' : undefined
              }
              className={cn(
                inputBase,
                'mt-1',
                errors.companyName && 'border-destructive'
              )}
            />
            <FieldError
              id="commercial-company-error"
              message={errors.companyName?.message}
            />
          </div>

          <div>
            <label htmlFor="commercial-name" className={labelBase}>
              {t('name')}
            </label>
            <input
              id="commercial-name"
              autoComplete="name"
              {...register('name')}
              aria-invalid={!!errors.name}
              aria-describedby={
                errors.name ? 'commercial-name-error' : undefined
              }
              className={cn(
                inputBase,
                'mt-1',
                errors.name && 'border-destructive'
              )}
            />
            <FieldError
              id="commercial-name-error"
              message={errors.name?.message}
            />
          </div>

          <div>
            <label htmlFor="commercial-phone" className={labelBase}>
              {t('phone')}
            </label>
            <input
              id="commercial-phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              {...register('phone')}
              aria-invalid={!!errors.phone}
              aria-describedby={
                errors.phone
                  ? 'commercial-phone-error'
                  : 'commercial-phone-helper'
              }
              className={cn(
                inputBase,
                'mt-1',
                errors.phone && 'border-destructive'
              )}
            />
            <FieldError
              id="commercial-phone-error"
              message={errors.phone?.message}
            />
            <p
              id="commercial-phone-helper"
              className="mt-1 text-base text-[#062E25]/70 tracking-tight"
            >
              {t('phoneHelper')}
            </p>
          </div>

          {submitErrorMessage && (
            <div
              role="alert"
              className="rounded-md bg-destructive/10 p-3 text-base text-destructive"
            >
              {submitErrorMessage}
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="min-h-[44px] w-full bg-[#062E25] text-base text-white hover:bg-[#062E25]/90 sm:h-12"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('button')}
          </Button>

          <p className="text-center text-base text-[#062E25] tracking-tight">
            {t('reassurance')}
          </p>
        </form>

        <div className="mx-auto mt-6 w-full max-w-md text-center">
          <button
            type="button"
            onClick={prevStep}
            disabled={isSubmitting}
            className="inline-flex min-h-[44px] items-center px-2 text-base text-[#062E25] underline underline-offset-2 hover:text-[#062E25]"
          >
            {t('back')}
          </button>
        </div>
      </div>
    </div>
  )
}
