'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useSolarAboCalculatorStore, type Salutation } from '@/stores/solar-abo-calculator.store'

export default function Step6ContactDetails() {
  const t = useTranslations('solarAboCalculator.step7')
  const tNav = useTranslations('solarAboCalculator.navigation')
  const tConsent = useTranslations('solarAboCalculator.consents')
  const {
    contact,
    consents,
    setContact,
    setConsents,
    prevStep,
    nextStep,
    isSubmitting,
    submissionError,
    createAccount,
  } = useSolarAboCalculatorStore()

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)

  const isValid =
    contact.salutation &&
    contact.firstName.trim() &&
    contact.lastName.trim() &&
    contact.email.trim() &&
    isValidEmail &&
    contact.phoneNumber.trim() &&
    consents.dataProcessing

  const handleSubmit = async () => {
    if (!isValid) return
    await createAccount()
    nextStep()
  }

  return (
    <div className='h-full overflow-y-auto'>
      <div className='container mx-auto px-4 pt-8 pb-16 max-w-4xl'>
        <div className='grid lg:grid-cols-2 gap-8'>
          <div>
            <h1 className='text-2xl font-bold'>{t('title')}</h1>
            <p className='mt-2 text-muted-foreground'>{t('helper')}</p>

            <div className='mt-8 flex items-center justify-center'>
              <div className='relative w-64 h-80'>
                <div className='absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg transform rotate-3' />
                <div className='absolute inset-0 bg-card border rounded-lg shadow-lg transform -rotate-2 flex items-center justify-center'>
                  <div className='text-center p-6'>
                    <p className='text-2xl font-bold text-primary'>{t('offerPreview.title')}</p>
                    <p className='mt-2 text-sm text-muted-foreground'>{t('offerPreview.subtitle')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='space-y-6'>
            <div className='space-y-3'>
              <Label>{t('salutation.label')}</Label>
              <RadioGroup
                value={contact.salutation || ''}
                onValueChange={(value) => setContact({ salutation: value as Salutation })}
                className='flex gap-4'
              >
                {(['mr', 'woman', 'family'] as Salutation[]).map((option) => (
                  <div key={option} className='flex items-center space-x-2'>
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option} className='cursor-pointer'>
                      {t(`salutation.options.${option}`)}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='firstName'>
                {t('firstName')} <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='firstName'
                value={contact.firstName}
                onChange={(e) => setContact({ firstName: e.target.value })}
                placeholder={t('firstNamePlaceholder')}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='lastName'>
                {t('lastName')} <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='lastName'
                value={contact.lastName}
                onChange={(e) => setContact({ lastName: e.target.value })}
                placeholder={t('lastNamePlaceholder')}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='email'>
                {t('email')} <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='email'
                type='email'
                value={contact.email}
                onChange={(e) => setContact({ email: e.target.value })}
                placeholder={t('emailPlaceholder')}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='phoneNumber'>
                {t('phoneNumber')} <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='phoneNumber'
                type='tel'
                value={contact.phoneNumber}
                onChange={(e) => setContact({ phoneNumber: e.target.value })}
                placeholder={t('phoneNumberPlaceholder')}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='remarks'>{t('remarks')}</Label>
              <Textarea
                id='remarks'
                value={contact.remarks}
                onChange={(e) => setContact({ remarks: e.target.value })}
                placeholder={t('remarksPlaceholder')}
                rows={4}
              />
            </div>

            <div className='pt-2'>
              <div className='flex items-start gap-3'>
                <Checkbox
                  id='consent-data'
                  checked={consents.dataProcessing}
                  onCheckedChange={(checked) => setConsents({ dataProcessing: checked === true })}
                  className='mt-0.5 border-[#062E25]/40 data-[state=checked]:bg-[#062E25] data-[state=checked]:border-[#062E25]'
                />
                <label htmlFor='consent-data' className='text-sm cursor-pointer text-[#062E25]/80'>
                  {tConsent('dataProcessingPrefix')}{' '}
                  <Link href='/privacy' className='underline underline-offset-2 text-[#062E25] hover:text-[#062E25]/70'>
                    {tConsent('dataProcessingLink')}
                  </Link>{' '}
                  {tConsent('dataProcessingSuffix')}
                  {' '}<span className='text-destructive'>*</span>
                </label>
              </div>
            </div>

            {submissionError && (
              <div className='text-sm text-destructive bg-destructive/10 p-3 rounded-md'>
                {submissionError}
              </div>
            )}
          </div>
        </div>

        <div className='fixed bottom-0 left-0 right-0 z-50 flex justify-end gap-4 px-6 py-4' style={{ background: 'rgba(234, 237, 223, 0.85)', backdropFilter: 'blur(12px)' }}>
          <Button variant='outline' onClick={prevStep} disabled={isSubmitting} style={{ borderColor: "#062E25", color: "#062E25" }}>
            {tNav('back')}
          </Button>
          <Button className='w-fit' onClick={handleSubmit} disabled={!isValid || isSubmitting}>
            {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {tNav('next')}
          </Button>
        </div>
      </div>
    </div>
  )
}
