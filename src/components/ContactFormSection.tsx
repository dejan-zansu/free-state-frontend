'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Link } from '@/i18n/navigation'
import { Badge } from './ui/badge'
import { Check } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { ArrowButton } from './ui/arrow-button'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

type ContactFormData = {
  entityType: string
  salutation: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  postalCode: string
  city: string
  message: string
  privacy: boolean
}

const inputClassName = 'h-9 bg-[#EAEDDF] border-[#E5E5E5] rounded-[5px] backdrop-blur-[65px]'

const ContactFormSection = () => {
  const t = useTranslations('contactForm')

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ContactFormData>({
    defaultValues: {
      entityType: '',
      salutation: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      postalCode: '',
      city: '',
      message: '',
      privacy: false,
    },
  })

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const onSubmit = async (data: ContactFormData) => {
    setStatus('loading')

    try {
      const response = await fetch(`${API_URL}/api/contact`, {
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
    <section className="relative py-16 md:py-24 px-4 sm:px-6">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/contact-form-bg.png')" }}
      />
      <div className="relative max-w-[877px] mx-auto">
        <div className="rounded-2xl border border-[#f6f6f6]/60 bg-[#a4beab]/33 backdrop-blur-[10px] p-6 sm:p-10">
          <div className="flex flex-col items-center gap-[50px]">
            <div className="flex flex-col items-center gap-5 text-center">
              <Badge variant="outline" className="border-foreground text-foreground font-light text-base backdrop-blur-[65px]">
                {t('eyebrow')}
              </Badge>
              <h2 className="text-foreground text-3xl md:text-[45px] font-medium">
                {t('title')}
              </h2>
            </div>

            {status === 'success' ? (
              <div className="flex flex-col items-center py-16">
                <Check className="h-8 w-8 text-green-600 mb-4" strokeWidth={2.5} />
                <h3 className="text-xl font-semibold text-foreground mb-2">{t('successTitle')}</h3>
                <p className="text-foreground/60">{t('successMessage')}</p>
              </div>
            ) : (
              <div className="w-full flex flex-col items-end gap-5">
                <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Controller
                      name="entityType"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className={inputClassName}>
                            <SelectValue placeholder={t('entityType.placeholder')} />
                          </SelectTrigger>
                          <SelectContent position="popper">
                            <SelectItem value="company">{t('entityType.company')}</SelectItem>
                            <SelectItem value="private">{t('entityType.private')}</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    <Controller
                      name="salutation"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className={inputClassName}>
                            <SelectValue placeholder={t('salutation.placeholder')} />
                          </SelectTrigger>
                          <SelectContent position="popper">
                            <SelectItem value="mr">{t('salutation.mr')}</SelectItem>
                            <SelectItem value="mrs">{t('salutation.mrs')}</SelectItem>
                            <SelectItem value="diverse">{t('salutation.diverse')}</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <Label className="text-foreground/60 text-sm font-medium tracking-tight">
                        {t('firstName.label')}
                      </Label>
                      <Input
                        {...register('firstName', { required: t('errors.firstName') })}
                        className={inputClassName}
                      />
                      {errors.firstName && (
                        <p className="text-red-500 text-sm">{errors.firstName.message}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-foreground/60 text-sm font-medium tracking-tight">
                        {t('lastName.label')}
                      </Label>
                      <Input
                        {...register('lastName', { required: t('errors.lastName') })}
                        className={inputClassName}
                      />
                      {errors.lastName && (
                        <p className="text-red-500 text-sm">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <Label className="text-foreground/60 text-sm font-medium tracking-tight">
                        {t('email.label')}
                      </Label>
                      <Input
                        type="email"
                        {...register('email', { required: t('errors.email') })}
                        className={inputClassName}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm">{errors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-foreground/60 text-sm font-medium tracking-tight">
                        {t('phone.label')}
                      </Label>
                      <Input
                        type="tel"
                        {...register('phone', { required: t('errors.phone') })}
                        className={inputClassName}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-sm">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-foreground/60 text-sm font-medium tracking-tight">
                      {t('address.label')}
                    </Label>
                    <Input
                      {...register('address', { required: t('errors.address') })}
                      className={inputClassName}
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm">{errors.address.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <Label className="text-foreground/60 text-sm font-medium tracking-tight">
                        {t('postalCode.label')}
                      </Label>
                      <Input
                        {...register('postalCode', { required: t('errors.postalCode') })}
                        className={inputClassName}
                      />
                      {errors.postalCode && (
                        <p className="text-red-500 text-sm">{errors.postalCode.message}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label className="text-foreground/60 text-sm font-medium tracking-tight">
                        {t('city.label')}
                      </Label>
                      <Input
                        {...register('city', { required: t('errors.city') })}
                        className={inputClassName}
                      />
                      {errors.city && (
                        <p className="text-red-500 text-sm">{errors.city.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-foreground/60 text-sm font-medium tracking-tight">
                      {t('message.label')}
                    </Label>
                    <Textarea
                      {...register('message')}
                      className="min-h-[164px] bg-[#EAEDDF] border-[#E5E5E5] rounded-[5px] backdrop-blur-[65px] resize-none"
                    />
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Controller
                      name="privacy"
                      control={control}
                      rules={{ required: t('errors.privacy') }}
                      render={({ field }) => (
                        <Checkbox
                          id="privacy"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="size-4 rounded-[3.75px] border-foreground/60 mt-0.5"
                        />
                      )}
                    />
                    <Label
                      htmlFor="privacy"
                      className="text-sm text-foreground/40 font-medium tracking-tight cursor-pointer"
                    >
                      <Link
                        href="/privacy-policy"
                        onClick={e => e.stopPropagation()}
                        className="hover:underline"
                      >
                        {t('privacy')}
                      </Link>
                    </Label>
                  </div>
                  {errors.privacy && (
                    <p className="text-red-500 text-sm">{errors.privacy.message}</p>
                  )}

                  {status === 'error' && (
                    <p className="text-red-600 text-sm font-medium">{t('errorMessage')}</p>
                  )}

                  <div className="flex justify-end">
                    <ArrowButton type="submit" variant="primary" disabled={status === 'loading'}>
                      {t('submit')}
                    </ArrowButton>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactFormSection
