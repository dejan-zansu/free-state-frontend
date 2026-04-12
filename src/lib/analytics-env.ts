export const analyticsEnabled =
  process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true'

export const gtmId = process.env.NEXT_PUBLIC_GTM_ID ?? ''
export const ga4MeasurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID ?? ''
export const hotjarSiteId = process.env.NEXT_PUBLIC_HOTJAR_SITE_ID ?? ''
export const googleSiteVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? ''

export const gtmEnabled = analyticsEnabled && gtmId.length > 0
export const hotjarEnabled = analyticsEnabled && hotjarSiteId.length > 0
export const searchConsoleVerificationEnabled =
  analyticsEnabled && googleSiteVerification.length > 0
