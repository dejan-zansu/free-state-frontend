'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCallback, useMemo } from 'react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useSolarAboCalculatorStore, type Salutation } from '@/stores/solar-abo-calculator.store'
import { cn } from '@/lib/utils'

const salutations: Salutation[] = ['mr', 'woman', 'family']

function useContactSchema(t: (key: string) => string) {
  return useMemo(() => z.object({
    salutation: z.enum(['mr', 'woman', 'family'], {
      message: t('salutationRequired'),
    }),
    firstName: z.string().min(1, t('firstNameRequired')),
    lastName: z.string().min(1, t('lastNameRequired')),
    email: z.string().min(1, t('emailRequired')).email(t('emailInvalid')),
    phoneNumber: z.string().min(1, t('phoneRequired')).regex(/^[+\d][\d\s\-().]{6,}$/, t('phoneInvalid')),
    remarks: z.string(),
    dataProcessing: z.literal(true, {
      message: t('consentRequired'),
    }),
  }), [t])
}

type ContactFormData = z.infer<ReturnType<typeof useContactSchema>>

export default function Step6ContactDetails() {
  const t = useTranslations('solarAboCalculator.step7')
  const tErr = useTranslations('solarAboCalculator.step7.errors')
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

  const schema = useContactSchema(tErr)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      salutation: contact.salutation || undefined,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phoneNumber: contact.phoneNumber,
      remarks: contact.remarks,
      dataProcessing: consents.dataProcessing || undefined,
    },
  })

  const onSubmit = useCallback(async (data: ContactFormData) => {
    setContact({
      salutation: data.salutation,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      remarks: data.remarks,
    })
    setConsents({ dataProcessing: data.dataProcessing })
    await createAccount()
    nextStep()
  }, [setContact, setConsents, createAccount, nextStep])

  return (
    <div className='h-full overflow-y-auto'>
      <div className='container mx-auto px-4 pt-8 pb-16 max-w-4xl'>
        <div className='max-w-lg mx-auto'>
          <h1 className='text-2xl font-bold'>{t('title')}</h1>
          <p className='mt-2 text-muted-foreground'>{t('helper')}</p>

          <form onSubmit={handleSubmit(onSubmit)} className='mt-8 space-y-6' noValidate>
            <div className='space-y-3'>
              <Label>{t('salutation.label')} <span className='text-destructive'>*</span></Label>
              <Controller
                name='salutation'
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    value={field.value || ''}
                    onValueChange={field.onChange}
                    className='flex gap-4'
                  >
                    {salutations.map((option) => (
                      <div key={option} className='flex items-center space-x-2'>
                        <RadioGroupItem value={option} id={option} />
                        <Label htmlFor={option} className='cursor-pointer'>
                          {t(`salutation.options.${option}`)}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              />
              {errors.salutation && (
                <p className='text-sm text-destructive'>{errors.salutation.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='firstName'>
                {t('firstName')} <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='firstName'
                {...register('firstName')}
                placeholder={t('firstNamePlaceholder')}
                className={cn(errors.firstName && 'border-destructive')}
              />
              {errors.firstName && (
                <p className='text-sm text-destructive'>{errors.firstName.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='lastName'>
                {t('lastName')} <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='lastName'
                {...register('lastName')}
                placeholder={t('lastNamePlaceholder')}
                className={cn(errors.lastName && 'border-destructive')}
              />
              {errors.lastName && (
                <p className='text-sm text-destructive'>{errors.lastName.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='email'>
                {t('email')} <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='email'
                type='email'
                {...register('email')}
                placeholder={t('emailPlaceholder')}
                className={cn(errors.email && 'border-destructive')}
              />
              {errors.email && (
                <p className='text-sm text-destructive'>{errors.email.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='phoneNumber'>
                {t('phoneNumber')} <span className='text-destructive'>*</span>
              </Label>
              <Input
                id='phoneNumber'
                type='tel'
                {...register('phoneNumber')}
                placeholder={t('phoneNumberPlaceholder')}
                className={cn(errors.phoneNumber && 'border-destructive')}
              />
              {errors.phoneNumber && (
                <p className='text-sm text-destructive'>{errors.phoneNumber.message}</p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='remarks'>{t('remarks')}</Label>
              <Textarea
                id='remarks'
                {...register('remarks')}
                placeholder={t('remarksPlaceholder')}
                rows={4}
              />
            </div>

            <div className='pt-2'>
              <Controller
                name='dataProcessing'
                control={control}
                render={({ field }) => (
                  <div className='flex items-start gap-3'>
                    <Checkbox
                      id='consent-data'
                      checked={field.value || false}
                      onCheckedChange={(checked) => field.onChange(checked === true ? true : undefined)}
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
                )}
              />
              {errors.dataProcessing && (
                <p className='mt-2 text-sm text-destructive'>{errors.dataProcessing.message}</p>
              )}
            </div>

            {submissionError && (
              <div className='text-sm text-destructive bg-destructive/10 p-3 rounded-md'>
                {submissionError}
              </div>
            )}
          </form>
        </div>

        <div className='fixed bottom-0 left-0 right-0 z-50 flex justify-end gap-4 px-6 py-4' style={{ background: 'rgba(234, 237, 223, 0.85)', backdropFilter: 'blur(12px)' }}>
          <Button variant='outline' onClick={prevStep} disabled={isSubmitting} style={{ borderColor: "#062E25", color: "#062E25" }}>
            {tNav('back')}
          </Button>
          <Button className='w-fit' onClick={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
            {tNav('next')}
          </Button>
        </div>
      </div>
    </div>
  )
}
