'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

import { ArrowButton } from '@/components/ui/arrow-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export type QuoteRequestSource = 'SOLAR_FREE' | 'SOLAR_DIRECT'

export interface QuoteRequestFormProps {
  source: QuoteRequestSource
  locale?: string
}

type FormValues = {
  firstName: string
  lastName: string
  email: string
  postalCode: string
  phone: string
  ownsHome: boolean | null
}

const fieldClass =
  'h-9 bg-white/10 border-white/10 text-white rounded-[5px] backdrop-blur-[65px] placeholder:text-white/40 focus-visible:border-white/40 focus-visible:ring-0'

const labelClass = 'text-white/70 text-xs font-medium tracking-[-0.02em]'

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
    className="flex items-center gap-1.5 cursor-pointer"
  >
    <span
      className={cn(
        'w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors',
        selected ? 'border-solar bg-solar' : 'border-[#D9D9D9] bg-transparent'
      )}
    >
      {selected && <span className="w-2 h-2 rounded-full bg-[#062E25]" />}
    </span>
    <span className="text-[#EDEDED]/70 text-xs font-medium tracking-[-0.02em]">
      {label}
    </span>
  </button>
)

const QuoteRequestForm = ({ source, locale }: QuoteRequestFormProps) => {
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
          consent: true,
          locale,
        }),
      })

      const result = await response.json()
      if (response.ok && result.success) {
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
      className="relative w-full overflow-hidden"
      style={{
        background:
          'linear-gradient(7deg, rgba(7, 51, 42, 1) 0%, rgba(9, 63, 53, 1) 21%, rgba(21, 139, 126, 1) 100%)',
      }}
    >
      <div
        className="absolute right-[-120px] top-[-180px] w-[413px] h-[413px] rounded-full pointer-events-none"
        style={{
          background: 'rgba(183, 254, 26, 0.5)',
          filter: 'blur(170px)',
        }}
      />

      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-20 sm:py-24 lg:py-[100px]">
        <div className="flex flex-col lg:flex-row lg:items-center gap-10 lg:gap-[134px]">
          <div className="flex flex-col gap-8 lg:gap-[50px] w-full lg:max-w-[453px]">
            <div className="flex flex-col gap-[30px]">
              <div className="flex flex-col gap-5">
                <div
                  className="self-start flex items-center justify-center px-4 py-[10px] rounded-[20px] border border-white/30"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(65px)',
                  }}
                >
                  <span className="text-[#E4EDE7] text-base font-light tracking-[-0.02em]">
                    {t('eyebrow')}
                  </span>
                </div>
                <h2 className="text-[#E3EDE7] text-4xl sm:text-5xl lg:text-[70px] font-medium tracking-tight">
                  {t('title')}
                </h2>
              </div>
              <p className="text-white/80 text-lg sm:text-xl lg:text-[22px] font-light tracking-[-0.02em] max-w-[330px]">
                {t('subtitle')}
              </p>
            </div>
          </div>

          <div className="w-full lg:max-w-[536px]">
            <div
              className="relative rounded-[16px] border border-white/20 p-8 sm:p-10"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
              }}
            >
              {status === 'success' ? (
                <div className="flex flex-col items-center text-center py-12">
                  <h3 className="text-white text-2xl font-medium mb-3">
                    {t('successTitle')}
                  </h3>
                  <p className="text-white/70">{t('successMessage')}</p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex flex-col gap-5"
                >
                  <div className="flex flex-col gap-5">
                    <h3 className="text-white text-[32px] font-light tracking-[-0.02em]">
                      {t('formTitle')}
                    </h3>
                    <p className="text-[#FDFFF5]/70 text-xs font-light tracking-[-0.02em]">
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
                        <p className="text-red-300 text-xs">
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
                        <p className="text-red-300 text-xs">
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
                      <p className="text-red-300 text-xs">
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
                        <p className="text-red-300 text-xs">
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
                        <p className="text-red-300 text-xs">
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
                        <p className="text-white/80 text-base sm:text-[22px] font-light tracking-[-0.02em]">
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
                          <p className="text-red-300 text-xs">
                            {errors.ownsHome.message}
                          </p>
                        )}
                      </div>
                    )}
                  />

                  <p className="text-white/70 text-xs font-light tracking-[-0.02em] mt-3">
                    {t('consent')}
                  </p>

                  {status === 'error' && (
                    <p className="text-red-300 text-sm font-medium">
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

      <div
        className="absolute bottom-0 left-0 right-0 h-px opacity-20"
        style={{
          background:
            'linear-gradient(54deg, rgba(6, 46, 37, 1) 74%, rgba(3, 107, 83, 1) 100%)',
        }}
      />
    </section>
  )
}

export default QuoteRequestForm
