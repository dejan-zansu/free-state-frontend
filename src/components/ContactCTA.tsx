import { getTranslations } from 'next-intl/server'
import { Badge } from './ui/badge'
import { LinkButton } from './ui/link-button'
import Image from 'next/image'

const ContactCTA = async () => {
  const t = await getTranslations('contactCTA')

  return (
    <section
      className="relative w-full min-h-[600px] lg:min-h-[838px]"
      style={{
        background: 'linear-gradient(180deg, #F2F4E8 78%, #DCE9E6 100%)',
      }}
    >
      <div className="absolute top-0 right-0 w-full lg:w-1/2 h-full">
        <Image
          src="/images/contact-cta-bg-384c05.png"
          alt=""
          fill
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(12,66,53,0) 22%, rgba(12,66,53,1) 100%), linear-gradient(180deg, rgba(3,107,83,0) 23%, rgba(3,107,83,1) 100%)',
          }}
        />
      </div>

      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[78px] py-20 lg:py-[225px] flex flex-col lg:flex-row gap-12 lg:gap-20">
        <div className="flex flex-col items-center text-center gap-10 lg:max-w-[559px]">
          <div className="flex flex-col items-center gap-5">
            <Badge
              variant="outline"
              className="border-foreground text-foreground font-light text-base backdrop-blur-[65px]"
            >
              {t('eyebrow')}
            </Badge>
            <h2 className="text-foreground text-3xl sm:text-4xl md:text-5xl lg:text-[65px] font-medium capitalize">
              {t('title')}
            </h2>
          </div>
          {/* <LinkButton href="/solar-calculator" variant="primary">
            {t('cta')}
          </LinkButton> */}
        </div>

        <div className="flex-1 flex items-end justify-center lg:justify-end">
          <div className="rounded-2xl border border-[#f6f6f6]/70 bg-[#1c281f]/16 backdrop-blur-[30px] p-10 max-w-[577px]">
            <p className="text-[#FDFFF5]/80 text-base font-light tracking-tight text-center">
              {t('description')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactCTA
