import { getTranslations } from 'next-intl/server'

const SolarAboSection = async () => {
  const t = await getTranslations('solarCalculator.solarAbo')

  return (
    <section className="relative w-full overflow-hidden py-16 md:py-24">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(146deg, rgba(6, 46, 37, 1) 0%, rgba(9, 63, 53, 1) 49%, rgba(21, 139, 126, 1) 100%)',
        }}
      />

      <div
        className="absolute pointer-events-none"
        style={{
          width: '374px',
          height: '374px',
          right: '0px',
          top: '-224px',
          background: '#B7FE1A',
          filter: 'blur(490px)',
          borderRadius: '50%',
          zIndex: 2,
        }}
      />

      <div
        className="absolute pointer-events-none"
        style={{
          width: '291px',
          height: '291px',
          right: '40px',
          top: '-256px',
          background: '#B7FE1A',
          filter: 'blur(170px)',
          borderRadius: '50%',
          zIndex: 2,
        }}
      />

      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-8">
        <div className="flex flex-col items-center gap-5 text-center">
          <div
            className="flex items-center justify-center px-4 py-[10px] rounded-[20px] border border-white/20"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(32.5px)',
              WebkitBackdropFilter: 'blur(32.5px)',
            }}
          >
            <span className="text-white text-base font-medium tracking-[-0.02em] whitespace-nowrap">
              {t('eyebrow')}
            </span>
          </div>

          <h2 className="text-white text-3xl sm:text-4xl md:text-[65px] font-medium capitalize max-w-[900px]">
            {t('title')}
          </h2>

          <p className="text-white/80 text-base md:text-[22px] font-light max-w-[600px]">
            {t('description')}
          </p>
        </div>
      </div>
    </section>
  )
}

export default SolarAboSection
