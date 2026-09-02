/** Free State AG main phone. Use for all public company `tel:` links and display text. */
export const COMPANY_MAIN_PHONE_E164 = '+41525253305' as const

export const COMPANY_MAIN_PHONE_TEL_HREF =
  `tel:${COMPANY_MAIN_PHONE_E164}` as const

export const COMPANY_MAIN_PHONE_DISPLAY = '+41 52 525 33 05' as const

export const COMPANY_MAIN_EMAIL = 'info@freestate.ch' as const

export const COMPANY_MAIN_MAILTO_HREF =
  `mailto:${COMPANY_MAIN_EMAIL}` as const

export type CompanyLocation = {
  key: string
  city: string
  address: string
  lat: number
  lng: number
}

/**
 * Free State AG office locations plotted on the contact map, matching the
 * Google Business Profile listings. Only sites with a confirmed street
 * address are listed; add new entries with `address`/`lat`/`lng` values.
 */
export const COMPANY_LOCATIONS: readonly CompanyLocation[] = [
  {
    key: 'schaffhausen',
    city: 'Schaffhausen',
    address: 'Stettemerstrasse 40, 8207 Schaffhausen',
    lat: 47.72236775065768,
    lng: 8.655320035601854,
  },
  {
    key: 'zuerich',
    city: 'Zürich',
    address: 'Bordacherstrasse 2, 8108 Zürich',
    lat: 47.4382426,
    lng: 8.4459542,
  },
  {
    key: 'stgallen',
    city: 'St. Gallen',
    address: 'Schmiedgasse 5, 9000 St. Gallen',
    lat: 47.4242841,
    lng: 9.3763953,
  },
] as const

/** Public Calendly booking link for scheduling a consultation. */
export const COMPANY_CALENDLY_URL =
  'https://calendly.com/ivan-m-freestate/30min' as const

export const CONSULTATION_ADVISORS = [
  {
    key: 'ivan',
    image: '/images/ivan.webp',
    email: 'ivan.m@freestate.ch',
    phone: '+41 (0)76 364 7775',
    calendlyUrl: COMPANY_CALENDLY_URL,
  },
  {
    key: 'peter',
    image: '/images/peter.webp',
    email: 'peter.aragai@freestate.ch',
    phone: '+41 78 608 88 50',
    calendlyUrl: COMPANY_CALENDLY_URL,
  },
] as const

export type ConsultationAdvisor = (typeof CONSULTATION_ADVISORS)[number]
