import { getTranslations } from 'next-intl/server'
import type { AdminReference, AdminReferenceTranslation } from '@/types/admin'
import {
  REFERENCE_CONTAINER,
  REFERENCE_SPLIT_GRID,
  formatMonthYear,
} from './reference-utils'

interface Props {
  reference: AdminReference
  translation: AdminReferenceTranslation
}

const ReferenceProject = async ({ reference, translation }: Props) => {
  const t = await getTranslations('referencePage')

  const specRows: { label: string; value: string }[] = []
  if (reference.mountingType) {
    specRows.push({
      label: t('project.mountingType'),
      value: t(`mounting.${reference.mountingType}`),
    })
  }
  if (reference.productModel) {
    specRows.push({
      label: t('project.model'),
      value: reference.productModel,
    })
  }
  if (reference.inverter) {
    specRows.push({
      label: t('project.inverter'),
      value: reference.inverter,
    })
  }
  if (reference.storageSystem) {
    specRows.push({
      label: t('project.storage'),
      value: reference.storageSystem,
    })
  }
  if (reference.buildDurationWeeks !== null) {
    specRows.push({
      label: t('project.buildTime'),
      value: t('project.buildTimeValue', {
        weeks: reference.buildDurationWeeks,
      }),
    })
  }
  const commissioned = reference.commissionedAt
    ? formatMonthYear(reference.commissionedAt)
    : null
  if (commissioned) {
    specRows.push({
      label: t('project.commissioning'),
      value: commissioned,
    })
  }

  const blocks: { title: string; text: string }[] = []
  if (translation.situation) {
    blocks.push({ title: t('project.situation'), text: translation.situation })
  }
  if (translation.approach) {
    blocks.push({ title: t('project.approach'), text: translation.approach })
  }
  if (translation.outcome) {
    blocks.push({ title: t('project.outcome'), text: translation.outcome })
  }

  const hasBody =
    Boolean(translation.lead) || Boolean(translation.body) || blocks.length > 0

  if (specRows.length === 0 && !hasBody) return null

  return (
    <section className="bg-white pb-20 pt-20 lg:pb-[110px] lg:pt-[110px]">
      <div className={REFERENCE_CONTAINER}>
        <div className={`${REFERENCE_SPLIT_GRID} gap-y-10`}>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="h-[2px] w-[22px] shrink-0 bg-[#B7FE1A]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#062E25]">
                {t('project.eyebrow')}
              </span>
            </div>
            <h2 className="mt-2 text-[30px] font-bold text-[#062E25] lg:text-[38px]">
              {t('project.title')}
            </h2>

            {specRows.length > 0 && (
              <dl className="mt-10 border-b border-[#E1E6E4]">
                {specRows.map(row => (
                  <div
                    key={row.label}
                    className="flex items-baseline justify-between gap-4 border-t border-[#E1E6E4] py-[15px]"
                  >
                    <dt className="text-[14px] text-[#7C918C]">{row.label}</dt>
                    <dd className="text-right text-[14px] font-bold text-[#062E25]">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {hasBody && (
            <div>
              {translation.lead && (
                <p className="max-w-[669px] text-[19px] leading-[30px] text-[#062E25] lg:text-[22px] lg:leading-[34px]">
                  {translation.lead}
                </p>
              )}

              {translation.body && (
                <div
                  className="prose mt-8 max-w-[669px] text-[17px] leading-[30px] text-[#4A6660] prose-headings:font-bold prose-headings:text-[#062E25] prose-p:text-[17px] prose-p:leading-[30px] prose-p:text-[#4A6660] prose-a:text-[#036B53] prose-a:underline-offset-4 prose-strong:text-[#062E25] prose-li:text-[17px] prose-li:leading-[30px] prose-li:text-[#4A6660] prose-li:marker:text-[#B7FE1A]"
                  dangerouslySetInnerHTML={{ __html: translation.body }}
                />
              )}

              {blocks.length > 0 && (
                <div className="mt-14 grid grid-cols-1 gap-x-[37px] gap-y-8 md:grid-cols-3 lg:mt-16">
                  {blocks.map(block => (
                    <div
                      key={block.title}
                      className="border-t-2 border-[#062E25] pt-4"
                    >
                      <h3 className="text-[17px] font-bold text-[#062E25]">
                        {block.title}
                      </h3>
                      <p className="mt-4 text-[16px] leading-[26px] text-[#4A6660]">
                        {block.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default ReferenceProject
