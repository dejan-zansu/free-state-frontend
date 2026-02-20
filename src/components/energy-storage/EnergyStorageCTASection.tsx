import { LinkButton } from '@/components/ui/link-button'
import { getTranslations } from 'next-intl/server'

const EnergyStorageCTASection = async () => {
  const t = await getTranslations('energyStorage')

  return (
    <section className="relative w-full overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(7deg, rgba(7, 51, 42, 1) 0%, rgba(9, 63, 53, 1) 21%, rgba(21, 139, 126, 1) 100%)',
        }}
      />

      <div
        className="absolute pointer-events-none"
        style={{
          width: '374px',
          height: '374px',
          right: '0px',
          top: '-224px',
          background: 'rgba(183, 254, 26, 0.5)',
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
          background: 'rgba(183, 254, 26, 0.5)',
          filter: 'blur(170px)',
          borderRadius: '50%',
          zIndex: 2,
        }}
      />

      <div className="relative z-10 max-w-[900px] mx-auto px-4 sm:px-6 py-[100px]">
        <div className="flex flex-col items-center gap-[60px]">
          <div className="flex flex-col items-center gap-[50px] w-full">
            <div className="flex flex-col items-center gap-5 w-full">
              <div
                className="flex items-center justify-center px-4 py-[10px] rounded-[20px] border border-white/20"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(65px)',
                  WebkitBackdropFilter: 'blur(65px)',
                }}
              >
                <span className="text-white text-base font-light tracking-[-0.02em] text-center whitespace-nowrap">
                  {t('perfectCombination.eyebrow')}
                </span>
              </div>

              <h2 className="text-white text-4xl sm:text-5xl lg:text-[65px] font-medium leading-[103%] text-center capitalize w-full">
                {t('perfectCombination.title')}
              </h2>
            </div>

            <p className="text-white/80 text-base md:text-[22px] font-light leading-[1.27em] tracking-[-0.02em] text-center max-w-[604px]">
              {t('perfectCombination.description')}
            </p>
          </div>

          <LinkButton
            variant="primary"
            href={t('perfectCombination.ctaLink') as '/solar-calculator'}
          >
            {t('perfectCombination.ctaText')}
          </LinkButton>
        </div>
      </div>
    </section>
  )
}

export default EnergyStorageCTASection
