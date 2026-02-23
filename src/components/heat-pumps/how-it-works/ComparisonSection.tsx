import { getTranslations } from 'next-intl/server'

const rows = ['installationEffort', 'acquisitionCosts', 'efficiency', 'energyCosts'] as const
const columns = ['airWater', 'brineWater', 'oilHeating'] as const

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

          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse min-w-[600px]">
              <thead>
                <tr>
                  <th className="text-left p-3" />
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="text-left p-3 text-[#062E25]/80 text-lg font-normal tracking-[-0.02em] rounded-t-[16px] backdrop-blur-[20px]"
                      style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(6, 46, 37, 0.4)',
                      }}
                    >
                      {t(`comparison.columns.${col}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row}>
                    <td className="p-3 text-[#062E25] text-lg font-semibold tracking-[-0.02em]">
                      {t(`comparison.rows.${row}.label`)}
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col}
                        className="p-3 text-[#062E25] text-lg font-semibold tracking-[-0.02em] backdrop-blur-[20px]"
                        style={{
                          background: '#B7FE1A',
                          border: '1px solid rgba(6, 46, 37, 0.4)',
                        }}
                      >
                        {t(`comparison.rows.${row}.${col}`)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
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
