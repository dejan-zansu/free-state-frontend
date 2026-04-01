import Image from 'next/image'
import { useTranslations } from 'next-intl'

const FounderSection = () => {
  const t = useTranslations('aboutUs.founder')

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, rgba(242, 244, 232, 1) 78%, rgba(220, 233, 230, 1) 100%)',
      }}
    >
      <div className="absolute top-[-224px] right-[0px] w-[374px] h-[374px] rounded-full bg-solar/30 blur-[490px]" />
      <div className="absolute top-[-256px] right-[0px] w-[291px] h-[291px] rounded-full bg-solar/30 blur-[170px]" />

      <div className="relative w-full">
        <div className="relative w-full h-[500px] sm:h-[600px] lg:h-[820px] -mt-[69px] rounded-t-[40px] overflow-hidden border border-[#63836F]">
          <div
            className="absolute inset-0 z-10"
            style={{
              background:
                'linear-gradient(0deg, rgba(242, 244, 232, 0) 18%, rgba(242, 244, 232, 1) 92%)',
              backgroundColor: 'rgba(168, 200, 193, 0.4)',
            }}
          />
          <Image
            src="/images/about-us-founder-bg-30d507.png"
            alt=""
            fill
            className="object-cover"
          />
        </div>

        <div className="absolute inset-0 z-20 flex items-start justify-center pt-[86px]">
          <div className="w-full max-w-[720px] mx-4 flex flex-col items-center text-center p-6 sm:p-10 rounded-[16px] border border-[#f6f6f6]/60 backdrop-blur-[10px] bg-[rgba(185,205,191,0.03)]">
            <span className="inline-flex items-center justify-center px-4 py-2.5 rounded-[20px] border border-foreground bg-white/20 backdrop-blur-[65px] text-foreground text-base font-light tracking-tight">
              {t('eyebrow')}
            </span>

            <h2 className="mt-5 text-foreground text-3xl sm:text-4xl lg:text-[65px] font-medium capitalize">
              {t('title')}
            </h2>

            <p className="mt-5 text-foreground/80 text-lg lg:text-[22px] font-light max-w-[505px]">
              {t('description')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FounderSection
