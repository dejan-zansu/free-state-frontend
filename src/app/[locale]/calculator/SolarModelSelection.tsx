'use client'

import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

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
}[] = [
  {
    model: 'solar-abo',
    tagKey: 'solarAbo.tag',
    titleKey: 'solarAbo.title',
    bullets: ['solarAbo.bullet1', 'solarAbo.bullet2'],
    image: '/images/calculator/solar-abo-card-11b71d.png',
    hasGlow: true,
    bgColor: '#F5F7EE',
    imageClassName: 'w-[110px] h-[160px] -top-6 sm:-top-10 sm:w-[232px] sm:h-[200px]',
  },
  {
    model: 'solar-direct',
    tagKey: 'solarDirect.tag',
    titleKey: 'solarDirect.title',
    bullets: ['solarDirect.bullet1', 'solarDirect.bullet2'],
    image: '/images/calculator/solar-direct-card-5141e7.png',
    hasGlow: false,
    bgColor: '#EEEFE5',
    imageClassName: 'w-[120px] h-[175px] -top-10 sm:-top-16 sm:w-[250px] sm:h-[220px]',
  },
]

export default function SolarModelSelection() {
  const t = useTranslations('solarAboCalculator.modelSelection')
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

      <div className="flex flex-col sm:flex-row gap-8 sm:gap-5 w-full max-w-[830px] pt-5">
        {cards.map(card => (
          <button
            key={card.model}
            type="button"
            onClick={() => setSolarModel(card.model)}
            className="group relative flex-1 h-[156px] overflow-visible rounded-[11px] border border-[#546963]/50 text-left transition-all duration-300 ease-out hover:border-[#062E25] hover:shadow-lg hover:scale-[1.03]"
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

            <div className="absolute top-0 left-[18px] z-10 -translate-y-1/2">
              <span className="inline-block rounded-full bg-[#B7FE1A] px-3 py-1 text-[13px] sm:px-4 sm:py-[6px] sm:text-[16px] font-light text-[#062E25] tracking-tight backdrop-blur-[65px]">
                {t(card.tagKey)}
              </span>
            </div>

            <div className="absolute left-[14px] right-[110px] sm:left-[18px] sm:right-[240px] top-[50px] sm:top-[60px] z-10 overflow-hidden">
              <h2 className="text-[17px] sm:text-[22px] font-medium text-[#062E25] leading-tight">
                {t(card.titleKey)}
              </h2>
            </div>

            <div className="absolute left-[14px] right-[110px] sm:left-[18px] sm:right-[240px] top-[85px] sm:top-[93px] z-10 flex flex-col gap-[4px] sm:gap-[6px]">
              {card.bullets.map(bulletKey => (
                <div key={bulletKey} className="flex items-center gap-1">
                  <CheckIcon />
                  <span className="text-xs font-light text-[#062E25]/80 tracking-tight">
                    {t(bulletKey)}
                  </span>
                </div>
              ))}
            </div>

            <div className={cn('absolute right-0 z-0 pointer-events-none', card.imageClassName)}>
              <Image
                src={card.image}
                alt={t(card.titleKey)}
                fill
                className="object-contain object-top-right"
              />
            </div>
          </button>
        ))}
      </div>

      <p className="mt-5 text-xs font-light text-[#062E25]/60 tracking-tight">
        {t('learnMorePrefix')}{' '}
        <Link
          href="/solar-abo"
          className="underline underline-offset-2 hover:text-[#062E25] transition-colors"
        >
          {t('learnMoreSolarAbo')}
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
