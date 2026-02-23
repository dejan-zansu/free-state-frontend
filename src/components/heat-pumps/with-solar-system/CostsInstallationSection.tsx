import { LinkButton } from '@/components/ui/link-button'
import { getTranslations } from 'next-intl/server'

const CostsInstallationSection = async () => {
  const t = await getTranslations('heatPumpsWithSolarSystem')

  return (
    <section className="relative overflow-hidden py-12 md:py-16 lg:py-20">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/images/heat-pumps-with-solar-system/costs-installation-bg-4962ac.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(0deg, rgba(74, 154, 153, 0) 0%, rgba(74, 154, 153, 1) 78%), linear-gradient(270deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 99%)',
          mixBlendMode: 'multiply',
        }}
      />
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 max-w-[786px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-[50px]">
        <div className="flex flex-col items-center gap-[50px] w-full">
          <h2 className="text-white text-3xl sm:text-4xl md:text-[45px] font-medium text-center w-full">
            {t('costsInstallation.title')}
          </h2>

          <div className="relative w-full">
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: 'rgba(185, 205, 191, 0.2)',
                border: '1px solid rgba(246, 246, 246, 0.4)',
                backdropFilter: 'blur(40px)',
                WebkitBackdropFilter: 'blur(40px)',
                borderRadius: '16px',
              }}
            />
            <div className="relative z-10 px-6 md:px-10 py-6">
              <p className="text-white/80 text-lg md:text-[22px] font-light tracking-[-0.02em] whitespace-pre-line">
                {t('costsInstallation.description')}
              </p>
            </div>
          </div>
        </div>

        <LinkButton variant="primary" href="/contact">
          {t('costsInstallation.cta')}
        </LinkButton>
      </div>
    </section>
  )
}

export default CostsInstallationSection
