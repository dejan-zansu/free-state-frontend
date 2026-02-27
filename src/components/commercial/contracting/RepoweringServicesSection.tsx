import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const cards = [
  { key: 'numberOne', icon: '/images/commercial/contracting/icon-number-one.png' },
  { key: 'customers', icon: '/images/commercial/contracting/icon-customers.png' },
  { key: 'yieldGuarantee', icon: '/images/commercial/contracting/icon-yield.png' },
  { key: 'regionalist', icon: '/images/commercial/contracting/icon-regionalist.png' },
] as const

const RepoweringServicesSection = async () => {
  const t = await getTranslations('contracting')

  return (
    <section className="relative bg-[#EAEDDF] py-12 md:py-16 lg:py-20">
      <div className="max-w-[1260px] mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium text-center mb-10 md:mb-16">
          {t('repoweringServices.title')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((card) => (
            <div
              key={card.key}
              className="relative overflow-hidden rounded-[20px] h-[370px]"
              style={{
                background: '#0D4841',
                border: '1px solid #809792',
              }}
            >
              <div className="absolute top-[30px] left-1/2 -translate-x-1/2 w-[142px] h-[142px]">
                <Image
                  src={card.icon}
                  alt=""
                  width={142}
                  height={142}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>

              <div
                className="absolute bottom-0 left-0 right-0 px-10 py-5 flex flex-col gap-5"
                style={{
                  background: '#E5E6DE',
                  backdropFilter: 'blur(26px)',
                  WebkitBackdropFilter: 'blur(26px)',
                  border: '1px solid #809792',
                }}
              >
                <h3 className="text-[#062E25] text-lg md:text-[22px] font-bold text-center">
                  {t(`repoweringServices.cards.${card.key}.title`)}
                </h3>
                <p className="text-[#062E25]/80 text-base font-light tracking-[-0.02em] text-center whitespace-pre-line">
                  {t(`repoweringServices.cards.${card.key}.description`)}
                </p>
              </div>
            </div>
          ))}
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

export default RepoweringServicesSection
