'use client'

import { Check, ChevronRight, FileText, Layers } from 'lucide-react'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { useState } from 'react'

import ModelViewer from '@/components/products/ModelViewer'
import ProductComments from '@/components/products/ProductComments'
import ProductGallery from '@/components/products/ProductGallery'
import ProductSpecTable from '@/components/products/ProductSpecTable'
import { LinkButton } from '@/components/ui/link-button'
import { Link } from '@/i18n/navigation'
import { COMPANY_CALENDLY_URL } from '@/lib/company-contact'
import { CATEGORY_ORDER, categoryLabel, type CatalogProduct, type ProductCategory, type SpecLocale } from '@/lib/products/catalog'
import { cn } from '@/lib/utils'

export interface ProductListItem {
  slug: string
  category: ProductCategory
  name: string
  manufacturerName: string
  posterUrl: string | null
  imageUrl: string | null
  packageCount: number
  hasModel: boolean
}

interface Props {
  products: ProductListItem[]
  selected: CatalogProduct
}

function ProductThumb({ item, className }: { item: ProductListItem; className?: string }) {
  const src = item.posterUrl ?? item.imageUrl
  return (
    <span className={cn('relative block shrink-0 overflow-hidden rounded-[12px] bg-sage', className)}>
      {src ? (
        <Image src={src} alt="" fill sizes="80px" className="object-contain p-1.5" />
      ) : (
        <Layers className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-pine/30" aria-hidden />
      )}
    </span>
  )
}

