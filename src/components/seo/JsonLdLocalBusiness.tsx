import {
  COMPANY_LOCATIONS,
  type CompanyLocation,
} from '@/lib/company-contact'
import { siteConfig } from '@/lib/seo/site-config'

const REGION_BY_KEY: Record<string, string> = {
  schaffhausen: 'SH',
  zuerich: 'ZH',
  stgallen: 'SG',
}

function buildPostalAddress(location: CompanyLocation) {
  const [streetAddress, postalTown] = location.address.split(', ')
  const [postalCode, ...localityParts] = postalTown.split(' ')
  return {
    '@type': 'PostalAddress',
    streetAddress,
    postalCode,
    addressLocality: localityParts.join(' '),
    addressRegion: REGION_BY_KEY[location.key] ?? '',
    addressCountry: 'CH',
  }
}

function buildGeo(location: CompanyLocation) {
  return {
    '@type': 'GeoCoordinates',
    latitude: location.lat,
    longitude: location.lng,
  }
}

const HQ = COMPANY_LOCATIONS.find(l => l.key === 'schaffhausen')!
const BRANCHES = COMPANY_LOCATIONS.filter(l => l.key !== 'schaffhausen')

const SHARED = {
  '@context': 'https://schema.org',
  '@type': 'SolarEnergyContractor',
  url: 'https://www.freestate.ch',
  image: `${siteConfig.url}${siteConfig.ogImage.url}`,
  telephone: '+41 52 525 33 05',
  email: 'info@freestate.ch',
  priceRange: 'CHF',
}

const LOCAL_BUSINESS_DATA = [
  {
    ...SHARED,
    '@id': 'https://www.freestate.ch/#localbusiness',
    name: 'Free State AG',
    address: buildPostalAddress(HQ),
    geo: buildGeo(HQ),
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
  },
  ...BRANCHES.map(location => ({
    ...SHARED,
    '@id': `https://www.freestate.ch/#localbusiness-${location.key}`,
    name: `Free State AG ${location.city}`,
    address: buildPostalAddress(location),
    geo: buildGeo(location),
    parentOrganization: {
      '@type': 'Organization',
      name: 'Free State AG',
      url: 'https://www.freestate.ch',
    },
  })),
]

export function JsonLdLocalBusiness() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_BUSINESS_DATA) }}
    />
  )
}
