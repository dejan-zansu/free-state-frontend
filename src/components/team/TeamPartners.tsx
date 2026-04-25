import Image from 'next/image'
import { useTranslations } from 'next-intl'

const TeamPartners = () => {
  const t = useTranslations('team.partners')

  return (
    <section
      className="relative w-full pt-12 lg:pt-[50px] pb-[88px] lg:pb-[90px] -mb-[40px]"
      style={{
        background:
          'linear-gradient(180deg, rgba(242, 244, 232, 1) 78%, rgba(220, 233, 230, 1) 100%)',
      }}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20">
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center justify-center px-4 py-2.5 rounded-[20px] border border-foreground text-foreground text-base font-light tracking-tight backdrop-blur-[65px]">
            {t('eyebrow')}
          </span>

          <h2 className="mt-5 text-foreground text-3xl sm:text-4xl lg:text-[45px] font-medium text-center">
            {t('title')}
          </h2>

          <p className="mt-5 text-foreground/80 text-lg lg:text-[22px] font-light max-w-[518px]">
            {t('subtitle')}
          </p>

          <div className="mt-14 w-full flex justify-center">
            <Image
              src="/images/team-partner-logos.png"
              alt={t('title')}
              width={1186}
              height={93}
              className="w-full max-w-[1186px] h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default TeamPartners
