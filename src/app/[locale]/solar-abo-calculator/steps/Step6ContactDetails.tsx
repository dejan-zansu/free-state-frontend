'use client'

import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useSolarAboCalculatorStore, type Salutation } from '@/stores/solar-abo-calculator.store'

export default function Step6ContactDetails() {
  const t = useTranslations('solarAboCalculator.step6')
  const tNav = useTranslations('solarAboCalculator.navigation')
  const { contact, setContact, prevStep } = useSolarAboCalculatorStore()

  const isValid =
    contact.salutation &&
    contact.firstName.trim() &&
    contact.lastName.trim() &&
    contact.phoneNumber.trim()

  const handleSubmit = () => {
    if (!isValid) return
    alert(t('successMessage'))
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
          </div>
        </div>

        <div className='mt-8 flex gap-4'>
          <Button variant='outline' onClick={prevStep}>
            {tNav('back')}
          </Button>
          <Button className='flex-1' onClick={handleSubmit} disabled={!isValid}>
            {t('submit')}
          </Button>
        </div>
      </div>
    </div>
  )
}
