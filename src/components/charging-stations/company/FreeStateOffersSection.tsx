import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const bullets = ['owners', 'condominiums'] as const

const FreeStateOffersSection = async () => {
  const t = await getTranslations('chargingStationsCompany')

  return (
    <section
      className="relative py-12 md:py-16 lg:py-20"
      style={{
        background:
          'linear-gradient(180deg, rgba(242, 244, 232, 1) 78%, rgba(220, 233, 230, 1) 100%)',
      }}
    >
      <div className="max-w-[582px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5">
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
    </section>
  )
}

export default FreeStateOffersSection
