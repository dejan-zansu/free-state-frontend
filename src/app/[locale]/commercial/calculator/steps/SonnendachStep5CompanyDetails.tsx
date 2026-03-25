'use client'

import { useTranslations } from 'next-intl'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSonnendachCalculatorStore } from '@/stores/sonnendach-calculator.store'

const SWISS_CANTONS = [
  'AG', 'AI', 'AR', 'BE', 'BL', 'BS', 'FR', 'GE', 'GL', 'GR', 'JU', 'LU', 'NE',
  'NW', 'OW', 'SG', 'SH', 'SO', 'SZ', 'TG', 'TI', 'UR', 'VD', 'VS', 'ZG', 'ZH',
]

export default function SonnendachStep5CompanyDetails() {
  const t = useTranslations('sonnendach.step5Company')
  const tNav = useTranslations('sonnendach.navigation')

  const {
    personalInfo,
    setPersonalInfo,
    installationAddress,
    setInstallationAddress,
    propertyOwnership,
    setPropertyOwnership,
    consents,
    setConsents,
    prevStep,
    nextStep,
  } = useSonnendachCalculatorStore()

  const [companyName, setCompanyName] = useState('')
  const [companyRole, setCompanyRole] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!personalInfo.firstName) newErrors.firstName = t('required')
    if (!personalInfo.lastName) newErrors.lastName = t('required')
    if (!personalInfo.email) newErrors.email = t('required')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfo.email)) newErrors.email = t('invalidEmail')
    if (!personalInfo.phone) newErrors.phone = t('required')
    if (!installationAddress.street) newErrors.street = t('required')
    if (!installationAddress.postalCode) newErrors.postalCode = t('required')
    if (!installationAddress.city) newErrors.city = t('required')
    if (!consents.privacy) newErrors.privacy = t('required')
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validate()) {
      nextStep()
    }
  }

  return (
    <div>
      <div className="container mx-auto px-4 pt-8 pb-24 max-w-2xl">
        <h1 className="text-2xl sm:text-3xl font-medium text-[#062E25]">
          {t('title')}
        </h1>
        <p className="mt-2 text-sm text-[#062E25]/60">
          {t('subtitle')}
        </p>

        <div className="mt-8 space-y-8">
          <div>
            <h2 className="text-base font-semibold text-[#062E25] mb-4">
              {t('companySection')}
            </h2>
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-[#062E25]/70">{t('companyName')}</Label>
                <Input
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm text-[#062E25]/70">{t('companyRole')}</Label>
                <Input
                  value={companyRole}
                  onChange={e => setCompanyRole(e.target.value)}
                  placeholder={t('companyRolePlaceholder')}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[#062E25] mb-4">
              {t('contactSection')}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-[#062E25]/70">{t('firstName')}</Label>
                <Input
                  value={personalInfo.firstName}
                  onChange={e => setPersonalInfo({ firstName: e.target.value })}
                  className="mt-1"
                />
                {errors.firstName && <p className="text-sm text-red-600 mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <Label className="text-sm text-[#062E25]/70">{t('lastName')}</Label>
                <Input
                  value={personalInfo.lastName}
                  onChange={e => setPersonalInfo({ lastName: e.target.value })}
                  className="mt-1"
                />
                {errors.lastName && <p className="text-sm text-red-600 mt-1">{errors.lastName}</p>}
              </div>
              <div>
                <Label className="text-sm text-[#062E25]/70">{t('email')}</Label>
                <Input
                  type="email"
                  value={personalInfo.email}
                  onChange={e => setPersonalInfo({ email: e.target.value })}
                  className="mt-1"
                />
                {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
              </div>
              <div>
                <Label className="text-sm text-[#062E25]/70">{t('phone')}</Label>
                <Input
                  value={personalInfo.phone}
                  onChange={e => setPersonalInfo({ phone: e.target.value })}
                  className="mt-1"
                />
                {errors.phone && <p className="text-sm text-red-600 mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[#062E25] mb-4">
              {t('propertySection')}
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label className="text-sm text-[#062E25]/70">{t('street')}</Label>
                  <Input
                    value={installationAddress.street}
                    onChange={e => setInstallationAddress({ ...installationAddress, street: e.target.value })}
                    className="mt-1"
                  />
                  {errors.street && <p className="text-sm text-red-600 mt-1">{errors.street}</p>}
                </div>
                <div>
                  <Label className="text-sm text-[#062E25]/70">{t('postalCode')}</Label>
                  <Input
                    value={installationAddress.postalCode}
                    onChange={e => setInstallationAddress({ ...installationAddress, postalCode: e.target.value })}
                    className="mt-1"
                  />
                  {errors.postalCode && <p className="text-sm text-red-600 mt-1">{errors.postalCode}</p>}
                </div>
                <div>
                  <Label className="text-sm text-[#062E25]/70">{t('city')}</Label>
                  <Input
                    value={installationAddress.city}
                    onChange={e => setInstallationAddress({ ...installationAddress, city: e.target.value })}
                    className="mt-1"
                  />
                  {errors.city && <p className="text-sm text-red-600 mt-1">{errors.city}</p>}
                </div>
                <div>
                  <Label className="text-sm text-[#062E25]/70">{t('canton')}</Label>
                  <Select
                    value={installationAddress.canton}
                    onValueChange={v => setInstallationAddress({ ...installationAddress, canton: v })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SWISS_CANTONS.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-4">
                <Checkbox
                  id="isOwner"
                  checked={propertyOwnership.isPropertyOwner}
                  onCheckedChange={v => setPropertyOwnership({ isPropertyOwner: v === true })}
                />
                <Label htmlFor="isOwner" className="text-sm text-[#062E25]/70">
                  {t('isPropertyOwner')}
                </Label>
              </div>

              {!propertyOwnership.isPropertyOwner && (
                <div className="space-y-4 pl-6 border-l-2 border-[#062E25]/10">
                  <div>
                    <Label className="text-sm text-[#062E25]/70">{t('ownerName')}</Label>
                    <Input
                      value={propertyOwnership.propertyOwnerName || ''}
                      onChange={e => setPropertyOwnership({ propertyOwnerName: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-[#062E25]/70">{t('ownerEmail')}</Label>
                    <Input
                      type="email"
                      value={propertyOwnership.propertyOwnerEmail || ''}
                      onChange={e => setPropertyOwnership({ propertyOwnerEmail: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm text-[#062E25]/70">{t('ownerPhone')}</Label>
                    <Input
                      value={propertyOwnership.propertyOwnerPhone || ''}
                      onChange={e => setPropertyOwnership({ propertyOwnerPhone: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-start gap-3">
              <Checkbox
                id="privacy"
                checked={consents.privacy}
                onCheckedChange={v => setConsents({ privacy: v === true })}
              />
              <Label htmlFor="privacy" className="text-sm text-[#062E25]/70">
                {t('privacyConsent')}
              </Label>
            </div>
            {errors.privacy && <p className="text-sm text-red-600 mt-1">{errors.privacy}</p>}

            <div className="flex items-start gap-3 mt-3">
              <Checkbox
                id="marketing"
                checked={consents.marketing}
                onCheckedChange={v => setConsents({ marketing: v === true })}
              />
              <Label htmlFor="marketing" className="text-sm text-[#062E25]/70">
                {t('marketingConsent')}
              </Label>
            </div>
          </div>
        </div>

        <div
          className="fixed bottom-0 left-0 right-0 z-50 flex justify-end gap-3 px-6 py-4"
          style={{
            background: 'rgba(234, 237, 223, 0.85)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <Button
            variant="outline"
            onClick={prevStep}
            style={{ borderColor: '#062E25', color: '#062E25' }}
          >
            {tNav('back')}
          </Button>
          <Button
            onClick={handleNext}
            className="bg-[#062E25] text-white hover:bg-[#062E25]/90"
          >
            {tNav('next')}
          </Button>
        </div>
      </div>
    </div>
  )
}
