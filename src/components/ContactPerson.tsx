'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { LinkButton } from './ui/link-button'

type Props = {
  translationNamespace?: string
}

const ContactPerson = ({
  translationNamespace = 'solarAboMulti',
}: Props) => {
  const t = useTranslations(`${translationNamespace}.contactPerson`)

  return (
    <section className="w-full grid grid-cols-1 md:grid-cols-2">
      <div className="relative px-8 py-16 md:px-[230px] md:py-[270px] bg-[linear-gradient(64deg,#191D1C_0%,#3D3858_100%)] text-white">
        <div className="flex flex-col gap-5 max-w-[261px]">
          <h3 className="font-figtree font-medium text-[32px] md:text-[45px] text-white">
            {t('name')}
          </h3>

          <div className="flex flex-col gap-[10px]">
            <a
              href={`tel:${t('phoneHref')}`}
              className="flex items-center gap-2 text-white/80 font-figtree font-medium text-[14px] tracking-[-0.02em]"
            >
              <span className="block w-[13px] h-[13px] border-[1.5px] border-[#9F3E4F] rounded-tl-[5px] rounded-br-[5px]" />
              {t('phone')}
            </a>
            <a
              href={`mailto:${t('email')}`}
              className="flex items-center gap-2 text-white/80 font-figtree font-medium text-[14px] tracking-[-0.02em]"
            >
              <span className="block w-[13px] h-[13px] border-[1.5px] border-[#9F3E4F] rounded-tl-[5px] rounded-br-[5px]" />
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

      <div className="relative min-h-[320px] md:min-h-[720px] bg-[linear-gradient(90deg,#F2F4E8_44%,#D6E2DF_100%)]">
        <Image
          src="/images/solar-free/multi-family-contact-person-63995f.webp"
          alt={t('name')}
          fill
          className="object-cover"
        />
        <div className="absolute top-[21px] right-[64px] flex flex-col items-center gap-[10px] w-[113px]">
          <span className="inline-flex items-center justify-center px-4 py-[10px] rounded-[20px] bg-white/20 border border-[#062E25] backdrop-blur-[65px] text-[#062E25] font-figtree font-semibold text-[16px] tracking-[-0.02em]">
            {t('name')}
          </span>
          <span className="text-center font-figtree font-light text-[16px] tracking-[-0.02em] text-[#062E25]">
            {t('role')}
          </span>
        </div>
      </div>
    </section>
  )
}

export default ContactPerson
