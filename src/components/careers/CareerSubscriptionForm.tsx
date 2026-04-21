'use client'

import { ArrowButton } from '@/components/ui/arrow-button'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

type CareerSubscriptionFormProps = {
  className?: string
}

type FormMessages = {
  firstNameRequired: string
  lastNameRequired: string
  emailInvalid: string
  roleRequired: string
  commentTooLong: string
  consentRequired: string
}

const buildSchema = (m: FormMessages) =>
  z.object({
    firstName: z.string().trim().min(1, m.firstNameRequired),
    lastName: z.string().trim().min(1, m.lastNameRequired),
    email: z.string().trim().email(m.emailInvalid),
    role: z.string().trim().min(1, m.roleRequired).max(200),
    comment: z.string().max(2000, m.commentTooLong).optional().or(z.literal('')),
    consentMarketing: z.boolean().refine(v => v === true, {
      message: m.consentRequired,
    }),
  })

type CareerFormValues = z.infer<ReturnType<typeof buildSchema>>

const fieldClassName =
  'bg-white border border-[#E5E5E5] rounded-[5px] backdrop-blur-[65px] px-[11px] py-2 text-base text-[#062E25] placeholder:text-[#062E25]/20 w-full outline-none focus:border-[#062E25]/30 focus:ring-1 focus:ring-[#062E25]/30'

const labelClassName =
  'text-[#062E25]/60 text-base font-medium tracking-[-0.02em]'

export const CareerSubscriptionForm = ({
  className,
}: CareerSubscriptionFormProps) => {
  const t = useTranslations('careersPage.stayInformed')
  const locale = useLocale()

  const errorMessages: FormMessages = {
    firstNameRequired: t('form.errors.firstNameRequired'),
    lastNameRequired: t('form.errors.lastNameRequired'),
    emailInvalid: t('form.errors.emailInvalid'),
    roleRequired: t('form.errors.roleRequired'),
    commentTooLong: t('form.errors.commentTooLong'),
    consentRequired: t('form.errors.consentRequired'),
  }

  const schema = buildSchema(errorMessages)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CareerFormValues>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      role: '',
      comment: '',
      consentMarketing: false,
    },
  })

  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const consentChecked = watch('consentMarketing')

  const onSubmit = async (values: CareerFormValues) => {
    setStatus('idle')
    try {
      const response = await fetch(`${API_URL}/api/career-subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          role: values.role,
          comment: values.comment || undefined,
          consentMarketing: values.consentMarketing,
          locale,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className={className}>
        <p className="text-[#062E25]/80 text-lg md:text-[22px] font-light tracking-[-0.02em] text-center">
          {t('success')}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={className} noValidate>
      <div className="flex flex-col gap-[30px] w-full">
        <div className="flex flex-col gap-[20px]">
          <div className="flex flex-row gap-[20px]">
            <div className="flex flex-col gap-[5px] flex-1">
              <label htmlFor="career-firstName" className={labelClassName}>
                {t('form.firstName')}
              </label>
              <input
                id="career-firstName"
                type="text"
                placeholder={t('form.firstNamePlaceholder')}
                className={fieldClassName}
                aria-invalid={errors.firstName ? 'true' : 'false'}
                {...register('firstName')}
              />
              {errors.firstName && (
                <p className="text-red-600 text-base">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-[5px] flex-1">
              <label htmlFor="career-lastName" className={labelClassName}>
                {t('form.lastName')}
              </label>
              <input
                id="career-lastName"
                type="text"
                placeholder={t('form.lastNamePlaceholder')}
                className={fieldClassName}
                aria-invalid={errors.lastName ? 'true' : 'false'}
                {...register('lastName')}
              />
              {errors.lastName && (
                <p className="text-red-600 text-base">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-[5px]">
            <label htmlFor="career-email" className={labelClassName}>
              {t('form.email')}
            </label>
            <input
              id="career-email"
              type="email"
              placeholder={t('form.emailPlaceholder')}
              className={fieldClassName}
              aria-invalid={errors.email ? 'true' : 'false'}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-red-600 text-base">{errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-[5px]">
            <label htmlFor="career-role" className={labelClassName}>
              {t('form.role')}
            </label>
            <input
              id="career-role"
              type="text"
              placeholder={t('form.rolePlaceholder')}
              className={fieldClassName}
              aria-invalid={errors.role ? 'true' : 'false'}
              {...register('role')}
            />
            {errors.role && (
              <p className="text-red-600 text-base">{errors.role.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-[5px]">
            <label htmlFor="career-comment" className={labelClassName}>
              {t('form.comment')}
            </label>
            <textarea
              id="career-comment"
              rows={4}
              placeholder={t('form.commentPlaceholder')}
              className={`${fieldClassName} resize-none min-h-[100px]`}
              aria-invalid={errors.comment ? 'true' : 'false'}
              {...register('comment')}
            />
            {errors.comment && (
              <p className="text-red-600 text-base">{errors.comment.message}</p>
            )}
          </div>

          <p className={labelClassName}>{t('form.privacy')}</p>

          <label
            htmlFor="career-consent"
            className="flex flex-row items-start gap-[10px] cursor-pointer"
          >
            <input
              id="career-consent"
              type="checkbox"
              className="peer sr-only"
              {...register('consentMarketing')}
            />
            <span
              aria-hidden="true"
              className={`w-[15px] h-[15px] border border-[#4A9A99] rounded-[3.75px] shrink-0 mt-0.5 flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-[#4A9A99] peer-focus-visible:ring-offset-2 ${consentChecked ? 'bg-[#4A9A99]' : ''}`}
            >
              {consentChecked && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path
                    d="M1 4L3.5 6.5L9 1"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            <span className={labelClassName}>{t('form.consent')}</span>
          </label>
          {errors.consentMarketing && (
            <p className="text-red-600 text-base">
              {errors.consentMarketing.message}
            </p>
          )}

          <p className="text-[#062E25]/60 text-base font-normal tracking-[-0.02em]">
            {t('form.disclaimer')}
          </p>
        </div>

        {status === 'error' && (
          <p className="text-red-600 text-base font-medium">{t('error')}</p>
        )}

        <ArrowButton
          type="submit"
          variant="tertiary"
          disabled={isSubmitting}
          className="w-fit"
        >
          {t('form.submit')}
        </ArrowButton>
      </div>
    </form>
  )
}
