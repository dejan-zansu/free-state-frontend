'use client'

import { HelpCircle } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { useSolarAboCalculatorStore, type RoofCoveringType } from '@/stores/solar-abo-calculator.store'
import { cn } from '@/lib/utils'

interface RoofOption {
  type: RoofCoveringType
  image: string | null
  labelKey: string
}

const pitchedOptions: RoofOption[] = [
  { type: 'tiled', image: '/images/calculator/roof-tiled.jpg', labelKey: 'tiled' },
  { type: 'tin', image: '/images/calculator/roof-tin.jpg', labelKey: 'tin' },
  { type: 'other', image: null, labelKey: 'other' },
]

const flatOptions: RoofOption[] = [
  { type: 'gravel', image: '/images/calculator/roof-gravel.jpg', labelKey: 'gravel' },
  { type: 'substrate', image: '/images/calculator/roof-substrate.jpg', labelKey: 'substrate' },
  { type: 'other', image: null, labelKey: 'other' },
]

export default function Step5RoofCovering() {
  const t = useTranslations('solarAboCalculator.step6')
  const tNav = useTranslations('solarAboCalculator.navigation')
  const { roofCovering, setRoofCovering, prevStep, nextStep, getRoofType } =
    useSolarAboCalculatorStore()

  const roofType = getRoofType()
  const options = roofType === 'flat' ? flatOptions : pitchedOptions

  const handleSelect = (type: RoofCoveringType) => {
    setRoofCovering(type)
    nextStep()
  }

  return (
    <div>
      <div className='container mx-auto px-4 pt-8 pb-16 max-w-lg'>
        <div className='mb-8'>
          <h1 className='text-2xl font-bold'>{t('title')}</h1>
          <p className='mt-2 text-muted-foreground'>
            {roofType === 'flat' ? t('helperFlat') : t('helper')}
          </p>
        </div>

        <div className='space-y-3'>
          {options.map((option) => (
            <button
              key={option.type}
              type='button'
              onClick={() => handleSelect(option.type)}
              className={cn(
                'flex w-full items-center gap-4 rounded-xl border-2 bg-card p-4 text-left transition-all',
                'hover:border-primary/50 hover:bg-primary/5',
                roofCovering === option.type
                  ? 'border-primary bg-primary/5'
                  : 'border-border'
              )}
            >
              <div className='h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted'>
                {option.image ? (
                  <Image
                    src={option.image}
                    alt={t(`options.${option.labelKey}`)}
                    width={64}
                    height={64}
                    className='h-full w-full object-cover'
                  />
                ) : (
                  <div className='flex h-full w-full items-center justify-center'>
                    <HelpCircle className='h-8 w-8 text-muted-foreground' />
                  </div>
                )}
              </div>
              <span className='flex-1 font-medium'>{t(`options.${option.labelKey}`)}</span>
              <svg
                className={cn(
                  'h-5 w-5 shrink-0',
                  roofCovering === option.type ? 'text-primary' : 'text-muted-foreground'
                )}
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
              </svg>
            </button>
          ))}
        </div>

        <div className='fixed bottom-0 left-0 right-0 z-50 flex justify-end gap-4 px-6 py-4' style={{ background: 'rgba(234, 237, 223, 0.85)', backdropFilter: 'blur(12px)' }}>
          <Button variant='outline' onClick={prevStep} style={{ borderColor: "#062E25", color: "#062E25" }}>
            {tNav('back')}
          </Button>
        </div>
      </div>
    </div>
  )
}
