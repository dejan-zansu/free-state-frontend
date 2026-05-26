import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { FOERDERUNG_CANTONS } from '@/data/foerderung-cantons'
import { CantonalFoerderungPage } from '@/components/CantonalFoerderungPage'
import { siteConfig } from '@/lib/seo/site-config'

export function generateStaticParams() {
  return FOERDERUNG_CANTONS.map(c => ({ kanton: c.nameSlug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ kanton: string; locale: string }>
}): Promise<Metadata> {
  const { kanton, locale } = await params
  const canton = FOERDERUNG_CANTONS.find(c => c.nameSlug === kanton)
  if (!canton) {
    return {
      robots: { index: false, follow: false },
      title: 'Photovoltaik Förderung | Free State AG',
    }
  }
  const localePrefix = locale === siteConfig.defaultLocale ? '' : `/${locale}`
  const canonical = `${siteConfig.url}${localePrefix}/foerderung/${canton.nameSlug}`
  return {
    title: `Photovoltaik Förderung ${canton.name} 2026 | Free State AG`,
    description: `Alle PV-Förderbeträge ${canton.name} 2026: Pronovo EIV, kantonale Programme, Solarpflicht, EVU-Tarife. Aktualisiert ${canton.lastUpdated}.`,
    alternates: { canonical },
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ kanton: string }>
}) {
  const { kanton } = await params
  const canton = FOERDERUNG_CANTONS.find(c => c.nameSlug === kanton)
  if (!canton) notFound()
  return <CantonalFoerderungPage canton={canton} />
}
