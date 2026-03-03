import { getTranslations } from 'next-intl/server'

const CheckmarkIcon = ({ stroke = '#295823' }: { stroke?: string }) => (
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
      stroke={stroke}
      strokeWidth={1.5}
    />
    <path
      d="M6.90698 11.5116L9.46512 14.0698L15.093 7.93023"
      stroke={stroke}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const MinusIcon = ({ stroke = '#295823' }: { stroke?: string }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="shrink-0"
  >
    <path
      d="M20.75 10.75C20.75 5.22715 16.2728 0.75 10.75 0.75C5.22715 0.75 0.75 5.22715 0.75 10.75C0.75 16.2728 5.22715 20.75 10.75 20.75C16.2728 20.75 20.75 16.2728 20.75 10.75Z"
      stroke={stroke}
      strokeWidth={1.5}
    />
    <path
      d="M5.75 11.25H15.75"
      stroke={stroke}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </svg>
)

interface BenefitsComparisonSectionBaseProps {
  headerBackground: string
  headerTextColor: string
  highlightRowBackground: string
  iconStroke?: string
}

const rows = [
  { key: 'returnOnFlexibility', hasNote: false, withSolar: true, withoutSolar: true },
  { key: 'lowerElectricityBill', hasNote: false, withSolar: true, withoutSolar: true },
  { key: 'multiDaySelfSufficiency', hasNote: true, withSolar: true, withoutSolar: false },
] as const

const BenefitsComparisonSectionBase = async ({
  headerBackground,
  headerTextColor,
  highlightRowBackground,
  iconStroke = '#295823',
}: BenefitsComparisonSectionBaseProps) => {
  const t = await getTranslations('bidirectionalChargingStation')

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

          <div className="w-full overflow-x-auto border border-[#062E25]/40 rounded-2xl">
            <div className="min-w-[600px] flex flex-col">
              <div
                className="grid grid-cols-3 rounded-t-2xl"
                style={{ background: headerBackground }}
              >
                <span className={`px-5 py-3 text-lg font-semibold tracking-[-0.02em] ${headerTextColor}`}>
                  {t('benefitsComparison.headers.yourAdvantage')}
                </span>
                <span className={`px-5 py-3 text-lg font-normal tracking-[-0.02em] text-center ${headerTextColor}`}>
                  {t('benefitsComparison.headers.withSolar')}
                </span>
                <span className={`px-5 py-3 text-lg font-normal tracking-[-0.02em] text-center ${headerTextColor}`}>
                  {t('benefitsComparison.headers.withoutSolar')}
                </span>
              </div>

              {rows.map((row, index) => (
                <div
                  key={row.key}
                  className={`grid grid-cols-3 ${index % 2 === 1 ? 'rounded-t-2xl border border-[#062E25]/40' : ''}`}
                  style={index % 2 === 1 ? { background: highlightRowBackground } : undefined}
                >
                  <div className="px-5 py-4">
                    <span className="text-[#062E25]/80 text-lg font-semibold tracking-[-0.02em]">
                      {t(`benefitsComparison.rows.${row.key}`)}
                    </span>
                  </div>
                  <div className="px-5 py-4 flex flex-col items-center justify-center gap-1">
                    {row.withSolar ? <CheckmarkIcon stroke={iconStroke} /> : <MinusIcon stroke={iconStroke} />}
                    {row.hasNote && (
                      <span className="text-[#062E25]/80 text-sm font-normal tracking-[-0.02em] text-center">
                        {t('benefitsComparison.rows.returnOnFlexibilityNote')}
                      </span>
                    )}
                  </div>
                  <div className="px-5 py-4 flex items-center justify-center">
                    {row.withoutSolar ? <CheckmarkIcon stroke={iconStroke} /> : <MinusIcon stroke={iconStroke} />}
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

export default BenefitsComparisonSectionBase
