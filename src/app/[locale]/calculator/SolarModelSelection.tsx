'use client'

import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'

import {
  useSolarAboCalculatorStore,
  type SolarModel,
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

const cards: {
  model: SolarModel
  tagKey: string
  titleKey: string
  bullets: string[]
  image: string
  hasGlow: boolean
  bgColor: string
  imageClassName: string
  disabled?: boolean
}[] = [
  {
    model: 'solar-free',
    tagKey: 'solarAbo.tag',
    titleKey: 'solarAbo.title',
    bullets: ['solarAbo.bullet1', 'solarAbo.bullet2'],
    image: '/images/calculator/solar-abo-card-11b71d.webp',
    hasGlow: true,
    bgColor: '#F5F7EE',
    imageClassName:
      'w-[86px] h-[124px] -top-2 sm:-top-9 sm:w-[198px] sm:h-[170px] hidden md:block',
  },
  {
    model: 'solar-abo',
    tagKey: 'solarAboPlan.tag',
    titleKey: 'solarAboPlan.title',
    bullets: ['solarAboPlan.bullet1', 'solarAboPlan.bullet2'],
    image: '/images/solar-direct.png',
    hasGlow: false,
    bgColor: '#EEF2E9',
    imageClassName:
      'w-[92px] h-[134px] -top-4 sm:-top-12 sm:w-[212px] sm:h-[185px] hidden md:block',
  },
  {
    model: 'solar-direct',
    tagKey: 'solarDirect.tag',
    titleKey: 'solarDirect.title',
    bullets: ['solarDirect.bullet1', 'solarDirect.bullet2'],
    image: '/images/calculator/solar-direct-card-5141e7.png',
    hasGlow: false,
    bgColor: '#EEEFE5',
    imageClassName:
      'w-[92px] h-[134px] -top-4 sm:-top-12 sm:w-[212px] sm:h-[185px] hidden md:block',
  },
]

export default function SolarModelSelection() {
  const t = useTranslations('solarAboCalculator.modelSelection')
  const tCommon = useTranslations('common')
  const { setSolarModel } = useSolarAboCalculatorStore()

  return (
    <div className="flex flex-col items-center px-4 py-6 sm:justify-center sm:min-h-full sm:py-12">
      <div className="text-center mb-6 sm:mb-10">
        <h1 className="text-2xl sm:text-[45px] font-medium text-[#062E25]">
          {t('title')}
        </h1>
        <p className="mt-3 text-base sm:mt-5 sm:text-[22px] font-light text-[#062E25]/80 tracking-tight">
          {t('subtitle')}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-5 w-full max-w-[1100px] pt-5">

        {cards.map(card => (
          <button
            key={card.model}
            type="button"
            onClick={() => {
              if (card.disabled) return
              setSolarModel(card.model)
            }}
            disabled={card.disabled}
            aria-disabled={card.disabled}
            title={card.disabled ? tCommon('comingSoon') : undefined}
            className={cn(
              'group relative flex-1 overflow-visible rounded-[11px] border border-[#546963]/50 p-4 sm:p-[18px] text-left transition-all duration-300 ease-out',
              card.disabled
                ? 'cursor-not-allowed opacity-60 grayscale-25'
                : 'hover:scale-[1.03] hover:border-[#062E25] hover:shadow-lg'
            )}
            style={{ backgroundColor: card.bgColor }}
          >
            {card.hasGlow && (
              <div
                className="absolute -top-[50px] right-0 w-[237px] h-[237px] rounded-full pointer-events-none"
                style={{
                  background: 'rgba(183, 254, 26, 0.2)',
                  filter: 'blur(161px)',
                }}
              />
            )}

            <div className="absolute top-0 left-4 sm:left-[18px] z-10 -translate-y-1/2 flex items-center gap-2">
              <span className="inline-block rounded-full bg-[#B7FE1A] px-3 py-1 text-sm font-light text-[#062E25] tracking-tight backdrop-blur-[65px] sm:px-4 sm:py-[6px] sm:text-[16px]">
                {t(card.tagKey)}
              </span>
              {card.disabled && (
                <span className="inline-block rounded-full bg-[#062E25] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white sm:px-3.5 sm:py-[5px] sm:text-[11px]">
                  {tCommon('comingSoon')}
                </span>
              )}
            </div>

            <div className="relative z-10 flex items-start gap-3 pt-2">
              <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                <h2 className="text-[17px] sm:text-[22px] font-medium text-[#062E25]">
                  {t(card.titleKey)}
                </h2>
                <div className="flex flex-col gap-1.5">
                  {card.bullets.map(bulletKey => (
                    <div key={bulletKey} className="flex items-center gap-1.5">
                      <span className="shrink-0">
                        <CheckIcon />
                      </span>
                      <span className="whitespace-nowrap text-sm font-light text-[#062E25]/80 tracking-tight">
                        {t(bulletKey)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative hidden md:block shrink-0 w-[68px] h-[60px] lg:w-[84px] lg:h-[74px]">
                <Image
                  src={card.image}
                  alt={t(card.titleKey)}
                  fill
                  className="object-contain object-top"
                  unoptimized
                />
              </div>
            </div>
          </button>
        ))}
      </div>

      <p className="mt-5 text-sm font-light text-[#062E25]/60 tracking-tight">
        {t('learnMorePrefix')}{' '}
        <Link
          href="/solar-free"
          className="underline underline-offset-2 hover:text-[#062E25] transition-colors"
        >
          {t('learnMoreSolarAbo')}
        </Link>
        {`, `}
        <Link
          href="/solar-abo"
          className="underline underline-offset-2 hover:text-[#062E25] transition-colors"
        >
          {t('learnMoreSolarAboPlan')}
        </Link>
        {` ${t('learnMoreConnector')} `}
        <Link
          href="/solar-direct"
          className="underline underline-offset-2 hover:text-[#062E25] transition-colors"
        >
          {t('learnMoreSolarDirect')}
        </Link>
      </p>
    </div>
  )
}
