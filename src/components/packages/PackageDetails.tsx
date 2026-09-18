'use client'

import { ArrowRight, ChevronDown, Cpu } from 'lucide-react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

import { TYPE_ICONS, useCategoryLabel } from './PackageGallery'
import { componentAnchor, type PackageComponentView } from './types'

/** Technical details of every item of the package in one place, one expandable row per item. */
export default function PackageDetails({ components, chargerPrice }: { components: PackageComponentView[]; chargerPrice: string | null }) {
  const t = useTranslations('packagePage.components')
  const categoryLabel = useCategoryLabel()
  const [open, setOpen] = useState<string | null>(components[0]?.key ?? null)

  // "Technische Daten" under the gallery jumps to a row, open it on arrival
  useEffect(() => {
    const openFromHash = () => {
      const hit = components.find((c) => `#${componentAnchor(c.key)}` === window.location.hash)
      if (hit) setOpen(hit.key)
    }
    openFromHash()
    window.addEventListener('hashchange', openFromHash)
    return () => window.removeEventListener('hashchange', openFromHash)
  }, [components])

  return (
    <section className="bg-white">
      <div className="container mx-auto max-w-[1290px] px-4 py-14 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-medium tracking-tight text-pine sm:text-[40px]">{t('title')}</h2>
          <p className="mt-3 text-base text-pine/70 sm:text-xl">{t('subtitle', { count: components.length })}</p>
        </div>

        <ul className="mt-10 divide-y divide-pine/10 rounded-[24px] border border-pine/10">
          {components.map((c) => {
            const isOpen = open === c.key
            const Icon = TYPE_ICONS[c.equipmentType] ?? Cpu
            const thumb = c.modelPosterUrl ?? c.imageUrl
            const title = c.spec?.displayName ?? c.name
            return (
              <li key={c.key} id={componentAnchor(c.key)} className="scroll-mt-28">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : c.key)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-4 p-4 text-left sm:p-6"
                >
                  <span className="relative block h-16 w-16 shrink-0 overflow-hidden rounded-[14px] bg-[#F5F6F0]">
                    {thumb ? (
                      <Image src={thumb} alt="" fill sizes="64px" className="object-contain p-1.5" />
                    ) : (
                      <Icon className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-pine/30" aria-hidden />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2 text-base text-pine/60">
                      {categoryLabel(c.equipmentType)}
                      {c.isOptional && <span className="rounded-full bg-sage px-2 py-0.5 text-sm text-pine/70 sm:text-base">{t('optional')}</span>}
                    </span>
                    <span className="block text-xl font-medium leading-snug text-pine">
                      {c.quantity > 1 ? `${c.quantity} x ` : ''}
                      {title}
                    </span>
                    {c.spec && c.spec.keyFacts.length > 0 && (
                      <span className="mt-1 hidden flex-wrap gap-x-5 gap-y-1 text-base text-pine/75 md:flex">
                        {c.spec.keyFacts.slice(0, 3).map((f) => (
                          <span key={f.key}>
                            {f.label} <span className="font-medium text-pine tabular-nums">{f.value}</span>
                          </span>
                        ))}
                      </span>
                    )}
                  </span>
                  <ChevronDown className={cn('h-5 w-5 shrink-0 text-pine/60 transition-transform', isOpen && 'rotate-180')} aria-hidden />
                </button>

                {isOpen && (
                  <div className="px-4 pb-6 sm:px-6 sm:pb-8">
                    {c.spec ? (
                      <>
                        <p className="max-w-3xl text-base leading-relaxed text-pine/80">{c.spec.summary}</p>
                        <div className="mt-6 gap-4 md:columns-2 xl:columns-3">
                          {c.spec.groups.map((g) => (
                            <section key={g.key} className="mb-4 break-inside-avoid rounded-[18px] bg-[#F5F6F0] p-5">
                              <h3 className="text-base font-semibold uppercase tracking-[0.08em] text-pine/60">{g.label}</h3>
                              <dl className="mt-2 divide-y divide-pine/8">
                                {g.rows.map((row) => {
                                  const long = row.value.length > 34
                                  return (
                                    <div key={row.key} className={cn('py-2', long ? 'flex flex-col gap-0.5' : 'grid grid-cols-[1fr_auto] items-baseline gap-4')}>
                                      <dt className="text-base text-pine/75">{row.label}</dt>
                                      <dd className={cn('text-base font-medium text-pine tabular-nums', long ? 'text-left leading-snug' : 'text-right')}>{row.value}</dd>
                                    </div>
                                  )
                                })}
                              </dl>
                            </section>
                          ))}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-8 gap-y-2">
                          {c.slug && (
                            <Link href={{ pathname: '/products', query: { p: c.slug } }} className="inline-flex items-center gap-1.5 text-base font-medium text-teal-deep hover:underline">
                              {t('allSpecs')}
                              <ArrowRight className="h-4 w-4" aria-hidden />
                            </Link>
                          )}
                          {c.spec.datasheetUrl && (
                            <a href={c.spec.datasheetUrl} target="_blank" rel="noopener noreferrer" className="text-base font-medium text-pine underline-offset-4 hover:underline">
                              {t('datasheet')}
                            </a>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-base text-pine/70">{t('noSpecs')}</p>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
        {chargerPrice && <p className="mt-4 text-base text-pine/65">{t('chargerNote', { price: chargerPrice })}</p>}
      </div>
    </section>
  )
}
