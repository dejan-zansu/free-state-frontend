import { getTranslations } from 'next-intl/server'
import { Badge } from './ui/badge'
import Image from 'next/image'

const OurPartners = async () => {
  const t = await getTranslations('home.ourPartners')

  return (
    <section
      className=" z-10 w-full py-12 md:py-16 px-4 sm:px-6"
      style={{
        background: 'linear-gradient(180deg, #F2F4E8 78%, #DCE9E6 100%)',
      }}
    >
      <div className="max-w-[1186px] mx-auto flex flex-col items-center gap-16 pb-[40px]">
        <div className="flex flex-col items-center gap-5 max-w-[726px] text-center">
          <Badge
            variant="outline"
            className="border-foreground text-foreground font-light text-base backdrop-blur-[65px]"
          >
            {t('eyebrow')}
          </Badge>
          <h2 className="text-foreground text-3xl md:text-[45px] font-medium">
            {t('title')}
          </h2>
          <p className="text-foreground/80 text-lg md:text-[22px] font-light tracking-tight">
            {t('subtitle')}
          </p>
        </div>

        <div className="w-full flex flex-wrap items-center justify-center gap-x-10 gap-y-8 md:gap-x-14">
          {[
            { src: '/images/swisscom-logo.png', alt: 'Swisscom', width: 196, height: 53 },
            { src: '/images/partners/partner-2.svg', alt: 'Partner', width: 95, height: 37 },
            { src: '/images/partners/partner-3.svg', alt: 'Partner', width: 225, height: 34 },
            { src: '/images/partners/partner-4.svg', alt: 'Partner', width: 169, height: 21 },
            { src: '/images/partners/partner-5.svg', alt: 'Partner', width: 183, height: 45 },
          ].map((logo, i) => (
            <div key={logo.src} className="flex items-center">
              <Image
                src={logo.src}
                alt={logo.alt}
                width={logo.width}
                height={logo.height}
                className="h-auto max-h-[56px] w-auto object-contain"
              />
              {i < 4 && (
                <span
                  aria-hidden
                  className="hidden md:block ml-10 md:ml-14 w-px h-[89px] bg-[#062E25]/30"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default OurPartners
