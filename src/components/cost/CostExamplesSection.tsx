import {
  chf,
  type CostExample,
  type CostFigures,
} from '@/lib/pricing/public-cost-figures'
import { ArrowDown } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

interface CostExamplesSectionProps {
  figures: CostFigures
  examples: CostExample[]
}

const range = (min: number, max: number, sep: string) =>
  min === max ? chf(min) : `${chf(min)} ${sep} ${chf(max)}`

const CostExamplesSection = async ({
  figures,
  examples,
}: CostExamplesSectionProps) => {
  const t = await getTranslations('cost')
  const sep = t('examples.rangeSeparator')

  const rows = [
    {
      key: 'grossExVat',
      value: (e: CostExample) => range(e.grossExVatMin, e.grossExVatMax, sep),
    },
    {
      key: 'vat',
      value: (e: CostExample) =>
        `+ ${range(e.grossInclVatMin - e.grossExVatMin, e.grossInclVatMax - e.grossExVatMax, sep)}`,
    },
    {
      key: 'grossInclVat',
      value: (e: CostExample) =>
        range(e.grossInclVatMin, e.grossInclVatMax, sep),
    },
    { key: 'subsidy', value: (e: CostExample) => `- ${chf(e.subsidy)}` },
  ] as const

  return (
    <section
      id="preisbeispiele"
      className="relative bg-[#FDFFF5] overflow-hidden scroll-mt-28"
    >
      <div className="max-w-[1214px] mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="flex flex-col items-center gap-5 text-center mb-12 md:mb-16">
          <span className="inline-flex items-center rounded-full border border-[#062E25] px-4 py-2 text-[#062E25] text-base font-light">
            {t('examples.eyebrow')}
          </span>
          <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium leading-[1.05] max-w-[820px]">
            {t('examples.title')}
          </h2>
          <p className="text-[#062E25]/80 text-lg md:text-[22px] leading-[1.3] tracking-[-0.02em] max-w-[760px]">
            {t('examples.subtitle', {
              min: chf(figures.minChfPerKwp),
              max: chf(figures.maxChfPerKwp),
            })}
          </p>
        </div>

        {/* Desktop ledger */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 rounded-[20px] border border-[#062E25]/30 overflow-hidden bg-[#F2F4E8]">
            <thead>
              <tr>
                <th className="text-left align-bottom px-6 py-5 text-[#062E25]/60 text-sm font-medium uppercase tracking-[0.08em] border-b border-[#062E25]/20">
                  {t('examples.columns.system')}
                </th>
                {examples.map(e => (
                  <th
                    key={e.kwp}
                    className="text-right align-bottom px-6 py-5 border-b border-l border-[#062E25]/20"
                  >
                    <span className="block text-[#062E25] text-3xl md:text-[38px] font-medium leading-none tabular-nums">
                      {e.kwp} kWp
                    </span>
                    <span className="block mt-2 text-[#062E25]/60 text-sm font-light">
                      {t(`examples.sizes.${e.kwp}` as 'examples.sizes.6')}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.key}>
                  <td className="px-6 py-4 text-[#062E25]/80 text-base md:text-lg border-b border-dashed border-[#062E25]/20">
                    {t(`examples.rows.${row.key}`)}
                  </td>
                  {examples.map(e => (
                    <td
                      key={e.kwp}
                      className="px-6 py-4 text-right text-[#062E25] text-base md:text-lg tabular-nums border-b border-l border-dashed border-[#062E25]/20"
                    >
                      {row.value(e)}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-[#B7FE1A]">
                <td className="px-6 py-5 text-[#062E25] text-lg md:text-xl font-semibold">
                  {t('examples.rows.net')}
                </td>
                {examples.map(e => (
                  <td
                    key={e.kwp}
                    className="px-6 py-5 text-right text-[#062E25] text-xl md:text-2xl font-semibold tabular-nums border-l border-[#062E25]/20"
                  >
                    CHF {range(e.netMin, e.netMax, sep)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden flex flex-col gap-4">
          {examples.map(e => (
            <div
              key={e.kwp}
              className="rounded-[20px] border border-[#062E25]/30 bg-[#F2F4E8] overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-[#062E25]/20">
                <span className="block text-[#062E25] text-3xl font-medium leading-none tabular-nums">
                  {e.kwp} kWp
                </span>
                <span className="block mt-1 text-[#062E25]/60 text-sm font-light">
                  {t(`examples.sizes.${e.kwp}` as 'examples.sizes.6')}
                </span>
              </div>
              <dl className="px-5">
                {rows.map(row => (
                  <div
                    key={row.key}
                    className="flex items-baseline justify-between gap-4 py-3 border-b border-dashed border-[#062E25]/20"
                  >
                    <dt className="text-[#062E25]/80 text-sm">
                      {t(`examples.rows.${row.key}`)}
                    </dt>
                    <dd className="text-[#062E25] text-sm tabular-nums text-right">
                      {row.value(e)}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="flex items-baseline justify-between gap-4 px-5 py-4 bg-[#B7FE1A]">
                <span className="text-[#062E25] text-base font-semibold">
                  {t('examples.rows.net')}
                </span>
                <span className="text-[#062E25] text-lg font-semibold tabular-nums text-right">
                  CHF {range(e.netMin, e.netMax, sep)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-[#062E25]/60 text-sm font-light leading-[1.4] max-w-[900px]">
          {t('examples.footnote', {
            source: figures.subsidy.source,
            validFrom: figures.subsidy.validFrom,
          })}
        </p>

        <div className="mt-10 flex justify-center">
          <a
            href="#rechner"
            className="group inline-flex items-center gap-3 rounded-full bg-[#062E25] pl-6 pr-1 py-1 text-white text-base font-medium transition-colors hover:bg-[#B7FE1A] hover:text-[#062E25]"
          >
            {t('examples.cta')}
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#B7FE1A] text-[#062E25] transition-colors group-hover:bg-[#062E25] group-hover:text-white">
              <ArrowDown className="h-4 w-4" />
            </span>
          </a>
        </div>
      </div>
    </section>
  )
}

export default CostExamplesSection
