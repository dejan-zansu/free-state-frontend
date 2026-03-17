'use client'

import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  useSolarAboCalculatorStore,
  type MultiPlanningType,
} from '@/stores/solar-abo-calculator.store'

const options: {
  type: MultiPlanningType
  titleKey: string
  descKey: string
}[] = [
  {
    type: 'my-needs',
    titleKey: 'myNeeds.title',
    descKey: 'myNeeds.description',
  },
  {
    type: 'all-parties',
    titleKey: 'allParties.title',
    descKey: 'allParties.description',
  },
]

export default function StepMultiPlanning() {
  const t = useTranslations('solarAboCalculator.multiPlanning')
  const tNav = useTranslations('solarAboCalculator.navigation')
  const {
    multiPlanningType,
    setMultiPlanningType,
    setShowMultiInterstitial,
    nextStep,
  } = useSolarAboCalculatorStore()

  const handleSelect = (type: MultiPlanningType) => {
    setMultiPlanningType(type)
    setShowMultiInterstitial(false)
    nextStep()
  }

  const handleBack = () => {
    setShowMultiInterstitial(false)
    useSolarAboCalculatorStore.getState().prevStep()
  }

  return (
    <div>
      <div className="flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-10 max-w-xl">
          <h1 className="text-3xl sm:text-[45px] font-medium text-[#062E25]">
            {t('title')}
          </h1>
          <p className="mt-5 text-lg sm:text-[22px] font-light text-[#062E25]/80 tracking-tight">
            {t('subtitle')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-[700px]">
          {options.map(option => (
            <button
              key={option.type}
              type="button"
              onClick={() => handleSelect(option.type)}
              className={cn(
                'group flex-1 rounded-[11px] border p-6 text-left transition-all',
                'hover:border-[#062E25] hover:shadow-lg',
                multiPlanningType === option.type
                  ? 'border-[#062E25] bg-[#F5F7EE]'
                  : 'border-[#546963]/50 bg-white/60'
              )}
            >
              <h3 className="text-lg font-medium text-[#062E25]">
                {t(option.titleKey)}
              </h3>
              <p className="mt-2 text-sm font-light text-[#062E25]/70 tracking-tight">
                {t(option.descKey)}
              </p>
            </button>
          ))}
        </div>

        <div
          className="fixed bottom-0 left-0 right-0 z-50 flex justify-end gap-4 px-6 py-4"
          style={{
            background: 'rgba(234, 237, 223, 0.85)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <Button
            variant="outline"
            style={{ borderColor: '#062E25', color: '#062E25' }}
            onClick={handleBack}
          >
            {tNav('back')}
          </Button>
        </div>
      </div>
    </div>
  )
}
