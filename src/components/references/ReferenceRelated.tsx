import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import type { AdminReference } from '@/types/admin'
import {
  REFERENCE_CONTAINER,
  formatSwissNumber,
  pickReferenceTranslation,
} from './reference-utils'

interface Props {
  references: AdminReference[]
  locale: string
}

const ReferenceRelated = async ({ references, locale }: Props) => {
  const t = await getTranslations('referencePage')

  const cards = references.flatMap(reference => {
    const translation = pickReferenceTranslation(reference, locale)
    return translation ? [{ reference, translation }] : []
  })

  if (cards.length === 0) return null

  return (
    <section className="bg-white pb-20 pt-20 lg:pb-[110px] lg:pt-[104px]">
      <div className={REFERENCE_CONTAINER}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="h-[2px] w-[22px] shrink-0 bg-[#B7FE1A]" />
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#062E25]">
                {t('related.eyebrow')}
              </span>
            </div>
            <h2 className="mt-2 text-[30px] font-bold text-[#062E25] lg:text-[38px]">
              {t('related.title')}
            </h2>
          </div>

          <Link
            href="/portfolio"
            className="inline-flex h-[52px] shrink-0 items-center self-start rounded-full border border-[#062E25]/20 px-[30px] text-[15px] font-bold text-[#062E25] transition-colors hover:bg-[#062E25] hover:text-white sm:self-auto"
          >
            {t('related.viewAll')}
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-7 md:grid-cols-3 lg:mt-[52px]">
          {cards.map(({ reference, translation }) => {
            const metaParts: string[] = []
            if (reference.location) metaParts.push(reference.location)
            if (reference.year) metaParts.push(String(reference.year))
            if (reference.installedKwp !== null) {
              metaParts.push(`${formatSwissNumber(reference.installedKwp)} kWp`)
            }

            return (
              <Link
                key={reference.id}
                href={{
                  pathname: '/portfolio/[slug]',
                  params: { slug: reference.slug },
                }}
                className="group block"
              >
                <div className="relative aspect-[395/250] overflow-hidden rounded-[14px] bg-[#0D3A2E]">
                  {reference.coverImageUrl && (
                    <Image
                      src={reference.coverImageUrl}
                      alt={translation.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 395px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <span className="absolute left-4 top-4 inline-flex h-[30px] items-center rounded-full bg-white/95 px-3.5 text-[11px] font-bold uppercase tracking-[0.06em] text-[#062E25]">
                    {t(`categories.${reference.category}`)}
                  </span>
                </div>

                <h3 className="mt-4 text-[20px] font-bold text-[#062E25]">
                  {translation.title}
                </h3>

                {metaParts.length > 0 && (
                  <p className="mt-4 flex flex-wrap items-center text-[13px] text-[#7C918C]">
                    {metaParts.map((part, index) => (
                      <span
                        key={`${part}-${index}`}
                        className="inline-flex items-center"
                      >
                        {index > 0 && (
                          <span className="mx-2 h-[3px] w-[3px] rounded-full bg-[#7C918C]" />
                        )}
                        {part}
                      </span>
                    ))}
                  </p>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default ReferenceRelated
