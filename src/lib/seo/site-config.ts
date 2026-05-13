export const siteConfig = {
  url: 'https://www.freestate.ch',
  name: 'Free State AG',
  legalName: 'Free State AG',
  description:
    'Solaranlagen, Batteriespeicher, Wärmepumpen und Ladestationen in der Schweiz. Kaufen oder als Solar-Abo ab CHF 0.00 Eigeninvestition.',
  defaultLocale: 'de' as const,
  locales: ['de', 'en', 'fr', 'it'] as const,
  brandColor: '#062E25',
  social: {
    linkedin: 'https://www.linkedin.com/company/free-state-ag/',
  },
  contact: {
    email: 'info@freestate.ch',
    phone: '+41 XX XXX XX XX',
  },
  address: {
    streetAddress: 'TO BE FILLED BY STAKEHOLDER',
    addressLocality: 'TO BE FILLED',
    postalCode: 'TO BE FILLED',
    addressRegion: 'TO BE FILLED',
    addressCountry: 'CH',
  },
  openingHours: [
    {
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '17:30',
    },
  ],
  areaServed: [
    'Zürich',
    'Bern',
    'Luzern',
    'Uri',
    'Schwyz',
    'Obwalden',
    'Nidwalden',
    'Glarus',
    'Zug',
    'Solothurn',
    'Basel-Stadt',
    'Basel-Landschaft',
    'Schaffhausen',
    'Appenzell Ausserrhoden',
    'Appenzell Innerrhoden',
    'St. Gallen',
    'Graubünden',
    'Aargau',
    'Thurgau',
  ],
  ogImage: {
    url: '/images/hero-solar-panels.webp',
    width: 1440,
    height: 736,
    alt: 'Free State AG, Solaranlagen und erneuerbare Energien in der Schweiz',
  },
  twitter: {
    handle: '@freestate_ag',
  },
} as const

export type SiteLocale = (typeof siteConfig.locales)[number]

export function getSiteUrl(): string {
  return siteConfig.url
}
