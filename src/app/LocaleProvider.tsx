'use client'

import { NextIntlClientProvider, useLocale, useMessages } from 'next-intl'
import React from 'react'

export default function LocaleProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = useLocale()
  const messages = useMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
