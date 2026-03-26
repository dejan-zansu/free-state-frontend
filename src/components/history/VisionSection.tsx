import Image from 'next/image'
import { useTranslations } from 'next-intl'

/** Light diagonal wash (#0C4235 / #036B53), bottom-right → top-left. */
const VISION_GREEN_WASH =
  'linear-gradient(to top left, #0C423540 0%, #036B5333 45%, #036B531A 72%, #0C423500 100%)'

const VisionSection = () => {
  const t = useTranslations('history.vision')

  return (
    <section
      className="relative w-full overflow-hidden -mb-[40px] pb-[40px]"
      style={{
        background:
          'linear-gradient(180deg, rgba(242, 244, 232, 1) 78%, rgba(220, 233, 230, 1) 100%)',
      }}
    >
      <div
        className="absolute inset-0 z-1 pointer-events-none"
        style={{ background: VISION_GREEN_WASH }}
        aria-hidden
      />

      <div className="relative z-10 max-w-[1440px] mx-auto flex flex-col lg:flex-row min-h-[500px] lg:min-h-[731px]">
        <div className="relative z-10 flex flex-col items-center text-center py-16 px-4 sm:px-6 lg:px-20 lg:py-0 lg:justify-center lg:items-center lg:max-w-[640px]">
          <span className="inline-flex items-center justify-center px-4 py-2.5 rounded-[20px] border border-foreground bg-white/20 backdrop-blur-[65px] text-foreground text-base font-light tracking-tight">
            {t('eyebrow')}
          </span>

          <h2 className="mt-5 text-foreground text-3xl sm:text-4xl lg:text-[65px] font-medium capitalize">
            {t('title')}
          </h2>

          <p className="mt-5 text-foreground/80 text-lg lg:text-[22px] font-light max-w-[505px]">
            {t('subtitle')}
          </p>
        </div>

        <div className="relative z-10 lg:absolute lg:right-0 lg:top-0 lg:w-1/2 h-[300px] sm:h-[400px] lg:h-full flex items-center justify-center px-4 sm:px-6 lg:px-10 py-8">
          <Image
            src="/images/history-vision-bg-2eaf33.png"
            alt=""
            fill
            className="z-0 object-cover"
          />

          <div
            className="absolute inset-0 z-5 pointer-events-none"
            style={{ background: VISION_GREEN_WASH }}
            aria-hidden
          />

          <div className="relative z-10 w-full max-w-[577px] p-6 sm:p-10 rounded-[16px] border border-[#f6f6f6]/60 backdrop-blur-[10px] bg-[rgba(28,40,31,0.06)]">
            <p className="text-[#FDFFF5]/80 text-base font-light text-center">
              {t('cardText')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default VisionSection
