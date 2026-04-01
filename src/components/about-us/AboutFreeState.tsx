import { useTranslations } from 'next-intl'
import Image from 'next/image'

const AboutFreeState = () => {
  const t = useTranslations('aboutUs.aboutFreeState')

  return (
    <section
      className="relative w-full overflow-hidden -mt-[40px]"
      style={{
        background:
          'linear-gradient(146deg, rgba(6, 46, 37, 1) 0%, rgba(9, 63, 53, 1) 49%, rgba(21, 139, 126, 1) 100%)',
      }}
    >
      <div className="absolute top-[-171px] left-[563px] w-[374px] h-[374px] rounded-full bg-solar blur-[490px]" />
      <div className="absolute top-[-203px] left-[605px] w-[291px] h-[291px] rounded-full bg-solar blur-[170px]" />

      <div className="relative min-h-[500px] lg:min-h-[693px] pt-[40px]">
        <div className="relative z-10 flex flex-col items-center text-center py-16 px-4 sm:px-6 lg:px-20 lg:py-0 lg:justify-center lg:items-start lg:text-left lg:max-w-[640px] lg:h-[693px]">
          <span className="inline-flex items-center justify-center px-4 py-2.5 rounded-[20px] bg-white/20 border border-white/30 backdrop-blur-[65px] text-white text-base font-light tracking-tight">
            {t('eyebrow')}
          </span>

          <h2 className="mt-5 text-white text-4xl sm:text-5xl lg:text-[65px] font-medium capitalize">
            {t('title')}
          </h2>

          <p className="mt-5 text-white/80 text-lg lg:text-[22px] font-light max-w-[505px] text-center lg:text-left">
            {t('subtitle')}
          </p>
        </div>

        <div className="relative lg:absolute lg:right-0 lg:top-0 lg:w-1/2 h-[300px] sm:h-[400px] lg:h-full">
          <Image
            src="/images/about-us-last-section-image-52b37f.png"
            alt=""
            fill
            className="object-cover"
          />
        </div>
      </div>
    </section>
  )
}

export default AboutFreeState
