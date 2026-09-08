import PageHero from '@/components/PageHero'
import { LinkButton } from '@/components/ui/link-button'
import { chf, type CostFigures } from '@/lib/pricing/public-cost-figures'
import { getTranslations } from 'next-intl/server'

interface CostHeroProps {
  figures: CostFigures
}

const CostHero = async ({ figures }: CostHeroProps) => {
  const t = await getTranslations('cost')
  const min = chf(figures.minChfPerKwp)
  const max = chf(figures.maxChfPerKwp)

  const stats = [
    {
      key: 'perKwp',
      value: t('hero.stats.perKwp.value', { min, max }),
      label: t('hero.stats.perKwp.label'),
    },
    {
      key: 'subsidy',
      value: t('hero.stats.subsidy.value', {
        rate: chf(figures.subsidy.tier1ChfPerKwp),
      }),
      label: t('hero.stats.subsidy.label'),
    },
    {
      key: 'solarFree',
      value: t('hero.stats.solarFree.value'),
      label: t('hero.stats.solarFree.label'),
    },
  ]

  return (
    <div className="bg-[#EAEDDF]">
      <PageHero
        backgroundImage="/images/cost-page-hero.png"
        dimBackground
        title={t('hero.title')}
        titleClassName="normal-case max-w-[980px]"
        description={t('hero.subtitle', { min, max })}
        descriptionClassName="max-w-[720px] text-lg md:text-[22px] leading-[1.3]"
        className="min-h-[720px] pb-[70px]"
      >
        <div className="mt-10 w-full max-w-[980px]">
          <dl className="grid grid-cols-1 sm:grid-cols-3 rounded-[24px] border border-white/25 bg-white/10 backdrop-blur-[26px] overflow-hidden">
            {stats.map((stat, index) => (
              <div
                key={stat.key}
                className={`flex flex-col items-center gap-2 px-6 py-6 ${
                  index > 0
                    ? 'border-t sm:border-t-0 sm:border-l border-white/20'
                    : ''
                }`}
              >
                <dd className="text-white text-2xl md:text-[30px] font-medium leading-none tabular-nums tracking-tight whitespace-nowrap">
                  {stat.value}
                </dd>
                <dt className="text-white/75 text-sm md:text-base font-light text-center">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <LinkButton variant="primary" href="/calculator">
              {t('hero.ctaCalculator')}
            </LinkButton>
            <a
              href="#preisbeispiele"
              className="inline-flex items-center justify-center rounded-full border border-white/60 px-6 py-3 text-white text-base font-medium transition-colors hover:bg-white/10"
            >
              {t('hero.ctaExamples')}
            </a>
          </div>

          <p className="mt-6 text-white/65 text-sm font-light text-center">
            {t('hero.note')}
          </p>
        </div>
      </PageHero>
    </div>
  )
}

export default CostHero
