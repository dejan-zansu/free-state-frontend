import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const serviceItems = [
  'consultation',
  'feasibilityStudy',
  'preliminaryStudy',
  'roofUsageAgreement',
  'planning',
  'projectManagement',
  'installation',
  'commissioning',
  'operationsMaintenance',
  'repoweringOptimization',
] as const

const OurServicesSection = async () => {
  const t = await getTranslations('contracting')

  return (
    <section className="relative overflow-hidden min-h-[956px]" style={{ background: '#4A9A99' }}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/images/commercial/contracting/our-services-bg-15cd4e.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(0deg, rgba(234, 237, 223, 0) 9%, rgba(234, 237, 223, 1) 100%)',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(270deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 99%)',
        }}
      />
      <div className="absolute inset-0" style={{ background: 'rgba(0, 0, 0, 0.2)' }} />
      <div className="absolute inset-0" style={{ background: 'rgba(173, 66, 197, 0.2)' }} />

      <div className="relative z-10 flex flex-col items-center gap-[50px] px-4 sm:px-6 lg:px-0 py-12 lg:py-[50px] lg:ml-auto lg:mr-[90px] lg:max-w-[571px]">
        <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium text-center w-full">
          {t('ourServices.title')}
        </h2>

        <div
          className="w-full rounded-2xl p-10 flex flex-col items-center gap-[30px]"
          style={{
            background: 'rgba(185, 205, 191, 0.3)',
            border: '1px solid rgba(246, 246, 246, 0.6)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
          }}
        >
          <p className="text-[#062E25]/80 text-lg md:text-[22px] font-light tracking-[-0.02em]">
            {t('ourServices.description')}
          </p>

          <div className="flex flex-col gap-[30px] w-full">
            {serviceItems.map((item) => (
              <div key={item} className="flex items-center gap-[10px]">
                <Image
                  src="/images/commercial/project-development/checkmark-green.svg"
                  alt=""
                  width={20}
                  height={20}
                  className="shrink-0"
                />
                <span className="text-[#062E25]/80 text-lg md:text-[22px] font-medium tracking-[-0.02em]">
                  {t(`ourServices.items.${item}`)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default OurServicesSection
