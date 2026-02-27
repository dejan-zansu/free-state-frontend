import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const HowItWorksSection = async () => {
  const t = await getTranslations('bidirectionalChargingStation')

  return (
    <section
      className="relative overflow-hidden py-16 md:py-20 lg:py-24 -mt-[40px]"
      style={{
        background:
          'linear-gradient(146deg, rgba(234, 237, 223, 1) 0%, rgba(234, 237, 223, 1) 49%, rgba(253, 255, 245, 1) 100%)',
      }}
    >
      <div
        className="absolute pointer-events-none"
        style={{
          width: '567px',
          height: '567px',
          right: '-50px',
          top: '-180px',
          background: 'rgba(228, 198, 255, 0.5)',
          filter: 'blur(490px)',
          borderRadius: '50%',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          width: '291px',
          height: '291px',
          right: '40px',
          top: '-213px',
          background: 'rgba(228, 198, 255, 0.5)',
          filter: 'blur(170px)',
          borderRadius: '50%',
        }}
      />

      <div className="relative z-10 max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-[60px]">
        <div className="flex flex-col items-center gap-5">
          <div
            className="flex items-center justify-center px-4 py-[10px] rounded-[20px] border border-[#062E25] w-fit"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(65px)',
              WebkitBackdropFilter: 'blur(65px)',
            }}
          >
            <span className="text-[#062E25] text-base font-light tracking-[-0.02em]">
              {t('howItWorks.eyebrow')}
            </span>
          </div>

          <h2 className="text-[#062E25] text-4xl sm:text-5xl lg:text-[65px] font-medium text-center capitalize">
            {t('howItWorks.title')}
          </h2>
        </div>

        <Image
          src="/images/bidirectional-charging/how-it-works-diagram-commercial.png"
          alt={t('howItWorks.title')}
          width={1075}
          height={404}
          className="rounded-[20px]"
        />
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

export default HowItWorksSection
