import { LinkButton, linkButtonVariants } from '@/components/ui/link-button'
import HeroNavLight from '@/components/HeroNavLight'
import { cn } from '@/lib/utils'
import { type VariantProps } from 'class-variance-authority'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { CO2ReductionIcon, MoneySignIcon, SaleIcon, ShieldIcon } from '../icons'

type LinkButtonVariant = NonNullable<
  VariantProps<typeof linkButtonVariants>['variant']
>

export interface SolarAboHeroProps {
  translationNamespace: string
  imageSrc: string
  imageAlt?: string
  isCommercial?: boolean
  elipseClassNames?: string
  ctaVariant?: LinkButtonVariant
  statIconBgClassName?: string
  statIconClassName?: string
}

interface StatItemProps {
  icon: React.ReactNode
  mobileIcon: React.ReactNode
  text: string
  align: 'left' | 'right'
  isCommercial: boolean
  iconBgClassName?: string
}

const StatItem = ({
  icon,
  mobileIcon,
  text,
  align,
  isCommercial,
  iconBgClassName,
}: StatItemProps) => {
  const iconBgClass =
    iconBgClassName || (isCommercial ? 'bg-[#3D3858]' : 'bg-solar')
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
            'text-[#062E25]/80 text-[22px] font-medium whitespace-pre-line',
            isRight ? 'text-right' : 'text-left'
          )}
        >
          {text}
        </p>
      </div>

      <div className="lg:hidden flex items-center gap-4">
        <div
          className={cn(
            'w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full shrink-0',
            iconBgClass
          )}
        >
          {mobileIcon}
        </div>
        <p className="min-w-0 flex-1 text-[#062E25]/80 text-base sm:text-lg font-medium text-left text-balance">
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
  ctaVariant,
  statIconBgClassName,
  statIconClassName,
}: SolarAboHeroProps) => {
  const t = await getTranslations(translationNamespace)

  const iconClass =
    statIconClassName ?? (isCommercial ? 'text-white' : 'text-[#062E25]')
  const mobileIconClass = cn(
    'w-5 h-5 sm:w-7 sm:h-7 overflow-visible',
    iconClass
  )

  const leftStats = [
    {
      icon: <MoneySignIcon className={iconClass} />,
      mobileIcon: (
        <MoneySignIcon className={mobileIconClass} strokeWidth={1.5} />
      ),
      text: t('hero.stats.left.investment'),
    },
    {
      icon: <SaleIcon className={iconClass} />,
      mobileIcon: <SaleIcon className={mobileIconClass} />,
      text: t('hero.stats.left.electricity'),
    },
  ]

  const rightStats = [
    {
      icon: <ShieldIcon className={iconClass} />,
      mobileIcon: <ShieldIcon className={mobileIconClass} strokeWidth={1.5} />,
      text: t('hero.stats.right.maintenance'),
    },
    {
      icon: <CO2ReductionIcon className={iconClass} />,
      mobileIcon: <CO2ReductionIcon className={mobileIconClass} />,
      text: t('hero.stats.right.reduction'),
    },
  ]

  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden bg-[#FDFFF5]">
      <HeroNavLight isCommercial={isCommercial} ctaVariant={ctaVariant} />
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
                href={isCommercial ? '/commercial/calculator' : '/calculator'}
                variant={
                  ctaVariant ??
                  (isCommercial ? 'outline-quaternary' : 'primary')
                }
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
              iconBgClassName={statIconBgClassName}
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
              iconBgClassName={statIconBgClassName}
            />
          ))}
        </div>

        <div className="lg:hidden w-full mt-4 md:mt-8 max-w-md mx-auto space-y-4 pb-8 md:pb-0">
          {[...leftStats, ...rightStats].map((stat, index) => (
            <StatItem
              key={index}
              {...stat}
              align="left"
              isCommercial={isCommercial}
              iconBgClassName={statIconBgClassName}
            />
          ))}
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
