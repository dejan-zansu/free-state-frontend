'use client'

import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { useSolarAboCalculatorStore } from '@/stores/solar-abo-calculator.store'
import { cn } from '@/lib/utils'
import { calculatorFlowV2Enabled, flowVersionMeta } from '@/lib/calculator-flow'
import { getAttribution, trackFunnelEvent } from '@/lib/analytics/funnel-events'
import { trackLead } from '@/lib/analytics/track-lead'
import { residentialCalculatorService } from '@/services/residential-calculator.service'
import { Link as LocaleLink } from '@/i18n/navigation'
import { useRouter } from 'next/navigation'
import { useCalculatorEmbed } from '../CalculatorEmbedContext'
import ManualCheckCapture from '../v2/ManualCheckCapture'

const DEV_DEFAULT_CONTACT = {
  firstName: 'Test',
  lastName: 'Test',
  email: 'arsicdejan996@gmail.com',
  phoneNumber: '123123123',
  country: 'CH' as const,
  postalCode: '11000',
  city: 'Belgrade',
  street: 'Mirijevski bulevar',
  streetNumber: '92',
}

function useContactSchema(t: (key: string) => string) {
  return useMemo(
    () =>
      z.object({
        firstName: z.string().min(1, t('firstNameRequired')),
        lastName: z.string().min(1, t('lastNameRequired')),
        email: z.string().min(1, t('emailRequired')).email(t('emailInvalid')),
        phoneNumber: z
          .string()
          .min(1, t('phoneRequired'))
          .regex(/^[+\d][\d\s\-().]{6,}$/, t('phoneInvalid')),
        country: z.enum(['CH', 'LI']),
        postalCode: z.string().min(1, t('postalCodeRequired')),
        city: z.string().min(1, t('cityRequired')),
        street: z.string().min(1, t('streetRequired')),
        streetNumber: z.string().min(1, t('streetNumberRequired')),
        dataProcessing: z.literal(true, {
          message: t('consentRequired'),
        }),
        marketing: z.boolean().optional(),
      }),
    [t]
  )
}

type ContactFormData = z.infer<ReturnType<typeof useContactSchema>>

const inputBase =
  'w-full h-9 rounded-[5px] border border-[#E5E5E5] bg-white/20 backdrop-blur-[65px] px-3 text-base text-[#062E25] placeholder:text-[#062E25]/50 focus:outline-none focus:border-[#062E25]/60'

const labelBase =
  'text-sm sm:text-base text-[#062E25] tracking-tight'

const v2InputBase =
  'w-full h-12 rounded-[5px] border border-[#E5E5E5] bg-white/20 backdrop-blur-[65px] px-3 text-base text-[#062E25] placeholder:text-[#062E25]/50 focus:outline-none focus:border-[#062E25]/60'

const v2LabelBase = 'text-base text-[#062E25] tracking-tight'

const V2_EMAIL_PATTERN = /^\S+@\S+\.\S+$/

export default function Step6ContactDetails() {
  if (calculatorFlowV2Enabled) {
    return <ContactScreenV2 />
  }
  return <ContactScreenV1 />
}

