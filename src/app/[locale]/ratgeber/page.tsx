import { ArrowUpRight } from 'lucide-react'
import type { Metadata } from 'next'

import RatgeberCta from '@/components/ratgeber/RatgeberCta'
import { JsonLd } from '@/components/seo/JsonLd'
import { RATGEBER_INDEX } from '@/data/energiegemeinschaften'
import { Link } from '@/i18n/navigation'
import { generateSEOMetadata } from '@/lib/seo/metadata'
import type { SiteLocale } from '@/lib/seo/site-config'
import { buildBreadcrumbsFromPath } from '@/lib/seo/structured-data'

const DE_ONLY = ['de'] as const

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return generateSEOMetadata({
    locale: locale as SiteLocale,
    pathname: '/ratgeber',
    title: RATGEBER_INDEX.seo.title,
    description: RATGEBER_INDEX.seo.description,
    availableLocales: DE_ONLY,
  })
}

export default async function RatgeberIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const prefix = locale === 'de' ? '' : `/${locale}`
  return (
    <div className="bg-[#EAEDDF] text-[#062E25]">
      <JsonLd
        data={buildBreadcrumbsFromPath([
          { name: 'Home', href: prefix || '/' },
          { name: 'Ratgeber', href: `${prefix}/ratgeber` },
        ])}
      />
      <div className="mx-auto max-w-[1200px] px-4 pb-16 pt-28 sm:px-6 md:pt-36">
        <h1 className="text-3xl font-bold md:text-5xl">
          {RATGEBER_INDEX.title}
        </h1>
        <p className="mt-4 max-w-3xl text-base md:text-lg">
          {RATGEBER_INDEX.lead}
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {RATGEBER_INDEX.cards.map(card => (
            <Link
              key={card.href}
              href={
                card.href === 'hub'
                  ? '/ratgeber/energiegemeinschaften'
                  : {
                      pathname: '/ratgeber/[model]',
                      params: { model: card.href },
                    }
              }
              className="group rounded-[24px] border border-[#062E25]/10 bg-white p-6 hover:border-[#062E25]/30"
            >
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                {card.title}
                <ArrowUpRight
                  className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden
                />
              </h2>
              <p className="mt-2 text-base text-[#062E25]/80">
                {card.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
      <RatgeberCta />
    </div>
  )
}
