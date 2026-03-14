'use client'

import { Minus, Plus } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  useSolarAboCalculatorStore,
  type HouseholdSize,
} from '@/stores/solar-abo-calculator.store'

const householdOptions: {
  size: HouseholdSize
  labelKey: string
  icon: React.ReactNode
}[] = [
  {
    size: 1,
    labelKey: '1',
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="16" cy="10" r="5" stroke="#062E25" strokeWidth="1.5" />
        <path
          d="M6 27c0-5.523 4.477-10 10-10s10 4.477 10 10"
          stroke="#062E25"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    size: 2,
    labelKey: '2',
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12" cy="10" r="4.5" stroke="#062E25" strokeWidth="1.5" />
        <circle cx="22" cy="12" r="3.5" stroke="#062E25" strokeWidth="1.5" />
        <path
          d="M3 27c0-5 3.582-9 8-9s8 4 8 9"
          stroke="#062E25"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M22 18c3.314 0 6 2.686 6 6"
          stroke="#062E25"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    size: 3,
    labelKey: '3',
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="16" cy="9" r="4" stroke="#062E25" strokeWidth="1.5" />
        <circle cx="6" cy="13" r="3" stroke="#062E25" strokeWidth="1.5" />
        <circle cx="26" cy="13" r="3" stroke="#062E25" strokeWidth="1.5" />
        <path
          d="M8 27c0-4.418 3.582-8 8-8s8 3.582 8 8"
          stroke="#062E25"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M3 27c0-2.761 1.343-5 3-5"
          stroke="#062E25"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M29 27c0-2.761-1.343-5-3-5"
          stroke="#062E25"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    size: 4,
    labelKey: '4',
    icon: (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="10" cy="9" r="3.5" stroke="#062E25" strokeWidth="1.5" />
        <circle cx="22" cy="9" r="3.5" stroke="#062E25" strokeWidth="1.5" />
        <circle cx="5" cy="16" r="2.5" stroke="#062E25" strokeWidth="1.5" />
        <circle cx="27" cy="16" r="2.5" stroke="#062E25" strokeWidth="1.5" />
        <path
          d="M4 27c0-3.866 2.686-7 6-7s6 3.134 6 7"
          stroke="#062E25"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M16 27c0-3.866 2.686-7 6-7s6 3.134 6 7"
          stroke="#062E25"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    size: 5,
    labelKey: '5',
    icon: (
      <svg
        width="26"
        height="26"
        viewBox="0 0 26 26"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="13" cy="5" r="3" stroke="#062E25" strokeWidth="1.3" />
        <circle cx="5" cy="8" r="2.5" stroke="#062E25" strokeWidth="1.3" />
        <circle cx="21" cy="8" r="2.5" stroke="#062E25" strokeWidth="1.3" />
        <circle cx="2.5" cy="14" r="2" stroke="#062E25" strokeWidth="1.3" />
        <circle cx="23.5" cy="14" r="2" stroke="#062E25" strokeWidth="1.3" />
        <path
          d="M7 23c0-3.314 2.686-6 6-6s6 2.686 6 6"
          stroke="#062E25"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <path
          d="M1 23c0-2.209 1.791-4 4-4"
          stroke="#062E25"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <path
          d="M25 23c0-2.209-1.791-4-4-4"
          stroke="#062E25"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
]

function ApartmentCountPicker() {
  const t = useTranslations('solarAboCalculator.apartmentCount')
  const tNav = useTranslations('solarAboCalculator.navigation')
  const { apartmentCount, setApartmentCount, nextStep, prevStep } =
    useSolarAboCalculatorStore()

  return (
    <div>
      <div className="container mx-auto px-4 pt-8 pb-16 max-w-2xl">
        <div className="flex flex-col sm:flex-row items-start gap-8 mt-12">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-medium text-[#062E25]">
              {t('title')}
            </h1>
          </div>

          <div className="w-full sm:w-auto">
            <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col items-center gap-2">
              <span className="text-sm text-[#062E25]/60">*</span>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setApartmentCount(apartmentCount - 1)}
                  disabled={apartmentCount <= 2}
                  className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#7BB5A8] text-[#7BB5A8] transition-colors hover:bg-[#7BB5A8]/10 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Minus className="h-5 w-5" />
                </button>

                <div className="flex h-14 w-20 items-center justify-center border-2 border-[#062E25] rounded-md">
                  <span className="text-2xl font-medium text-[#062E25]">
                    {apartmentCount}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setApartmentCount(apartmentCount + 1)}
                  className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#7BB5A8] text-[#7BB5A8] transition-colors hover:bg-[#7BB5A8]/10"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          className="fixed bottom-0 left-0 right-0 z-50 flex justify-end gap-4 px-6 py-4"
          style={{
            background: 'rgba(234, 237, 223, 0.85)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <Button variant="outline" onClick={prevStep} style={{ borderColor: "#062E25", color: "#062E25" }}>
            {tNav('back')}
          </Button>
          <Button
            className="bg-[#062E25] text-white hover:bg-[#062E25]/90"
            onClick={nextStep}
          >
            {tNav('next')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function Step2HouseholdSize() {
  const t = useTranslations('solarAboCalculator.step3')
  const tNav = useTranslations('solarAboCalculator.navigation')
  const {
    buildingType,
    multiPlanningType,
    householdSize,
    setHouseholdSize,
    nextStep,
    prevStep,
  } = useSolarAboCalculatorStore()

  if (buildingType === 'apartment' && multiPlanningType === 'all-parties') {
    return <ApartmentCountPicker />
  }

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
          <p className="mt-5 text-lg sm:text-[22px] font-light text-[#062E25]/80 tracking-tight">
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
                'group flex flex-col items-center gap-2.5 w-[130px] h-[112px] rounded-[20px] border pt-5 transition-all',
                'hover:border-[#062E25] hover:shadow-md',
                householdSize === option.size
                  ? 'bg-[#B7FE1A]/20 border-[#062E25]'
                  : 'bg-[#F5F7EE] border-[#809792]'
              )}
            >
              <div className="flex-shrink-0">{option.icon}</div>
              <div className="flex items-center gap-2">
                <span className="text-sm md:text-base text-[#062E25] capitalize">
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
          <Button variant="outline" onClick={prevStep} style={{ borderColor: "#062E25", color: "#062E25" }}>
            {tNav('back')}
          </Button>
        </div>
      </div>
    </div>
  )
}
