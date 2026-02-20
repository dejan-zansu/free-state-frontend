import { LinkButton } from '@/components/ui/link-button'
import { getTranslations } from 'next-intl/server'

const itemKeys = [
  'notification',
  'visualization',
  'storage',
  'faultSupport',
  'includedServices',
  'dataSecurity',
] as const

const MonitoringSection = async () => {
  const t = await getTranslations('service')

  return (
    <section className="relative w-full overflow-hidden bg-[#4A9A99]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/service/service-monitoring-bg-439fa7.png')" }}
      />
      <div className="absolute inset-0 bg-black/20" />
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(270deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 99%)',
          opacity: 0.2,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(0deg, rgba(74, 154, 153, 0) 9%, rgba(74, 154, 153, 1) 100%)',
        }}
      />

      <div className="relative z-10 max-w-[1103px] mx-auto px-4 sm:px-6 py-12 md:py-[50px]">
        <div className="flex flex-col items-center gap-10">
          <div className="flex flex-col items-center gap-[50px] w-full">
            <h2 className="text-white text-3xl md:text-[45px] font-medium leading-[1em] text-center">
              {t('monitoring.title')}
            </h2>

            <div className="relative w-full">
              <div
                className="absolute inset-0 rounded-[16px]"
                style={{
                  background: 'rgba(185, 205, 191, 0.2)',
                  border: '1px solid rgba(246, 246, 246, 0.4)',
                  backdropFilter: 'blur(40px)',
                  WebkitBackdropFilter: 'blur(40px)',
                }}
              />

              <div className="relative z-10 px-6 sm:px-10 py-8 sm:py-[30px]">
                <div className="flex flex-col gap-5">
                  {itemKeys.map(key => (
                    <div key={key} className="flex items-start gap-2">
                      <div
                        className="w-[13px] h-[13px] shrink-0 mt-1.5 rounded-l-[5px] rounded-r-0"
                        style={{ border: '1.5px solid #B7FE1A' }}
                      />
                      <span className="text-white/80 text-base md:text-[22px] font-bold tracking-[-0.02em]">
                        {t(`monitoring.items.${key}`)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <LinkButton
            variant="primary"
            href={t('monitoring.ctaLink') as '/contact'}
          >
            {t('monitoring.cta')}
          </LinkButton>
        </div>
      </div>
    </section>
  )
}

export default MonitoringSection
