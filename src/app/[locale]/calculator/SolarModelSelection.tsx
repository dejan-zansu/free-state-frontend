'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { useSolarAboCalculatorStore, type SolarModel } from '@/stores/solar-abo-calculator.store'

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.5463 6.49902C12.5463 3.15972 9.8393 0.452687 6.5 0.452687C3.1607 0.452687 0.453671 3.15972 0.453671 6.49902C0.453671 9.83831 3.1607 12.5453 6.5 12.5453C9.8393 12.5453 12.5463 9.83831 12.5463 6.49902Z" stroke="#295823" strokeWidth="0.9"/>
    <path d="M4.08107 6.80054L5.59266 8.31213L8.91814 4.68433" stroke="#295823" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const cards: { model: SolarModel; tagKey: string; titleKey: string; bullets: string[]; image: string; hasGlow: boolean; bgColor: string }[] = [
  {
    model: 'solar-abo',
    tagKey: 'solarAbo.tag',
    titleKey: 'solarAbo.title',
    bullets: ['solarAbo.bullet1', 'solarAbo.bullet2'],
    image: '/images/calculator/solar-abo-card-11b71d.png',
    hasGlow: true,
    bgColor: '#F5F7EE',
  },
  {
    model: 'solar-direct',
    tagKey: 'solarDirect.tag',
    titleKey: 'solarDirect.title',
    bullets: ['solarDirect.bullet1', 'solarDirect.bullet2'],
    image: '/images/calculator/solar-direct-card-5141e7.png',
    hasGlow: false,
    bgColor: '#EEEFE5',
  },
]

export default function SolarModelSelection() {
  const t = useTranslations('solarAboCalculator.modelSelection')
  const { setSolarModel } = useSolarAboCalculatorStore()

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-[45px] font-medium text-[#062E25]">
          {t('title')}
        </h1>
        <p className="mt-5 text-lg sm:text-[22px] font-light text-[#062E25]/80 tracking-tight">
          {t('subtitle')}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-5 w-full max-w-[830px] pt-5">
        {cards.map((card) => (
          <button
            key={card.model}
            type="button"
            onClick={() => setSolarModel(card.model)}
            className="group relative flex-1 h-[156px] overflow-visible rounded-[11px] border border-[#546963]/50 text-left transition-all hover:border-[#062E25] hover:shadow-lg"
            style={{ backgroundColor: card.bgColor }}
          >
            {card.hasGlow && (
              <div
                className="absolute -top-[50px] right-0 w-[237px] h-[237px] rounded-full pointer-events-none"
                style={{ background: 'rgba(183, 254, 26, 0.2)', filter: 'blur(161px)' }}
              />
            )}

            <div className="absolute top-0 left-[18px] z-10 -translate-y-1/2">
              <span className="inline-block rounded-full bg-[#B7FE1A] px-4 py-[6px] text-[16px] font-light text-[#062E25] tracking-tight backdrop-blur-[65px]">
                {t(card.tagKey)}
              </span>
            </div>

            <div className="absolute left-[18px] top-[60px] z-10">
              <h2 className="text-[22px] font-medium text-[#062E25]">
                {t(card.titleKey)}
              </h2>
            </div>

            <div className="absolute left-[18px] top-[93px] z-10 flex flex-col gap-[6px]">
              {card.bullets.map((bulletKey) => (
                <div key={bulletKey} className="flex items-center gap-1">
                  <CheckIcon />
                  <span className="text-xs font-light text-[#062E25]/80 tracking-tight">
                    {t(bulletKey)}
                  </span>
                </div>
              ))}
            </div>

            <div className="absolute right-0 -top-4 bottom-0 w-[232px] z-0 pointer-events-none">
              <Image
                src={card.image}
                alt={t(card.titleKey)}
                fill
                className="object-cover object-top"
              />
            </div>

            <div className="absolute left-[18px] bottom-[14px] z-10">
              <div className="flex items-center gap-1 text-[#062E25] group-hover:gap-2 transition-all">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </button>
        ))}
      </div>

      <p className="mt-5 text-xs font-light text-[#062E25]/60 tracking-tight">
        {t('learnMore')}
      </p>
    </div>
  )
}
