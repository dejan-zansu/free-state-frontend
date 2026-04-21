import { cn } from '@/lib/utils'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

export interface SolarAboDetailsProps {
  translationNamespace: string
}

interface DetailRowProps {
  title: string
  description: string
  imageSrc: string
  imageAlt: string
  imageWidth: number
  imageHeight: number
  textWidth: number
  reverse?: boolean
}

const DetailRow = ({
  title,
  description,
  imageSrc,
  imageAlt,
  imageWidth,
  imageHeight,
  textWidth,
  reverse = false,
}: DetailRowProps) => {
  return (
    <div
      className={cn(
        'w-full flex flex-col items-center gap-8 md:gap-[50px]',
        reverse
          ? 'md:flex-row-reverse md:justify-between'
          : 'md:flex-row md:justify-center'
      )}
    >
      <div
        className="flex flex-col gap-5 w-full"
        style={{ maxWidth: `${textWidth}px` }}
      >
        <h3 className="text-[#062E25] text-xl sm:text-[22px] font-bold tracking-[-0.02em]">
          {title}
        </h3>
        <p className="text-[#062E25]/80 text-base font-light tracking-[-0.02em]">
          {description}
        </p>
      </div>
      <div
        className="relative w-full shrink-0"
        style={{
          maxWidth: `${imageWidth}px`,
          aspectRatio: `${imageWidth}/${imageHeight}`,
        }}
      >
        <Image src={imageSrc} alt={imageAlt} fill className="object-contain" />
      </div>
    </div>
  )
}

const SolarAboDetails = async ({
  translationNamespace,
}: SolarAboDetailsProps) => {
  const t = await getTranslations(translationNamespace)

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, rgba(242, 244, 232, 1) 78%, rgba(220, 233, 230, 1) 100%)',
      }}
    >
      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[30px] py-20 sm:py-24 lg:py-[100px]">
        <div className="mx-auto flex flex-col items-center gap-5 text-center max-w-[616px]">
          <div
            className="flex items-center justify-center px-4 py-[10px] rounded-[20px] border border-[#062E25]"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(65px)',
            }}
          >
            <span className="text-[#062E25] text-base font-light tracking-[-0.02em]">
              {t('details.eyebrow')}
            </span>
          </div>

          <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-5xl lg:text-[45px] font-medium text-center tracking-tight">
            {t('details.title')}
          </h2>

          <p className="text-[#062E25]/80 text-lg sm:text-xl lg:text-[22px] font-light tracking-[-0.02em] text-center max-w-[562px]">
            {t('details.subtitle')}
          </p>
        </div>

        <div className="mt-12 sm:mt-16 lg:mt-[60px] mx-auto max-w-[692px] flex flex-col items-center gap-10">
          <DetailRow
            title={t('details.solarModules.title')}
            description={t('details.solarModules.description')}
            imageSrc="/images/solar-free/solar-modules-details-73c74f.webp"
            imageAlt={t('details.solarModules.title')}
            imageWidth={364}
            imageHeight={236}
            textWidth={222}
          />

          <div className="w-full h-px bg-[#062E25]/30" />

          <DetailRow
            title={t('details.batteryStorage.title')}
            description={t('details.batteryStorage.description')}
            imageSrc="/images/solar-free/battery-storage-details-293b57.webp"
            imageAlt={t('details.batteryStorage.title')}
            imageWidth={298}
            imageHeight={262}
            textWidth={238}
            reverse
          />
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

export default SolarAboDetails
