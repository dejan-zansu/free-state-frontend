import { LinkButton } from '@/components/ui/link-button'
import { getTranslations } from 'next-intl/server'

const rows = ['airToWater', 'groundSource', 'oilHeating'] as const
const columns = ['purchase', 'maintenance', 'energy'] as const
const gridCols = 'grid grid-cols-4'

const CostComparisonSection = async () => {
  const t = await getTranslations('heatPumpsCost')

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
          <div className="w-full overflow-x-auto border border-white/20 rounded-2xl">
            <div className="min-w-[700px] flex flex-col">
              <div
                className={`${gridCols} rounded-t-2xl backdrop-blur-[20px]`}
                style={{ background: 'rgba(255, 255, 255, 0.1)' }}
              >
                <span className="px-5 py-3" />
                {columns.map((col) => (
                  <span
                    key={col}
                    className="px-5 py-3 text-white/80 text-sm md:text-lg font-bold tracking-[-0.02em]"
                  >
                    {t(`comparison.headers.${col}`)}
                  </span>
                ))}
              </div>

              {rows.map((row, index) => {
                const isGlass = index % 2 !== 0
                return (
                  <div
                    key={row}
                    className={`${gridCols} ${isGlass ? 'backdrop-blur-[20px]' : 'bg-[#E4E9D3]'}`}
                    style={isGlass ? { background: 'rgba(255, 255, 255, 0.1)' } : undefined}
                  >
                    <span
                      className={`px-5 py-4 text-sm md:text-lg tracking-[-0.02em] ${
                        isGlass ? 'text-white/80' : 'text-[#062E25]/80'
                      }`}
                    >
                      {t(`comparison.rows.${row}.label`)}
                    </span>
                    {columns.map((col) => (
                      <span
                        key={col}
                        className={`px-5 py-4 text-sm md:text-lg font-bold tracking-[-0.02em] ${
                          isGlass ? 'text-white/80' : 'text-[#062E25]/80'
                        }`}
                      >
                        {t(`comparison.rows.${row}.${col}`)}
                      </span>
                    ))}
                  </div>
                )
              })}
            </div>
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
