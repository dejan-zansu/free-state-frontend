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
    image: '/images/solar-abo-home-package.png',
    hasGlow: true,
    bgColor: '#F5F7EE',
    imageClassName: 'w-[215px] h-[156px] bottom-0 hidden md:block',
  },
  {
    type: 'apartment',
    tagKey: 'multi.tag',
    titleKey: 'multi.title',
    bullets: ['multi.bullet1', 'multi.bullet2'],
    image: '/images/solar-abo-multi-package.png',
    hasGlow: false,
    bgColor: '#EEEFE5',
    imageClassName: 'w-[235px] h-[176px] bottom-0 hidden md:block',
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

  const toSentenceCase = (text: string) =>
    text.length > 0 ? text.charAt(0).toLowerCase() + text.slice(1) : text

  const getDescription = (descriptionKeys: string[]) => {
    const [firstKey, secondKey] = descriptionKeys
    if (!firstKey) return ''
    if (!secondKey) return t(firstKey)

    const first = t(firstKey)
    const second = toSentenceCase(t(secondKey))
    const connector = second.startsWith('with ') ? ' ' : ' and '

    return `${first}${connector}${second}`
  }

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
      <div className="flex flex-col items-center px-4 py-6 pb-24 sm:justify-center sm:min-h-full sm:py-12">
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
              className="group relative flex-1 min-h-[172px] overflow-visible rounded-[11px] border border-[#546963]/50 px-4 pb-4 pt-3 text-left transition-all duration-300 ease-out hover:scale-[1.03] hover:border-[#062E25] hover:shadow-lg sm:h-[156px] sm:min-h-0 sm:p-0"
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

              <div className="absolute top-0 left-4 z-10 -translate-y-1/2 sm:left-[18px]">
                <span className="inline-block rounded-full bg-[#B7FE1A] px-3 py-1 text-[13px] sm:px-4 sm:py-[6px] sm:text-[16px] font-light text-[#062E25] tracking-tight backdrop-blur-[65px]">
                  {t(pkg.tagKey)}
                </span>
              </div>

              <div className="relative z-10 mt-3 mr-[84px] overflow-hidden sm:absolute sm:left-[18px] sm:right-[196px] sm:top-[40px] sm:mt-0 sm:mr-0">
                <h2 className="text-[17px] sm:text-[22px] font-medium text-[#062E25] leading-tight">
                  {t(pkg.titleKey, { model: modelLabel })}
                </h2>
              </div>

              <p className="relative z-10 mt-[10px] mr-[84px] text-sm font-light tracking-tight text-[#062E25]/80 sm:absolute sm:left-[18px] sm:right-[196px] sm:top-[73px] sm:mt-0 sm:mr-0">
                {getDescription(pkg.bullets)}
              </p>

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

        <p className="mt-5 text-sm font-light text-[#062E25]/60 tracking-tight">
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
