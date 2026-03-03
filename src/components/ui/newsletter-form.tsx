'use client'

import { ArrowButton } from '@/components/ui/arrow-button'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

type NewsletterFormProps = {
  className?: string
}

export const NewsletterForm = ({ className }: NewsletterFormProps) => {
  const t = useTranslations('bidirectionalChargingStation.newsletter')

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    consentMarketing: false,
  })

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const response = await fetch(`${API_URL}/api/newsletters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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
    <form
      onSubmit={handleSubmit}
      className={className}
    >
      <div className="flex flex-col gap-[30px] w-full">
        <div className="flex flex-col gap-[20px]">
          <div className="flex flex-row gap-[20px]">
            <div className="flex flex-col gap-[5px] flex-1">
              <label className="text-[#062E25]/60 text-xs font-medium tracking-[-0.02em]">
                {t('form.firstName')}
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                placeholder={t('form.firstNamePlaceholder')}
                className="bg-[#EAEDDF] border border-[#E5E5E5] rounded-[5px] backdrop-blur-[65px] px-[11px] py-2 text-xs text-[#062E25] placeholder:text-[#062E25]/20 w-full outline-none focus:border-[#062E25]/30 focus:ring-1 focus:ring-[#062E25]/30"
              />
            </div>
            <div className="flex flex-col gap-[5px] flex-1">
              <label className="text-[#062E25]/60 text-xs font-medium tracking-[-0.02em]">
                {t('form.lastName')}
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                placeholder={t('form.lastNamePlaceholder')}
                className="bg-[#EAEDDF] border border-[#E5E5E5] rounded-[5px] backdrop-blur-[65px] px-[11px] py-2 text-xs text-[#062E25] placeholder:text-[#062E25]/20 w-full outline-none focus:border-[#062E25]/30 focus:ring-1 focus:ring-[#062E25]/30"
              />
            </div>
          </div>

          <div className="flex flex-col gap-[5px]">
            <label className="text-[#062E25]/60 text-xs font-medium tracking-[-0.02em]">
              {t('form.email')}
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder={t('form.emailPlaceholder')}
              className="bg-[#EAEDDF] border border-[#E5E5E5] rounded-[5px] backdrop-blur-[65px] px-[11px] py-2 text-xs text-[#062E25] placeholder:text-[#062E25]/20 w-full outline-none focus:border-[#062E25]/30 focus:ring-1 focus:ring-[#062E25]/30"
            />
          </div>

          <p className="text-[#062E25]/60 text-xs font-medium tracking-[-0.02em]">
            {t('form.privacy')}
          </p>

          <div
            className="flex flex-row items-start gap-[10px] cursor-pointer"
            onClick={() => setFormData({ ...formData, consentMarketing: !formData.consentMarketing })}
          >
            <div
              className={`w-[15px] h-[15px] border border-[#4A9A99] rounded-[3.75px] shrink-0 mt-0.5 flex items-center justify-center ${formData.consentMarketing ? 'bg-[#4A9A99]' : ''}`}
            >
              {formData.consentMarketing && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span className="text-[#062E25]/60 text-xs font-medium tracking-[-0.02em]">
              {t('form.consent')}
            </span>
          </div>

          <p className="text-[#062E25]/60 text-xs font-normal tracking-[-0.02em]">
            {t('form.disclaimer')}
          </p>
        </div>

        {status === 'error' && (
          <p className="text-red-600 text-xs font-medium">
            Something went wrong. Please try again.
          </p>
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