function ContactScreenV1() {
  const t = useTranslations('solarAboCalculator.step7')
  const tErr = useTranslations('solarAboCalculator.step7.errors')
  const tAddr = useTranslations('solarAboCalculator.step7.address')
  const tNav = useTranslations('solarAboCalculator.navigation')
  const tConsent = useTranslations('solarAboCalculator.consents')
  const tPending = useTranslations('calculator.pendingVerification')
  const tSubmitErr = useTranslations('calculatorV2.screen5.errors')
  const locale = useLocale()
  const router = useRouter()
  const embedded = useCalculatorEmbed()
  const Heading = embedded ? 'h3' : 'h1'
  const {
    contact,
    consents,
    setContact,
    setConsents,
    prevStep,
    isSubmitting,
    submissionError,
    submissionErrorCode,
    pendingVerification,
    createAccount,
  } = useSolarAboCalculatorStore()

  const schema = useContactSchema(tErr)
  const isLocalDev = process.env.NODE_ENV === 'development'

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName:
        contact.firstName || (isLocalDev ? DEV_DEFAULT_CONTACT.firstName : ''),
      lastName:
        contact.lastName || (isLocalDev ? DEV_DEFAULT_CONTACT.lastName : ''),
      email: contact.email || (isLocalDev ? DEV_DEFAULT_CONTACT.email : ''),
      phoneNumber:
        contact.phoneNumber ||
        (isLocalDev ? DEV_DEFAULT_CONTACT.phoneNumber : ''),
      country:
        contact.country || (isLocalDev ? DEV_DEFAULT_CONTACT.country : 'CH'),
      postalCode:
        contact.postalCode ||
        (isLocalDev ? DEV_DEFAULT_CONTACT.postalCode : ''),
      city: contact.city || (isLocalDev ? DEV_DEFAULT_CONTACT.city : ''),
      street: contact.street || (isLocalDev ? DEV_DEFAULT_CONTACT.street : ''),
      streetNumber:
        contact.streetNumber ||
        (isLocalDev ? DEV_DEFAULT_CONTACT.streetNumber : ''),
      dataProcessing:
        consents.dataProcessing || (isLocalDev ? true : undefined),
      marketing: consents.marketing ?? false,
    },
  })

  const onSubmit = useCallback(
    async (data: ContactFormData) => {
      setContact({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        country: data.country,
        postalCode: data.postalCode,
        city: data.city,
        street: data.street,
        streetNumber: data.streetNumber,
      })
      setConsents({
        dataProcessing: data.dataProcessing,
        marketing: data.marketing ?? false,
      })
      await createAccount()
      const s = useSolarAboCalculatorStore.getState()
      const serverSavings = s.serverAnnualSavingsChf
      const leadValue =
        typeof serverSavings === 'number' && serverSavings > 0
          ? { value: Math.round(serverSavings) }
          : {}
      if (s.pendingVerification) {
        trackLead({ form: 'calculator', locale, ...leadValue })
        trackFunnelEvent('account_pending_verification', {
          meta: { model: s.solarModel ?? undefined },
        })
        return
      }
      if (s.accountCreated) {
        trackLead({ form: 'calculator', locale, ...leadValue })
        trackFunnelEvent('account_created', {
          meta: { model: s.solarModel ?? undefined, source: 'calculator' },
        })
        const projectId = s.createdProjectId
        if (projectId) {
          router.push(`/${locale}/dashboard/project/${projectId}`)
        } else {
          router.push(`/${locale}/dashboard`)
        }
      }
    },
    [setContact, setConsents, createAccount, router, locale]
  )

  if (pendingVerification) {
    return (
      <div className="h-full overflow-y-auto">
        <div
          className={cn(
            'container mx-auto px-4 pt-8',
            embedded ? 'pb-12' : 'pb-24'
          )}
        >
          <div className="mx-auto max-w-md text-center py-12">
            <Heading className="text-3xl sm:text-[45px] font-medium text-[#062E25]">
              {tPending('title')}
            </Heading>
            <p className="mt-3 text-base sm:text-[22px] text-[#062E25] tracking-tight">
              {tPending('body')}
            </p>
            <p className="mt-2 text-base text-[#062E25]">
              {tPending('hint')}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto" data-hj-suppress data-cs-mask>
      <div
        className={cn(
          'container mx-auto px-4 pt-8',
          embedded ? 'pb-12' : 'pb-24'
        )}
      >
        <div
          className={cn(
            'flex flex-col',
            embedded
              ? 'items-center gap-8'
              : 'lg:flex-row justify-center gap-10 lg:gap-[60px]'
          )}
        >
          <div
            className={cn(
              'flex flex-col w-full',
              embedded
                ? 'gap-3 max-w-[700px] items-center text-center'
                : 'gap-5 max-w-[436px]'
            )}
          >
            <Heading className="text-3xl sm:text-[45px] font-medium text-[#062E25]">
              {t('title')}
            </Heading>
            <p className="text-base sm:text-[22px] text-[#062E25] tracking-tight">
              {t('helper')}
            </p>
          </div>

          <div
            className={cn(
              'w-full',
              embedded ? 'max-w-[1040px]' : 'max-w-[534px]'
            )}
          >
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className={cn(
                'rounded-[16px] border border-[#9CA9A6]/30 bg-white/40 backdrop-blur-[20px] p-7 sm:p-8',
                embedded
                  ? 'grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-5'
                  : 'space-y-5'
              )}
            >
              <div className="space-y-5 min-w-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-5">
                  <div className="space-y-1">
                    <input
                      id="firstName"
                      {...register('firstName')}
                      placeholder={t('firstName')}
                      className={cn(
                        inputBase,
                        errors.firstName && 'border-destructive'
                      )}
                    />
                    {errors.firstName && (
                      <p className="text-sm sm:text-base text-destructive">
                        {errors.firstName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <input
                      id="lastName"
                      {...register('lastName')}
                      placeholder={t('lastName')}
                      className={cn(
                        inputBase,
                        errors.lastName && 'border-destructive'
                      )}
                    />
                    {errors.lastName && (
                      <p className="text-sm sm:text-base text-destructive">
                        {errors.lastName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <input
                      id="phoneNumber"
                      type="tel"
                      {...register('phoneNumber')}
                      placeholder={t('phoneNumber')}
                      className={cn(
                        inputBase,
                        errors.phoneNumber && 'border-destructive'
                      )}
                    />
                    {errors.phoneNumber && (
                      <p className="text-sm sm:text-base text-destructive">
                        {errors.phoneNumber.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <input
                      id="email"
                      type="email"
                      {...register('email')}
                      placeholder={t('email')}
                      className={cn(
                        inputBase,
                        errors.email && 'border-destructive'
                      )}
                    />
                    {errors.email && (
                      <p className="text-sm sm:text-base text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-5 min-w-0">
                <div className="space-y-3 pt-1">
                  <p className={cn(labelBase, 'font-medium')}>
                    {tAddr('sectionTitle')}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-5">
                    <div className="space-y-1">
                      <input
                        id="postalCode"
                        {...register('postalCode')}
                        placeholder={tAddr('postalCode')}
                        className={cn(
                          inputBase,
                          errors.postalCode && 'border-destructive'
                        )}
                      />
                      {errors.postalCode && (
                        <p className="text-sm sm:text-base text-destructive">
                          {errors.postalCode.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <input
                        id="city"
                        {...register('city')}
                        placeholder={tAddr('city')}
                        className={cn(
                          inputBase,
                          errors.city && 'border-destructive'
                        )}
                      />
                      {errors.city && (
                        <p className="text-sm sm:text-base text-destructive">
                          {errors.city.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-[1fr_120px] gap-x-3 gap-y-5">
                    <div className="space-y-1">
                      <input
                        id="street"
                        {...register('street')}
                        placeholder={tAddr('street')}
                        className={cn(
                          inputBase,
                          errors.street && 'border-destructive'
                        )}
                      />
                      {errors.street && (
                        <p className="text-sm sm:text-base text-destructive">
                          {errors.street.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <input
                        id="streetNumber"
                        {...register('streetNumber')}
                        placeholder={tAddr('streetNumber')}
                        className={cn(
                          inputBase,
                          errors.streetNumber && 'border-destructive'
                        )}
                      />
                      {errors.streetNumber && (
                        <p className="text-sm sm:text-base text-destructive">
                          {errors.streetNumber.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className={cn(embedded && 'lg:col-span-2')}>
                <Controller
                  name="dataProcessing"
                  control={control}
                  render={({ field }) => {
                    const checked = field.value === true
                    return (
                      <button
                        type="button"
                        onClick={() =>
                          field.onChange(checked ? undefined : true)
                        }
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
                        <span className="text-sm sm:text-base text-[#062E25] tracking-tight">
                          {tConsent('dataProcessingPrefix')}{' '}
                          <Link
                            href="/privacy-policy"
                            className="underline underline-offset-2 text-[#062E25] hover:text-[#062E25]/80"
                            onClick={e => e.stopPropagation()}
                          >
                            {tConsent('dataProcessingLink')}
                          </Link>{' '}
                          {tConsent('dataProcessingSuffix')}{' '}
                          <span className="text-destructive">*</span>
                        </span>
                      </button>
                    )
                  }}
                />
                {errors.dataProcessing && (
                  <p className="mt-2 text-sm sm:text-base text-destructive">
                    {errors.dataProcessing.message}
                  </p>
                )}
              </div>

              <div className={cn(embedded && 'lg:col-span-2')}>
                <Controller
                  name="marketing"
                  control={control}
                  render={({ field }) => {
                    const checked = field.value === true
                    return (
                      <button
                        type="button"
                        onClick={() => field.onChange(!checked)}
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
                        <span className="text-sm sm:text-base text-[#062E25] tracking-tight">
                          {tConsent('marketing')}
                        </span>
                      </button>
                    )
                  }}
                />
              </div>

              {submissionError && (
                <div
                  className={cn(
                    'text-sm sm:text-base text-destructive bg-destructive/10 p-3 rounded-md',
                    embedded && 'lg:col-span-2'
                  )}
                >
                  {submissionErrorCode === 'rate_limited'
                    ? tSubmitErr('rateLimited')
                    : tSubmitErr('submitFailed')}
                </div>
              )}
            </form>
          </div>
        </div>

        <div
          className={cn(
            'flex justify-end gap-4 px-6 py-4',
            embedded
              ? 'mt-8 w-full rounded-2xl'
              : 'fixed bottom-0 left-0 right-0 z-50'
          )}
          style={{
            background: 'rgba(234, 237, 223, 0.85)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={isSubmitting}
            style={{ borderColor: '#062E25', color: '#062E25' }}
          >
            {tNav('back')}
          </Button>
          <Button
            className="w-fit bg-[#062E25] text-white hover:bg-[#062E25]/90"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {tNav('next')}
          </Button>
        </div>
      </div>
    </div>
  )
}

function useV2Schema(tErr: (key: string) => string, needsAddressFallback: boolean) {
  return useMemo(
    () =>
      z
        .object({
          email: z.string().min(1, tErr('required')).email(tErr('emailInvalid')),
          consent: z.literal(true, {
            message: tErr('consentRequired'),
          }),
          firstName: z.string().min(1, tErr('required')),
          lastName: z.string().min(1, tErr('required')),
          phoneNumber: z
            .string()
            .min(1, tErr('required'))
            .regex(/^[+\d][\d\s\-().]{6,}$/, tErr('phoneInvalid')),
          postalCode: z.string(),
          city: z.string(),
        })
        .superRefine((data, ctx) => {
          if (!needsAddressFallback) return
          if (!data.postalCode.trim()) {
            ctx.addIssue({
              code: 'custom',
              path: ['postalCode'],
              message: tErr('required'),
            })
          }
          if (!data.city.trim()) {
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

type V2FormData = z.infer<ReturnType<typeof useV2Schema>>

function V2FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} role="alert" className="mt-1 text-base text-destructive">
      {message}
    </p>
  )
}

function ContactScreenV2() {
  const t = useTranslations('calculatorV2.screen5')
  const tErr = useTranslations('calculatorV2.screen5.errors')
  const tNav = useTranslations('solarAboCalculator.navigation')
  const tPending = useTranslations('calculator.pendingVerification')
  const locale = useLocale()
  const router = useRouter()
  const embedded = useCalculatorEmbed()
  const Heading = embedded ? 'h3' : 'h1'

  const {
    contact,
    consents,
    setContact,
    setConsents,
    prevStep,
    isSubmitting,
    submissionError,
    submissionErrorCode,
    pendingVerification,
    accountCreated,
    createdProjectId,
    address,
    createAccount,
  } = useSolarAboCalculatorStore()

  const [needsAddressFallback] = useState(
    () => !contact.postalCode || !contact.city
  )
  const [correctedEmail, setCorrectedEmail] = useState(contact.email)
  const [resendError, setResendError] = useState<string | null>(null)
  const partialFiredRef = useRef(false)

  const prevPendingRef = useRef(pendingVerification)
  useEffect(() => {
    if (pendingVerification && !prevPendingRef.current) {
      setCorrectedEmail(useSolarAboCalculatorStore.getState().contact.email)
    }
    prevPendingRef.current = pendingVerification
  }, [pendingVerification])

  const schema = useV2Schema(tErr, needsAddressFallback)
  const isLocalDev = process.env.NODE_ENV === 'development'

  const {
    register,
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<V2FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: contact.email || (isLocalDev ? DEV_DEFAULT_CONTACT.email : ''),
      consent: consents.dataProcessing || isLocalDev ? true : undefined,
      firstName:
        contact.firstName || (isLocalDev ? DEV_DEFAULT_CONTACT.firstName : ''),
      lastName:
        contact.lastName || (isLocalDev ? DEV_DEFAULT_CONTACT.lastName : ''),
      phoneNumber:
        contact.phoneNumber ||
        (isLocalDev ? DEV_DEFAULT_CONTACT.phoneNumber : ''),
      postalCode: contact.postalCode,
      city: contact.city,
    },
  })

  const maybeCapturePartial = useCallback(
    (consentOverride?: boolean) => {
      if (partialFiredRef.current) return
      const state = useSolarAboCalculatorStore.getState()
      if (state.manualCheckRequested === 'partial_contact') return
      if (state.accountCreated) return
      const email = getValues('email')?.trim() ?? ''
      const consentTicked = consentOverride ?? getValues('consent') === true
      if (!consentTicked || !V2_EMAIL_PATTERN.test(email)) return
      partialFiredRef.current = true
      const kwp = state.getSystemSizeKwp()
      residentialCalculatorService
        .requestManualCheck({
          email,
          address: state.address,
          privacy: true,
          source: 'partial_contact',
          postalCode: state.contact.postalCode || undefined,
          city: state.contact.city || undefined,
          lat: state.selectedLocation?.lat,
          lng: state.selectedLocation?.lng,
          systemSizeKwp: kwp > 0 ? kwp : undefined,
          attribution: getAttribution(),
        })
        .then(() => {
          trackFunnelEvent('manual_check_requested', {
            meta: { source: 'partial_contact', ...flowVersionMeta },
          })
          useSolarAboCalculatorStore
            .getState()
            .setManualCheckRequested('partial_contact')
        })
        .catch(() => {
          partialFiredRef.current = false
        })
    },
    [getValues]
  )

  const onSubmit = useCallback(
    async (data: V2FormData) => {
      setContact({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        ...(needsAddressFallback
          ? { postalCode: data.postalCode, city: data.city }
          : {}),
      })
      setConsents({ dataProcessing: true })
      await createAccount()
      const s = useSolarAboCalculatorStore.getState()
      const serverSavings = s.serverAnnualSavingsChf
      const leadValue =
        typeof serverSavings === 'number' && serverSavings > 0
          ? { value: Math.round(serverSavings) }
          : {}
      if (s.pendingVerification) {
        trackLead({ form: 'calculator', locale, ...leadValue })
        trackFunnelEvent('account_pending_verification', {
          meta: { model: s.solarModel ?? undefined },
        })
        return
      }
      if (s.accountCreated) {
        trackLead({ form: 'calculator', locale, ...leadValue })
        trackFunnelEvent('account_created', {
          meta: { model: s.solarModel ?? undefined, source: 'calculator' },
        })
        const projectId = s.createdProjectId
        if (projectId) {
          router.push(`/${locale}/dashboard/project/${projectId}`)
        } else {
          router.push(`/${locale}/dashboard`)
        }
      }
    },
    [setContact, setConsents, createAccount, router, locale, needsAddressFallback]
  )

  const handleResend = useCallback(async () => {
    const email = correctedEmail.trim()
    if (!V2_EMAIL_PATTERN.test(email)) {
      setResendError(tErr('emailInvalid'))
      return
    }
    setResendError(null)
    setContact({ email })
    await createAccount()
  }, [correctedEmail, setContact, createAccount, tErr])

  if (accountCreated && createdProjectId) {
    return (
      <div className="h-full overflow-y-auto">
        <div
          className={cn(
            'container mx-auto px-4 pt-8',
            embedded ? 'pb-12' : 'pb-24'
          )}
        >
          <div className="mx-auto max-w-md text-center py-12">
            <Heading className="text-2xl sm:text-3xl font-medium text-[#062E25]">
              {t('alreadyDone')}
            </Heading>
            <Button
              asChild
              className="mt-6 h-12 bg-[#062E25] px-6 text-base text-white hover:bg-[#062E25]/90"
            >
              <Link href={`/${locale}/dashboard/project/${createdProjectId}`}>
                {t('alreadyDoneCta')}
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (pendingVerification) {
    return (
      <div className="h-full overflow-y-auto" data-hj-suppress data-cs-mask>
        <div
          className={cn(
            'container mx-auto px-4 pt-8',
            embedded ? 'pb-12' : 'pb-24'
          )}
        >
          <div className="mx-auto max-w-md py-12">
            <div className="text-center">
              <Heading className="text-3xl sm:text-[45px] font-medium text-[#062E25]">
                {tPending('title')}
              </Heading>
              <p className="mt-3 text-base sm:text-[22px] text-[#062E25] tracking-tight">
                {tPending('body')}
              </p>
              <p className="mt-2 text-base text-[#062E25]">
                {tPending('hint')}
              </p>
            </div>

            <div className="mt-10 rounded-[16px] border border-[#9CA9A6]/30 bg-white/40 backdrop-blur-[20px] p-6 text-left">
              <p className="text-base text-[#062E25] tracking-tight">
                {t('verifyTypoPrompt')}
              </p>
              <label htmlFor="v2-verify-email" className={cn(v2LabelBase, 'mt-4 block')}>
                {t('email')}
              </label>
              <input
                id="v2-verify-email"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={correctedEmail}
                onChange={event => setCorrectedEmail(event.target.value)}
                aria-invalid={!!resendError}
                aria-describedby={resendError ? 'v2-verify-email-error' : undefined}
                className={cn(
                  v2InputBase,
                  'mt-1',
                  resendError && 'border-destructive'
                )}
              />
              <V2FieldError
                id="v2-verify-email-error"
                message={resendError ?? undefined}
              />
              {submissionError && (
                <p role="alert" className="mt-2 text-base text-destructive">
                  {submissionErrorCode === 'rate_limited'
                    ? tErr('rateLimited')
                    : tErr('submitFailed')}
                </p>
              )}
              <Button
                onClick={handleResend}
                disabled={isSubmitting}
                className="mt-4 h-12 w-full bg-[#062E25] text-base text-white hover:bg-[#062E25]/90"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {t('verifyResendButton')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (submissionErrorCode === 'rate_limited') {
    const state = useSolarAboCalculatorStore.getState()
    const kwp = state.getSystemSizeKwp()
    return (
      <div className="h-full overflow-y-auto" data-hj-suppress data-cs-mask>
        <div
          className={cn(
            'container mx-auto px-4 pt-8',
            embedded ? 'pb-12' : 'pb-24'
          )}
        >
          <div className="flex flex-col items-center py-8">
            <ManualCheckCapture
              source="retry_blocked"
              prefill={{
                address,
                postalCode: contact.postalCode || undefined,
                city: contact.city || undefined,
                systemSizeKwp: kwp > 0 ? kwp : undefined,
              }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto" data-hj-suppress data-cs-mask>
      <div
        className={cn(
          'container mx-auto px-4 pt-8',
          embedded ? 'pb-12' : 'pb-24'
        )}
      >
        <div className="mx-auto w-full max-w-xl text-center">
          <Heading className="text-3xl sm:text-[45px] font-medium text-[#062E25]">
            {t('headline')}
          </Heading>
          <p className="mt-4 text-base sm:text-[22px] text-[#062E25] tracking-tight">
            {t('helper')}
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mx-auto mt-8 flex w-full max-w-md flex-col gap-5 rounded-[16px] border border-[#9CA9A6]/30 bg-white/40 backdrop-blur-[20px] p-6 text-left sm:p-8"
        >
          <div>
            <label htmlFor="v2-email" className={v2LabelBase}>
              {t('email')}
            </label>
            <input
              id="v2-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              {...register('email', { onBlur: () => maybeCapturePartial() })}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'v2-email-error' : undefined}
              className={cn(
                v2InputBase,
                'mt-1',
                errors.email && 'border-destructive'
              )}
            />
            <V2FieldError id="v2-email-error" message={errors.email?.message} />
          </div>

          {needsAddressFallback && (
            <div>
              <p className="text-base text-[#062E25] tracking-tight">
                {t('addressFallbackHelper')}
              </p>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="v2-postal-code" className={v2LabelBase}>
                    {t('postalCode')}
                  </label>
                  <input
                    id="v2-postal-code"
                    autoComplete="postal-code"
                    {...register('postalCode')}
                    aria-invalid={!!errors.postalCode}
                    aria-describedby={
                      errors.postalCode ? 'v2-postal-code-error' : undefined
                    }
                    className={cn(
                      v2InputBase,
                      'mt-1',
                      errors.postalCode && 'border-destructive'
                    )}
                  />
                  <V2FieldError
                    id="v2-postal-code-error"
                    message={errors.postalCode?.message}
                  />
                </div>
                <div>
                  <label htmlFor="v2-city" className={v2LabelBase}>
                    {t('city')}
                  </label>
                  <input
                    id="v2-city"
                    autoComplete="address-level2"
                    {...register('city')}
                    aria-invalid={!!errors.city}
                    aria-describedby={
                      errors.city ? 'v2-city-error' : undefined
                    }
                    className={cn(
                      v2InputBase,
                      'mt-1',
                      errors.city && 'border-destructive'
                    )}
                  />
                  <V2FieldError
                    id="v2-city-error"
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
            <p className="mt-2 text-base text-[#062E25] tracking-tight">
              {t('consentNote')}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="v2-first-name" className={v2LabelBase}>
                {t('firstName')}
              </label>
              <input
                id="v2-first-name"
                autoComplete="given-name"
                {...register('firstName')}
                aria-invalid={!!errors.firstName}
                aria-describedby={
                  errors.firstName ? 'v2-first-name-error' : undefined
                }
                className={cn(
                  v2InputBase,
                  'mt-1',
                  errors.firstName && 'border-destructive'
                )}
              />
              <V2FieldError
                id="v2-first-name-error"
                message={errors.firstName?.message}
              />
            </div>
            <div>
              <label htmlFor="v2-last-name" className={v2LabelBase}>
                {t('lastName')}
              </label>
              <input
                id="v2-last-name"
                autoComplete="family-name"
                {...register('lastName')}
                aria-invalid={!!errors.lastName}
                aria-describedby={
                  errors.lastName ? 'v2-last-name-error' : undefined
                }
                className={cn(
                  v2InputBase,
                  'mt-1',
                  errors.lastName && 'border-destructive'
                )}
              />
              <V2FieldError
                id="v2-last-name-error"
                message={errors.lastName?.message}
              />
            </div>
          </div>

          <div>
            <label htmlFor="v2-phone" className={v2LabelBase}>
              {t('phone')}
            </label>
            <input
              id="v2-phone"
              type="tel"
              autoComplete="tel"
              {...register('phoneNumber')}
              aria-invalid={!!errors.phoneNumber}
              aria-describedby={cn(
                errors.phoneNumber && 'v2-phone-error',
                'v2-phone-helper'
              )}
              className={cn(
                v2InputBase,
                'mt-1',
                errors.phoneNumber && 'border-destructive'
              )}
            />
            <V2FieldError
              id="v2-phone-error"
              message={errors.phoneNumber?.message}
            />
            <p
              id="v2-phone-helper"
              className="mt-1 text-base text-[#062E25] tracking-tight"
            >
              {t('phoneHelper')}
            </p>
          </div>

          {submissionError && (
            <div
              role="alert"
              className="rounded-md bg-destructive/10 p-3 text-base text-destructive"
            >
              {tErr('submitFailed')}
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-12 w-full bg-[#062E25] text-base text-white hover:bg-[#062E25]/90"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('button')}
          </Button>

          <div>
            <p className="text-center text-base text-[#062E25] tracking-tight">
              {t('reassurance1')}
            </p>
            <p className="mt-1 text-center text-base text-[#062E25] tracking-tight">
              {t('reassurance2')}
            </p>
          </div>
        </form>

        <div className="mx-auto mt-6 w-full max-w-md text-center">
          <button
            type="button"
            onClick={prevStep}
            disabled={isSubmitting}
            className="text-base text-[#062E25] underline underline-offset-2 hover:text-[#062E25]"
          >
            {tNav('back')}
          </button>
        </div>
      </div>
    </div>
  )
}
