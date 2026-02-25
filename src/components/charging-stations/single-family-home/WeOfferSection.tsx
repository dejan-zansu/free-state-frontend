import { getTranslations } from 'next-intl/server'

const WeOfferSection = async () => {
  const t = await getTranslations('chargingStationsSingleFamilyHome')

  return (
    <section
      className="relative overflow-hidden py-12 md:py-16"
      style={{
        background:
          'linear-gradient(146deg, rgba(6, 46, 37, 1) 0%, rgba(9, 63, 53, 1) 49%, rgba(21, 139, 126, 1) 100%)',
      }}
    >
      <div
        className="absolute pointer-events-none"
        style={{
          width: '374px',
          height: '374px',
          right: '0px',
          top: '-147px',
          background: 'rgba(183, 254, 26, 0.5)',
          filter: 'blur(490px)',
          borderRadius: '50%',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-[75px] justify-center">
          <h2 className="text-white text-3xl sm:text-4xl md:text-[45px] font-medium text-center shrink-0">
            {t('weOffer.title')}
          </h2>

          <p className="text-white/80 text-lg md:text-[22px] font-light tracking-[-0.02em] text-justify max-w-[527px]">
            {t('weOffer.description')}
          </p>
        </div>
      </div>
    </section>
  )
}

export default WeOfferSection
