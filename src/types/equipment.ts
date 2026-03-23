export interface EquipmentManufacturer {
  code: string
  name: string | null
}

export interface SolarPanelItem {
  id: string
  modelNumber: string
  seriesCode: string
  pmaxStcW: number
  efficiencyStcPercent: number
  cellTechnology: string | null
  lengthMm: number
  widthMm: number
  weightKg: number | null
  price: number
  currency: string
  isStocked: boolean
  displayName: string
  description: string | null
  keyFeatures: string[] | null
  manufacturer: EquipmentManufacturer
}

export interface InverterItem {
  id: string
  modelNumber: string
  series: string | null
  type: string
  ratedPowerKw: number
  maxEfficiencyPercent: number | null
  europeanEfficiencyPercent: number | null
  mpptCount: number | null
  hasBatterySupport: boolean
  hasBackupSupport: boolean
  weightKg: number | null
  price: number
  currency: string
  isStocked: boolean
  displayName: string
  description: string | null
  keyFeatures: string[] | null
  manufacturer: EquipmentManufacturer
}

export interface BatteryItem {
  id: string
  modelNumber: string
  series: string | null
  capacityKwh: number
  usableCapacityKwh: number | null
  maxChargePowerKw: number | null
  maxDischargePowerKw: number | null
  chemistry: string | null
  cycleLife: number | null
  depthOfDischargePercent: number | null
  weightKg: number | null
  warrantyYears: number
  compatibleInverters: string | null
  price: number
  currency: string
  isStocked: boolean
  displayName: string
  description: string | null
  keyFeatures: string[] | null
  manufacturer: EquipmentManufacturer
}

export interface MountingSystemItem {
  id: string
  modelNumber: string
  type: string
  roofType: string | null
  material: string | null
  snowLoadRatingPa: number | null
  windLoadRatingPa: number | null
  installationMethod: string | null
  warrantyYears: number
  price: number
  currency: string
  isStocked: boolean
  displayName: string
  description: string | null
  keyFeatures: string[] | null
  manufacturer: EquipmentManufacturer
}

export interface EmsItem {
  id: string
  modelNumber: string
  type: string
  maxInverters: number | null
  maxChargers: number | null
  maxHeatPumps: number | null
  powerConsumptionW: number
  weightKg: number
  price: number
  currency: string
  isStocked: boolean
  displayName: string
  description: string | null
  keyFeatures: string[] | null
  manufacturer: EquipmentManufacturer
}

export interface HeatPumpItem {
  id: string
  modelNumber: string
  series: string | null
  type: string
  heatingCapacityKw: number
  coolingCapacityKw: number | null
  copRating: number | null
  scopRating: number | null
  powerInputKw: number | null
  noiseLevelDb: number | null
  refrigerantType: string | null
  hasSgReady: boolean
  warrantyYears: number | null
  weightKg: number | null
  price: number
  currency: string
  isStocked: boolean
  displayName: string
  description: string | null
  keyFeatures: string[] | null
  manufacturer: EquipmentManufacturer
}

export interface QuoteRequestItem {
  equipmentId: string
  equipmentType: string
  quantity: number
}

export interface QuoteResponseItem {
  equipmentId: string
  equipmentType: string
  displayName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  currency: string
}

export interface EquipmentQuote {
  items: QuoteResponseItem[]
  subtotal: number
  currency: string
}
