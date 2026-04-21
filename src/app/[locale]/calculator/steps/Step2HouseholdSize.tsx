'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  useSolarAboCalculatorStore,
  type HouseholdSize,
} from '@/stores/solar-abo-calculator.store'

const householdOptions: { size: HouseholdSize; labelKey: string; image: string }[] = [
  { size: 1, labelKey: '1', image: '/images/calculator/household/1.webp' },
  { size: 2, labelKey: '2', image: '/images/calculator/household/2.webp' },
  { size: 3, labelKey: '3', image: '/images/calculator/household/3.webp' },
  { size: 4, labelKey: '4', image: '/images/calculator/household/4.webp' },
  { size: 5, labelKey: '5', image: '/images/calculator/household/5.webp' },
]

export default function Step2HouseholdSize() {
  const t = useTranslations('solarAboCalculator.step3')
  const tNav = useTranslations('solarAboCalculator.navigation')
  const { householdSize, setHouseholdSize, setSolarModel, nextStep } =
    useSolarAboCalculatorStore()

  const handleSelect = (size: HouseholdSize) => {
    setHouseholdSize(size)
    nextStep()
  }

  return (
    <div>
      <div className="flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-[45px] font-medium text-[#062E25]">
            {t('title')}
          </h1>
          <p className="mt-5 text-base sm:text-[22px] font-light text-[#062E25]/80 tracking-tight">
            {t('helper')}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2.5">
          {householdOptions.map(option => (
            <button
              key={option.size}
              type="button"
              onClick={() => handleSelect(option.size)}
              className={cn(
                'group flex flex-col items-center justify-start w-[260px] h-[232px] rounded-[20px] border pt-5 pb-5 transition-all bg-[#F5F7EE]',
                'hover:border-[#062E25] hover:shadow-md',
                householdSize === option.size
                  ? 'border-[#062E25] shadow-md'
                  : 'border-[#809792]'
              )}
            >
              <div
                className={cn(
                  'w-[142px] h-[142px] rounded-full overflow-hidden border',
                  householdSize === option.size
                    ? 'border-[#B7FE1A]'
                    : 'border-[#B7FE1A]'
                )}
              >
                <Image
                  src={option.image}
                  alt={t(`options.${option.labelKey}`)}
                  width={142}
                  height={142}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              </div>
              <div className="flex items-center gap-2 mt-5">
                <span className="text-base text-[#062E25] capitalize">
                  {t(`options.${option.labelKey}`)}
                </span>
                <svg width="4" height="6" viewBox="0 0 4 6" fill="none">
                  <path
                    d="M1 1l2 2-2 2"
                    stroke="#062E25"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
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
            onClick={() => setSolarModel(null)}
            style={{ borderColor: '#062E25', color: '#062E25' }}
          >
            {tNav('back')}
          </Button>
        </div>
      </div>
    </div>
  )
}
