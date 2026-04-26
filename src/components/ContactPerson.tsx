'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { LinkButton } from './ui/link-button'

type Props = {
  translationNamespace?: string
}

const ContactPerson = ({ translationNamespace = 'solarAboMulti' }: Props) => {
  const t = useTranslations(`${translationNamespace}.contactPerson`)

  return (
    <section className="w-full grid grid-cols-1 md:grid-cols-2">
      <div className="relative px-6 sm:px-10 py-14 sm:py-20 md:px-[230px] md:py-[270px] bg-[linear-gradient(64deg,#191D1C_0%,#3D3858_100%)] text-white">
        <div className="flex flex-col gap-5 max-w-[261px] mx-auto md:mx-0 items-center md:items-start text-center md:text-left">
          <div className="flex flex-col gap-1 items-center md:items-start">
            <h3 className="font-figtree font-medium text-3xl sm:text-4xl md:text-[45px] text-white">
              {t('name')}
            </h3>
            <span className="md:hidden font-figtree font-light text-base tracking-[-0.02em] text-white/80">
              {t('role')}
            </span>
          </div>

          <div className="flex flex-col gap-[10px] items-center md:items-start">
            <a
              href={`tel:${t('phoneHref')}`}
              className="flex items-center gap-2 text-white/80 font-figtree font-medium text-sm tracking-[-0.02em]"
            >
              <span className="block w-[13px] h-[13px] border-[1.5px] border-[#9F3E4F] rounded-tl-[5px] rounded-br-[5px] shrink-0" />
              {t('phone')}
            </a>
            <a
              href={`mailto:${t('email')}`}
              className="flex items-center gap-2 text-white/80 font-figtree font-medium text-sm tracking-[-0.02em] break-all"
            >
              <span className="block w-[13px] h-[13px] border-[1.5px] border-[#9F3E4F] rounded-tl-[5px] rounded-br-[5px] shrink-0" />
              {t('email')}
            </a>
          </div>

          <LinkButton
            href="/contact"
            variant="outline-quaternary"
            className="w-fit"
          >
            {t('cta')}
          </LinkButton>
        </div>
      </div>

      <div className="relative aspect-[4/5] sm:aspect-[3/2] md:aspect-auto md:min-h-[720px] bg-[linear-gradient(90deg,#F2F4E8_44%,#D6E2DF_100%)]">
        <Image
          src="/images/solar-free/multi-family-contact-person-63995f.webp"
          alt={t('name')}
          fill
          className="object-cover"
        />
        <div className="hidden md:flex absolute top-5 right-5 md:top-[21px] md:right-[64px] flex-col items-center gap-[10px] w-[120px]">
          <span className="inline-flex items-center justify-center px-3 py-[10px] rounded-[20px] bg-white/20 border border-[#062E25] backdrop-blur-[65px] text-[#062E25] font-figtree font-semibold text-base">
            {t('name')}
          </span>
          <span className="text-center font-figtree font-light text-sm sm:text-base tracking-[-0.02em] text-[#062E25]">
            {t('role')}
          </span>
        </div>
      </div>
    </section>
  )
}

export default ContactPerson
