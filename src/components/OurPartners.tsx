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

        <div className="w-full">
          <Image
            src="/images/partner-logos.svg"
            alt={t('title')}
            width={1186}
            height={93}
            className="w-full max-w-full h-auto"
          />
        </div>
      </div>
    </section>
  )
}

export default OurPartners
