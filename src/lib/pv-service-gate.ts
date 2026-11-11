export const PV_SERVICE_LIVE = true
export const pvServiceVisible =
  PV_SERVICE_LIVE || process.env.NEXT_PUBLIC_PV_SERVICE_PREVIEW === '1'
