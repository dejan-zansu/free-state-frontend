const VIDEO_BASE = 'https://pub-4c6192458b6640b4882edb8106c3751f.r2.dev/videos'

export const COMMERCIAL_SEGMENT_KEYS = [
  'multiFamily',
  'industry',
  'farm',
  'public',
] as const

export type CommercialSegmentKey = (typeof COMMERCIAL_SEGMENT_KEYS)[number]

export const COMMERCIAL_SOLAR_FREE_HREF = '/commercial/solar-free' as const
export const COMMERCIAL_CALCULATOR_HREF = '/commercial/calculator' as const
export const COMMERCIAL_PURCHASE_HREF = '/commercial/solar-systems' as const

export const COMMERCIAL_HUB_MEDIA = {
  hero: '/images/photography/commercial-flat-roof-pv-rows-walkway-landscape-crop-0774.webp',
  facts: '/images/pv-service/commercial-roof-pv-portrait.webp',
}

export const COMMERCIAL_SEGMENTS = {
  multiFamily: {
    href: '/commercial/solar-free/solar-free-multi-family',
    image: '/images/photography/pv-modules-around-roof-dormer-1177.webp',
    video: `${VIDEO_BASE}/FreeState%20-%20Multi.mp4`,
  },
  industry: {
    href: '/commercial/solar-free/industry-commercial',
    image: '/images/photography/commercial-flat-roof-pv-array-halls-landscape-crop-0771.webp',
    video: `${VIDEO_BASE}/FreeState%20-%20Industrial.mp4`,
  },
  farm: {
    href: '/commercial/solar-free/farmhouses',
    image: '/images/photography/barn-pv-roof-trees-landscape-crop-0599.webp',
    video: null,
    factsImage: '/images/solar-free/farmhouses-how-pv-1-248feb.webp',
  },
  public: {
    href: '/commercial/solar-free/public-buildings',
    image: '/images/photography/pv-modules-roof-edge-wide-blue-sky-1142.webp',
    video: `${VIDEO_BASE}/FreeState%20-%20Public.mp4`,
  },
} as const satisfies Record<
  CommercialSegmentKey,
  | { href: string; image: string; video: string }
  | { href: string; image: string; video: null; factsImage: string }
>
