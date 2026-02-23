import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const ChargingSolutionsSection = async () => {
  const t = await getTranslations('chargingStationsCompany')

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
          <div className="max-w-[440px] flex flex-col gap-5">
            <div
              className="flex items-center justify-center px-4 py-[10px] rounded-[20px] border border-[#062E25] w-fit"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(65px)',
                WebkitBackdropFilter: 'blur(65px)',
              }}
            >
              <span className="text-[#062E25] text-base font-light tracking-[-0.02em]">
                {t('chargingSolutions.eyebrow')}
              </span>
            </div>

            <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium">
              {t('chargingSolutions.title')}
            </h2>

            <p className="text-[#062E25]/80 text-lg md:text-[22px] font-light tracking-[-0.02em]">
              {t('chargingSolutions.description')}
            </p>
          </div>
        </div>

        <div className="relative w-full lg:w-1/2 aspect-[720/586]">
          <Image
            src="/images/charging-stations/company/company-charging-image-49280f.png"
            alt={t('chargingSolutions.title')}
            fill
            className="object-cover"
          />
        </div>
      </div>
    </section>
  )
}

export default ChargingSolutionsSection
