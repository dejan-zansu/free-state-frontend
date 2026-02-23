import { LinkButton } from '@/components/ui/link-button'
import { getTranslations } from 'next-intl/server'

const ServiceHotlineSection = async () => {
  const t = await getTranslations('heatPumpsService')

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background:
          'linear-gradient(146deg, rgba(234, 237, 223, 1) 0%, rgba(234, 237, 223, 1) 49%, rgba(253, 255, 245, 1) 100%)',
      }}
    >
      <div
        className="absolute top-[-159px] right-[-100px] w-[374px] h-[374px] rounded-full pointer-events-none"
        style={{
          background: 'rgba(183, 254, 26, 0.5)',
          filter: 'blur(490px)',
        }}
      />
      <div
        className="absolute top-[-191px] right-[-60px] w-[291px] h-[291px] rounded-full pointer-events-none"
        style={{
          background: 'rgba(183, 254, 26, 0.5)',
          filter: 'blur(170px)',
        }}
      />

      <div className="relative z-10 max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex flex-col items-center text-center gap-12">
        <div className="flex flex-col items-center gap-5">
          <div
            className="flex items-center justify-center px-4 py-2.5 rounded-full border border-[#062E25] w-fit"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(65px)',
            }}
          >
            <span className="text-[#062E25] text-sm md:text-base font-light tracking-[-0.02em]">
              {t('hotline.eyebrow')}
            </span>
          </div>

          <h2 className="text-[#062E25] text-4xl md:text-[65px] font-medium md:leading-[1.03em]">
            {t('hotline.title')}
          </h2>
        </div>

        <LinkButton variant="tertiary" href="/contact">
          {t('hotline.cta')}
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

export default ServiceHotlineSection
