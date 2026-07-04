/** Free State AG main phone — use for all public company `tel:` links and display text. */
export const COMPANY_MAIN_PHONE_E164 = '+41525253305' as const

export const COMPANY_MAIN_PHONE_TEL_HREF =
  `tel:${COMPANY_MAIN_PHONE_E164}` as const

export const COMPANY_MAIN_PHONE_DISPLAY = '+41 52 525 33 05' as const

export const COMPANY_MAIN_EMAIL = 'info@freestate.ch' as const

export const COMPANY_MAIN_MAILTO_HREF =
  `mailto:${COMPANY_MAIN_EMAIL}` as const

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
    phone: '+41 (0)78 6088 850',
    calendlyUrl: COMPANY_CALENDLY_URL,
  },
] as const

export type ConsultationAdvisor = (typeof CONSULTATION_ADVISORS)[number]
