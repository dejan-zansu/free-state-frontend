'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowButton } from '@/components/ui/arrow-button'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

const interestOptions = ['optionPhotovoltaics', 'optionHeatPump', 'optionChargingStation'] as const

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

const RepoweringQuoteFormSection = () => {
  const t = useTranslations('repowering.quoteForm')

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    interests: [] as string[],
    callbackRequested: false,
  })

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const toggleInterest = (item: string) =>
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(item)
        ? prev.interests.filter(i => i !== item)
        : [...prev.interests, item],
    }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const response = await fetch(`${API_URL}/api/repowering-inquiries`, {
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
      <section
        className="relative w-full py-20"
        style={{
          background: 'linear-gradient(180deg, rgba(243, 245, 233, 1) 50%, rgba(220, 233, 230, 1) 100%)',
        }}
      >
        <div className="max-w-[621px] mx-auto px-4 sm:px-6 text-center">
          <p className="text-[#062E25] text-base md:text-[22px] font-light tracking-[-0.02em]">
            Thank you for your inquiry. We will get back to you shortly.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section
      className="relative w-full"
      style={{
        background: 'linear-gradient(180deg, rgba(243, 245, 233, 1) 50%, rgba(220, 233, 230, 1) 100%)',
      }}
    >
      <div className="max-w-[1038px] mx-auto px-4 sm:px-6 py-12 md:py-[50px]">
        <div className="flex flex-col items-center gap-[50px]">
          <h2 className="text-[#062E25] text-3xl md:text-[45px] font-medium text-center">
            {t('title')}
          </h2>

          <form onSubmit={handleSubmit} className="w-full max-w-[621px] flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-[5px]">
                <Label className="text-[#062E25]/60 text-xs font-medium tracking-[-0.02em]">
                  {t('firstName')}
                </Label>
                <Input
                  value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder={t('firstNamePlaceholder')}
                  className="h-9 bg-[#EAEDDF] border-[#E5E5E5] rounded-[5px] backdrop-blur-[65px] text-[#062E25] placeholder:text-[#062E25]/20 text-xs font-medium tracking-[-0.02em]"
                  required
                />
              </div>
              <div className="flex flex-col gap-[5px]">
                <Label className="text-[#062E25]/60 text-xs font-medium tracking-[-0.02em]">
                  {t('lastName')}
                </Label>
                <Input
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder={t('lastNamePlaceholder')}
                  className="h-9 bg-[#EAEDDF] border-[#E5E5E5] rounded-[5px] backdrop-blur-[65px] text-[#062E25] placeholder:text-[#062E25]/20 text-xs font-medium tracking-[-0.02em]"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-[10px]">
              <Label className="text-[#062E25]/60 text-xs font-medium tracking-[-0.02em]">
                {t('interestedIn')}
              </Label>
              <div className="flex flex-col gap-[7px]">
                {interestOptions.map(key => (
                  <label key={key} className="flex items-center gap-[10px] cursor-pointer">
                    <Checkbox
                      checked={formData.interests.includes(key)}
                      onCheckedChange={() => toggleInterest(key)}
                      className="size-[15px] rounded-full border-[#4A9A99] opacity-60"
                    />
                    <span className="text-[#062E25]/60 text-xs font-medium tracking-[-0.02em]">
                      {t(key)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-[10px]">
              <Label className="text-[#062E25]/60 text-xs font-medium tracking-[-0.02em]">
                {t('callbackLabel')}
              </Label>
              <label className="flex items-center gap-[10px] cursor-pointer">
                <Checkbox
                  checked={formData.callbackRequested}
                  onCheckedChange={checked =>
                    setFormData({ ...formData, callbackRequested: checked as boolean })
                  }
                  className="size-[15px] rounded-[3.75px] border-[#4A9A99] opacity-60"
                />
                <span className="text-[#062E25]/60 text-xs font-medium tracking-[-0.02em]">
                  {t('callbackYes')}
                </span>
              </label>
            </div>

            <div className="mt-4">
              <ArrowButton
                type="submit"
                variant="tertiary"
                disabled={status === 'loading'}
              >
                {t('submit')}
              </ArrowButton>
            </div>

            {status === 'error' && (
              <p className="text-red-600 text-xs">Something went wrong. Please try again.</p>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}

export default RepoweringQuoteFormSection
