import { getTranslations } from 'next-intl/server'

const MarketingFlexibilitySection = async () => {
  const t = await getTranslations('bidirectionalChargingStation')

  return (
    <section className="relative py-12 md:py-16" style={{ background: '#EAEDDF' }}>
      <div
        className="absolute rounded-full"
        style={{
          left: '-174px',
          top: '-122px',
          width: '374px',
          height: '374px',
          background: 'rgba(183, 254, 26, 0.5)',
          filter: 'blur(490px)',
        }}
      />

      <div className="max-w-[867px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-[50px]">
          <div className="flex flex-col items-center gap-[20px]">
            <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium text-center">
              {t('marketingFlexibility.title')}
            </h2>
            <p className="text-[#062E25]/80 text-lg md:text-[22px] font-light tracking-[-0.02em] text-center max-w-[670px] mx-auto">
              {t('marketingFlexibility.description')}
            </p>
            <p className="text-[#062E25]/80 text-[22px] font-semibold tracking-[-0.02em] text-center">
              {t('marketingFlexibility.additionalIncome')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-[20px] max-w-[740px] mx-auto">
            <div className="bg-[#0D4841] border border-[#809792] rounded-[20px] w-[360px] h-[317px] relative overflow-hidden">
              <div className="flex items-center justify-center h-full pb-[125px]">
                <div className="w-[142px] h-[142px]" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[125px] bg-[#E5E6DE] backdrop-blur-[26px] border-t border-[#809792] flex flex-col items-center justify-center px-4">
                <h3 className="text-[#062E25] text-[22px] font-bold text-center capitalize">
                  {t('marketingFlexibility.cards.withSolar.title')}
                </h3>
                <p className="text-[#062E25]/80 text-base font-light tracking-[-0.02em] text-center">
                  {t('marketingFlexibility.cards.withSolar.amount')}
                </p>
              </div>
            </div>

            <div className="bg-[#0D4841] border border-[#809792] rounded-[20px] w-[360px] h-[317px] relative overflow-hidden">
              <div className="flex items-center justify-center h-full pb-[125px]">
                <div className="w-[142px] h-[142px]" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-[125px] bg-[#E5E6DE] backdrop-blur-[26px] border-t border-[#809792] flex flex-col items-center justify-center px-4">
                <h3 className="text-[#062E25] text-[22px] font-bold text-center capitalize">
                  {t('marketingFlexibility.cards.systemComparison.title')}
                </h3>
                <p className="text-[#062E25]/80 text-base font-light tracking-[-0.02em] text-center">
                  {t('marketingFlexibility.cards.systemComparison.amount')}
                </p>
              </div>
            </div>
          </div>

          <p className="text-[#062E25]/80 text-lg font-normal tracking-[-0.02em] text-center">
            {t('marketingFlexibility.note')}
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

export default MarketingFlexibilitySection
