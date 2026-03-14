'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import {
  useSolarAboCalculatorStore,
  type HighPowerDevices,
} from '@/stores/solar-abo-calculator.store'
import { cn } from '@/lib/utils'

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
                  'group flex flex-col items-center w-[260px] h-[232px] rounded-[20px] border pt-5 transition-all',
                  'hover:border-[#062E25] hover:shadow-md',
                  isSelected
                    ? 'bg-[#B7FE1A]/20 border-[#B7FE1A]'
                    : 'bg-[#F5F7EE] border-[#809792]'
                )}
              >
                <div className="w-[142px] h-[142px] flex-shrink-0">
                  <Image
                    src={option.image}
                    alt={t(`devices.${option.labelKey}`)}
                    width={142}
                    height={142}
                  />
                </div>
                <div className="flex items-center gap-2.5 mt-5">
                  <span className="text-[18px] text-[#062E25] capitalize">
                    {t(`devices.${option.labelKey}`)}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        <div className="fixed bottom-6 right-6 z-50 flex gap-4">
          <Button variant="outline" onClick={prevStep}>
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
