import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { LinkButton } from '@/components/ui/link-button'

const values = [
  { key: 'trust', image: '/images/team-value-trust-29ff36.png' },
  {
    key: 'responsibility',
    image: '/images/team-value-responsibility-177914.png',
  },
  { key: 'dedication', image: '/images/team-value-dedication-1017db.png' },
  { key: 'pragmatism', image: '/images/team-value-pragmatism-2bcbed.png' },
]

const ValuesSection = () => {
  const t = useTranslations('team.values')

  return (
    <section className="relative w-full bg-[#FDFFF5] py-12 lg:py-[50px]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[106px]">
        <div className="flex flex-col items-center text-center mb-10 lg:mb-[50px]">
          <h2 className="text-foreground text-3xl sm:text-4xl lg:text-[45px] font-medium text-center">
            {t('title')}
          </h2>

          <p className="mt-5 text-foreground/80 text-lg lg:text-[22px] font-light tracking-[-0.02em] max-w-[562px]">
            {t('subtitle')}
          </p>

          <div className="mt-10">
            <LinkButton href="/about-us" variant="outline-primary">
              {t('cta')}
            </LinkButton>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 lg:flex lg:gap-[140px]">
          {values.map((value, index) => (
            <div
              key={value.key}
              className="relative flex flex-col lg:flex-1 lg:min-w-0"
            >
              {index > 0 && (
                <div className="hidden lg:block absolute -left-[70px] top-7 bottom-0 w-px bg-foreground/30" />
              )}
              <div className="relative w-[135px] h-[113px] mb-[50px]">
                <Image
                  src={value.image}
                  alt={t(`${value.key}.title`)}
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-foreground text-[22px] font-bold capitalize">
                {t(`${value.key}.title`)}
              </h3>
              <p className="mt-5 text-foreground/80 text-base font-light tracking-[-0.02em]">
                {t(`${value.key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default ValuesSection
