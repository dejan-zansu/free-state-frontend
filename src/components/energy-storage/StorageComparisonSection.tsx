import LeafIcon from '@/components/icons/LeafIcon'
import { LinkButton } from '@/components/ui/link-button'
import { getTranslations } from 'next-intl/server'

const columns = ['huawei', 'sun', 'e3dc'] as const
const gridCols = 'grid grid-cols-4'

const StorageComparisonSection = async () => {
  const t = await getTranslations('energyStorage.comparison')

  return (
    <section className="relative w-full overflow-hidden bg-[#FDFFF5]">
      <div className="max-w-[1038px] mx-auto px-4 sm:px-8 py-[50px]">
        <div className="flex flex-col items-center gap-10">
          <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium text-center">
            {t('title')}
          </h2>

          <div className="w-full overflow-x-auto">
            <div className="min-w-[700px] flex flex-col">
              <div className={`${gridCols} bg-[#B7FE1A] rounded-t-2xl`}>
                <span className="px-5 py-3 text-[#062E25]/80 text-lg font-semibold tracking-[-0.02em]">
                  {t('manufacturer.label')}
                </span>
                {columns.map(col => (
                  <span key={col} className="px-5 py-3 text-[#062E25]/80 text-lg font-semibold tracking-[-0.02em]">
                    {t(`columns.${col}`)}
                  </span>
                ))}
              </div>

              <div className={`${gridCols} border border-[#062E25]/40`}>
                <span className="px-5 py-4 text-[#062E25]/80 text-lg font-semibold tracking-[-0.02em]">
                  {t('inverter.label')}
                </span>
                {columns.map(col => (
                  <span key={col} className="px-5 py-4 text-[#062E25]/80 text-lg italic tracking-[-0.02em] whitespace-pre-line">
                    {t(`inverter.${col}`)}
                  </span>
                ))}
              </div>

              <div className={`${gridCols} bg-[#B7FE1A] rounded-t-2xl`}>
                <span className="px-5 py-3 text-[#062E25]/80 text-lg font-semibold tracking-[-0.02em]">
                  {t('storageCapacity.label')}
                </span>
                {columns.map(col => (
                  <span key={col} className="px-5 py-3 text-[#062E25]/80 text-lg font-semibold tracking-[-0.02em]">
                    {t(`capacity.${col}`)}
                  </span>
                ))}
              </div>

              <div className={`${gridCols} border border-[#062E25]/40`}>
                <span className="px-5 py-4 text-[#062E25]/80 text-lg font-semibold tracking-[-0.02em]">
                  {t('emergencyPower.label')}
                </span>
                {columns.map(col => (
                  <span key={col} className="px-5 py-4 text-[#062E25]/80 text-lg italic tracking-[-0.02em] whitespace-pre-line">
                    {t(`emergencyPower.${col}`)}
                  </span>
                ))}
              </div>

              <div className={`${gridCols} bg-[#B7FE1A] rounded-t-2xl`}>
                <span className="px-5 py-3 text-[#062E25]/80 text-lg font-semibold tracking-[-0.02em]">
                  {t('islandOperation.label')}
                </span>
                {columns.map(col => (
                  <span key={col} className="px-5 py-3 text-[#062E25]/80 text-lg font-semibold tracking-[-0.02em]">
                    {t(`islandOperation.${col}`)}
                  </span>
                ))}
              </div>

              <div className="rounded-2xl bg-[#E4E9D3]">
                <div className={`${gridCols} border border-[#062E25]/40`}>
                  <div className="px-5 py-4 flex flex-col gap-4">
                    <span className="text-[#062E25]/80 text-lg font-semibold italic tracking-[-0.02em]">
                      {t('costs.label')}
                    </span>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <LeafIcon className="w-[9px] h-[9px] shrink-0 text-[#036B53]" />
                        <span className="text-[#062E25]/80 text-sm tracking-[-0.02em]">
                          {t('footnotes.note1')}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <LeafIcon className="w-[9px] h-[9px] shrink-0 mt-[5px] text-[#036B53]" />
                        <span className="text-[#062E25]/80 text-sm tracking-[-0.02em]">
                          {t('footnotes.note2')}
                        </span>
                      </div>
                    </div>
                  </div>
                  {columns.map(col => (
                    <span key={col} className="px-5 py-4 text-[#062E25]/80 text-lg italic tracking-[-0.02em] whitespace-pre-line">
                      {t(`costs.${col}`)}
                    </span>
                  ))}
                </div>

                <div className={`${gridCols} bg-[#B7FE1A] rounded-t-2xl mt-8`}>
                  <span className="px-5 py-5 text-[#062E25]/80 text-lg font-semibold tracking-[-0.02em] whitespace-pre-line">
                    {t('smartEnergy.label')}
                  </span>
                  <div className="col-span-3 px-5 py-5 flex flex-col gap-[6px]">
                    <div className="flex items-center gap-2">
                      <LeafIcon className="w-[9px] h-[9px] shrink-0 text-[#036B53]" />
                      <span className="text-[#062E25]/80 text-lg italic tracking-[-0.02em]">
                        {t('smartEnergy.note1')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <LeafIcon className="w-[9px] h-[9px] shrink-0 text-[#036B53]" />
                      <span className="text-[#062E25]/80 text-lg italic tracking-[-0.02em]">
                        {t('smartEnergy.note2')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <LinkButton variant="tertiary" href={t('ctaLink') as '/contact'}>
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
