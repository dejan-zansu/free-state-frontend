import { LinkButton } from '@/components/ui/link-button'
import { getTranslations } from 'next-intl/server'

const SupportSection = async () => {
  const t = await getTranslations('heatPumpsCost')

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background:
          'linear-gradient(7deg, rgba(7, 51, 42, 1) 0%, rgba(9, 63, 53, 1) 21%, rgba(21, 139, 126, 1) 100%)',
      }}
    >
      <div
        className="absolute top-[-224px] right-[-100px] w-[374px] h-[374px] rounded-full pointer-events-none"
        style={{
          background: 'rgba(183, 254, 26, 0.5)',
          filter: 'blur(490px)',
        }}
      />
      <div
        className="absolute top-[-256px] right-[-60px] w-[291px] h-[291px] rounded-full pointer-events-none"
        style={{
          background: 'rgba(183, 254, 26, 0.5)',
          filter: 'blur(170px)',
        }}
      />

      <div className="relative z-10 max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex flex-col items-center text-center gap-12">
        <div className="flex flex-col items-center gap-5">
          <div
            className="flex items-center justify-center px-4 py-2.5 rounded-full border border-white/20 w-fit"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(65px)',
            }}
          >
            <span className="text-white text-sm md:text-base font-light tracking-[-0.02em]">
              {t('support.eyebrow')}
            </span>
          </div>

          <h2 className="text-white text-4xl md:text-[65px] font-medium md:leading-[1.03em]">
            {t('support.title')}
          </h2>

          <p className="text-white/80 text-lg md:text-[22px] font-light tracking-[-0.02em] max-w-[519px]">
            {t('support.description')}
          </p>
        </div>

        <div className="flex flex-col items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="w-[13px] h-[13px] rounded-[5px_0px_5px_0px] border-[1.5px] border-[#B7FE1A] flex-shrink-0" />
            <p className="text-white/80 text-lg md:text-[22px] font-medium tracking-[-0.02em]">
              {t('support.checkItem')}
            </p>
          </div>
        </div>

        <LinkButton variant="primary" href="https://www.energiefranken.ch">
          {t('support.cta')}
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

export default SupportSection
