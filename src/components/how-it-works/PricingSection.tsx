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
      <div className="max-w-[1214px] mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <div className="flex flex-col gap-12 md:gap-16">
          <div className="max-w-[885px]">
            <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium leading-[1em] mb-5 text-center">
              {t('pricing.whichSystem.title')}
            </h2>
            <p className="text-[#062E25]/80 text-lg sm:text-xl md:text-[22px] leading-[1.36] tracking-[-0.02em] text-center">
              {t('pricing.whichSystem.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#EAEDDF] border border-[#062E25]/50 rounded-[10px] p-8 md:p-10">
              <h3 className="text-[#17302A] text-2xl sm:text-3xl md:text-[35px] font-semibold leading-[1em] mb-5">
                {t('pricing.whichSystem.householdConsumption.title')}
              </h3>
              <p className="text-[#062E25]/80 text-lg sm:text-xl md:text-[22px] leading-[1.36] tracking-[-0.02em]">
                {t('pricing.whichSystem.householdConsumption.description')}
              </p>
            </div>

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

      <div className="relative min-h-[660px]">
        <div className="absolute inset-0">
          <Image
            src="/images/home-with-solar-panels.png"
            alt="Home with solar panels"
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#FDFFF5] via-[#FDFFF5]/75 to-transparent" />
        </div>

        <div className="relative z-10 max-w-[975px] mx-auto px-4 sm:px-6 py-12 md:pt-0">
          <div className="flex flex-col items-center gap-12 md:gap-[50px]">
            <div className="max-w-[885px]">
              <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium leading-[1em] mb-5 text-center">
                {t('pricing.requiredOutput.title')}
              </h2>
              <p className="text-[#062E25]/80 text-lg sm:text-xl md:text-[22px] leading-[1.36] tracking-[-0.02em] text-center">
                {t('pricing.requiredOutput.description')}
              </p>
            </div>

            <div className="w-full overflow-x-auto">
              <div
                className="relative rounded-[16px] overflow-hidden border border-[#062E25] backdrop-blur-[20px] grid"
                style={{
                  gridTemplateColumns: `minmax(100px, auto) repeat(${tableData.length}, 1fr)`,
                }}
              >
                {(
                  [
                    { header: t('pricing.table.headers.household'), key: 'household' },
                    { header: t('pricing.table.headers.power'), key: 'power' },
                    { header: t('pricing.table.headers.size'), key: 'size' },
                  ] as const
                ).map(({ header, key }) => (
                  <>
                    <div
                      key={`${key}-header`}
                      className="bg-white/10 backdrop-blur-[20px] px-3 py-4 sm:px-4 sm:py-5 md:px-5 md:py-6 border-r border-[#062E25] flex items-center justify-center"
                    >
                      <span className="text-[#062E25]/80 text-xs sm:text-sm md:text-base font-semibold leading-tight tracking-[-0.02em] text-center">
                        {header}
                      </span>
                    </div>
                    {tableData.map((row, index) => (
                      <div
                        key={`${key}-${index}`}
                        className={`bg-[#E4E9D3] backdrop-blur-[20px] px-2 py-4 sm:px-3 sm:py-5 md:px-4 md:py-6 flex items-center justify-center ${
                          index < tableData.length - 1
                            ? 'border-r border-[#062E25]/50'
                            : ''
                        }`}
                      >
                        <span className="text-[#062E25]/80 text-xs sm:text-sm md:text-base font-normal leading-tight tracking-[-0.02em] whitespace-nowrap text-center">
                          {row[key]}
                        </span>
                      </div>
                    ))}
                  </>
                ))}
              </div>
            </div>

            <LinkButton variant="primary" href="/cost">
              {t('pricing.cta')}
            </LinkButton>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PricingSection
