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
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { ArrowButton } from '@/components/ui/arrow-button'

const maintenanceServiceKeys = ['monitoring', 'inspection', 'systemCheck', 'investmentCheck'] as const
const productKeys = [
  'solarAboPrivate',
  'solarAboBusiness',
  'huaweiInverters',
  'sonnenBattery',
  'e3dcBattery',
  'vartaBattery',
  'sungrowBattery',
  'huaweiBattery',
  'bydBattery',
  'teslaBattery',
] as const

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

const MaintenanceInquirySection = () => {
  const t = useTranslations('service.inquiry')

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    postalCode: '',
    location: '',
    maintenanceServices: [] as string[],
    hasFreeStateSystem: null as boolean | null,
    systemOutputKwp: '',
    hasInternetAccess: '',
    products: [] as string[],
    message: '',
    consentPrivacy: false,
  })

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const toggleArrayItem = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')

    try {
      const response = await fetch(`${API_URL}/api/service-inquiries`, {
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
          background: 'linear-gradient(180deg, rgba(242, 244, 232, 1) 84%, rgba(220, 233, 230, 1) 100%)',
        }}
      >
        <div className="max-w-[621px] mx-auto px-4 sm:px-6 text-center">
          <p className="text-[#062E25] text-base md:text-[22px] font-light tracking-[-0.02em]">
            {t('success')}
          </p>
        </div>
      </section>
    )
  }

  return (
    <section
      className="relative w-full"
      style={{
        background: 'linear-gradient(180deg, rgba(242, 244, 232, 1) 84%, rgba(220, 233, 230, 1) 100%)',
      }}
    >
      <div className="max-w-[621px] mx-auto px-4 sm:px-6 py-12 md:py-[50px]">
        <div className="flex flex-col gap-[29px]">
          <div className="flex flex-col gap-5">
            <div
              className="flex items-center justify-center px-4 py-[10px] rounded-[20px] border border-[#062E25] w-fit"
              style={{
                backdropFilter: 'blur(65px)',
                WebkitBackdropFilter: 'blur(65px)',
              }}
            >
              <span className="text-[#062E25] text-base font-light tracking-[-0.02em] whitespace-nowrap">
                {t('eyebrow')}
              </span>
            </div>

            <h2 className="text-[#062E25] text-3xl md:text-[45px] font-medium leading-[1em] whitespace-pre-line">
              {t('title')}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-[29px]">
            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-[5px]">
                  <Label className="text-[#062E25]/60 text-xs font-medium tracking-[-0.02em]">
                    {t('firstName.label')}
                  </Label>
                  <Input
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder={t('firstName.placeholder')}
                    className="h-9 bg-[#EAEDDF] border-[#E5E5E5] rounded-[5px] backdrop-blur-[65px] text-[#062E25] placeholder:text-[#062E25]/20 text-xs font-medium tracking-[-0.02em]"
                    required
                  />
                </div>
                <div className="flex flex-col gap-[5px]">
                  <Label className="text-[#062E25]/60 text-xs font-medium tracking-[-0.02em]">
                    {t('lastName.label')}
                  </Label>
                  <Input
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder={t('lastName.placeholder')}
                    className="h-9 bg-[#EAEDDF] border-[#E5E5E5] rounded-[5px] backdrop-blur-[65px] text-[#062E25] placeholder:text-[#062E25]/20 text-xs font-medium tracking-[-0.02em]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-[5px]">
                  <Label className="text-[#062E25]/60 text-xs font-medium tracking-[-0.02em]">
                    {t('email.label')}
                  </Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder={t('email.placeholder')}
                    className="h-9 bg-[#EAEDDF] border-[#E5E5E5] rounded-[5px] backdrop-blur-[65px] text-[#062E25] placeholder:text-[#062E25]/20 text-xs font-medium tracking-[-0.02em]"
                    required
                  />
                </div>
                <div className="flex flex-col gap-[5px]">
                  <Label className="text-[#062E25]/60 text-xs font-medium tracking-[-0.02em]">
                    {t('phone.label')}
                  </Label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder={t('phone.placeholder')}
                    className="h-9 bg-[#EAEDDF] border-[#E5E5E5] rounded-[5px] backdrop-blur-[65px] text-[#062E25] placeholder:text-[#062E25]/20 text-xs font-medium tracking-[-0.02em]"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-[5px]">
                <Label className="text-[#062E25]/60 text-xs font-medium tracking-[-0.02em]">
                  {t('street.label')}
                </Label>
                <Input
                  value={formData.street}
                  onChange={e => setFormData({ ...formData, street: e.target.value })}
                  placeholder={t('street.placeholder')}
                  className="h-9 bg-[#EAEDDF] border-[#E5E5E5] rounded-[5px] backdrop-blur-[65px] text-[#062E25] placeholder:text-[#062E25]/20 text-xs font-medium tracking-[-0.02em]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-[5px]">
                  <Label className="text-[#062E25]/60 text-xs font-medium tracking-[-0.02em]">
                    {t('postalCode.label')}
                  </Label>
                  <Input
                    value={formData.postalCode}
                    onChange={e => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder={t('postalCode.placeholder')}
                    className="h-9 bg-[#EAEDDF] border-[#E5E5E5] rounded-[5px] backdrop-blur-[65px] text-[#062E25] placeholder:text-[#062E25]/20 text-xs font-medium tracking-[-0.02em]"
                    required
                  />
                </div>
                <div className="flex flex-col gap-[5px]">
                  <Label className="text-[#062E25]/60 text-xs font-medium tracking-[-0.02em]">
                    {t('location.label')}
                  </Label>
                  <Input
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    placeholder={t('location.placeholder')}
                    className="h-9 bg-[#EAEDDF] border-[#E5E5E5] rounded-[5px] backdrop-blur-[65px] text-[#062E25] placeholder:text-[#062E25]/20 text-xs font-medium tracking-[-0.02em]"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-[10px]">
              <Label className="text-[#062E25]/60 text-xs font-medium tracking-[-0.02em]">
                {t('maintenanceServices.label')}
              </Label>
              <div className="flex flex-col gap-[7px]">
                {maintenanceServiceKeys.map(key => (
                  <label key={key} className="flex items-center gap-[10px] cursor-pointer">
                    <Checkbox
                      checked={formData.maintenanceServices.includes(key)}
                      onCheckedChange={() =>
                        setFormData({
                          ...formData,
                          maintenanceServices: toggleArrayItem(formData.maintenanceServices, key),
                        })
                      }
                      className="size-[15px] rounded-[3.75px] border-[#4A9A99] opacity-60"
                    />
                    <span className="text-[#062E25]/60 text-xs font-medium tracking-[-0.02em]">
                      {t(`maintenanceServices.${key}`)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="h-px bg-[#062E25]/20" />

            <div className="flex flex-col gap-[10px]">
              <Label className="text-[#062E25]/60 text-xs font-medium tracking-[-0.02em]">
                {t('freeStateSystem.label')}
              </Label>
              <div className="flex flex-col gap-[7px]">
                <label className="flex items-center gap-[10px] cursor-pointer">
                  <input
                    type="radio"
                    name="freeStateSystem"
                    checked={formData.hasFreeStateSystem === true}
                    onChange={() => setFormData({ ...formData, hasFreeStateSystem: true })}
                    className="size-[15px] accent-[#4A9A99] opacity-60"
                  />
                  <span className="text-[#062E25]/60 text-xs font-medium tracking-[-0.02em]">
                    {t('freeStateSystem.yes')}
                  </span>
                </label>
                <label className="flex items-center gap-[10px] cursor-pointer">
                  <input
                    type="radio"
                    name="freeStateSystem"
                    checked={formData.hasFreeStateSystem === false}
                    onChange={() => setFormData({ ...formData, hasFreeStateSystem: false })}
                    className="size-[15px] accent-[#4A9A99] opacity-60"
                  />
                  <span className="text-[#062E25]/60 text-xs font-medium tracking-[-0.02em]">
                    {t('freeStateSystem.no')}
                  </span>
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-[5px]">
              <Label className="text-[#062E25]/60 text-xs font-medium tracking-[-0.02em]">
                {t('systemOutput.label')}
              </Label>
              <Input
                value={formData.systemOutputKwp}
                onChange={e => setFormData({ ...formData, systemOutputKwp: e.target.value })}
                placeholder={t('systemOutput.placeholder')}
                className="h-9 bg-[#EAEDDF] border-[#E5E5E5] rounded-[5px] backdrop-blur-[65px] text-[#062E25] placeholder:text-[#062E25]/20 text-xs font-medium tracking-[-0.02em]"
              />
            </div>

            <div className="flex flex-col gap-[5px]">
              <Label className="text-[#062E25]/60 text-xs font-medium tracking-[-0.02em]">
                {t('internetAccess.label')}
              </Label>
              <Select
                value={formData.hasInternetAccess}
                onValueChange={value => setFormData({ ...formData, hasInternetAccess: value })}
              >
                <SelectTrigger className="h-9 bg-[#EAEDDF] border-[#E5E5E5] rounded-[5px] backdrop-blur-[65px] text-[#062E25] text-xs font-medium tracking-[-0.02em]">
                  <SelectValue placeholder={t('internetAccess.placeholder')} />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="yes">{t('internetOptions.yes')}</SelectItem>
                  <SelectItem value="no">{t('internetOptions.no')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-[10px]">
              <Label className="text-[#062E25]/60 text-xs font-medium tracking-[-0.02em]">
                {t('products.label')}
              </Label>
              <div className="flex flex-col gap-[7px]">
                {productKeys.map(key => (
                  <label key={key} className="flex items-center gap-[10px] cursor-pointer">
                    <Checkbox
                      checked={formData.products.includes(key)}
                      onCheckedChange={() =>
                        setFormData({
                          ...formData,
                          products: toggleArrayItem(formData.products, key),
                        })
                      }
                      className="size-[15px] rounded-[3.75px] border-[#4A9A99] opacity-60"
                    />
                    <span className="text-[#062E25]/60 text-xs font-medium tracking-[-0.02em]">
                      {t(`products.${key}`)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="h-px bg-[#062E25]/20" />

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-[5px]">
                <Label className="text-[#062E25]/60 text-xs font-medium tracking-[-0.02em]">
                  {t('message.label')}
                </Label>
                <Textarea
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  placeholder={t('message.placeholder')}
                  className="min-h-[120px] bg-[#EAEDDF] border-[#E5E5E5] rounded-[5px] backdrop-blur-[65px] text-[#062E25] placeholder:text-[#062E25]/20 text-xs font-medium tracking-[-0.02em] resize-none"
                />
              </div>

              <label className="flex items-center gap-[10px] cursor-pointer">
                <Checkbox
                  checked={formData.consentPrivacy}
                  onCheckedChange={checked =>
                    setFormData({ ...formData, consentPrivacy: checked as boolean })
                  }
                  className="size-[15px] rounded-[3.75px] border-[#062E25] opacity-60"
                />
                <span className="text-[#062E25]/40 text-xs font-medium tracking-[-0.02em]">
                  <Link
                    href="/privacy-policy"
                    onClick={e => e.stopPropagation()}
                    className="hover:underline"
                  >
                    {t('privacy')}
                  </Link>
                </span>
              </label>
            </div>

            <ArrowButton
              type="submit"
              variant="primary"
              disabled={status === 'loading'}
            >
              {t('submit')}
            </ArrowButton>

            {status === 'error' && (
              <p className="text-red-600 text-xs">{t('error')}</p>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}

export default MaintenanceInquirySection
