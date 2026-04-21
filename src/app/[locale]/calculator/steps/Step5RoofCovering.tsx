'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import {
  useSolarAboCalculatorStore,
  type RoofCoveringType,
} from '@/stores/solar-abo-calculator.store'
import { cn } from '@/lib/utils'

interface RoofOption {
  type: RoofCoveringType
  image: string
  labelKey: string
}

const pitchedOptions: RoofOption[] = [
  { type: 'tiled', image: '/images/calculator/roof/tiled.webp', labelKey: 'tiled' },
  { type: 'tin', image: '/images/calculator/roof/tin.webp', labelKey: 'tin' },
  { type: 'slate', image: '/images/calculator/roof/slate.webp', labelKey: 'slate' },
  { type: 'fiber_cement', image: '/images/calculator/roof/fiber-cement.webp', labelKey: 'fiberCement' },
  { type: 'other', image: '/images/calculator/roof/other.webp', labelKey: 'other' },
]

const flatOptions: RoofOption[] = [
  { type: 'gravel', image: '/images/calculator/roof/other.webp', labelKey: 'gravel' },
  { type: 'substrate', image: '/images/calculator/roof/other.webp', labelKey: 'substrate' },
  { type: 'bitumen', image: '/images/calculator/roof/other.webp', labelKey: 'bitumen' },
  { type: 'membrane', image: '/images/calculator/roof/other.webp', labelKey: 'membrane' },
  { type: 'other', image: '/images/calculator/roof/other.webp', labelKey: 'other' },
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
      <div className="flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-8 max-w-[616px]">
          <h1 className="text-3xl sm:text-[45px] font-medium text-[#062E25]">
            {t('title')}
          </h1>
          <p className="mt-5 text-base sm:text-[22px] font-light text-[#062E25]/80 tracking-tight">
            {roofType === 'flat' ? t('helperFlat') : t('helper')}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2.5 max-w-[1340px]">
          {options.map(option => (
            <button
              key={`${option.type}-${option.labelKey}`}
              type="button"
              onClick={() => handleSelect(option.type)}
              className={cn(
                'group relative flex flex-col w-[260px] h-[232px] rounded-[20px] border overflow-hidden transition-all bg-[#F5F7EE]',
                'hover:border-[#062E25] hover:shadow-md',
                roofCovering === option.type
                  ? 'border-[#062E25] shadow-md'
                  : 'border-[#809792]'
              )}
            >
              <div className="relative w-full h-[162px]">
                <Image
                  src={option.image}
                  alt={t(`options.${option.labelKey}`)}
                  fill
                  className="object-cover"
                  sizes="260px"
                  unoptimized
                />
              </div>
              <div className="flex flex-1 items-center justify-center gap-2">
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
            onClick={prevStep}
            style={{ borderColor: '#062E25', color: '#062E25' }}
          >
            {tNav('back')}
          </Button>
        </div>
      </div>
    </div>
  )
}
