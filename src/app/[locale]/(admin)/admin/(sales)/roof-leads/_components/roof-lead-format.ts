import type {
  RoofLeadForm,
  RoofLeadListItem,
  RoofLeadPvState,
  RoofLeadSegment,
  RoofLeadStatus,
} from '@/types/roof-lead'

export const ROOF_LEADS_QUERY_KEY = ['admin', 'roof-leads'] as const

export const ROOF_LEAD_STATUSES: RoofLeadStatus[] = [
  'NEW',
  'QUALIFIED',
  'CONTACTED',
  'REPLIED',
  'LEAD',
  'WON',
  'LOST',
  'EXCLUDED',
]

export const ROOF_LEAD_SEGMENTS: RoofLeadSegment[] = [
  'HOUSE',
  'MULTI_FAMILY',
  'COMMERCIAL',
  'HALL',
  'FARM',
  'MANAGER',
  'COOPERATIVE',
  'OWNER_PORTFOLIO',
]

export const ROOF_LEAD_FORMS: RoofLeadForm[] = [
  'FLAT',
  'STEEP',
  'MIXED',
  'SHED',
  'UNKNOWN',
]

export const ROOF_LEAD_PV_STATES: RoofLeadPvState[] = [
  'NONE',
  'OLD',
  'MID',
  'RECENT',
  'UNKNOWN',
]

export const ROOF_LEAD_STATUS_CLASS: Partial<Record<RoofLeadStatus, string>> = {
  LEAD: 'bg-teal-100 text-teal-700',
  EXCLUDED: 'bg-gray-100 text-gray-500',
}

const numberFormat = new Intl.NumberFormat('de-CH')

export function formatNumber(value: number): string {
  return numberFormat.format(value)
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('de-CH')
}

export function formatPoints(points: number): string {
  return points > 0 ? `+${points}` : String(points)
}

export function roofLeadAddress(
  lead: Pick<
    RoofLeadListItem,
    'street' | 'houseNumber' | 'postalCode' | 'city' | 'canton'
  >
): string {
  const streetLine = [lead.street, lead.houseNumber].filter(Boolean).join(' ')
  const placeLine = [lead.postalCode, lead.city].filter(Boolean).join(' ')
  return [streetLine, placeLine, lead.canton].filter(Boolean).join(', ')
}

export function roofLeadYear(
  lead: Pick<RoofLeadListItem, 'buildingYear' | 'buildingPeriod'>
): string {
  return lead.buildingYear !== null
    ? String(lead.buildingYear)
    : (lead.buildingPeriod ?? '-')
}

export function roofLeadPvDetail(
  lead: Pick<RoofLeadListItem, 'pvKw' | 'pvStartYear'>
): string {
  return [
    lead.pvKw !== null ? `${formatNumber(lead.pvKw)} kW` : null,
    lead.pvStartYear !== null ? String(lead.pvStartYear) : null,
  ]
    .filter(Boolean)
    .join(', ')
}

export function swissImageUrl(
  x: number,
  y: number,
  footprintM2: number | null
): string {
  const half =
    footprintM2 === null
      ? 60
      : Math.min(200, Math.max(30, Math.round(Math.sqrt(footprintM2) * 1.2)))
  const bbox = `${x - half},${y - half},${x + half},${y + half}`
  return `https://wms.geo.admin.ch/?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=ch.swisstopo.swissimage&STYLES=&CRS=EPSG:2056&BBOX=${bbox}&WIDTH=640&HEIGHT=640&FORMAT=image/jpeg`
}
