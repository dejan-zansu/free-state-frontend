import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const bullets = ['owners', 'condominiums'] as const

const FreeStateOffersSection = async () => {
  const t = await getTranslations('apartmentBuilding')

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
          <div className="max-w-[582px] flex flex-col gap-5">
            <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium">
              {t('freeStateOffers.title')}
            </h2>

            <div className="flex flex-col gap-5">
              {bullets.map((key) => (
                <div key={key} className="flex items-start gap-[10px]">
                  <Image
                    src="/images/apartment-building/checkmark-green.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="flex-shrink-0 mt-[10px]"
                  />
                  <p className="text-[#062E25]/80 text-lg md:text-[22px] font-medium tracking-[-0.02em]">
                    {t(`freeStateOffers.bullets.${key}`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative w-full lg:w-1/2 aspect-[720/586]">
          <Image
            src="/images/apartment-building/freestate-offers-image-new-1fd214.png"
            alt={t('freeStateOffers.title')}
            fill
            className="object-cover"
          />
        </div>
      </div>
    </section>
  )
}

export default FreeStateOffersSection
