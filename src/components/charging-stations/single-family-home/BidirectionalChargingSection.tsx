import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const BidirectionalChargingSection = async () => {
  const t = await getTranslations('chargingStationsSingleFamilyHome')

  return (
    <section className="relative">
      <div className="flex flex-col lg:flex-row">
        <div className="relative w-full lg:w-1/2 aspect-[720/535] bg-[#B7FE1A]">
          <Image
            src="/images/charging-stations/single-family-home/bidirectional-charging.svg"
            alt={t('bidirectionalCharging.title')}
            fill
            className="object-contain"
          />
        </div>

        <div
          className="w-full lg:w-1/2 flex items-center px-4 sm:px-6 lg:px-0 py-12 lg:py-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(242, 244, 232, 1) 78%, rgba(220, 233, 230, 1) 100%)',
          }}
        >
          <div className="max-w-[582px] mx-auto flex flex-col gap-5">
            <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium">
              {t('bidirectionalCharging.title')}
            </h2>

            <p className="text-[#062E25]/80 text-lg md:text-[22px] font-light tracking-[-0.02em] text-justify">
              {t('bidirectionalCharging.description')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BidirectionalChargingSection
