import LeafIcon from '@/components/icons/LeafIcon'
import { LinkButton } from '@/components/ui/link-button'
import { getTranslations } from 'next-intl/server'

const columns = ['huawei', 'sun', 'e3dc'] as const

const headerRows = [
  {
    key: 'manufacturer',
    valueKey: 'columns',
  },
  {
    key: 'storageCapacity',
    valueKey: 'capacity',
  },
  {
    key: 'islandOperation',
    valueKey: 'islandOperation',
  },
] as const

const dataRows = ['inverter', 'emergencyPower', 'costs'] as const

const tableRows = [
  { type: 'header' as const, index: 0 },
  { type: 'data' as const, key: 'inverter' },
  { type: 'header' as const, index: 1 },
  { type: 'data' as const, key: 'emergencyPower' },
  { type: 'header' as const, index: 2 },
  { type: 'data' as const, key: 'costs' },
]

const StorageComparisonSection = async () => {
  const t = await getTranslations('energyStorage.comparison')

  return (
    <section className="relative w-full overflow-hidden bg-[#FDFFF5]">
      <div className="max-w-[1038px] mx-auto px-4 sm:px-8 pt-[50px] pb-[50px]">
        <div className="flex flex-col items-center gap-[50px]">
          <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium text-center">
            {t('title')}
          </h2>

          <div className="w-full overflow-x-auto">
            <div className="min-w-[700px]">
              {tableRows.map((row, i) => {
                if (row.type === 'header') {
                  const hr = headerRows[row.index]
                  return (
                    <div
                      key={`header-${hr.key}`}
                      className="grid grid-cols-[minmax(150px,260px)_repeat(3,1fr)] rounded-r-2xl border border-[#062E25]/40 mb-px"
                      style={{
                        background: '#B7FE1A',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                      }}
                    >
                      <div className="px-4 py-3">
                        <span className="text-[#062E25]/80 text-base md:text-lg font-semibold tracking-[-0.02em]">
                          {t(`${hr.key}.label`)}
                        </span>
                      </div>
                      {columns.map((col) => (
                        <div key={col} className="px-4 py-3">
                          <span className="text-[#062E25]/80 text-base md:text-lg font-semibold tracking-[-0.02em]">
                            {t(`${hr.valueKey}.${col}`)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )
                }

                return (
                  <div
                    key={`data-${row.key}`}
                    className="grid grid-cols-[minmax(150px,260px)_repeat(3,1fr)] border border-[#062E25]/40 mb-px"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(20px)',
                      WebkitBackdropFilter: 'blur(20px)',
                    }}
                  >
                    <div className="px-4 py-4">
                      <span className="text-[#062E25]/80 text-base md:text-lg font-semibold tracking-[-0.02em]">
                        {t(`${row.key}.label`)}
                      </span>
                    </div>
                    {columns.map((col) => (
                      <div key={col} className="px-4 py-4">
                        <span className="text-[#062E25]/80 text-base md:text-lg font-normal tracking-[-0.02em] whitespace-pre-line">
                          {t(`${row.key}.${col}`)}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>

            <div className="min-w-[700px] mt-6">
              <div className="flex flex-col gap-[10px] max-w-[250px]">
                <div className="flex items-start gap-2">
                  <LeafIcon className="w-[9px] h-[9px] shrink-0 mt-[7px] text-[#036B53]" />
                  <span className="text-[#062E25]/80 text-base md:text-lg font-semibold tracking-[-0.02em]">
                    {t('footnotes.note1')}
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <LeafIcon className="w-[9px] h-[9px] shrink-0 mt-[7px] text-[#036B53]" />
                  <span className="text-[#062E25]/80 text-base md:text-lg font-semibold tracking-[-0.02em]">
                    {t('footnotes.note2')}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-[63px] mt-8">
                <span className="text-[#062E25]/80 text-base md:text-lg font-semibold tracking-[-0.02em] whitespace-pre-line">
                  {t('smartEnergy.label')}
                </span>
                <div className="flex flex-col gap-[6px]">
                  <div className="flex items-start gap-2">
                    <LeafIcon className="w-[9px] h-[9px] shrink-0 mt-[7px] text-[#036B53]" />
                    <span className="text-[#062E25]/80 text-base md:text-lg font-normal tracking-[-0.02em]">
                      {t('smartEnergy.note1')}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <LeafIcon className="w-[9px] h-[9px] shrink-0 mt-[7px] text-[#036B53]" />
                    <span className="text-[#062E25]/80 text-base md:text-lg font-normal tracking-[-0.02em]">
                      {t('smartEnergy.note2')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <LinkButton
            variant="tertiary"
            href={t('ctaLink') as '/contact'}
          >
            {t('cta')}
          </LinkButton>
        </div>
      </div>

      <div
        className="w-full h-px opacity-20"
        style={{
          background:
            'linear-gradient(54deg, rgba(6, 46, 37, 1) 74%, rgba(3, 107, 83, 1) 100%)',
        }}
      />
    </section>
  )
}

export default StorageComparisonSection
