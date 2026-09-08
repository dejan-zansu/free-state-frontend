import { LearnMoreLink } from '@/components/ui/learn-more-link'
import {
  chf,
  subsidyForKwp,
  type CostFigures,
} from '@/lib/pricing/public-cost-figures'
import { getTranslations } from 'next-intl/server'

interface CostSubsidySectionProps {
  figures: CostFigures
}

const EXAMPLE_KWP = 10

const CostSubsidySection = async ({ figures }: CostSubsidySectionProps) => {
  const t = await getTranslations('cost')
  const s = figures.subsidy
  const exampleAmount = subsidyForKwp(EXAMPLE_KWP, s)

  return (
    <section className="relative bg-[#062E25] overflow-hidden">
      <div
        className="pointer-events-none absolute -bottom-40 -left-20 w-[520px] h-[520px] rounded-full"
        style={{
          background: 'rgba(183, 254, 26, 0.18)',
          filter: 'blur(170px)',
        }}
      />
      <div className="relative max-w-[1214px] mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="flex flex-col gap-6">
            <span className="inline-flex w-fit items-center rounded-full border border-white/30 px-4 py-2 text-white text-base font-light">
              {t('subsidy.eyebrow')}
            </span>
            <h2 className="text-white text-3xl sm:text-4xl md:text-[45px] font-medium leading-[1.05]">
              {t('subsidy.title')}
            </h2>
            <p className="text-white/80 text-lg md:text-[22px] leading-[1.3] tracking-[-0.02em]">
              {t('subsidy.paragraph1', {
                rate1: chf(s.tier1ChfPerKwp),
                tier1: s.tier1MaxKwp,
                rate2: chf(s.tier2ChfPerKwp),
                tier2: s.tier2MaxKwp,
              })}
            </p>
            <p className="text-white/80 text-base md:text-lg leading-[1.35] tracking-[-0.02em]">
              {t('subsidy.feedIn', { rate: figures.feedInRpPerKwh })}
            </p>
            <p className="text-white/80 text-base md:text-lg leading-[1.35] tracking-[-0.02em]">
              {t('subsidy.tax')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 pt-2">
              <LearnMoreLink
                href={{
                  pathname: '/blog/[slug]',
                  params: { slug: 'einmalverguetung-2026-kleiv-greiv-heiv' },
                }}
                className="text-[#B7FE1A]"
              >
                {t('subsidy.links.blog')}
              </LearnMoreLink>
              <LearnMoreLink href="/foerderung" className="text-[#B7FE1A]">
                {t('subsidy.links.cantons')}
              </LearnMoreLink>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/20 bg-white/5 backdrop-blur-[26px] p-8 md:p-10 flex flex-col gap-6">
            <span className="text-white/60 text-sm font-medium uppercase tracking-[0.08em]">
              {t('subsidy.example.label', { kwp: EXAMPLE_KWP })}
            </span>
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-white text-xl md:text-2xl tabular-nums">
                {EXAMPLE_KWP} kWp
              </span>
              <span className="text-white/50 text-xl">×</span>
              <span className="text-white text-xl md:text-2xl tabular-nums">
                CHF {chf(s.tier1ChfPerKwp)}
              </span>
            </div>
            <div className="h-px w-full bg-white/20" />
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-white/80 text-base md:text-lg">
                {t('subsidy.example.result')}
              </span>
              <span className="text-[#B7FE1A] text-3xl md:text-[44px] font-medium leading-none tabular-nums">
                CHF {chf(exampleAmount)}
              </span>
            </div>
            <p className="text-white/55 text-sm font-light leading-[1.4]">
              {t('subsidy.example.note', { source: s.source })}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CostSubsidySection
