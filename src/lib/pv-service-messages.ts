import type { AbstractIntlMessages } from 'next-intl'

import { pvServiceVisible } from '@/lib/pv-service-gate'

function withoutPvServiceAdmin(
  messages: AbstractIntlMessages
): AbstractIntlMessages {
  const source = messages.admin as AbstractIntlMessages | undefined
  if (!source) return messages

  const sidebar = { ...(source.sidebar as AbstractIntlMessages) }
  delete sidebar.groupPvService
  delete sidebar.pvServiceRequests

  const admin: AbstractIntlMessages = { ...source, sidebar }
  delete admin.pvService

  return { ...messages, admin }
}

export function publicPvServiceMessages(
  input: AbstractIntlMessages
): AbstractIntlMessages {
  const messages = withoutPvServiceAdmin(input)
  if (pvServiceVisible) return messages

  const result: AbstractIntlMessages = { ...messages }
  delete result.pvService

  const seo = { ...(messages.seo as AbstractIntlMessages) }
  delete seo.pvService

  const footer = messages.footer as AbstractIntlMessages
  const products = { ...(footer.products as AbstractIntlMessages) }
  delete products.pvService

  const sourceHome = messages.home as AbstractIntlMessages
  const home = { ...sourceHome }
  delete home.pvService
  const hero = sourceHome.hero as AbstractIntlMessages | undefined
  if (hero?.nav) {
    const nav = { ...(hero.nav as AbstractIntlMessages) }
    delete nav.pvService
    home.hero = { ...hero, nav }
  }

  return { ...result, seo, home, footer: { ...footer, products } }
}
