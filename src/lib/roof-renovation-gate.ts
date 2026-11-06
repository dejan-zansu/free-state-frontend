export const ROOF_RENOVATION_LIVE = false
export const ROOF_FINANCING_APPROVED = false
export const roofFinancingVisible =
  ROOF_FINANCING_APPROVED || !ROOF_RENOVATION_LIVE
export const roofRenovationVisible =
  ROOF_RENOVATION_LIVE ||
  process.env.NEXT_PUBLIC_ROOF_RENOVATION_PREVIEW === '1'
