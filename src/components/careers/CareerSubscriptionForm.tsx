'use client'

import { ArrowButton } from '@/components/ui/arrow-button'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

type CareerSubscriptionFormProps = {
  className?: string
}

export const CareerSubscriptionForm = ({
  className,
}: CareerSubscriptionFormProps) => {
  const t = useTranslations('careersPage.stayInformed')
  const locale = useLocale()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    consentMarketing: false,
  })

  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const response = await fetch(`${API_URL}/api/career-subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, locale }),
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
    <form onSubmit={handleSubmit} className={className}>
      <div className="flex flex-col gap-[30px] w-full">
        <div className="flex flex-col gap-[20px]">
          <div className="flex flex-row gap-[20px]">
            <div className="flex flex-col gap-[5px] flex-1">
              <label htmlFor="career-firstName" className="text-[#062E25]/60 text-base font-medium tracking-[-0.02em]">
                {t('form.firstName')}
              </label>
              <input
                id="career-firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={e =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                placeholder={t('form.firstNamePlaceholder')}
                className="bg-white border border-[#E5E5E5] rounded-[5px] backdrop-blur-[65px] px-[11px] py-2 text-base text-[#062E25] placeholder:text-[#062E25]/20 w-full outline-none focus:border-[#062E25]/30 focus:ring-1 focus:ring-[#062E25]/30"
              />
            </div>
            <div className="flex flex-col gap-[5px] flex-1">
              <label htmlFor="career-lastName" className="text-[#062E25]/60 text-base font-medium tracking-[-0.02em]">
                {t('form.lastName')}
              </label>
              <input
                id="career-lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={e =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                placeholder={t('form.lastNamePlaceholder')}
                className="bg-white border border-[#E5E5E5] rounded-[5px] backdrop-blur-[65px] px-[11px] py-2 text-base text-[#062E25] placeholder:text-[#062E25]/20 w-full outline-none focus:border-[#062E25]/30 focus:ring-1 focus:ring-[#062E25]/30"
              />
            </div>
          </div>

          <div className="flex flex-col gap-[5px]">
            <label htmlFor="career-email" className="text-[#062E25]/60 text-base font-medium tracking-[-0.02em]">
              {t('form.email')}
            </label>
            <input
              id="career-email"
              type="email"
              required
              value={formData.email}
              onChange={e =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder={t('form.emailPlaceholder')}
              className="bg-white border border-[#E5E5E5] rounded-[5px] backdrop-blur-[65px] px-[11px] py-2 text-base text-[#062E25] placeholder:text-[#062E25]/20 w-full outline-none focus:border-[#062E25]/30 focus:ring-1 focus:ring-[#062E25]/30"
            />
          </div>

          <p className="text-[#062E25]/60 text-base font-medium tracking-[-0.02em]">
            {t('form.privacy')}
          </p>

          <label
            htmlFor="career-consent"
            className="flex flex-row items-start gap-[10px] cursor-pointer"
          >
            <input
              id="career-consent"
              type="checkbox"
              required
              checked={formData.consentMarketing}
              onChange={e =>
                setFormData({
                  ...formData,
                  consentMarketing: e.target.checked,
                })
              }
              className="peer sr-only"
            />
            <span
              aria-hidden="true"
              className={`w-[15px] h-[15px] border border-[#4A9A99] rounded-[3.75px] shrink-0 mt-0.5 flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-[#4A9A99] peer-focus-visible:ring-offset-2 ${formData.consentMarketing ? 'bg-[#4A9A99]' : ''}`}
            >
              {formData.consentMarketing && (
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
            <span className="text-[#062E25]/60 text-base font-medium tracking-[-0.02em]">
              {t('form.consent')}
            </span>
          </label>

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
          disabled={status === 'loading'}
          className="w-fit"
        >
          {t('form.submit')}
        </ArrowButton>
      </div>
    </form>
  )
}
