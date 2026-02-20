import { getTranslations } from 'next-intl/server'

const rowKeys = [
  'moduleAlignment',
  'yearOfConstruction',
  'installedPower',
  'numberOfModules',
  'annualYield',
  'totalArea',
] as const

const CustomerBenefitsSection = async () => {
  const t = await getTranslations('repowering.customerBenefits')

  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/images/repowering-benefits-bg-131d94.png')`,
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(0deg, rgba(253, 255, 245, 0) 0%, rgba(253, 255, 245, 1) 75%)',
        }}
      />

      <div className="relative z-10 max-w-[925px] mx-auto px-4 sm:px-6 py-20 md:py-[100px]">
        <div className="flex flex-col items-center gap-[50px]">
          <div className="flex flex-col items-center gap-5">
            <h2 className="text-[#062E25] text-3xl md:text-[45px] font-medium text-center">
              {t('title')}
            </h2>
            <p className="text-[#062E25]/80 text-lg md:text-[22px] font-light tracking-[-0.02em] text-center">
              {t('description')}
            </p>
          </div>

          <div className="w-full max-w-[724px] overflow-x-auto">
            <div
              className="min-w-[600px] rounded-[16px] backdrop-blur-[20px] overflow-hidden"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(6, 46, 37, 0.4)',
              }}
            >
              <div className="grid grid-cols-3">
                <div className="bg-[#E4E9D3] rounded-tl-[16px] p-4 border-r border-[#8B9E8D]" />
                <div className="bg-[#E4E9D3] p-4 flex items-center justify-center border-r border-dashed border-[#8B9E8D]">
                  <span className="text-[#062E25]/80 text-sm md:text-lg font-semibold tracking-[-0.02em] text-center whitespace-pre-line">
                    {t('existingFacility')}
                  </span>
                </div>
                <div className="bg-[#E4E9D3] rounded-tr-[16px] p-4 flex items-center justify-center">
                  <span className="text-[#062E25]/80 text-sm md:text-lg font-semibold tracking-[-0.02em] text-center whitespace-pre-line">
                    {t('newFacility')}
                  </span>
                </div>
              </div>

              {rowKeys.map((key, index) => (
                <div
                  key={key}
                  className={`grid grid-cols-3 ${index < rowKeys.length - 1 ? 'border-b border-dashed border-[#8B9E8D]' : ''}`}
                >
                  <div
                    className={`bg-[#E4E9D3] p-4 flex items-center border-r border-[#8B9E8D] ${index === rowKeys.length - 1 ? 'rounded-bl-[16px]' : ''}`}
                  >
                    <span className="text-[#062E25]/80 text-sm md:text-lg font-semibold tracking-[-0.02em]">
                      {t(`rows.${key}.label`)}
                    </span>
                  </div>
                  <div className="p-4 flex items-center justify-center border-r border-dashed border-[#8B9E8D]">
                    <span className="text-[#062E25]/80 text-sm md:text-lg tracking-[-0.02em] text-center">
                      {t(`rows.${key}.existing`)}
                    </span>
                  </div>
                  <div className="p-4 flex items-center justify-center">
                    <span className="text-[#062E25]/80 text-sm md:text-lg tracking-[-0.02em] text-center">
                      {t(`rows.${key}.new`)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CustomerBenefitsSection
