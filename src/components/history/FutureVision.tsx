import { useTranslations } from 'next-intl'

const FutureVision = () => {
  const t = useTranslations('history.futureVision')

  return (
    <section className="relative w-full bg-[#FDFFF5] py-12 lg:py-[50px]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20">
        <div className="flex flex-col items-center text-center max-w-[813px] mx-auto">
          <span className="inline-flex items-center justify-center px-4 py-2.5 rounded-[20px] border border-foreground text-foreground text-base font-light tracking-tight backdrop-blur-[65px]">
            {t('eyebrow')}
          </span>

          <h2 className="mt-5 text-foreground text-4xl sm:text-5xl lg:text-[70px] font-medium capitalize">
            {t('title')}
          </h2>

          <p className="mt-7 text-foreground/80 text-lg lg:text-[22px] font-light max-w-[563px]">
            {t('subtitle')}
          </p>
        </div>

        <div className="w-full max-w-[643px] mx-auto h-px bg-foreground/20 mt-12" />

        <p className="mt-7 text-foreground/80 text-base font-light text-center max-w-[747px] mx-auto whitespace-pre-line">
          {t('bottomText')}
        </p>
      </div>
    </section>
  )
}

export default FutureVision
