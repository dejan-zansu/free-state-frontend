import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { LinkButton } from '@/components/ui/link-button'

const StorageSelfConsumptionSection = async () => {
  const t = await getTranslations('howLargePlantsWorks')

  return (
    <section className="relative">
      <div className="flex flex-col lg:flex-row">
        <div className="relative w-full lg:w-1/2 aspect-[720/586]">
          <Image
            src="/images/commercial/how-large-plants-works/storage-self-consumption.png"
            alt={t('storageSelfConsumption.title')}
            fill
            className="object-cover"
          />
        </div>

        <div
          className="w-full lg:w-1/2 flex items-center px-4 sm:px-6 lg:px-0 py-12 lg:py-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(242, 244, 232, 1) 78%, rgba(220, 233, 230, 1) 100%)',
          }}
        >
          <div className="max-w-[458px] flex flex-col gap-5 lg:pl-[69px]">
            <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium">
              {t('storageSelfConsumption.title')}
            </h2>
            <p className="text-[#062E25]/80 text-lg md:text-[22px] font-medium tracking-[-0.02em]">
              {t('storageSelfConsumption.description')}
            </p>
            <LinkButton href="/commercial/cost" variant="quaternary">
              {t('storageSelfConsumption.cta')}
            </LinkButton>
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

export default StorageSelfConsumptionSection
