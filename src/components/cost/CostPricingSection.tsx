import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const CostPricingSection = async () => {
  const t = await getTranslations('cost')

  const tableData = [
    {
      roofSize: t('pricingSection.table.rows.threePerson.roofSize'),
      residents: t('pricingSection.table.rows.threePerson.residents'),
      costPerSqm: t('pricingSection.table.rows.threePerson.costPerSqm'),
      cost: t('pricingSection.table.rows.threePerson.cost'),
    },
    {
      roofSize: t('pricingSection.table.rows.fourPerson.roofSize'),
      residents: t('pricingSection.table.rows.fourPerson.residents'),
      costPerSqm: t('pricingSection.table.rows.fourPerson.costPerSqm'),
      cost: t('pricingSection.table.rows.fourPerson.cost'),
    },
    {
      roofSize: t('pricingSection.table.rows.fivePerson.roofSize'),
      residents: t('pricingSection.table.rows.fivePerson.residents'),
      costPerSqm: t('pricingSection.table.rows.fivePerson.costPerSqm'),
      cost: t('pricingSection.table.rows.fivePerson.cost'),
    },
  ]

  const headers = [
    t('pricingSection.table.headers.roofSize'),
    t('pricingSection.table.headers.residents'),
    t('pricingSection.table.headers.costPerSqm'),
    t('pricingSection.table.headers.cost'),
  ]

  return (
    <section className="relative min-h-[591px]">
      <div className="absolute inset-0">
        <Image
          src="/images/cost-of-solar-system-bg.png"
          alt="Solar panels on roof"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FDFFF5] via-[#FDFFF5]/75 to-transparent" />
      </div>

      <div className="relative z-10 max-w-[735px] mx-auto px-4 sm:px-6 py-[100px]">
        <div className="flex flex-col items-center gap-[50px]">
          <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium leading-[1em] text-center">
            {t('pricingSection.title')}
          </h2>

          <div className="w-full overflow-x-auto">
            <div className="relative rounded-[16px] overflow-hidden border border-[#062E25] backdrop-blur-[20px]">
              {headers.map((header, rowIndex) => (
                <div key={rowIndex} className="flex">
                  <div className="w-[120px] sm:w-[150px] md:w-[200px] shrink-0 bg-white/10 backdrop-blur-[20px] px-3 py-4 sm:px-4 sm:py-5 md:px-5 md:py-6 border-r border-[#062E25] flex items-center">
                    <span className="text-[#062E25]/80 text-xs sm:text-sm md:text-lg font-semibold leading-tight tracking-[-0.02em]">
                      {header}
                    </span>
                  </div>
                  <div className="flex-1 flex bg-[#E4E9D3] backdrop-blur-[20px]">
                    {tableData.map((row, colIndex) => {
                      const values = [
                        row.roofSize,
                        row.residents,
                        row.costPerSqm,
                        row.cost,
                      ]
                      return (
                        <div
                          key={colIndex}
                          className={`flex-1 px-2 py-4 sm:px-3 sm:py-5 md:px-4 md:py-6 flex items-center ${
                            colIndex < tableData.length - 1
                              ? 'border-r border-[#062E25]/50'
                              : ''
                          }`}
                        >
                          <span className="text-[#062E25]/80 text-xs sm:text-sm md:text-lg font-normal leading-tight tracking-[-0.02em]">
                            {values[rowIndex]}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-[#062E25]/80 text-sm md:text-base leading-[1.56] tracking-[-0.02em] text-center">
            {t('pricingSection.note')}
          </p>
        </div>
      </div>
    </section>
  )
}

export default CostPricingSection
