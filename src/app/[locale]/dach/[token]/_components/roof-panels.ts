export type RoofPagePanels = {
  modules: Array<Array<[number, number]>>
  center: { lat: number; lng: number }
  groundAltitudeM: number | null
}
