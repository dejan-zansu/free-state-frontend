import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { CareerSubscriptionForm } from './CareerSubscriptionForm'

const CareersStayInformed = () => {
  const t = useTranslations('careersPage.stayInformed')

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background:
          'linear-gradient(181deg, rgba(243, 245, 233, 1) 8%, rgba(220, 233, 230, 1) 100%)',
      }}
    >
      <div className="flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/2 px-4 sm:px-6 py-12 md:py-16 lg:py-[80px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-[40px] w-full max-w-[436px]">
            <div className="flex flex-col items-center gap-5 w-full">
              <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium text-center">
                {t('title')}
              </h2>
              <p className="text-[#062E25]/80 text-lg md:text-[22px] font-light tracking-[-0.02em] text-center">
                {t('description')}
              </p>
            </div>

            <CareerSubscriptionForm className="flex items-center bg-white/10 border border-[#062E25]/40 rounded-2xl backdrop-blur-[20px] px-8 py-[26px] w-full" />
          </div>
        </div>

        <div className="relative w-full lg:w-1/2 aspect-[720/488] lg:aspect-auto lg:self-stretch min-h-[280px]">
          <Image
            src="/images/careers-stay-informed-right.webp"
            alt=""
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[rgba(0,230,120,0.1)]" />
        </div>
      </div>
    </section>
  )
}

export default CareersStayInformed
