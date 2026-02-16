'use client'

import { HelpCircle } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { useSolarAboCalculatorStore, type RoofCoveringType } from '@/stores/solar-abo-calculator.store'
import { cn } from '@/lib/utils'

const roofOptions: { type: RoofCoveringType; image: string | null; labelKey: string }[] = [
  { type: 'tiled', image: 'https://placehold.co/128x128/e2e8f0/475569?text=Tiled', labelKey: 'tiled' },
  { type: 'tin', image: 'https://placehold.co/128x128/e2e8f0/475569?text=Tin', labelKey: 'tin' },
  { type: 'other', image: null, labelKey: 'other' },
]

export default function Step5RoofCovering() {
  const t = useTranslations('solarAboCalculator.step5')
  const tNav = useTranslations('solarAboCalculator.navigation')
  const { roofCovering, setRoofCovering, prevStep, nextStep } = useSolarAboCalculatorStore()

  const handleSelect = (type: RoofCoveringType) => {
    setRoofCovering(type)
    nextStep()
  }

  return (
    <div className='h-full overflow-y-auto'>
      <div className='container mx-auto px-4 pt-8 pb-16 max-w-lg'>
        <div className='mb-8'>
          <h1 className='text-2xl font-bold'>{t('title')}</h1>
          <p className='mt-2 text-muted-foreground'>{t('helper')}</p>
        </div>

        <div className='space-y-3'>
          {roofOptions.map((option) => (
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

        <div className='mt-8'>
          <Button variant='outline' onClick={prevStep}>
            {tNav('back')}
          </Button>
        </div>
      </div>
    </div>
  )
}
