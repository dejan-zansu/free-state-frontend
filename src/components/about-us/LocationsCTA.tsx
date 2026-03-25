import { LinkButton } from '@/components/ui/link-button'
import { useTranslations } from 'next-intl'

const LocationsCTA = () => {
  const t = useTranslations('aboutUs.locations')

  return (
    <section
      className="relative w-full overflow-hidden py-12 lg:py-[50px]"
      style={{
        background:
          'linear-gradient(146deg, rgba(6, 46, 37, 1) 0%, rgba(9, 63, 53, 1) 49%, rgba(21, 139, 126, 1) 100%)',
      }}
    >
      <div className="absolute top-[-224px] right-[0px] w-[374px] h-[374px] rounded-full bg-solar blur-[490px]" />
      <div className="absolute top-[-256px] right-[0px] w-[291px] h-[291px] rounded-full bg-solar blur-[170px]" />

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 flex flex-col items-center text-center">
        <span className="inline-flex items-center justify-center px-4 py-2.5 rounded-[20px] border border-white text-white text-base font-light tracking-tight backdrop-blur-[65px]">
          {t('eyebrow')}
        </span>

        <h2 className="mt-5 text-white text-4xl sm:text-5xl lg:text-[70px] font-medium capitalize">
          {t('title')}
        </h2>

        <p className="mt-7 text-white/80 text-lg lg:text-[22px] font-light max-w-[814px]">
          {t('subtitle')}
        </p>

        <div className="mt-14 flex flex-col sm:flex-row items-center gap-5">
          <LinkButton href="/contact" variant="primary">
            {t('ctaContact')}
          </LinkButton>
          <LinkButton href="/solar-calculator" variant="outline-secondary">
            {t('ctaCalculator')}
          </LinkButton>
        </div>
      </div>
    </section>
  )
}

export default LocationsCTA
