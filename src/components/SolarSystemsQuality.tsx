import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import SolarSystemsQualityTimeline from './SolarSystemsQualityTimeline'

const SolarSystemsQuality = async () => {
  const t = await getTranslations('solarSystems')

  const qualityItems = [
    t('quality.items.highPerformance'),
    t('quality.items.longTermUse'),
    t('quality.items.certifiedQuality'),
    t('quality.items.expertSelected'),
  ]

  return (
    <section className="relative bg-[#EAEDDF]">
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-20"
        style={{
          background:
            'linear-gradient(54deg, rgba(6, 46, 37, 1) 74%, rgba(3, 107, 83, 1) 100%)',
        }}
      />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <h2 className="text-[#062E25] text-3xl sm:text-4xl lg:text-[45px] font-medium leading-none tracking-tight text-center mb-16 lg:mb-20">
          {t('quality.title')}
        </h2>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          <SolarSystemsQualityTimeline items={qualityItems} />

          <div className="relative lg:w-1/2 aspect-[721/600] border-x border-[#062E25]">
            <Image
              src="/images/solar-system.png"
              alt={t('quality.title')}
              fill
              className="object-cover"
              quality={100}
            />
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

export default SolarSystemsQuality
