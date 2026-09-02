import { getTranslations } from 'next-intl/server'
import { Badge } from './ui/badge'
import Image from 'next/image'
import { Reveal, RevealStagger } from '@/components/motion/Reveal'
import RevealText from '@/components/motion/RevealText'

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
          <RevealText
            as="h2"
            className="text-foreground text-3xl md:text-[45px] font-medium"
          >
            {t('title')}
          </RevealText>
          <Reveal
            as="p"
            delay={0.2}
            className="text-foreground/80 text-lg md:text-[22px] tracking-tight"
          >
            {t('subtitle')}
          </Reveal>
        </div>

        <RevealStagger className="w-full flex flex-wrap items-center justify-center gap-x-10 gap-y-8 md:gap-x-14">
          {[
            { src: '/images/promo/logo-huawei.webp', alt: 'Huawei', width: 145, height: 36 },
            { src: '/images/promo/logo-sigenergy.svg', alt: 'Sigenergy', width: 202, height: 24 },
            { src: '/images/promo/logo-sofar.svg', alt: 'Sofar', width: 128, height: 24 },
          ].map((logo, i) => (
            <div key={logo.src} className="flex items-center">
              <Image
                src={logo.src}
                alt={logo.alt}
                width={logo.width}
                height={logo.height}
                className="h-auto max-h-[56px] w-auto object-contain"
              />
              {i < 2 && (
                <span
                  aria-hidden
                  className="hidden md:block ml-10 md:ml-14 w-px h-[89px] bg-[#062E25]/30"
                />
              )}
            </div>
          ))}
        </RevealStagger>
      </div>
    </section>
  )
}

export default OurPartners
