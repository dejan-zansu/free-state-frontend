import type { AbstractIntlMessages } from 'next-intl'

import { roofRenovationVisible } from '@/lib/roof-renovation-gate'

export function publicRoofMessages(
  messages: AbstractIntlMessages
): AbstractIntlMessages {
  const source = messages.admin as AbstractIntlMessages
  const sidebar = { ...(source.sidebar as AbstractIntlMessages) }
  delete sidebar.groupRoofRenovation
  delete sidebar.roofLeads
  const contacts = source.contacts as AbstractIntlMessages
  const entityTypes = { ...(contacts.entityTypes as AbstractIntlMessages) }
  delete entityTypes.roof_renovation
  const admin: AbstractIntlMessages = {
    ...source,
    sidebar,
    contacts: { ...contacts, entityTypes },
  }
  delete admin.roofLeads
  const result: AbstractIntlMessages = { ...messages, admin }
  if (roofRenovationVisible) return result

  const seo = { ...(messages.seo as AbstractIntlMessages) }
  delete seo.roofRenovation
  delete seo.roofRenovationSolar
  const footer = messages.footer as AbstractIntlMessages
  const products = { ...(footer.products as AbstractIntlMessages) }
  delete products.roofRenovation
  delete products.roofRenovationSolar
  delete result.roofRenovation
  return { ...result, seo, footer: { ...footer, products } }
}

export function adminAreaMessages(
  messages: AbstractIntlMessages
): AbstractIntlMessages {
  const result = publicRoofMessages(messages)
  const admin = messages.admin as AbstractIntlMessages
  return {
    ...result,
    admin: {
      ...(result.admin as AbstractIntlMessages),
      sidebar: admin.sidebar,
      contacts: admin.contacts,
    },
  }
}

export function roofLeadsAdminMessages(
  messages: AbstractIntlMessages
): AbstractIntlMessages {
  const result = adminAreaMessages(messages)
  const admin = messages.admin as AbstractIntlMessages
  return {
    ...result,
    admin: {
      ...(result.admin as AbstractIntlMessages),
      roofLeads: admin.roofLeads,
    },
  }
}
