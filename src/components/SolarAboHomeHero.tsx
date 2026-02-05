import { LinkButton } from '@/components/ui/link-button'
import { DollarSign, Settings, TrendingDown } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { CO2ReductionIcon, MoneySignIcon, SaleIcon, ShieldIcon } from './icons'
import ReductionIcon from './icons/ReductionIcon'

interface SolarAboHomeHeroProps {
  imageSrc?: string
  imageAlt?: string
}

const SolarAboHomeHero = async ({
  imageSrc = '/images/solar-abo-home.png',
  imageAlt = 'SolarAbo Home',
}: SolarAboHomeHeroProps = {}) => {
  const t = await getTranslations('solarAboHome.hero')
  const locale = await getLocale()

  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden bg-[#FDFFF5]">
      <div className="relative z-10 max-w-[1440px] mx-auto w-full px-4 sm:px-6 pt-[138px] pb-1">
        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center gap-5 mb-12 sm:mb-16 lg:mb-20 w-full">
            <div
              className="flex items-center justify-center px-4 py-[10px] rounded-[20px] border border-[#062E25]"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(65px)',
              }}
            >
              <span className="text-[#062E25] text-base font-medium leading-[14px] text-center">
                {t('eyebrow')}
              </span>
            </div>

            <h1 className="text-[#17302A] text-4xl sm:text-5xl md:text-6xl lg:text-[70px] font-medium text-center tracking-tight">
              {t('title')}
            </h1>

            <p className="text-[#17302A]/80 text-base sm:text-lg md:text-xl lg:text-[22px] font-normal leading-[1.36em] text-center">
              {t('subtitle')}
            </p>

            <div>
              <LinkButton href="/calculator" locale={locale}>
                {t('cta')}
              </LinkButton>
            </div>

            <p className="text-[#17302A]/80 text-sm sm:text-base font-medium leading-[1.875em] text-center italic">
              {t('tag')}
            </p>
          </div>

          <div className="relative w-full max-w-[666px] aspect-666/498 mx-auto">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="hidden lg:flex absolute left-[30px] top-[641px] flex-col gap-10">
          <div className="flex items-center gap-5">
            <div className="w-[71px] h-[71px] flex-none order-0 grow-0 flex items-center justify-center bg-solar rounded-full">
              <MoneySignIcon className="text-[#062E25]" />
            </div>
            <p className="text-[#062E25]/80 text-[22px] font-medium leading-[1.09em] text-left whitespace-pre-line">
              {t('stats.left.investment')}
            </p>
          </div>
          <div className="flex items-center gap-5">
            <div className="w-[71px] h-[71px] flex-none order-0 grow-0 flex items-center justify-center bg-solar rounded-full">
              <SaleIcon />
            </div>
            <p className="text-[#062E25]/80 text-[22px] font-medium leading-[1.09em] text-left whitespace-pre-line">
              {t('stats.left.electricity')}
            </p>
          </div>
        </div>

        <div className="hidden lg:flex absolute right-[30px] top-[641px] flex-col gap-10 items-end">
          <div className="flex items-center gap-5 flex-row-reverse">
            <div className="w-[71px] h-[71px] flex-none order-0 grow-0 flex items-center justify-center bg-solar rounded-full">
              <ShieldIcon />
            </div>
            <p className="text-[#062E25]/80 text-[22px] font-medium leading-[1.09em] text-right whitespace-pre-line">
              {t('stats.right.maintenance')}
            </p>
          </div>
          <div className="flex items-center gap-5 flex-row-reverse">
            <div className="w-[71px] h-[71px] flex-none order-0 grow-0 flex items-center justify-center bg-solar rounded-full">
              <CO2ReductionIcon />
            </div>
            <p className="text-[#062E25]/80 text-[22px] font-medium leading-[1.09em] text-right whitespace-pre-line">
              {t('stats.right.reduction')}
            </p>
          </div>
        </div>

        <div className="lg:hidden w-full mt-8 space-y-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
                  <DollarSign
                    className="w-6 h-6 sm:w-8 sm:h-8 text-[#062E25]"
                    strokeWidth={1.5}
                  />
                </div>
                <p className="text-[#062E25]/80 text-base sm:text-lg font-medium leading-[1.09em] whitespace-pre-line">
                  {t('stats.left.investment')}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
                  <TrendingDown
                    className="w-6 h-6 sm:w-8 sm:h-8 text-[#062E25]"
                    strokeWidth={1.5}
                  />
                </div>
                <p className="text-[#062E25]/80 text-base sm:text-lg font-medium leading-[1.09em] whitespace-pre-line">
                  {t('stats.left.electricity')}
                </p>
              </div>
            </div>

            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-4 flex-row-reverse sm:flex-row">
                <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
                  <Settings
                    className="w-6 h-6 sm:w-8 sm:h-8 text-[#062E25]"
                    strokeWidth={1.5}
                  />
                </div>
                <p className="text-[#062E25]/80 text-base sm:text-lg font-medium leading-[1.09em] text-right sm:text-left whitespace-pre-line">
                  {t('stats.right.maintenance')}
                </p>
              </div>
              <div className="flex items-center gap-4 flex-row-reverse sm:flex-row">
                <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
                  <ReductionIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <p className="text-[#062E25]/80 text-base sm:text-lg font-medium leading-[1.09em] text-right sm:text-left whitespace-pre-line">
                  {t('stats.right.reduction')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-px opacity-20"
        style={{
          background:
            'linear-gradient(54deg, rgba(6, 46, 37, 1) 74%, rgba(3, 107, 83, 1) 100%)',
        }}
      />
    </section>
  )
}

export default SolarAboHomeHero
