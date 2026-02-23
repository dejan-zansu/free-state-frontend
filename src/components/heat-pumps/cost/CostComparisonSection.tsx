import { LinkButton } from '@/components/ui/link-button'
import { getTranslations } from 'next-intl/server'

const CostComparisonSection = async () => {
  const t = await getTranslations('heatPumpsCost')

  const rows = [
    {
      key: 'airToWater',
      style: 'glass' as const,
    },
    {
      key: 'groundSource',
      style: 'solid' as const,
    },
    {
      key: 'oilHeating',
      style: 'solid' as const,
    },
  ]

  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(0deg, rgba(74, 154, 153, 0) 9%, rgba(74, 154, 153, 1) 100%), linear-gradient(270deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 99%), rgba(0, 0, 0, 0.2)',
        }}
      />
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage: 'url(/images/heat-pumps-cost/hero-bg.png)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <h2 className="text-white text-3xl md:text-[45px] font-medium text-center mb-10 md:mb-14">
          {t('comparison.title')}
        </h2>

        <div className="max-w-[1118px] mx-auto">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-separate border-spacing-y-0">
              <thead>
                <tr>
                  <th className="rounded-l-2xl bg-[#E4E9D3] border border-[#062E25]/40 border-r-0 px-5 py-3 text-left text-[#062E25]/80 text-sm md:text-lg font-bold tracking-[-0.02em]" />
                  <th className="bg-[#E4E9D3] border-y border-[#062E25]/40 px-5 py-3 text-left text-[#062E25]/80 text-sm md:text-lg font-bold tracking-[-0.02em]">
                    {t('comparison.headers.purchase')}
                  </th>
                  <th className="bg-[#E4E9D3] border-y border-[#062E25]/40 px-5 py-3 text-left text-[#062E25]/80 text-sm md:text-lg font-bold tracking-[-0.02em]">
                    {t('comparison.headers.maintenance')}
                  </th>
                  <th className="rounded-r-2xl bg-[#E4E9D3] border border-[#062E25]/40 border-l-0 px-5 py-3 text-left text-[#062E25]/80 text-sm md:text-lg font-bold tracking-[-0.02em]">
                    {t('comparison.headers.energy')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => {
                  const isGlass = index === 0
                  return (
                    <tr key={row.key}>
                      <td
                        className={`px-5 py-3 text-sm md:text-lg tracking-[-0.02em] ${
                          isGlass
                            ? 'rounded-l-none text-white/80 bg-white/10 border border-white/20 border-r-0'
                            : 'rounded-l-2xl text-[#062E25]/80 bg-[#E4E9D3] border border-[#062E25]/40 border-r-0'
                        }`}
                      >
                        {t(`comparison.rows.${row.key}.label`)}
                      </td>
                      <td
                        className={`px-5 py-3 text-sm md:text-lg font-bold tracking-[-0.02em] ${
                          isGlass
                            ? 'text-white/80 bg-white/10 border-y border-white/20'
                            : 'text-[#062E25]/80 bg-[#E4E9D3] border-y border-[#062E25]/40'
                        }`}
                      >
                        {t(`comparison.rows.${row.key}.purchase`)}
                      </td>
                      <td
                        className={`px-5 py-3 text-sm md:text-lg font-bold tracking-[-0.02em] ${
                          isGlass
                            ? 'text-white/80 bg-white/10 border-y border-white/20'
                            : 'text-[#062E25]/80 bg-[#E4E9D3] border-y border-[#062E25]/40'
                        }`}
                      >
                        {t(`comparison.rows.${row.key}.maintenance`)}
                      </td>
                      <td
                        className={`px-5 py-3 text-sm md:text-lg font-bold tracking-[-0.02em] ${
                          isGlass
                            ? 'rounded-r-none text-white/80 bg-white/10 border border-white/20 border-l-0'
                            : 'rounded-r-2xl text-[#062E25]/80 bg-[#E4E9D3] border border-[#062E25]/40 border-l-0'
                        }`}
                      >
                        {t(`comparison.rows.${row.key}.energy`)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <p className="text-white/80 text-xs mt-4 tracking-[-0.02em]">
            {t('comparison.caption')}
          </p>
        </div>

        <div className="flex justify-center mt-10">
          <LinkButton variant="primary" href="/heat-pumps/cost">
            {t('comparison.cta')}
          </LinkButton>
        </div>
      </div>
    </section>
  )
}

export default CostComparisonSection
