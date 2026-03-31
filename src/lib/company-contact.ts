/** Free State AG main phone — use for all public company `tel:` links and display text. */
export const COMPANY_MAIN_PHONE_E164 = '+41525253305' as const

export const COMPANY_MAIN_PHONE_TEL_HREF =
  `tel:${COMPANY_MAIN_PHONE_E164}` as const

export const COMPANY_MAIN_PHONE_DISPLAY = '+41 52 525 33 05' as const

export const COMPANY_MAIN_EMAIL = 'info@freestate.ch' as const

export const COMPANY_MAIN_MAILTO_HREF =
  `mailto:${COMPANY_MAIN_EMAIL}` as const
