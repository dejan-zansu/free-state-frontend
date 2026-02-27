import { getTranslations } from 'next-intl/server'
import { LinkButton } from '@/components/ui/link-button'
import Image from 'next/image'

const FastChargingOffersSection = async () => {
  const t = await getTranslations('fastChargingStations')

  return (
    <section className="relative -mt-[40px]">
      <div className="flex flex-col lg:flex-row">
        <div
          className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-0 py-12 lg:py-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(242, 244, 232, 1) 78%, rgba(220, 233, 230, 1) 100%)',
          }}
        >
          <div className="max-w-[499px] flex flex-col gap-5">
            <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium">
              {t('offersSection.title')}
            </h2>

            <p className="text-[#062E25]/80 text-lg md:text-[22px] font-medium tracking-[-0.02em]">
              {t('offersSection.description')}
            </p>

            <LinkButton variant="quaternary" href="/contact" className="w-fit">
              {t('offersSection.cta')}
            </LinkButton>
          </div>
        </div>

        <div className="relative w-full lg:w-1/2 aspect-[720/586]">
          <Image
            src="/images/fast-charging-stations/fast-charging-offers-right.png"
            alt={t('offersSection.title')}
            fill
            className="object-cover"
          />
        </div>
      </div>
    </section>
  )
}

export default FastChargingOffersSection
