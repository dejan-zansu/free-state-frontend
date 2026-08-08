import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const BatteryInstallationSection = async () => {
  const t = await getTranslations('energyStorage')

  return (
    <section className="relative overflow-hidden bg-[#EAEDDF]">
      <div className="flex flex-col lg:flex-row">
        <div className="relative w-full lg:w-1/2 aspect-[490/344]">
          <Image
            src="/images/battery-storage-installation.webp"
            alt={t('installation.title')}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-10 py-12 lg:py-0">
          <div className="flex flex-col gap-5 max-w-[561px]">
            <div
              className="flex items-center justify-center px-4 py-[10px] rounded-[20px] border border-[#062E25] w-fit"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(65px)',
                WebkitBackdropFilter: 'blur(65px)',
              }}
            >
              <span className="text-[#062E25] text-base tracking-[-0.02em] text-center whitespace-nowrap">
                {t('installation.eyebrow')}
              </span>
            </div>

            <h2 className="text-[#062E25] text-3xl md:text-[45px] font-medium">
              {t('installation.title')}
            </h2>

            <p className="text-[#062E25]/80 text-base md:text-[22px] leading-[1.27em] tracking-[-0.02em]">
              {t('installation.description')}
            </p>
          </div>
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

export default BatteryInstallationSection
