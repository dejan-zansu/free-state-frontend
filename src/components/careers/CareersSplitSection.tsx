import { useTranslations } from 'next-intl'
import Image from 'next/image'

const CareersSplitSection = () => {
  const t = useTranslations('careersPage.splitSection')

  return (
    <section className="relative w-full -mt-[40px]">
      <div className="flex flex-col lg:flex-row">
        <div className="relative w-full lg:w-1/2 aspect-[720/488]">
          <Image
            src="/images/careers-split-left-4ff04a.webp"
            alt=""
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[rgba(0,230,120,0.1)]" />
        </div>

        <div className="relative w-full lg:w-1/2 bg-solar flex items-center justify-center px-4 sm:px-6 lg:px-0 py-16 lg:py-0 lg:aspect-[720/488]">
          <div className="flex flex-col items-center gap-5 max-w-[353px]">
            <h2 className="text-foreground text-3xl sm:text-4xl md:text-[45px] font-medium text-center">
              {t('title')}
            </h2>
            <p className="text-foreground/80 text-sm font-medium tracking-[-0.02em] text-center">
              {t('description')}
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

export default CareersSplitSection
