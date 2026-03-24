'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  useSolarAboCalculatorStore,
  type HighPowerDevices,
} from '@/stores/solar-abo-calculator.store'

const deviceOptions: {
  key: keyof HighPowerDevices
  labelKey: string
  image: string
}[] = [
  {
    key: 'heatPumpHeating',
    labelKey: 'heatPumpHeating',
    image: '/images/calculator/devices/heat-pump.svg',
  },
  {
    key: 'electricHeating',
    labelKey: 'electricHeating',
    image: '/images/calculator/devices/electric-heating.svg',
  },
  {
    key: 'electricBoiler',
    labelKey: 'electricBoiler',
    image: '/images/calculator/devices/electric-boiler.svg',
  },
  {
    key: 'evChargingStation',
    labelKey: 'evChargingStation',
    image: '/images/calculator/devices/ev-station.svg',
  },
  {
    key: 'swimmingPoolSauna',
    labelKey: 'swimmingPoolSauna',
    image: '/images/calculator/devices/pool-sauna.svg',
  },
]

export default function Step3Devices() {
  const t = useTranslations('solarAboCalculator.step4')
  const tNav = useTranslations('solarAboCalculator.navigation')
  const { devices, setDevice, prevStep, nextStep } =
    useSolarAboCalculatorStore()

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
          {deviceOptions.map(option => {
            const isSelected = devices[option.key]
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => setDevice(option.key, !isSelected)}
                className={cn(
                  'group relative flex flex-col items-center w-[260px] h-[232px] rounded-[20px] border pt-5 transition-all bg-[#F5F7EE]',
                  'hover:border-[#062E25] hover:shadow-md',
                  isSelected ? 'border-[#062E25]' : 'border-[#809792]'
                )}
              >
                <div
                  className={cn(
                    'absolute top-3 right-3 w-5 h-5 rounded-full border flex items-center justify-center transition-all',
                    isSelected
                      ? 'bg-[#B7FE1A] border-[#B7FE1A]'
                      : 'bg-transparent border-[#809792]'
                  )}
                >
                  {isSelected && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path
                        d="M1 4L3.5 6.5L9 1"
                        stroke="#062E25"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>

                <div className="w-[142px] h-[142px] shrink-0">
                  <Image
                    src={option.image}
                    alt={t(`devices.${option.labelKey}`)}
                    width={142}
                    height={142}
                    unoptimized
                  />
                </div>
                <div className="flex items-center gap-2.5 mt-5">
                  <span className="text-sm md:text-base text-[#062E25] capitalize">
                    {t(`devices.${option.labelKey}`)}
                  </span>
                </div>
              </button>
            )
          })}
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
