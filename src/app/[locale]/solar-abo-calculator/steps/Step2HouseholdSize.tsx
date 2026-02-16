'use client'

import { User, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { SelectionCard } from '@/components/solar-abo-calculator'
import { useSolarAboCalculatorStore, type HouseholdSize } from '@/stores/solar-abo-calculator.store'

const householdOptions: { size: HouseholdSize; labelKey: string }[] = [
  { size: 1, labelKey: '1' },
  { size: 2, labelKey: '2' },
  { size: 3, labelKey: '3' },
  { size: 4, labelKey: '4' },
  { size: 5, labelKey: '5' },
]

function HouseholdIcon({ count }: { count: number }) {
  if (count === 1) {
    return <User className='h-6 w-6' />
  }
  return (
    <div className='flex items-center'>
      <Users className='h-6 w-6' />
      {count > 2 && <span className='ml-1 text-xs font-medium'>+{count - 2}</span>}
    </div>
  )
}

export default function Step2HouseholdSize() {
  const t = useTranslations('solarAboCalculator.step2')
  const tNav = useTranslations('solarAboCalculator.navigation')
  const { householdSize, setHouseholdSize, nextStep, prevStep } = useSolarAboCalculatorStore()

  const handleSelect = (size: HouseholdSize) => {
    setHouseholdSize(size)
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
          {householdOptions.map((option) => (
            <SelectionCard
              key={option.size}
              icon={<HouseholdIcon count={option.size} />}
              label={t(`options.${option.labelKey}`)}
              selected={householdSize === option.size}
              onClick={() => handleSelect(option.size)}
            />
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