export default function ProductsExplorer({ products, selected }: Props) {
  const t = useTranslations('products.explorer')
  const locale = useLocale() as SpecLocale
  const [summaryOpen, setSummaryOpen] = useState(false)

  const categories = CATEGORY_ORDER.filter((c) => products.some((p) => p.category === c))
  const inCategory = products.filter((p) => p.category === selected.category)
  const api = selected.api
  const spec = selected.spec
  const heading = spec?.displayName ?? api.name
  const dims = spec?.dimensionsMm
  const localePrefix = locale === 'de' ? '' : `/${locale}`

  return (
    <section className="bg-white">
      <div className="container mx-auto max-w-[1290px] px-4 py-10 sm:py-14">
        {/* Category tabs */}
        <nav aria-label={t('categories')} className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul className="flex w-max gap-2">
            {categories.map((c) => {
              const first = products.find((p) => p.category === c)!
              const active = c === selected.category
              return (
                <li key={c}>
                  <Link
                    href={{ pathname: '/products', query: { p: first.slug } }}
                    scroll={false}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'inline-flex items-center gap-2 whitespace-nowrap rounded-full border px-4 py-2 text-base font-medium transition',
                      active ? 'border-pine bg-pine text-white' : 'border-pine/15 bg-white text-pine hover:border-pine/40'
                    )}
                  >
                    {categoryLabel(c, locale)}
                    <span className={cn('rounded-full px-1.5 text-sm tabular-nums sm:text-base', active ? 'bg-white/15' : 'bg-sage')}>
                      {products.filter((p) => p.category === c).length}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="mt-6 grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)_340px] lg:gap-6 xl:grid-cols-[280px_minmax(0,1fr)_400px] xl:gap-8">
          {/* Model list */}
          <aside aria-label={t('models')}>
            <h2 className="mb-3 text-base font-semibold uppercase tracking-[0.08em] text-pine/60">{t('models')}</h2>
            <ul className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden">
              {inCategory.map((item) => {
                const active = item.slug === selected.slug
                return (
                  <li key={item.slug} className="w-[240px] shrink-0 lg:w-auto">
                    <Link
                      href={{ pathname: '/products', query: { p: item.slug } }}
                      scroll={false}
                      aria-current={active ? 'true' : undefined}
                      className={cn(
                        'flex h-full items-center gap-3 rounded-[18px] border bg-white p-3 text-left transition',
                        active ? 'border-pine ring-1 ring-pine' : 'border-pine/10 hover:border-pine/40'
                      )}
                    >
                      <ProductThumb item={item} className="h-14 w-14" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm uppercase tracking-[0.06em] text-pine/55 sm:text-base">
                          {item.manufacturerName}
                        </span>
                        <span className="block truncate text-base font-medium text-pine">{item.name}</span>
                        <span className="block text-sm text-pine/60 sm:text-base">
                          {t('inPackages', { count: item.packageCount })}
                        </span>
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </aside>

          {/* Viewer */}
          <div className="min-w-0">
            {api.modelUrl ? (
              <ModelViewer
                key={api.modelUrl}
                src={api.modelUrl}
                poster={api.modelPosterUrl}
                alt={t('viewerAlt', { name: heading })}
                orbit={selected.orbit}
                fieldOfView={selected.fieldOfView}
                className="aspect-square w-full sm:aspect-[4/3] lg:aspect-auto lg:h-[600px] xl:h-[640px]"
              />
            ) : (
              <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-[24px] border border-pine/10 bg-[#F5F6F0] sm:aspect-[4/3] lg:aspect-auto lg:h-[600px]">
                {api.imageUrl ? (
                  <Image src={api.imageUrl} alt={heading} fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-contain p-10" />
                ) : null}
                <p className="absolute inset-x-0 bottom-4 text-center text-base text-pine/60">{t('noModel')}</p>
              </div>
            )}
            <dl className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 px-1 text-base text-pine/65">
              {dims && (
                <div className="flex gap-2">
                  <dt>{t('dimensions')}</dt>
                  <dd className="font-medium text-pine tabular-nums">
                    {dims[0]} x {dims[1]} x {dims[2]} mm
                  </dd>
                </div>
              )}
              {spec?.weightKg != null && (
                <div className="flex gap-2">
                  <dt>{t('weight')}</dt>
                  <dd className="font-medium text-pine tabular-nums">{spec.weightKg} kg</dd>
                </div>
              )}
              {api.modelUrl && <p className="ml-auto text-sm text-pine/50 sm:text-base">{t('modelNote')}</p>}
            </dl>
          </div>

          {/* Product panel */}
          <aside className="rounded-[24px] border border-pine/10 bg-[#F5F6F0] p-6 sm:p-7">
            <p className="text-base font-semibold uppercase tracking-[0.08em] text-pine/60">{api.manufacturerName}</p>
            <h2 className="mt-1 text-2xl font-medium leading-tight tracking-tight text-pine sm:text-[28px]">{heading}</h2>
            <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-lime/40 px-3 py-1.5 text-base font-medium text-pine">
              <Check className="h-4 w-4 text-teal-deep" strokeWidth={2.5} aria-hidden />
              {t('installedBadge')}
            </p>

            {spec?.summary && (
              <div className="mt-4">
                <p className={cn('text-base leading-relaxed text-pine/80', !summaryOpen && 'line-clamp-4')}>{spec.summary}</p>
                <button
                  type="button"
                  onClick={() => setSummaryOpen((v) => !v)}
                  className="mt-1 text-base font-medium text-teal-deep hover:underline"
                  aria-expanded={summaryOpen}
                >
                  {summaryOpen ? t('summaryLess') : t('summaryMore')}
                </button>
              </div>
            )}

            {spec && spec.keyFacts.length > 0 && (
              <dl className="mt-5 grid grid-cols-2 gap-2.5">
                {spec.keyFacts.map((fact) => (
                  <div key={fact.key} className="rounded-[14px] border border-pine/8 bg-white px-3.5 py-3">
                    <dt className="text-sm leading-snug text-pine/60 sm:text-base">{fact.label}</dt>
                    <dd className="mt-1 text-base font-semibold leading-snug text-pine tabular-nums">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {api.packages.length > 0 && (
              <div className="mt-5">
                <p className="text-base text-pine/65">{t('includedIn')}</p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {api.packages.map((p) => (
                    <li key={p.code} className="rounded-full border border-pine/12 bg-white px-2.5 py-1 text-sm text-pine sm:text-base">
                      {p.name}
                    </li>
                  ))}
                </ul>
                <a href={`${localePrefix}/#pakete`} className="mt-2 inline-flex items-center gap-1 text-base font-medium text-teal-deep hover:underline">
                  {t('comparePackages')}
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </a>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3">
              <LinkButton href={COMPANY_CALENDLY_URL} variant="tertiary" className="w-full justify-between" target="_blank" rel="noopener noreferrer">
                {t('bookConsultation')}
              </LinkButton>
              {spec?.datasheetUrl && (
                <a
                  href={spec.datasheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 text-base font-medium text-pine underline-offset-4 hover:underline"
                >
                  <FileText className="h-4 w-4" aria-hidden />
                  {t('datasheet')}
                </a>
              )}
            </div>
          </aside>
        </div>

        {spec && (
          <div className="mt-16 sm:mt-20">
            <ProductSpecTable spec={spec} />
          </div>
        )}

        <div className="mt-16 sm:mt-20">
          <ProductGallery name={heading} images={api.galleryUrls} references={api.references} />
        </div>

        <div className="mt-16 sm:mt-20">
          <ProductComments
            equipmentType={api.equipmentType}
            equipmentId={api.id}
            productName={heading}
            approvedCount={api.commentCount}
          />
        </div>
      </div>
    </section>
  )
}
