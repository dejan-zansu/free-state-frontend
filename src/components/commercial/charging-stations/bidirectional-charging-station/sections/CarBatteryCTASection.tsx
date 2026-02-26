import { getTranslations } from 'next-intl/server'
import { LinkButton } from '@/components/ui/link-button'

const CarBatteryCTASection = async () => {
  const t = await getTranslations('bidirectionalChargingStation')

  return (
    <section
      className="relative overflow-hidden py-16 md:py-20 lg:py-24"
      style={{
        background:
          'linear-gradient(180deg, rgba(59, 46, 88, 1) 47%, rgba(31, 25, 41, 1) 100%)',
      }}
    >
      <div
        className="absolute pointer-events-none"
        style={{
          width: '374px',
          height: '374px',
          right: '0px',
          top: '-224px',
          background: 'rgba(228, 198, 255, 0.5)',
          filter: 'blur(490px)',
          borderRadius: '50%',
        }}
      />

      <div className="relative z-10 max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-[60px]">
        <div className="flex flex-col items-center gap-[50px]">
          <div className="flex flex-col items-center gap-5">
            <div
              className="flex items-center justify-center px-4 py-[10px] rounded-[20px] border w-fit"
              style={{
                borderColor: 'rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(65px)',
                WebkitBackdropFilter: 'blur(65px)',
              }}
            >
              <span className="text-white text-base font-light tracking-[-0.02em]">
                {t('carBattery.eyebrow')}
              </span>
            </div>

            <h2 className="text-white text-4xl sm:text-5xl lg:text-[65px] font-medium text-center capitalize">
              {t('carBattery.title')}
            </h2>
          </div>

          <p className="text-white/80 text-lg md:text-[22px] font-light tracking-[-0.02em] text-center max-w-[556px]">
            {t('carBattery.description')}
          </p>
        </div>

        <LinkButton variant="secondary" href="/contact">
          {t('carBattery.cta')}
        </LinkButton>
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

export default CarBatteryCTASection
