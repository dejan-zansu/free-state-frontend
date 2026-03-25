import Image from 'next/image'
import { useTranslations } from 'next-intl'

const FoundingSection = () => {
  const t = useTranslations('history.founding')

  return (
    <section className="relative w-full bg-[#FDFFF5] pt-12 lg:pt-[50px]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20">
        <div className="flex flex-col items-center text-center mb-10 lg:mb-[50px]">
          <span className="inline-flex items-center justify-center px-4 py-2.5 rounded-[20px] border border-foreground bg-white/20 backdrop-blur-[65px] text-foreground text-base font-light tracking-tight">
            {t('eyebrow')}
          </span>

          <h2 className="mt-5 text-foreground text-3xl sm:text-4xl lg:text-[45px] font-medium text-center">
            {t('title')}
          </h2>

          <p className="mt-5 text-foreground/80 text-lg lg:text-[22px] font-light max-w-[679px]">
            {t('subtitle')}
          </p>
        </div>
      </div>

      <div className="relative w-full h-[250px] sm:h-[280px] lg:h-[320px]">
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              'linear-gradient(90deg, rgba(74, 154, 153, 0) 22%, rgba(74, 154, 153, 0.5) 100%), linear-gradient(180deg, rgba(74, 154, 153, 0) 23%, rgba(74, 154, 153, 0.5) 100%)',
            backgroundColor: 'rgba(74, 154, 153, 0.35)',
          }}
        />
        <Image
          src="/images/history-founding-bg-62becc.png"
          alt=""
          fill
          className="object-cover"
        />

        <div className="absolute inset-0 z-[2] flex items-center justify-center px-4">
          <div className="max-w-[606px] w-full p-6 sm:p-10 rounded-[16px] border border-[#f6f6f6]/60 backdrop-blur-[10px] bg-[rgba(185,205,191,0.03)]">
            <p className="text-[#FDFFF5]/80 text-base font-light text-center">
              {t('cardText')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FoundingSection
