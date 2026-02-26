import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const KeyFactsSection = async () => {
  const t = await getTranslations('bidirectionalChargingStation')

  return (
    <section className="relative">
      <div className="flex flex-col lg:flex-row">
        <div
          className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-0 py-12 lg:py-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(242, 244, 232, 1) 78%, rgba(220, 233, 230, 1) 100%)',
          }}
        >
          <div className="max-w-[436px] mx-auto flex flex-col gap-5 py-12 lg:py-0 px-4 sm:px-6 lg:px-0">
            <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium">
              {t('keyFacts.title')}
            </h2>

            <p className="text-[#062E25]/80 text-lg md:text-[22px] font-light tracking-[-0.02em]">
              {t('keyFacts.description')}
            </p>

            <div className="flex flex-col gap-[10px]">
              <div className="flex flex-row gap-[8px] items-center">
                <div className="w-[18px] h-[18px] flex items-center justify-center rounded-[9px] border-[1.5px] border-[#036B53] shrink-0">
                  <span className="text-[#062E25] text-[9px] font-bold">1</span>
                </div>
                <span className="text-[#062E25]/80 text-sm font-medium tracking-[-0.02em]">
                  {t('keyFacts.steps.1')}
                </span>
              </div>

              <div className="flex flex-row gap-[8px] items-center">
                <div className="w-[18px] h-[18px] flex items-center justify-center rounded-[9px] border-[1.5px] border-[#036B53] shrink-0">
                  <span className="text-[#062E25] text-[9px] font-bold">2</span>
                </div>
                <span className="text-[#062E25]/80 text-sm font-medium tracking-[-0.02em]">
                  {t('keyFacts.steps.2')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 relative aspect-[720/487]">
          <Image
            src="/images/bidirectional-charging/key-facts-right-749664.png"
            alt={t('keyFacts.title')}
            fill
            className="object-cover"
          />
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-px opacity-20"
        style={{
          background:
            'linear-gradient(54deg, rgba(6, 46, 37, 1) 74%, rgba(3, 107, 83, 1) 100%)',
        }}
      />
    </section>
  )
}

export default KeyFactsSection
