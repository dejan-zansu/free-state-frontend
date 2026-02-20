import { getTranslations } from 'next-intl/server'

const MaintenanceServicesSection = async () => {
  const t = await getTranslations('service')

  return (
    <section className="relative w-full bg-[#FDFFF5]">
      <div className="max-w-[533px] mx-auto px-4 sm:px-6 py-12 md:py-[50px]">
        <div className="flex flex-col gap-5">
          <div
            className="flex items-center justify-center px-4 py-[10px] rounded-[20px] border border-[#062E25] w-fit"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(65px)',
              WebkitBackdropFilter: 'blur(65px)',
            }}
          >
            <span className="text-[#062E25] text-base font-light tracking-[-0.02em] text-center whitespace-nowrap">
              {t('maintenance.eyebrow')}
            </span>
          </div>

          <h2 className="text-[#062E25] text-3xl md:text-[45px] font-medium leading-[1em]">
            {t('maintenance.title')}
          </h2>

          <p className="text-[#062E25]/80 text-base md:text-[22px] font-light tracking-[-0.02em] whitespace-pre-line">
            {t('maintenance.description')}
          </p>
        </div>
      </div>
    </section>
  )
}

export default MaintenanceServicesSection
