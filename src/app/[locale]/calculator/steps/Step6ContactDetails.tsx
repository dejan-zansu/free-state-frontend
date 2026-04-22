'use client'

import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCallback, useMemo } from 'react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useSolarAboCalculatorStore,
  type Salutation,
  type ContactCountry,
} from '@/stores/solar-abo-calculator.store'
import { cn } from '@/lib/utils'

const salutations: Salutation[] = ['mr', 'woman', 'family']
const countries: ContactCountry[] = ['CH', 'LI']

function useContactSchema(t: (key: string) => string) {
  return useMemo(
    () =>
      z.object({
        salutation: z.enum(['mr', 'woman', 'family'], {
          message: t('salutationRequired'),
        }),
        firstName: z.string().min(1, t('firstNameRequired')),
        lastName: z.string().min(1, t('lastNameRequired')),
        email: z.string().min(1, t('emailRequired')).email(t('emailInvalid')),
        phoneNumber: z
          .string()
          .min(1, t('phoneRequired'))
          .regex(/^[+\d][\d\s\-().]{6,}$/, t('phoneInvalid')),
        dateOfBirth: z
          .string()
          .min(1, t('dateOfBirthRequired'))
          .refine(v => {
            const d = new Date(v)
            if (isNaN(d.getTime())) return false
            const today = new Date()
            const age = today.getFullYear() - d.getFullYear() -
              (today < new Date(today.getFullYear(), d.getMonth(), d.getDate()) ? 1 : 0)
            return age >= 18 && age <= 120
          }, t('dateOfBirthInvalid')),
        nationality: z.string().min(1, t('nationalityRequired')),
        country: z.enum(['CH', 'LI']),
        postalCode: z.string().min(1, t('postalCodeRequired')),
        city: z.string().min(1, t('cityRequired')),
        street: z.string().min(1, t('streetRequired')),
        streetNumber: z.string().min(1, t('streetNumberRequired')),
        addressAdditional: z.string(),
        remarks: z.string(),
        dataProcessing: z.literal(true, {
          message: t('consentRequired'),
        }),
      }),
    [t]
  )
}

type ContactFormData = z.infer<ReturnType<typeof useContactSchema>>

const inputBase =
  'w-full h-9 rounded-[5px] border border-[#E5E5E5] bg-white/20 backdrop-blur-[65px] px-3 text-base text-[#062E25] placeholder:text-[#062E25]/30 focus:outline-none focus:border-[#062E25]/60'

const labelBase = 'text-sm font-light text-[#062E25]/80 tracking-tight'

export default function Step6ContactDetails() {
  const t = useTranslations('solarAboCalculator.step7')
  const tErr = useTranslations('solarAboCalculator.step7.errors')
  const tAddr = useTranslations('solarAboCalculator.step7.address')
  const tNav = useTranslations('solarAboCalculator.navigation')
  const tConsent = useTranslations('solarAboCalculator.consents')
  const locale = useLocale()
  const {
    contact,
    consents,
    setContact,
    setConsents,
    prevStep,
    nextStep,
    isSubmitting,
    submissionError,
    createAccount,
  } = useSolarAboCalculatorStore()

  const schema = useContactSchema(tErr)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      salutation: contact.salutation || undefined,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phoneNumber: contact.phoneNumber,
      dateOfBirth: contact.dateOfBirth,
      nationality: contact.nationality,
      country: contact.country || 'CH',
      postalCode: contact.postalCode,
      city: contact.city,
      street: contact.street,
      streetNumber: contact.streetNumber,
      addressAdditional: contact.addressAdditional,
      remarks: contact.remarks,
      dataProcessing: consents.dataProcessing || undefined,
    },
  })

  const onSubmit = useCallback(
    async (data: ContactFormData) => {
      setContact({
        salutation: data.salutation,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        dateOfBirth: data.dateOfBirth,
        nationality: data.nationality,
        country: data.country,
        postalCode: data.postalCode,
        city: data.city,
        street: data.street,
        streetNumber: data.streetNumber,
        addressAdditional: data.addressAdditional,
        remarks: data.remarks,
      })
      setConsents({ dataProcessing: data.dataProcessing })
      await createAccount()
      if (useSolarAboCalculatorStore.getState().accountCreated) {
        nextStep()
      }
    },
    [setContact, setConsents, createAccount, nextStep]
  )

  return (
    <div className="h-full overflow-y-auto">
      <div className="container mx-auto px-4 pt-8 pb-24">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-[60px]">
          <div className="flex flex-col gap-5 w-full max-w-[436px]">
            <h1 className="text-3xl sm:text-[45px] font-medium text-[#062E25]">
              {t('title')}
            </h1>
            <p className="text-base sm:text-[22px] font-light text-[#062E25]/80 tracking-tight">
              {t('helper')}
            </p>
          </div>

          <div className="w-full max-w-[534px]">
            <form
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="rounded-[16px] border border-[#9CA9A6]/30 bg-white/40 backdrop-blur-[20px] p-7 sm:p-8 space-y-5"
            >
              <div className="flex flex-col gap-2.5">
                <label className={labelBase}>
                  {t('salutation.label')}{' '}
                  <span className="text-destructive">*</span>
                </label>
                <Controller
                  name="salutation"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center gap-[17px]">
                      {salutations.map(option => {
                        const selected = field.value === option
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => field.onChange(option)}
                            className="flex items-center gap-1.5"
                          >
                            <span
                              className={cn(
                                'w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors',
                                selected
                                  ? 'border-[#062E25]'
                                  : 'border-[#D9D9D9]'
                              )}
                            >
                              {selected && (
                                <span className="w-2 h-2 rounded-full bg-[#B7FE1A]" />
                              )}
                            </span>
                            <span
                              className={cn(
                                'text-sm font-medium tracking-tight',
                                selected
                                  ? 'text-[#062E25]'
                                  : 'text-[#062E25]/70'
                              )}
                            >
                              {t(`salutation.options.${option}`)}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                />
                {errors.salutation && (
                  <p className="text-sm text-destructive">
                    {errors.salutation.message}
                  </p>
                )}
              </div>

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
                    <p className="text-sm text-destructive">
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
                    <p className="text-sm text-destructive">
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
                    <p className="text-sm text-destructive">
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
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Controller
                    name="dateOfBirth"
                    control={control}
                    render={({ field }) => {
                      const [y = '', m = '', d = ''] = (field.value || '').split('-')
                      const update = (part: 'y' | 'm' | 'd', v: string) => {
                        const ny = part === 'y' ? v : y
                        const nm = part === 'm' ? v : m
                        const nd = part === 'd' ? v : d
                        field.onChange(ny && nm && nd ? `${ny}-${nm}-${nd}` : '')
                      }
                      const currentYear = new Date().getFullYear()
                      const years = Array.from(
                        { length: 103 },
                        (_, i) => currentYear - 18 - i
                      )
                      const monthFmt = new Intl.DateTimeFormat(locale, {
                        month: 'long',
                      })
                      const triggerCls = cn(
                        inputBase,
                        'flex items-center justify-between',
                        errors.dateOfBirth && 'border-destructive'
                      )
                      return (
                        <div className="grid grid-cols-[1fr_1.4fr_1fr] gap-2">
                          <Select value={d} onValueChange={v => update('d', v)}>
                            <SelectTrigger className={triggerCls}>
                              <SelectValue placeholder={t('dateOfBirthDay')} />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 31 }, (_, i) => {
                                const v = String(i + 1).padStart(2, '0')
                                return (
                                  <SelectItem key={v} value={v}>
                                    {v}
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>
                          <Select value={m} onValueChange={v => update('m', v)}>
                            <SelectTrigger className={triggerCls}>
                              <SelectValue placeholder={t('dateOfBirthMonth')} />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 12 }, (_, i) => {
                                const v = String(i + 1).padStart(2, '0')
                                return (
                                  <SelectItem key={v} value={v}>
                                    {monthFmt.format(new Date(2000, i, 1))}
                                  </SelectItem>
                                )
                              })}
                            </SelectContent>
                          </Select>
                          <Select value={y} onValueChange={v => update('y', v)}>
                            <SelectTrigger className={triggerCls}>
                              <SelectValue placeholder={t('dateOfBirthYear')} />
                            </SelectTrigger>
                            <SelectContent>
                              {years.map(yr => (
                                <SelectItem key={yr} value={String(yr)}>
                                  {yr}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )
                    }}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-sm text-destructive">
                      {errors.dateOfBirth.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <input
                    id="nationality"
                    {...register('nationality')}
                    placeholder={t('nationality')}
                    className={cn(
                      inputBase,
                      errors.nationality && 'border-destructive'
                    )}
                  />
                  {errors.nationality && (
                    <p className="text-sm text-destructive">
                      {errors.nationality.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <p className={cn(labelBase, 'font-medium')}>
                  {tAddr('sectionTitle')}
                </p>

                <div className="flex flex-col gap-2.5">
                  <label className={labelBase}>
                    {tAddr('countryLabel')}{' '}
                    <span className="text-destructive">*</span>
                  </label>
                  <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center gap-[17px]">
                        {countries.map(option => {
                          const selected = field.value === option
                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => field.onChange(option)}
                              className="flex items-center gap-1.5"
                            >
                              <span
                                className={cn(
                                  'w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors',
                                  selected
                                    ? 'border-[#062E25]'
                                    : 'border-[#D9D9D9]'
                                )}
                              >
                                {selected && (
                                  <span className="w-2 h-2 rounded-full bg-[#B7FE1A]" />
                                )}
                              </span>
                              <span
                                className={cn(
                                  'text-sm font-medium tracking-tight',
                                  selected
                                    ? 'text-[#062E25]'
                                    : 'text-[#062E25]/70'
                                )}
                              >
                                {tAddr(`countryOptions.${option}`)}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  />
                </div>

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
                      <p className="text-sm text-destructive">
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
                      <p className="text-sm text-destructive">
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
                      <p className="text-sm text-destructive">
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
                      <p className="text-sm text-destructive">
                        {errors.streetNumber.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <input
                    id="addressAdditional"
                    {...register('addressAdditional')}
                    placeholder={tAddr('addressAdditional')}
                    className={inputBase}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <textarea
                  id="remarks"
                  {...register('remarks')}
                  placeholder={t('remarksPlaceholder')}
                  rows={2}
                  className="w-full rounded-[5px] border border-[#E5E5E5] bg-white/20 backdrop-blur-[65px] px-3 py-2 text-base text-[#062E25] placeholder:text-[#062E25]/30 focus:outline-none focus:border-[#062E25]/60 resize-none"
                />
              </div>

              <div>
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
                            'mt-0.5 flex h-3 w-3 shrink-0 items-center justify-center rounded-[3px] border transition-colors',
                            checked
                              ? 'bg-[#B7FE1A] border-[#B7FE1A]'
                              : 'border-[#062E25]/40'
                          )}
                        >
                          {checked && (
                            <svg
                              width="8"
                              height="6"
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
                        <span className="text-sm font-light text-[#062E25]/70 tracking-tight">
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
                  <p className="mt-2 text-sm text-destructive">
                    {errors.dataProcessing.message}
                  </p>
                )}
              </div>

              {submissionError && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {submissionError}
                </div>
              )}
            </form>
          </div>
        </div>

        <div
          className="fixed bottom-0 left-0 right-0 z-50 flex justify-end gap-4 px-6 py-4"
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
