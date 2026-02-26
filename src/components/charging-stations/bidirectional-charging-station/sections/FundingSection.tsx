import { getTranslations } from 'next-intl/server'

const cantons = [
  { key: 'bern', highlighted: true },
  { key: 'graubunden', highlighted: false },
  { key: 'lucerne', highlighted: true },
  { key: 'schaffhausen', highlighted: false },
  { key: 'ticino', highlighted: true },
  { key: 'thurgau', highlighted: false },
  { key: 'uri', highlighted: true },
  { key: 'zurich', highlighted: false },
] as const

const FundingSection = async () => {
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
          <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium text-center">
            {t('funding.title')}
          </h2>

          <div className="w-full flex flex-col">
            {cantons.map((canton, index) => (
              <div
                key={canton.key}
                className={`grid grid-cols-2 border border-[#062E25]/40 backdrop-blur-[20px] ${
                  canton.highlighted ? 'bg-[#B7FE1A]' : 'bg-white/10'
                } ${index === 0 ? 'rounded-t-2xl' : ''}`}
              >
                <span className="px-[17px] py-3 text-[#062E25]/80 text-lg font-normal tracking-[-0.02em]">
                  {t(`funding.cantons.${canton.key}.name`)}
                </span>
                <span className="px-5 py-3 text-[#062E25]/80 text-lg font-semibold tracking-[-0.02em]">
                  {t(`funding.cantons.${canton.key}.amount`)}
                </span>
              </div>
            ))}
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

export default FundingSection
