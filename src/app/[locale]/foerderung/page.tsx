import type { Metadata } from 'next'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { FOERDERUNG_CANTONS, type CantonCode } from '@/data/foerderung-cantons'
import { siteConfig } from '@/lib/seo/site-config'

const ALL_CANTONS: { code: CantonCode; name: string }[] = [
  { code: 'AG', name: 'Aargau' },
  { code: 'AI', name: 'Appenzell Innerrhoden' },
  { code: 'AR', name: 'Appenzell Ausserrhoden' },
  { code: 'BE', name: 'Bern' },
  { code: 'BL', name: 'Basel-Landschaft' },
  { code: 'BS', name: 'Basel-Stadt' },
  { code: 'FR', name: 'Freiburg' },
  { code: 'GE', name: 'Genf' },
  { code: 'GL', name: 'Glarus' },
  { code: 'GR', name: 'Graubünden' },
  { code: 'JU', name: 'Jura' },
  { code: 'LU', name: 'Luzern' },
  { code: 'NE', name: 'Neuenburg' },
  { code: 'NW', name: 'Nidwalden' },
  { code: 'OW', name: 'Obwalden' },
  { code: 'SG', name: 'St. Gallen' },
  { code: 'SH', name: 'Schaffhausen' },
  { code: 'SO', name: 'Solothurn' },
  { code: 'SZ', name: 'Schwyz' },
  { code: 'TG', name: 'Thurgau' },
  { code: 'TI', name: 'Tessin' },
  { code: 'UR', name: 'Uri' },
  { code: 'VD', name: 'Waadt' },
  { code: 'VS', name: 'Wallis' },
  { code: 'ZG', name: 'Zug' },
  { code: 'ZH', name: 'Zürich' },
]

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const localePrefix = locale === siteConfig.defaultLocale ? '' : `/${locale}`
  const canonical = `${siteConfig.url}${localePrefix}/foerderung`
  return {
    title: 'Photovoltaik Förderung Schweiz 2026 | Free State AG',
    description:
      'Alle Förderprogramme, Einspeisetarife und Solarpflicht-Regeln für PV in 26 Schweizer Kantonen 2026.',
    alternates: { canonical },
  }
}

export default async function FoerderungHubPage() {
  const t = await getTranslations('foerderung')
  const seededSlugByCode = new Map(
    FOERDERUNG_CANTONS.map(c => [c.code, c.nameSlug])
  )

  return (
    <article className="max-w-[1200px] mx-auto px-6 py-16 md:py-24 text-[#062E25]">
      <header className="mb-12">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          {t('hubTitle')}
        </h1>
        <p className="text-base md:text-lg text-[#062E25]/80 max-w-3xl">
          {t('hubSubheading')}
        </p>
      </header>

      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {ALL_CANTONS.map(c => {
          const slug = seededSlugByCode.get(c.code)
          if (slug) {
            return (
              <li key={c.code}>
                <Link
                  href={`/foerderung/${slug}`}
                  className="block rounded-xl border border-[#062E25]/15 bg-white p-5 hover:border-[#062E25] hover:shadow-sm transition-all"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-[#062E25]/60">
                      {c.code}
                    </span>
                    <span className="text-base font-semibold">{c.name}</span>
                  </div>
                </Link>
              </li>
            )
          }
          return (
            <li key={c.code}>
              <div className="rounded-xl border border-[#062E25]/10 bg-[#062E25]/5 p-5">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-sm font-semibold text-[#062E25]/40">
                    {c.code}
                  </span>
                  <span className="text-base font-semibold text-[#062E25]/60">
                    {c.name}
                  </span>
                </div>
                <span className="inline-block text-xs font-medium text-[#062E25]/60 bg-white rounded-full px-2 py-1">
                  {t('inPreparation')}
                </span>
              </div>
            </li>
          )
        })}
      </ul>
    </article>
  )
}
