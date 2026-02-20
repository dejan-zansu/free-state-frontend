import Image from 'next/image'
import { getTranslations } from 'next-intl/server'

const HowItWorksSection = async () => {
  const t = await getTranslations('energyStorage.howItWorks')

  return (
    <section className="relative w-full overflow-hidden bg-[#FDFFF5]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-[50px]">
        <div className="flex flex-col lg:flex-row items-center gap-[50px]">
          <div className="flex flex-col gap-5 max-w-[525px] shrink-0">
            <div
              className="flex items-center justify-center px-4 py-[10px] rounded-[20px] border border-[#062E25] w-fit"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(65px)',
                WebkitBackdropFilter: 'blur(65px)',
              }}
            >
              <span className="text-[#062E25] text-base font-light tracking-[-0.02em] text-center whitespace-nowrap">
                {t('eyebrow')}
              </span>
            </div>

            <h2 className="text-[#062E25] text-3xl md:text-[45px] font-medium whitespace-pre-line">
              {t('title')}
            </h2>

            <p className="text-[#062E25]/80 text-base md:text-[22px] font-light tracking-[-0.02em] whitespace-pre-line max-w-[502px]">
              {t('description')}
            </p>
          </div>

          <div className="relative w-full max-w-[550px]">
            <Image
              src="/images/energy-storage/energy-flow-chart.png"
              alt={t('title')}
              width={550}
              height={388}
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>

      <div
        className="w-full h-px opacity-20"
        style={{
          background:
            'linear-gradient(54deg, rgba(6, 46, 37, 1) 74%, rgba(3, 107, 83, 1) 100%)',
        }}
      />
    </section>
  )
}

export default HowItWorksSection
