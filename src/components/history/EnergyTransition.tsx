import Image from 'next/image'
import { useTranslations } from 'next-intl'

const EnergyTransition = () => {
  const t = useTranslations('history.energyTransition')

  return (
    <section
      className="relative w-full overflow-hidden -mt-[40px]"
      style={{
        background:
          'linear-gradient(180deg, rgba(242, 244, 232, 1) 78%, rgba(220, 233, 230, 1) 100%)',
      }}
    >
      <div className="absolute top-[-176px] right-[0px] w-[374px] h-[374px] rounded-full bg-solar/30 blur-[490px]" />
      <div className="absolute top-[-208px] right-[0px] w-[291px] h-[291px] rounded-full bg-solar/30 blur-[170px]" />

      <div className="absolute inset-0 -top-[21px] rounded-tl-[40px] overflow-hidden border border-[#63836F] pt-[40px]">
        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              'linear-gradient(0deg, rgba(242, 244, 232, 0) 18%, rgba(242, 244, 232, 1) 48%)',
            backgroundColor: 'rgba(168, 200, 193, 0.4)',
          }}
        />
        <Image
          src="/images/history-section1-bg-600a42.png"
          alt=""
          fill
          className="object-cover"
        />
      </div>

      <div className="relative z-20 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 py-16 lg:py-[118px]">
        <div className="flex flex-col items-center text-center max-w-[777px] mx-auto">
          <span className="inline-flex items-center justify-center px-4 py-2.5 rounded-[20px] border border-foreground bg-white/20 backdrop-blur-[65px] text-foreground text-base font-light tracking-tight">
            {t('eyebrow')}
          </span>

          <h2 className="mt-5 text-foreground text-3xl sm:text-4xl lg:text-[65px] font-medium capitalize">
            {t('title')}
          </h2>

          <p className="mt-5 text-foreground/80 text-lg lg:text-[22px] font-light">
            {t('subtitle')}
          </p>
        </div>

        <div className="w-full max-w-[643px] mx-auto h-px bg-[#ABB9AD] mt-12" />

        <p className="mt-7 text-foreground/80 text-lg lg:text-[22px] font-light text-center max-w-[592px] mx-auto">
          {t('bottomText')}
        </p>
      </div>
    </section>
  )
}

export default EnergyTransition
