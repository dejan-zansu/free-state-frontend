import { LeafIcon } from '@/components/icons'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import LightBulbIcon from '../icons/LihghtBulbIcon'

const SelectionCriteriaSection = async () => {
  const t = await getTranslations('howItWorks')

  return (
    <section className="relative min-h-[800px] md:min-h-[1043px] overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/images/how-it-works-section-bg.png"
          alt=""
          fill
          className="object-cover"
        />
      </div>

      <div className="relative z-10 max-w-[1250px] mx-auto px-4 sm:px-6 py-10 md:py-[38px]">
        <h2 className="text-white text-3xl sm:text-4xl md:text-[45px] font-medium leading-[1em] text-center mb-16 md:mb-[105px]">
          {t('selectionCriteria.title')}
        </h2>

        <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-[90px] mb-12 md:mb-16">
          <div className="flex items-center gap-3">
            <div className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] rounded-[20px] bg-white flex items-center justify-center shrink-0">
              <LightBulbIcon className="text-[#036B53]" />
            </div>

            <div className="bg-white/50 backdrop-blur-[26px] border border-white/10 rounded-[20px] p-4 md:p-5 max-w-[527px]">
              <p className="text-[#062E25]/80 text-base md:text-xl leading-[1.2] text-center">
                {t('selectionCriteria.quote')}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-5 max-w-[505px]">
            <div className="flex items-center gap-2">
              <LeafIcon className="w-[13px] h-[13px] text-[#B7FE1A] shrink-0" />
              <span className="text-white/80 text-lg md:text-[22px] font-bold">
                {t('selectionCriteria.roofCondition.title')}
              </span>
            </div>
            <p className="text-white/80 text-lg md:text-[22px]">
              {t('selectionCriteria.roofCondition.description')}
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 md:gap-16">
          <div className="flex flex-col gap-10 max-w-[505px]">
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <LeafIcon className="w-[13px] h-[13px] text-[#B7FE1A] shrink-0" />
                <span className="text-white/80 text-lg md:text-[22px] font-bold">
                  {t('selectionCriteria.onRoofOrInRoof.title')}
                </span>
              </div>
              <p className="text-white/80 text-lg md:text-[22px]">
                {t('selectionCriteria.onRoofOrInRoof.description')}
              </p>
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <LeafIcon className="w-[13px] h-[13px] text-[#B7FE1A] shrink-0" />
                <span className="text-white/80 text-lg md:text-[22px] font-bold">
                  {t('selectionCriteria.desiredAppearance.title')}
                </span>
              </div>
              <p className="text-white/80 text-lg md:text-[22px]">
                {t('selectionCriteria.desiredAppearance.description')}
              </p>
            </div>
          </div>

          <div className="flex-1 flex justify-end">
            <div className="relative w-full">
              <Image
                src="/images/two-small-roofs-with-solar-panels.png"
                alt="Two roofs with solar panels"
                fill
                className="object-contain object-right-bottom"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SelectionCriteriaSection
