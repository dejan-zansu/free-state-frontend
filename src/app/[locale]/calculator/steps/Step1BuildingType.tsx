'use client'

import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  useSolarAboCalculatorStore,
  type BuildingType,
} from '@/stores/solar-abo-calculator.store'

const CheckIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 13 13"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12.5463 6.49902C12.5463 3.15972 9.8393 0.452687 6.5 0.452687C3.1607 0.452687 0.453671 3.15972 0.453671 6.49902C0.453671 9.83831 3.1607 12.5453 6.5 12.5453C9.8393 12.5453 12.5463 9.83831 12.5463 6.49902Z"
      stroke="#295823"
      strokeWidth="0.9"
    />
    <path
      d="M4.08107 6.80054L5.59266 8.31213L8.91814 4.68433"
      stroke="#295823"
      strokeWidth="0.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const packages: {
  type: BuildingType
  tagKey: string
  titleKey: string
  bullets: string[]
  image: string
  hasGlow: boolean
  bgColor: string
  imageClassName: string
}[] = [
  {
    type: 'single_family',
    tagKey: 'home.tag',
    titleKey: 'home.title',
    bullets: ['home.bullet1', 'home.bullet2'],
    image: '/images/calculator/package-home-1d3295.png',
    hasGlow: true,
    bgColor: '#F5F7EE',
    imageClassName:
      'w-[110px] h-[150px] -top-4 sm:-top-8 sm:w-[215px] sm:h-[180px]',
  },
  {
    type: 'apartment',
    tagKey: 'multi.tag',
    titleKey: 'multi.title',
    bullets: ['multi.bullet1', 'multi.bullet2'],
    image: '/images/calculator/package-multi-28f430.png',
    hasGlow: false,
    bgColor: '#EEEFE5',
    imageClassName:
      'w-[120px] h-[160px] -top-6 sm:-top-10 sm:w-[233px] sm:h-[200px]',
  },
]

export default function Step1BuildingType() {
  const t = useTranslations('solarAboCalculator.step1Packages')
  const tNav = useTranslations('solarAboCalculator.navigation')
  const {
    solarModel,
    setBuildingType,
    nextStep,
    setSolarModel,
    setShowMultiInterstitial,
  } = useSolarAboCalculatorStore()

  const modelLabel = solarModel === 'solar-direct' ? 'SolarDirect' : 'SolarAbo'

  const handleSelect = (type: BuildingType) => {
    setBuildingType(type)
    if (type === 'apartment') {
      setShowMultiInterstitial(true)
    } else {
      nextStep()
    }
  }

  const handleBack = () => {
    setSolarModel(null)
  }

  return (
    <div>
      <div className="flex flex-col items-center px-4 py-6 sm:justify-center sm:py-12">
        <div className="text-center mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-[45px] font-medium text-[#062E25]">
            {t('title', { model: modelLabel })}
          </h1>
          <p className="mt-3 text-base sm:mt-5 sm:text-[22px] font-light text-[#062E25]/80 tracking-tight">
            {t('subtitle')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-8 sm:gap-5 w-full max-w-[830px] pt-5">
          {packages.map(pkg => (
            <button
              key={pkg.type}
              type="button"
              onClick={() => handleSelect(pkg.type)}
              className="group relative flex-1 h-[156px] overflow-visible rounded-[11px] border border-[#546963]/50 text-left transition-all duration-300 ease-out hover:border-[#062E25] hover:shadow-lg hover:scale-[1.03]"
              style={{ backgroundColor: pkg.bgColor }}
            >
              {pkg.hasGlow && (
                <div
                  className="absolute -top-[50px] right-0 w-[237px] h-[237px] rounded-full pointer-events-none"
                  style={{
                    background: 'rgba(183, 254, 26, 0.2)',
                    filter: 'blur(161px)',
                  }}
                />
              )}

              <div className="absolute top-0 left-[18px] z-10 -translate-y-1/2">
                <span className="inline-block rounded-full bg-[#B7FE1A] px-3 py-1 text-[13px] sm:px-4 sm:py-[6px] sm:text-[16px] font-light text-[#062E25] tracking-tight backdrop-blur-[65px]">
                  {t(pkg.tagKey)}
                </span>
              </div>

              <div className="absolute left-[14px] right-[110px] sm:left-[18px] sm:right-[240px] top-[50px] sm:top-[60px] z-10 overflow-hidden">
                <h2 className="text-[17px] sm:text-[20px] font-medium text-[#062E25] leading-tight">
                  {t(pkg.titleKey, { model: modelLabel })}
                </h2>
              </div>

              <div className="absolute left-[14px] right-[110px] sm:left-[18px] sm:right-[240px] top-[85px] sm:top-[93px] z-10 flex flex-col gap-[4px] sm:gap-[6px]">
                {pkg.bullets.map(bulletKey => (
                  <div key={bulletKey} className="flex items-center gap-1">
                    <span className="shrink-0"><CheckIcon /></span>
                    <span className="text-xs font-light text-[#062E25]/80 tracking-tight">
                      {t(bulletKey)}
                    </span>
                  </div>
                ))}
              </div>

              <div
                className={cn(
                  'absolute right-0 z-0 pointer-events-none',
                  pkg.imageClassName
                )}
              >
                <Image
                  src={pkg.image}
                  alt={t(pkg.titleKey, { model: modelLabel })}
                  fill
                  className="object-contain object-top-right"
                />
              </div>
            </button>
          ))}
        </div>

        <p className="mt-5 text-xs font-light text-[#062E25]/60 tracking-tight">
          {t('learnMorePrefix')}{' '}
          {solarModel === 'solar-direct' ? (
            <Link
              href="/solar-direct"
              className="underline underline-offset-2 hover:text-[#062E25] transition-colors"
            >
              {t('learnMoreSolarDirect')}
            </Link>
          ) : (
            <>
              <Link
                href="/solar-abo/solar-abo-home"
                className="underline underline-offset-2 hover:text-[#062E25] transition-colors"
              >
                {t('learnMoreHome', { model: modelLabel })}
              </Link>
              {` ${t('learnMoreConnector')} `}
              <Link
                href="/solar-abo/solar-abo-multi"
                className="underline underline-offset-2 hover:text-[#062E25] transition-colors"
              >
                {t('learnMoreMulti', { model: modelLabel })}
              </Link>
            </>
          )}
        </p>

        <div
          className="fixed bottom-0 left-0 right-0 z-50 flex justify-end gap-3 px-6 py-4"
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
