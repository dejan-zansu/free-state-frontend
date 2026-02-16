'use client'

import { Home, Building2, Store, Building } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { SelectionCard } from '@/components/solar-abo-calculator'
import { useSolarAboCalculatorStore, type BuildingType } from '@/stores/solar-abo-calculator.store'

const buildingOptions: { type: BuildingType; icon: React.ReactNode; labelKey: string }[] = [
  { type: 'single_family', icon: <Home className='h-6 w-6' />, labelKey: 'singleFamily' },
  { type: 'apartment', icon: <Building2 className='h-6 w-6' />, labelKey: 'apartment' },
  { type: 'trade', icon: <Store className='h-6 w-6' />, labelKey: 'trade' },
  { type: 'office', icon: <Building className='h-6 w-6' />, labelKey: 'office' },
]

export default function Step1BuildingType() {
  const t = useTranslations('solarAboCalculator.step2')
  const { buildingType, setBuildingType, nextStep } = useSolarAboCalculatorStore()

  const handleSelect = (type: BuildingType) => {
    setBuildingType(type)
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
          {buildingOptions.map((option) => (
            <SelectionCard
              key={option.type}
              icon={option.icon}
              label={t(`options.${option.labelKey}`)}
              selected={buildingType === option.type}
              onClick={() => handleSelect(option.type)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
