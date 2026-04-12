import ConditionalFooter from '@/components/ConditionalFooter'
import ConditionalHeader from '@/components/ConditionalHeader'
import CookieConsentBanner from '@/components/CookieConsent'
import { locales } from '@/i18n/routing'
import { QueryProvider } from '@/providers/QueryProvider'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
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
    <NextIntlClientProvider messages={messages} locale={locale}>
      <QueryProvider>
        <div className='flex flex-col min-h-screen'>
          <ConditionalHeader />
          <main className='flex-1'>{children}</main>
          <ConditionalFooter locale={locale} />
          <CookieConsentBanner />
        </div>
      </QueryProvider>
    </NextIntlClientProvider>
  )
}
