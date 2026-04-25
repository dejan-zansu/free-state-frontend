import type { Metadata } from 'next'
import { Geist, Geist_Mono, Figtree } from 'next/font/google'
import '../globals.css'
import {
  AnalyticsScripts,
  AnalyticsNoscript,
} from '@/components/analytics/AnalyticsScripts'
import ConditionalFooter from '@/components/ConditionalFooter'
import ConditionalHeader from '@/components/ConditionalHeader'
import CookieConsentBanner from '@/components/CookieConsent'
import { locales } from '@/i18n/routing'
import { QueryProvider } from '@/providers/QueryProvider'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { generateSEOMetadata } from '@/lib/seo/metadata'
import type { SiteLocale } from '@/lib/seo/site-config'
import { JsonLd } from '@/components/seo/JsonLd'
import {
  buildOrganizationJsonLd,
  buildLocalBusinessJsonLd,
  buildWebSiteJsonLd,
} from '@/lib/seo/structured-data'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })
const figtree = Figtree({
  variable: '--font-figtree',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
})

export async function generateStaticParams() {
  return locales.map(locale => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo' })
  return generateSEOMetadata({
    locale: locale as SiteLocale,
    pathname: '/',
    title: t('home.title') || '',
    description: t('home.description') || '',
  })
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound()
  }

  const messages = await getMessages({ locale })

  return (
    <html lang={locale} className="light" suppressHydrationWarning>
      <head>
        <link
          rel="preconnect"
          href="https://pub-4c6192458b6640b4882edb8106c3751f.r2.dev"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://pub-4c6192458b6640b4882edb8106c3751f.r2.dev"
        />
        <JsonLd data={buildOrganizationJsonLd()} />
        <JsonLd data={buildLocalBusinessJsonLd()} />
        <JsonLd data={buildWebSiteJsonLd()} />
        <AnalyticsScripts />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${figtree.variable} antialiased flex flex-col min-h-screen`}
      >
        <AnalyticsNoscript />
        <NextIntlClientProvider messages={messages} locale={locale}>
          <NuqsAdapter>
            <QueryProvider>
              <div className="flex flex-col min-h-screen">
                <ConditionalHeader />
                <div className="flex-1">{children}</div>
                <ConditionalFooter locale={locale} />
                <CookieConsentBanner />
              </div>
            </QueryProvider>
          </NuqsAdapter>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
