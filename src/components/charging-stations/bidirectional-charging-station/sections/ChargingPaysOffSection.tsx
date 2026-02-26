import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const ChargingPaysOffSection = async () => {
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
              {t('chargingPaysOff.title')}
            </h2>

            <p className="text-[#062E25]/80 text-lg md:text-[22px] font-light tracking-[-0.02em]">
              {t('chargingPaysOff.description')}
            </p>
          </div>
        </div>

        <div className="w-full lg:w-1/2 relative aspect-[720/487]">
          <Image
            src="/images/bidirectional-charging/charging-pays-off-right-5c95e0.png"
            alt={t('chargingPaysOff.title')}
            fill
            className="object-cover"
          />
        </div>
      </div>
    </section>
  )
}

export default ChargingPaysOffSection
