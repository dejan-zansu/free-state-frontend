import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import type { ReactNode } from 'react'

import { AdminShell } from '@/components/admin/AdminShell'
import { adminAreaMessages } from '@/lib/roof-renovation-messages'

export default async function AdminLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = adminAreaMessages(await getMessages({ locale }))

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <AdminShell>{children}</AdminShell>
    </NextIntlClientProvider>
  )
}
