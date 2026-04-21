'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'

type Props = {
  translationNamespace?: string
}

const SolarAboMultiFamilyPublicSpaces = ({
  translationNamespace = 'solarAboMulti',
}: Props) => {
  const t = useTranslations(`${translationNamespace}.publicSpaces`)

  return (
    <section className="relative w-full overflow-hidden bg-[#EAEDDF]">
      <div className="absolute inset-0">
        <Image
          src="/images/solar-free/multi-family-public-spaces-bg-3de18b.webp"
          alt=""
          fill
          className="object-cover"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#EAEDDF]/0 to-[#EAEDDF]" />
      </div>

      <div className="relative px-6 pt-20 pb-20 md:pt-[100px] md:pb-[100px] max-w-[1440px] mx-auto">
        <div className="flex flex-col items-center text-center gap-5 max-w-[483px] mx-auto">
          <h3 className="font-figtree font-medium text-[32px] md:text-[45px] text-[#062E25]">
            {t('title')}
          </h3>
          <p className="font-figtree font-light text-[18px] md:text-[22px] tracking-[-0.02em] text-[#062E25]/80">
            {t('subtitle')}
          </p>
        </div>

        <div className="mt-10 md:mt-14 max-w-[898px] mx-auto">
          <div className="relative rounded-[12px] border border-white/70 bg-[#FEFFF8]/50 backdrop-blur-[10px] p-8 md:px-[58px] md:py-[30px]">
            <p className="font-figtree font-light text-[18px] md:text-[22px] tracking-[-0.02em] text-[#062E25]/80 whitespace-pre-line">
              {t('body')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SolarAboMultiFamilyPublicSpaces
