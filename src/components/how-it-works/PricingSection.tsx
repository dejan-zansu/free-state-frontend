import { LinkButton } from '@/components/ui/link-button'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const PricingSection = async () => {
  const t = await getTranslations('howItWorks')

  const tableData = [
    {
      household: t('pricing.table.rows.car.household'),
      power: t('pricing.table.rows.car.power'),
      size: t('pricing.table.rows.car.size'),
    },
    {
      household: t('pricing.table.rows.twoPerson.household'),
      power: t('pricing.table.rows.twoPerson.power'),
      size: t('pricing.table.rows.twoPerson.size'),
    },
    {
      household: t('pricing.table.rows.threePerson.household'),
      power: t('pricing.table.rows.threePerson.power'),
      size: t('pricing.table.rows.threePerson.size'),
    },
    {
      household: t('pricing.table.rows.fourPerson.household'),
      power: t('pricing.table.rows.fourPerson.power'),
      size: t('pricing.table.rows.fourPerson.size'),
    },
    {
      household: t('pricing.table.rows.fivePerson.household'),
      power: t('pricing.table.rows.fivePerson.power'),
      size: t('pricing.table.rows.fivePerson.size'),
    },
  ]

  return (
    <section className="bg-[#FDFFF5]">
      {/* Top Section - Which solar system */}
      <div className="max-w-[1214px] mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <div className="flex flex-col gap-12 md:gap-16">
          {/* Title and description */}
          <div className="max-w-[885px]">
            <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium leading-[1em] mb-5">
              {t('pricing.whichSystem.title')}
            </h2>
            <p className="text-[#062E25]/80 text-lg sm:text-xl md:text-[22px] leading-[1.36] tracking-[-0.02em]">
              {t('pricing.whichSystem.description')}
            </p>
          </div>

          {/* Two cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Household consumption card */}
            <div className="bg-[#EAEDDF] border border-[#062E25]/50 rounded-[10px] p-8 md:p-10">
              <h3 className="text-[#17302A] text-2xl sm:text-3xl md:text-[35px] font-semibold leading-[1em] mb-5">
                {t('pricing.whichSystem.householdConsumption.title')}
              </h3>
              <p className="text-[#062E25]/80 text-lg sm:text-xl md:text-[22px] leading-[1.36] tracking-[-0.02em]">
                {t('pricing.whichSystem.householdConsumption.description')}
              </p>
            </div>

            {/* Size of roof area card */}
            <div className="bg-[#B7FE1A] border border-[#062E25]/50 rounded-[10px] p-8 md:p-10">
              <h3 className="text-[#062E25] text-2xl sm:text-3xl md:text-[35px] font-semibold leading-[1em] mb-5">
                {t('pricing.whichSystem.roofArea.title')}
              </h3>
              <p className="text-[#062E25]/80 text-lg sm:text-xl md:text-[22px] leading-[1.36] tracking-[-0.02em]">
                {t('pricing.whichSystem.roofArea.description')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Required output with background image */}
      <div className="relative min-h-[700px] md:min-h-[853px]">
        {/* Background image with gradient overlay */}
        <div className="absolute inset-0">
          <Image
            src="/images/home-with-solar-panels.png"
            alt="Home with solar panels"
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#FDFFF5] via-[#FDFFF5]/75 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-[925px] mx-auto px-4 sm:px-6 py-16 md:py-[202px]">
          <div className="flex flex-col items-center gap-12 md:gap-[50px]">
            {/* Title and description */}
            <div className="max-w-[885px]">
              <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium leading-[1em] mb-5">
                {t('pricing.requiredOutput.title')}
              </h2>
              <p className="text-[#062E25]/80 text-lg sm:text-xl md:text-[22px] leading-[1.36] tracking-[-0.02em]">
                {t('pricing.requiredOutput.description')}
              </p>
            </div>

            {/* Table */}
            <div className="w-full">
              <div className="relative rounded-[16px] overflow-hidden border border-[#062E25] backdrop-blur-[20px]">
                {/* Header row */}
                <div className="flex">
                  {/* Left column header - transparent with blur */}
                  <div className="w-[140px] sm:w-[158px] shrink-0 bg-white/10 backdrop-blur-[20px] p-4 sm:p-5 md:p-[30px] border-r border-[#062E25]">
                    <div className="flex flex-col gap-4 sm:gap-[25px]">
                      <span className="text-[#062E25]/80 text-sm sm:text-base md:text-lg font-semibold leading-[1.67] tracking-[-0.02em]">
                        {t('pricing.table.headers.household')}
                      </span>
                      <span className="text-[#062E25]/80 text-sm sm:text-base md:text-lg font-semibold leading-[1.67] tracking-[-0.02em]">
                        {t('pricing.table.headers.power')}
                      </span>
                      <span className="text-[#062E25]/80 text-sm sm:text-base md:text-lg font-semibold leading-[1.28] tracking-[-0.02em]">
                        {t('pricing.table.headers.size')}
                      </span>
                    </div>
                  </div>

                  {/* Data columns */}
                  <div className="flex-1 bg-[#E4E9D3] backdrop-blur-[20px] overflow-x-auto">
                    <div className="flex min-w-max">
                      {tableData.map((row, index) => (
                        <div
                          key={index}
                          className={`flex-1 min-w-[100px] sm:min-w-[120px] md:min-w-[148px] p-4 sm:p-5 md:p-[30px] ${
                            index < tableData.length - 1
                              ? 'border-r border-[#062E25]/50'
                              : ''
                          }`}
                        >
                          <div className="flex flex-col gap-4 sm:gap-[25px]">
                            <span className="text-[#062E25]/80 text-sm sm:text-base md:text-lg font-normal leading-[1.67] tracking-[-0.02em]">
                              {row.household}
                            </span>
                            <span className="text-[#062E25]/80 text-sm sm:text-base md:text-lg font-normal leading-[1.67] tracking-[-0.02em]">
                              {row.power}
                            </span>
                            <span className="text-[#062E25]/80 text-sm sm:text-base md:text-lg font-normal leading-[1.67] tracking-[-0.02em]">
                              {row.size}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <LinkButton variant="primary" href="/solar-systems">
              {t('pricing.cta')}
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PricingSection
