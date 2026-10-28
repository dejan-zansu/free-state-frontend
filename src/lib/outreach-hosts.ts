import { siteConfig } from '@/lib/seo/site-config'

export const OUTREACH_HOSTS = [
  'freestate-solar.ch',
  'freestate-energie.ch',
  'freestate-photovoltaik.ch',
]

export const MAIN_SITE_ORIGIN = siteConfig.url

export function isOutreachHost(host: string | null | undefined): boolean {
  if (!host) return false
  const name = host
    .toLowerCase()
    .split(':')[0]
    .replace(/^www\./, '')
  return OUTREACH_HOSTS.includes(name)
}

const MAIL_PATHS = ['/', '/datenschutz', '/portfolio/bowling-five-thayngen']
const ROOF_PAGE_PATH = /^\/dach\/[^/]+$/

export function isOutreachMailPath(pathname: string): boolean {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname
  return MAIL_PATHS.includes(path) || ROOF_PAGE_PATH.test(path)
}
