import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

const SolarAboShowcaseSection = async () => {
  const t = await getTranslations('solarCalculator.solarAbo')

  return (
    <section className="relative w-full overflow-hidden">
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

      <div className="absolute top-0 left-0 w-full h-px bg-white/60" />

      <div className="relative z-10 flex flex-col lg:flex-row min-h-[640px]">
        <div className="relative w-full lg:w-1/2 h-[400px] lg:h-auto">
          <Image
            src="/images/app-solar-calculator-view.png"
            alt={t('title')}
            fill
            className="object-cover object-center"
          />
        </div>

        <div className="flex items-center justify-center w-full lg:w-1/2 px-6 sm:px-10 py-16 lg:py-0">
          <div className="flex flex-col items-center gap-5 max-w-[559px]">
            <div
              className="flex items-center justify-center px-4 py-[10px] rounded-[20px] border border-white/30"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(65px)',
                WebkitBackdropFilter: 'blur(65px)',
              }}
            >
              <span className="text-white text-base font-light tracking-[-0.02em] text-center whitespace-nowrap">
                {t('eyebrow')}
              </span>
            </div>

            <h2 className="text-white text-3xl sm:text-4xl lg:text-[65px] font-medium text-center capitalize">
              {t('title')}
            </h2>

            <p className="text-white/80 text-base md:text-[22px] font-light tracking-[-0.02em] text-center">
              {t('description')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SolarAboShowcaseSection
