import { getTranslations } from 'next-intl/server'

const rows = [
  'installationEffort',
  'efficiency',
  'acquisitionCosts',
  'energyCosts',
] as const
const columns = ['airWater', 'brineWater', 'oilHeating'] as const
const gridCols = 'grid grid-cols-4'

const ComparisonSection = async () => {
  const t = await getTranslations('heatPumpsHowItWorks')

  return (
    <section
      className="relative py-12 md:py-16"
      style={{
        background:
          'linear-gradient(180deg, rgba(243, 245, 233, 1) 0%, rgba(220, 233, 230, 1) 100%)',
      }}
    >
      <div className="max-w-[1038px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-[50px]">
          <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium text-center">
            {t('comparison.title')}
          </h2>

          <div className="w-full overflow-x-auto border border-[#062E25]/40 rounded-2xl">
            <div className="min-w-[600px] flex flex-col">
              <div
                className={`${gridCols} rounded-t-2xl backdrop-blur-[20px]`}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                }}
              >
                <span className="px-5 py-3" />
                {columns.map(col => (
                  <span
                    key={col}
                    className="px-5 py-3 text-[#062E25]/80 text-lg font-normal tracking-[-0.02em]"
                  >
                    {t(`comparison.columns.${col}`)}
                  </span>
                ))}
              </div>

              {rows.map((row, index) => (
                <div
                  key={row}
                  className={`${gridCols} ${index % 2 === 0 ? 'bg-[#B7FE1A] rounded-t-2xl border border-[#062E25]/40' : ''}`}
                >
                  <span className="px-5 py-4 text-[#062E25]/80 text-lg font-semibold tracking-[-0.02em]">
                    {t(`comparison.rows.${row}.label`)}
                  </span>
                  {columns.map(col => (
                    <span
                      key={col}
                      className="px-5 py-4 text-[#062E25]/80 text-lg font-semibold tracking-[-0.02em]"
                    >
                      {t(`comparison.rows.${row}.${col}`)}
                    </span>
                  ))}
                </div>
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

export default ComparisonSection
