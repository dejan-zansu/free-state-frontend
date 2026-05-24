const LOCAL_BUSINESS_DATA = {
  '@context': 'https://schema.org',
  '@type': 'SolarEnergyContractor',
  '@id': 'https://www.freestate.ch/#localbusiness',
  name: 'Free State AG',
  url: 'https://www.freestate.ch',
  image: 'https://www.freestate.ch/og/default-1200x630.png',
  telephone: '+41 52 525 33 05',
  email: 'info@freestate.ch',
  priceRange: 'CHF',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Stettemerstrasse 40',
    postalCode: '8207',
    addressLocality: 'Schaffhausen',
    addressRegion: 'SH',
    addressCountry: 'CH',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 47.6981,
    longitude: 8.6286,
  },
  areaServed: [
    { '@type': 'AdministrativeArea', name: 'Aargau' },
    { '@type': 'AdministrativeArea', name: 'Appenzell Ausserrhoden' },
    { '@type': 'AdministrativeArea', name: 'Appenzell Innerrhoden' },
    { '@type': 'AdministrativeArea', name: 'Basel-Land' },
    { '@type': 'AdministrativeArea', name: 'Basel-Stadt' },
    { '@type': 'AdministrativeArea', name: 'Bern' },
    { '@type': 'AdministrativeArea', name: 'Glarus' },
    { '@type': 'AdministrativeArea', name: 'Graubünden' },
    { '@type': 'AdministrativeArea', name: 'Luzern' },
    { '@type': 'AdministrativeArea', name: 'Nidwalden' },
    { '@type': 'AdministrativeArea', name: 'Obwalden' },
    { '@type': 'AdministrativeArea', name: 'Schaffhausen' },
    { '@type': 'AdministrativeArea', name: 'Schwyz' },
    { '@type': 'AdministrativeArea', name: 'Solothurn' },
    { '@type': 'AdministrativeArea', name: 'St. Gallen' },
    { '@type': 'AdministrativeArea', name: 'Thurgau' },
    { '@type': 'AdministrativeArea', name: 'Uri' },
    { '@type': 'AdministrativeArea', name: 'Zug' },
    { '@type': 'AdministrativeArea', name: 'Zürich' },
  ],
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '17:30',
    },
  ],
  sameAs: [
    'https://www.linkedin.com/company/free-state-ag/',
    'https://www.facebook.com/freestateag',
    'https://www.instagram.com/free_state_ag',
  ],
}

export function JsonLdLocalBusiness() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_BUSINESS_DATA) }}
    />
  )
}
