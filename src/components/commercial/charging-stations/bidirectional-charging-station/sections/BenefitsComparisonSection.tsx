import { getTranslations } from 'next-intl/server'

const CheckmarkIcon = ({ color = '#295823' }: { color?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    viewBox="0 0 22 22"
    fill="none"
    className="shrink-0"
  >
    <path
      d="M21.2326 11C21.2326 5.34871 16.6513 0.767442 11 0.767442C5.34871 0.767442 0.767442 5.34871 0.767442 11C0.767442 16.6513 5.34871 21.2326 11 21.2326C16.6513 21.2326 21.2326 16.6513 21.2326 11Z"
      stroke={color}
      strokeWidth={1.5}
    />
    <path
      d="M6.90698 11.5116L9.46512 14.0698L15.093 7.93023"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const BenefitsComparisonSection = async () => {
  const t = await getTranslations('bidirectionalChargingStation')

  const rows = [
    { key: 'returnOnFlexibility', hasNote: true, withSolar: true, withoutSolar: true },
    { key: 'lowerElectricityBill', hasNote: false, withSolar: true, withoutSolar: true },
    { key: 'multiDaySelfSufficiency', hasNote: false, withSolar: true, withoutSolar: false },
  ] as const

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
          <div className="flex flex-col items-center gap-[20px]">
            <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium text-center">
              {t('benefitsComparison.title')}
            </h2>
            <p className="text-[#062E25]/80 text-lg md:text-[22px] font-light tracking-[-0.02em] text-center max-w-[705px] mx-auto">
              {t('benefitsComparison.description')}
            </p>
          </div>

          <div className="w-full overflow-x-auto">
            <div className="min-w-[600px]">
              <div className="grid grid-cols-3 bg-[#3D3858] rounded-t-2xl">
                <span className="px-[17px] py-3 text-white/80 text-lg font-semibold tracking-[-0.02em]">
                  {t('benefitsComparison.headers.yourAdvantage')}
                </span>
                <span className="px-5 py-3 text-white/80 text-lg font-semibold tracking-[-0.02em]">
                  {t('benefitsComparison.headers.withSolar')}
                </span>
                <span className="px-5 py-3 text-white/80 text-lg font-semibold tracking-[-0.02em]">
                  {t('benefitsComparison.headers.withoutSolar')}
                </span>
              </div>

              {rows.map((row) => (
                <div
                  key={row.key}
                  className="grid grid-cols-3 border-b border-[#062E25]/10"
                >
                  <div className="px-[17px] py-3">
                    <span className="text-[#062E25]/80 text-lg font-semibold tracking-[-0.02em]">
                      {t(`benefitsComparison.rows.${row.key}`)}
                    </span>
                    {row.hasNote && (
                      <span className="text-[#062E25]/80 text-lg font-normal tracking-[-0.02em]">
                        {' '}
                        {t('benefitsComparison.rows.returnOnFlexibilityNote')}
                      </span>
                    )}
                  </div>
                  <div className="px-5 py-3 flex items-center">
                    {row.withSolar ? (
                      <CheckmarkIcon />
                    ) : (
                      <span className="border-t border-dashed border-[#8BA192] w-5" />
                    )}
                  </div>
                  <div className="px-5 py-3 flex items-center">
                    {row.withoutSolar ? (
                      <CheckmarkIcon />
                    ) : (
                      <span className="border-t border-dashed border-[#8BA192] w-5" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[#062E25]/80 text-lg font-normal tracking-[-0.02em] text-center">
            {t('benefitsComparison.footnote')}
          </p>
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

export default BenefitsComparisonSection
