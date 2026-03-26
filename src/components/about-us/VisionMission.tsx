import Image from 'next/image'
import { useTranslations } from 'next-intl'

const VisionMission = () => {
  const t = useTranslations('aboutUs.visionMission')

  return (
    <section className="relative w-full bg-[#FDFFF5] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20">
        <div className="flex flex-col md:flex-row items-start justify-center gap-10 md:gap-0 py-12 lg:py-[50px]">
          <div className="flex flex-col items-center text-center flex-1 px-4">
            <span className="inline-flex items-center justify-center px-4 py-2.5 rounded-[20px] border border-foreground text-foreground text-base font-light tracking-tight">
              {t('vision.eyebrow')}
            </span>
            <h2 className="mt-5 text-foreground text-2xl sm:text-3xl lg:text-[35px] font-normal">
              {t('vision.title')}
            </h2>
            <p className="mt-5 text-foreground/80 text-lg lg:text-[22px] font-light max-w-[369px]">
              {t('vision.description')}
            </p>
          </div>

          <div className="hidden md:block w-px h-[290px] bg-foreground/30 shrink-0" />

          <div className="flex flex-col items-center text-center flex-1 px-4">
            <span className="inline-flex items-center justify-center px-4 py-2.5 rounded-[20px] border border-foreground text-foreground text-base font-light tracking-tight">
              {t('mission.eyebrow')}
            </span>
            <h2 className="mt-5 text-foreground text-2xl sm:text-3xl lg:text-[35px] font-normal">
              {t('mission.title')}
            </h2>
            <p className="mt-5 text-foreground/80 text-lg lg:text-[22px] font-light max-w-[423px]">
              {t('mission.description')}
            </p>
          </div>
        </div>
      </div>

      <div className="relative w-full h-[200px] sm:h-[260px] lg:h-[320px]">
        <div className="absolute inset-0 z-10 bg-[#036B53]/40" aria-hidden />
        <Image
          src="/images/about-us-vision-bg-645500.png"
          alt=""
          fill
          className="object-cover"
        />
      </div>
    </section>
  )
}

export default VisionMission
