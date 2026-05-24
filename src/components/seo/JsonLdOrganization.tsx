const ORG_DATA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Free State AG',
  alternateName: ['Free State', 'Free State Ltd', 'Free State SA'],
  legalName: 'Free State AG',
  url: 'https://www.freestate.ch',
  logo: 'https://www.freestate.ch/logo-dark.svg',
  foundingDate: '2024-11-12',
  taxID: 'CHE-134.711.335',
  vatID: 'CHE-134.711.335 MWST',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Stettemerstrasse 40',
    postalCode: '8207',
    addressLocality: 'Schaffhausen',
    addressRegion: 'SH',
    addressCountry: 'CH',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+41 52 525 33 05',
    email: 'info@freestate.ch',
    contactType: 'customer service',
    areaServed: 'CH',
    availableLanguage: ['de', 'en', 'fr', 'it'],
  },
  sameAs: [
    'https://www.linkedin.com/company/free-state-ag/',
    'https://www.facebook.com/freestateag',
    'https://www.instagram.com/free_state_ag',
  ],
}

export function JsonLdOrganization() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_DATA) }}
    />
  )
}
