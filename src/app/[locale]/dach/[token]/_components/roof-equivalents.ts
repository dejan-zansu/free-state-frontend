export const ECAR_KWH_PER_100KM = 18
export const EARTH_CIRCUMFERENCE_KM = 40075
export const VAN_KM_PER_YEAR = 12000
export const EVAN_KWH_PER_100KM = 26.8
export const VAN_KWH_PER_YEAR = (VAN_KM_PER_YEAR * EVAN_KWH_PER_100KM) / 100
export const HEAT_PUMP_HOUSE_KWH_PER_YEAR = 5330

export type RoofEquivalents = {
  laps: number
  km: number
  vans: number
  houses: number
}

export function equivalentsFor(kwhYear: number): RoofEquivalents {
  const km = (kwhYear / ECAR_KWH_PER_100KM) * 100
  return {
    laps: km / EARTH_CIRCUMFERENCE_KM,
    km,
    vans: kwhYear / VAN_KWH_PER_YEAR,
    houses: kwhYear / HEAT_PUMP_HOUSE_KWH_PER_YEAR,
  }
}
