import { LinkButton } from '@/components/ui/link-button'
import HeroNavLight from '@/components/HeroNavLight'
import { cn } from '@/lib/utils'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { CO2ReductionIcon, MoneySignIcon, SaleIcon, ShieldIcon } from '../icons'

export interface SolarAboHeroProps {
  translationNamespace: string
  imageSrc: string
  imageAlt?: string
  isCommercial?: boolean
  elipseClassNames?: string
}

interface StatItemProps {
  icon: React.ReactNode
  mobileIcon: React.ReactNode
  text: string
  align: 'left' | 'right'
  isCommercial: boolean
}

const StatItem = ({
  icon,
  mobileIcon,
  text,
  align,
  isCommercial,
}: StatItemProps) => {
  const iconBgClass = isCommercial ? 'bg-[#3D3858]' : 'bg-solar'
  const isRight = align === 'right'

  return (
    <>
      <div
        className={cn(
          'hidden lg:flex items-center gap-5',
          isRight && 'flex-row-reverse'
        )}
      >
        <div
          className={cn(
            'w-[71px] h-[71px] flex items-center justify-center rounded-full',
            iconBgClass
          )}
        >
          {icon}
        </div>
        <p
          className={cn(
            'text-[#062E25]/80 text-[22px] font-medium leading-[1.09em] whitespace-pre-line',
            isRight ? 'text-right' : 'text-left'
          )}
        >
          {text}
        </p>
      </div>

      <div
        className={cn(
          'lg:hidden flex items-center gap-4',
          isRight && 'flex-row-reverse sm:flex-row'
        )}
      >
        <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center shrink-0">
          {mobileIcon}
        </div>
        <p
          className={cn(
            'text-[#062E25]/80 text-base sm:text-lg font-medium leading-[1.09em] whitespace-pre-line',
            isRight ? 'text-right sm:text-left' : ''
          )}
        >
          {text}
        </p>
      </div>
    </>
  )
}

const SolarAboHero = async ({
  translationNamespace,
  imageSrc,
  imageAlt = 'SolarAbo',
  isCommercial = false,
  elipseClassNames,
}: SolarAboHeroProps) => {
  const t = await getTranslations(translationNamespace)

  const iconClass = isCommercial ? 'text-white' : 'text-[#062E25]'

  const leftStats = [
    {
      icon: <MoneySignIcon className={iconClass} />,
      mobileIcon: (
        <MoneySignIcon className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={1.5} />
      ),
      text: t('hero.stats.left.investment'),
    },
    {
      icon: <SaleIcon className={iconClass} />,
      mobileIcon: <SaleIcon className="w-6 h-6 sm:w-8 sm:h-8" />,
      text: t('hero.stats.left.electricity'),
    },
  ]

  const rightStats = [
    {
      icon: <ShieldIcon className={iconClass} />,
      mobileIcon: (
        <ShieldIcon className="w-6 h-6 sm:w-8 sm:h-8" strokeWidth={1.5} />
      ),
      text: t('hero.stats.right.maintenance'),
    },
    {
      icon: <CO2ReductionIcon className={iconClass} />,
      mobileIcon: <CO2ReductionIcon className="w-6 h-6 sm:w-8 sm:h-8" />,
      text: t('hero.stats.right.reduction'),
    },
  ]

  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden bg-[#FDFFF5]">
      <HeroNavLight isCommercial={isCommercial} />
      <div className="relative z-10 max-w-[1440px] mx-auto w-full px-4 sm:px-6 pt-[160px] sm:pt-[180px] md:pt-[200px] pb-1">
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
                {t('hero.eyebrow')}
              </span>
            </div>

            <h1 className="text-[#17302A] text-4xl sm:text-5xl md:text-6xl lg:text-[70px] font-medium text-center tracking-tight">
              {t('hero.title')}
            </h1>

            <p className="text-[#17302A]/80 text-base sm:text-lg md:text-xl lg:text-[22px] font-normal leading-[1.36em] text-center">
              {t('hero.subtitle')}
            </p>

            <div>
              <LinkButton
                href="/calculator"
                variant={isCommercial ? 'outline-quaternary' : 'primary'}
              >
                {t('hero.cta')}
              </LinkButton>
            </div>

            <p className="text-[#17302A]/80 text-sm sm:text-base font-medium leading-[1.875em] text-center italic">
              {t('hero.tag')}
            </p>
          </div>

          <div className="relative w-full max-w-[666px] aspect-666/498 mx-auto">
            <div
              className={cn(
                'bg-solar/30 absolute top-0 left-[45%] -translate-x-1/2 w-[50%] h-[30%] rounded-full blur-[60px]',
                elipseClassNames
              )}
            />
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
          {leftStats.map((stat, index) => (
            <StatItem
              key={index}
              {...stat}
              align="left"
              isCommercial={isCommercial}
            />
          ))}
        </div>

        <div className="hidden lg:flex absolute right-[30px] top-[641px] flex-col gap-10 items-end">
          {rightStats.map((stat, index) => (
            <StatItem
              key={index}
              {...stat}
              align="right"
              isCommercial={isCommercial}
            />
          ))}
        </div>

        <div className="lg:hidden w-full mt-8 space-y-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1 space-y-6">
              {leftStats.map((stat, index) => (
                <StatItem
                  key={index}
                  {...stat}
                  align="left"
                  isCommercial={isCommercial}
                />
              ))}
            </div>
            <div className="flex-1 space-y-6">
              {rightStats.map((stat, index) => (
                <StatItem
                  key={index}
                  {...stat}
                  align="right"
                  isCommercial={isCommercial}
                />
              ))}
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

export default SolarAboHero
