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
import { Check, Facebook, InstagramIcon, LinkedinIcon } from 'lucide-react'
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
  postalCode: string
  city: string
  phone: string
  email: string
  message: string
  privacy: boolean
}

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
      postalCode: '',
      city: '',
      phone: '',
      email: '',
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
    <section className="relative py-24">
      <div className="max-w-[1310px] mx-auto px-6">
        <div className="mb-10">
          <span className="inline-block px-4 py-2.5 rounded-full border border-foreground/20 text-sm font-medium backdrop-blur-[65px] mb-5">
            {t('eyebrow')}
          </span>
          <h2 className="text-foreground text-[45px] font-medium leading-[1em] max-w-[400px]">
            {t('title')}
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          <div>
            {status === 'success' ? (
              <div className="flex flex-col items-start py-16">
                <Check className="h-8 w-8 text-green-600 mb-4" strokeWidth={2.5} />
                <h3 className="text-xl font-semibold text-[#062E25] mb-2">{t('successTitle')}</h3>
                <p className="text-[#062E25]/60">{t('successMessage')}</p>
              </div>
            ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Controller
                  name="entityType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t('entityType.placeholder')} />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="company">
                          {t('entityType.company')}
                        </SelectItem>
                        <SelectItem value="private">
                          {t('entityType.private')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />

                <Controller
                  name="salutation"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t('salutation.placeholder')} />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        <SelectItem value="mr">{t('salutation.mr')}</SelectItem>
                        <SelectItem value="mrs">{t('salutation.mrs')}</SelectItem>
                        <SelectItem value="diverse">
                          {t('salutation.diverse')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label className="text-foreground/60 text-sm">
                    {t('firstName.label')}
                  </Label>
                  <Input
                    {...register('firstName')}
                    placeholder={t('firstName.placeholder')}
                    className="h-9 bg-[#F5F5F5] border-[#E5E5E5] rounded-[5px] backdrop-blur-[65px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-foreground/60 text-sm">
                    {t('lastName.label')}
                  </Label>
                  <Input
                    {...register('lastName')}
                    placeholder={t('lastName.placeholder')}
                    className="h-9 bg-[#F5F5F5] border-[#E5E5E5] rounded-[5px] backdrop-blur-[65px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label className="text-foreground/60 text-sm">
                    {t('postalCode.label')}
                  </Label>
                  <Input
                    {...register('postalCode')}
                    placeholder={t('postalCode.placeholder')}
                    className="h-9 bg-[#F5F5F5] border-[#E5E5E5] rounded-[5px] backdrop-blur-[65px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-foreground/60 text-sm">
                    {t('city.label')}
                  </Label>
                  <Input
                    {...register('city')}
                    placeholder={t('city.placeholder')}
                    className="h-9 bg-[#F5F5F5] border-[#E5E5E5] rounded-[5px] backdrop-blur-[65px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label className="text-foreground/60 text-sm">
                    {t('phone.label')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="tel"
                    {...register('phone', { required: t('errors.phone') })}
                    placeholder={t('phone.placeholder')}
                    className="h-9 bg-[#F5F5F5] border-[#E5E5E5] rounded-[5px] backdrop-blur-[65px]"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm">{errors.phone.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-foreground/60 text-sm">
                    {t('email.label')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    {...register('email', { required: t('errors.email') })}
                    placeholder={t('email.placeholder')}
                    className="h-9 bg-[#F5F5F5] border-[#E5E5E5] rounded-[5px] backdrop-blur-[65px]"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="h-px bg-foreground/20 my-5" />

              <div className="space-y-1.5">
                <Label className="text-foreground/60 text-sm">
                  {t('message.label')} <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  {...register('message', { required: t('errors.message') })}
                  placeholder={t('message.placeholder')}
                  className="min-h-[120px] bg-[#F5F5F5] border-[#E5E5E5] rounded-[5px] backdrop-blur-[65px] resize-none"
                />
                {errors.message && (
                  <p className="text-red-500 text-sm">{errors.message.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <Controller
                    name="privacy"
                    control={control}
                    rules={{ required: t('errors.privacy') }}
                    render={({ field }) => (
                      <Checkbox
                        id="privacy"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="size-6 rounded border-foreground/60 "
                      />
                    )}
                  />
                  <Label
                    htmlFor="privacy"
                    className="text-sm text-foreground/40 cursor-pointer"
                  >
                    <Link
                      href="/privacy-policy"
                      onClick={e => e.stopPropagation()}
                      className="hover:underline"
                    >
                      {t('privacy')} <span className="text-red-500">*</span>
                    </Link>
                  </Label>
                </div>
                {errors.privacy && (
                  <p className="text-red-500 text-sm">{errors.privacy.message}</p>
                )}
              </div>

              {status === 'error' && (
                <p className="text-red-600 text-sm font-medium">{t('errorMessage')}</p>
              )}

              <ArrowButton type="submit" variant="primary" disabled={status === 'loading'}>
                {t('submit')}
              </ArrowButton>
            </form>
            )}
          </div>

          <div className="relative">
            <div className="bg-solar rounded-2xl p-8 text-[#062E25] flex flex-col">
              <div className="pb-6 border-b border-[#062E25]/20">
                <h3 className="text-[22px] font-medium mb-3 leading-[30px]">
                  {t('card.address.title')}
                </h3>
                <p className="text-[#062E25]/80 text-base font-light leading-6">
                  {t('card.address.value')}
                </p>
              </div>

              <div className="py-6 border-b border-[#062E25]/20">
                <h3 className="text-[22px] font-medium mb-3 leading-[30px]">
                  {t('card.contact.title')}
                </h3>
                <p className="text-[#062E25]/80 text-base font-light leading-6">
                  {t('card.contact.phone')}
                </p>
              </div>

              <div className="py-6 border-b border-[#062E25]/20">
                <h3 className="text-[22px] font-medium mb-3 leading-[30px]">
                  {t('card.email.title')}
                </h3>
                <p className="text-[#062E25]/80 text-base font-light leading-6">
                  {t('card.email.value')}
                </p>
              </div>

              <div className="pt-6">
                <h3 className="text-[22px] font-medium mb-5 leading-[30px]">
                  {t('card.social.title')}
                </h3>
                <div className="flex gap-[11.14px]">
                  <a
                    href="#"
                    className="size-[42.35px] rounded-full bg-[#062E25] flex items-center justify-center hover:opacity-80 transition-opacity"
                  >
                    <Facebook className="size-6 text-solar" />
                  </a>
                  <a
                    href="#"
                    className="size-[42.35px] rounded-full bg-[#062E25] flex items-center justify-center hover:opacity-80 transition-opacity"
                  >
                    <InstagramIcon className="size-6 text-solar" />
                  </a>
                  <a
                    href="https://www.linkedin.com/company/agribusiness-training-institute-of-free-state/"
                    className="size-[42.35px] rounded-full bg-[#062E25] flex items-center justify-center hover:opacity-80 transition-opacity"
                  >
                    <LinkedinIcon className="size-6 text-solar" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactFormSection
