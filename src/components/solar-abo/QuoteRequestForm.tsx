'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { ArrowButton } from '@/components/ui/arrow-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { getAttribution } from '@/lib/analytics/funnel-events'
import { trackLead } from '@/lib/analytics/track-lead'
import { Link } from '@/i18n/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export type QuoteRequestSource = 'SOLAR_FREE' | 'SOLAR_ABO' | 'SOLAR_DIRECT'

export interface QuoteRequestFormProps {
  source: QuoteRequestSource
  locale?: string
  id?: string
  eyebrow?: string
  title?: string
  subtitle?: string
}

type FormValues = {
  firstName: string
  lastName: string
  email: string
  postalCode: string
  phone: string
  ownsHome: boolean | null
  consent: boolean
}

const fieldClass =
  'h-11 rounded-[8px] border-[#062E25]/20 bg-white text-base text-[#062E25] placeholder:text-[#062E25]/40 focus-visible:border-[#062E25] focus-visible:ring-0'

const labelClass = 'text-[#062E25]/80 text-sm font-medium tracking-[-0.02em]'

const RadioPill = ({
  selected,
  label,
  onClick,
}: {
  selected: boolean
  label: string
  onClick: () => void
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex items-center gap-2 cursor-pointer"
  >
    <span
      className={cn(
        'size-5 rounded-full border flex items-center justify-center transition-colors',
        selected
          ? 'border-[#062E25] bg-[#062E25]'
          : 'border-[#062E25]/40 bg-white'
      )}
    >
      {selected && <span className="size-2 rounded-full bg-solar" />}
    </span>
    <span className="text-[#062E25] text-base font-medium tracking-[-0.02em]">
      {label}
    </span>
  </button>
)

const QuoteRequestForm = ({
  source,
  locale,
  id,
  eyebrow,
  title,
  subtitle,
}: QuoteRequestFormProps) => {
  const t = useTranslations('quoteRequestForm')

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      postalCode: '',
      phone: '',
      ownsHome: null,
      consent: false,
    },
  })

  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')

  const onSubmit = async (data: FormValues) => {
    setStatus('loading')
    try {
      const response = await fetch(`${API_URL}/api/quote-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          postalCode: data.postalCode,
          phone: data.phone,
          ownsHome: data.ownsHome === true,
          consent: data.consent,
          locale,
          attribution: getAttribution(),
        }),
      })

      const result = await response.json()
      if (response.ok && result.success) {
        trackLead({ form: 'quote_request', source, locale })
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <section
      id={id}
      className="w-full scroll-mt-24 bg-[#EAEDDF] text-[#062E25]"
    >
      <div className="mx-auto max-w-[1214px] px-4 py-16 sm:px-6 md:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-16">
          <div className="flex flex-col gap-5">
            <div className="self-start flex items-center justify-center px-4 py-[10px] rounded-[20px] border border-[#062E25]">
              <span className="text-base font-light tracking-[-0.02em]">
                {eyebrow ?? t('eyebrow')}
              </span>
            </div>
            <h2 className="text-3xl font-medium sm:text-4xl md:text-[45px]">
              {title ?? t('title')}
            </h2>
            <p className="max-w-[460px] text-lg tracking-[-0.02em] text-[#062E25]/80 md:text-[22px]">
              {subtitle ?? t('subtitle')}
            </p>
          </div>

          <div className="w-full">
            <div className="rounded-[24px] border border-[#062E25]/12 bg-white p-6 sm:p-10">
              {status === 'success' ? (
                <div className="flex flex-col items-center text-center py-12">
                  <h3 className="text-2xl font-medium mb-3">
                    {t('successTitle')}
                  </h3>
                  <p className="text-[#062E25]/75">{t('successMessage')}</p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex flex-col gap-5"
                >
                  <div className="flex flex-col gap-5">
                    <h3 className="text-2xl font-medium tracking-[-0.02em] md:text-3xl">
                      {t('formTitle')}
                    </h3>
                    <p className="text-[#062E25]/65 text-sm tracking-[-0.02em]">
                      {t('requiredHint')}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <Label className={labelClass}>{t('firstName')}</Label>
                      <Input
                        {...register('firstName', {
                          required: t('errors.firstName'),
                        })}
                        placeholder={t('placeholders.firstName')}
                        className={fieldClass}
                      />
                      {errors.firstName && (
                        <p className="text-red-700 text-sm">
                          {errors.firstName.message}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className={labelClass}>{t('lastName')}</Label>
                      <Input
                        {...register('lastName', {
                          required: t('errors.lastName'),
                        })}
                        placeholder={t('placeholders.lastName')}
                        className={fieldClass}
                      />
                      {errors.lastName && (
                        <p className="text-red-700 text-sm">
                          {errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Label className={labelClass}>{t('email')}</Label>
                    <Input
                      type="email"
                      {...register('email', {
                        required: t('errors.email'),
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: t('errors.emailInvalid'),
                        },
                      })}
                      placeholder={t('placeholders.email')}
                      className={fieldClass}
                    />
                    {errors.email && (
                      <p className="text-red-700 text-sm">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <Label className={labelClass}>{t('postalCode')}</Label>
                      <Input
                        {...register('postalCode', {
                          required: t('errors.postalCode'),
                        })}
                        placeholder={t('placeholders.postalCode')}
                        className={fieldClass}
                      />
                      {errors.postalCode && (
                        <p className="text-red-700 text-sm">
                          {errors.postalCode.message}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className={labelClass}>{t('phone')}</Label>
                      <Input
                        type="tel"
                        {...register('phone', {
                          required: t('errors.phone'),
                        })}
                        placeholder={t('placeholders.phone')}
                        className={fieldClass}
                      />
                      {errors.phone && (
                        <p className="text-red-700 text-sm">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <Controller
                    name="ownsHome"
                    control={control}
                    rules={{
                      validate: v => v !== null || t('errors.ownsHome'),
                    }}
                    render={({ field }) => (
                      <div className="flex flex-col gap-5 mt-3">
                        <p className="text-base font-medium tracking-[-0.02em] sm:text-xl">
                          {t('ownsHomeQuestion')}
                        </p>
                        <div className="flex items-center gap-[17px]">
                          <RadioPill
                            selected={field.value === true}
                            label={t('yes')}
                            onClick={() => field.onChange(true)}
                          />
                          <RadioPill
                            selected={field.value === false}
                            label={t('no')}
                            onClick={() => field.onChange(false)}
                          />
                        </div>
                        {errors.ownsHome && (
                          <p className="text-red-700 text-sm">
                            {errors.ownsHome.message}
                          </p>
                        )}
                      </div>
                    )}
                  />

                  <Controller
                    name="consent"
                    control={control}
                    rules={{ validate: v => v === true || t('errors.consent') }}
                    render={({ field }) => (
                      <div className="flex flex-col gap-1.5 mt-3">
                        <div className="flex items-start gap-3">
                          <button
                            type="button"
                            role="checkbox"
                            aria-checked={field.value}
                            onClick={() => field.onChange(!field.value)}
                            className={cn(
                              'size-5 rounded-[5px] border shrink-0 flex items-center justify-center transition-colors cursor-pointer',
                              field.value
                                ? 'border-[#062E25] bg-[#062E25]'
                                : 'border-[#062E25]/40 bg-white'
                            )}
                          >
                            {field.value && (
                              <svg
                                width="12"
                                height="9"
                                viewBox="0 0 10 8"
                                fill="none"
                                className="text-solar"
                              >
                                <path
                                  d="M1 4L3.5 6.5L9 1"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </button>
                          <span className="text-[#062E25]/75 text-sm tracking-[-0.02em]">
                            {t.rich('consent', {
                              link: chunks => (
                                <Link
                                  href="/privacy-policy"
                                  className="underline hover:text-[#062E25]"
                                >
                                  {chunks}
                                </Link>
                              ),
                            })}
                          </span>
                        </div>
                        {errors.consent && (
                          <p className="text-red-700 text-sm">
                            {errors.consent.message}
                          </p>
                        )}
                      </div>
                    )}
                  />

                  {status === 'error' && (
                    <p className="text-red-700 text-sm font-medium">
                      {t('errorMessage')}
                    </p>
                  )}

                  <div className="flex mt-2">
                    <ArrowButton
                      type="submit"
                      variant="tertiary"
                      disabled={status === 'loading'}
                    >
                      {t('submit')}
                    </ArrowButton>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default QuoteRequestForm
