'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useTranslations } from 'next-intl'
import { Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowButton } from '@/components/ui/arrow-button'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

type InvestorFormData = {
  entityType: string
  salutation: string
  firstName: string
  lastName: string
  address: string
  postalCode: string
  city: string
  email: string
  phonePrefix: string
  phone: string
  comment: string
  language: string
}

const inputClassName =
  'h-9 bg-white border-[#E5E5E5] rounded-[5px] backdrop-blur-[65px] text-xs font-medium tracking-[-0.02em] placeholder:text-foreground/70'

const InvestorsForm = () => {
  const t = useTranslations('investorsPage.form')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<InvestorFormData>({
    defaultValues: {
      entityType: '',
      salutation: '',
      firstName: '',
      lastName: '',
      address: '',
      postalCode: '',
      city: '',
      email: '',
      phonePrefix: '+41',
      phone: '',
      comment: '',
      language: 'german',
    },
  })

  const onSubmit = async (data: InvestorFormData) => {
    setStatus('loading')
    try {
      const response = await fetch(`${API_URL}/api/investor-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await response.json()
      if (result.success) {
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <span className="inline-flex items-center justify-center px-4 py-2.5 rounded-[20px] border border-foreground text-foreground text-base font-light tracking-[-0.02em]">
        {t('eyebrow')}
      </span>

      <h2 className="text-foreground text-3xl lg:text-[45px] font-medium text-center">
        {t('title')}
      </h2>

      {status === 'success' ? (
        <div className="flex flex-col items-center py-16">
          <Check className="h-8 w-8 text-green-600 mb-4" strokeWidth={2.5} />
          <h3 className="text-xl font-semibold text-foreground mb-2">{t('successTitle')}</h3>
          <p className="text-foreground/60">{t('successMessage')}</p>
        </div>
      ) : (
        <div className="relative w-full max-w-[536px]">
          <div className="rounded-2xl border border-[#062E25]/40 bg-white/10 backdrop-blur-[20px] p-7 lg:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <Controller
                name="entityType"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={inputClassName}>
                      <SelectValue placeholder={t('entityType')} />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="private">{t('typePrivate')}</SelectItem>
                      <SelectItem value="company">{t('typeCompany')}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />

              <div className="flex gap-2.5">
                <div className="w-[97px] shrink-0">
                  <Controller
                    name="salutation"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className={inputClassName}>
                          <SelectValue placeholder={t('salutation')} />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          <SelectItem value="mr">{t('salutationMr')}</SelectItem>
                          <SelectItem value="mrs">{t('salutationMrs')}</SelectItem>
                          <SelectItem value="diverse">{t('salutationDiverse')}</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    {...register('firstName', { required: true })}
                    placeholder={t('firstName')}
                    className={inputClassName}
                  />
                  {errors.firstName && <p className="text-red-500 text-xs mt-1">{t('required')}</p>}
                </div>
                <div className="flex-1">
                  <Input
                    {...register('lastName', { required: true })}
                    placeholder={t('lastName')}
                    className={inputClassName}
                  />
                  {errors.lastName && <p className="text-red-500 text-xs mt-1">{t('required')}</p>}
                </div>
              </div>

              <Input
                {...register('address')}
                placeholder={t('address')}
                className={inputClassName}
              />

              <div className="flex gap-2.5">
                <div className="w-[109px] shrink-0">
                  <Input
                    {...register('postalCode')}
                    placeholder={t('postalCode')}
                    className={inputClassName}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    {...register('city')}
                    placeholder={t('city')}
                    className={inputClassName}
                  />
                </div>
              </div>

              <Input
                type="email"
                {...register('email', { required: true })}
                placeholder={t('email')}
                className={inputClassName}
              />
              {errors.email && <p className="text-red-500 text-xs -mt-3">{t('required')}</p>}

              <div className="flex gap-2.5">
                <div className="w-[97px] shrink-0">
                  <Controller
                    name="phonePrefix"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className={inputClassName}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          <SelectItem value="+41">+41</SelectItem>
                          <SelectItem value="+49">+49</SelectItem>
                          <SelectItem value="+43">+43</SelectItem>
                          <SelectItem value="+33">+33</SelectItem>
                          <SelectItem value="+39">+39</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="tel"
                    {...register('phone')}
                    placeholder={t('phone')}
                    className={inputClassName}
                  />
                </div>
              </div>

              <Input
                {...register('comment')}
                placeholder={t('comment')}
                className={inputClassName}
              />

              <div className="flex items-center justify-between">
                <span className="text-foreground/70 text-xs font-normal tracking-[-0.02em]">
                  {t('languageLabel')}
                </span>
                <div className="w-[97px]">
                  <Controller
                    name="language"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className={inputClassName}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent position="popper">
                          <SelectItem value="german">{t('languageGerman')}</SelectItem>
                          <SelectItem value="english">{t('languageEnglish')}</SelectItem>
                          <SelectItem value="french">{t('languageFrench')}</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>

              {status === 'error' && (
                <p className="text-red-600 text-sm font-medium">{t('errorMessage')}</p>
              )}

              <div className="flex justify-center">
                <ArrowButton
                  type="submit"
                  variant="tertiary"
                  disabled={status === 'loading'}
                >
                  {t('submit')}
                </ArrowButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default InvestorsForm
