'use client'

import { EquipmentFormPage } from '@/components/admin/EquipmentFormPage'
import type { FieldDef, TranslationFieldDef } from '@/components/admin/EquipmentFormPage'
import { adminEquipmentService } from '@/services/admin-equipment.service'

const fields: FieldDef[] = [
  { name: 'imageUrl', label: 'Image', type: 'image', section: 'General' },
  { name: 'manufacturerId', label: 'Manufacturer ID', type: 'text', required: true, section: 'General' },
  { name: 'modelNumber', label: 'Model Number', type: 'text', required: true, section: 'General' },
  { name: 'series', label: 'Series', type: 'text', section: 'General' },
  { name: 'sku', label: 'SKU', type: 'text', section: 'General' },
  { name: 'capacityKwh', label: 'Capacity (kWh)', type: 'number', step: '0.01', required: true, section: 'Capacity' },
  { name: 'usableCapacityKwh', label: 'Usable Capacity (kWh)', type: 'number', step: '0.01', section: 'Capacity' },
  { name: 'nominalVoltageV', label: 'Nominal Voltage (V)', type: 'number', step: '0.1', section: 'Capacity' },
  { name: 'maxChargePowerKw', label: 'Max Charge Power (kW)', type: 'number', step: '0.01', section: 'Power' },
  { name: 'maxDischargePowerKw', label: 'Max Discharge Power (kW)', type: 'number', step: '0.01', section: 'Power' },
  { name: 'chemistry', label: 'Chemistry', type: 'select', options: [
    { value: 'LFP', label: 'LFP (Lithium Iron Phosphate)' },
    { value: 'NMC', label: 'NMC (Nickel Manganese Cobalt)' },
    { value: 'LTO', label: 'LTO (Lithium Titanate)' },
  ], section: 'Specifications' },
  { name: 'cycleLife', label: 'Cycle Life', type: 'number', section: 'Specifications' },
  { name: 'depthOfDischargePercent', label: 'Depth of Discharge (%)', type: 'number', step: '0.1', section: 'Specifications' },
  { name: 'dimensionsWidthMm', label: 'Width (mm)', type: 'number', section: 'Physical' },
  { name: 'dimensionsHeightMm', label: 'Height (mm)', type: 'number', section: 'Physical' },
  { name: 'dimensionsDepthMm', label: 'Depth (mm)', type: 'number', section: 'Physical' },
  { name: 'weightKg', label: 'Weight (kg)', type: 'number', step: '0.1', section: 'Physical' },
  { name: 'protectionRating', label: 'Protection Rating', type: 'text', placeholder: 'e.g. IP55', section: 'Physical' },
  { name: 'warrantyYears', label: 'Warranty (years)', type: 'number', section: 'Warranty' },
  { name: 'cycleWarranty', label: 'Cycle Warranty', type: 'number', section: 'Warranty' },
  { name: 'isActive', label: 'Active', type: 'boolean', section: 'Availability' },
  { name: 'isStocked', label: 'Stocked', type: 'boolean', section: 'Availability' },
  { name: 'leadTimeDays', label: 'Lead Time (days)', type: 'number', section: 'Availability' },
]

const translationFields: TranslationFieldDef[] = [
  { name: 'displayName', label: 'Display Name', type: 'text' },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'keyFeatures', label: 'Key Features', type: 'json' },
]

export default function Page() {
  return (
    <EquipmentFormPage
      title="Battery"
      backPath="/admin/equipment/batteries"
      queryKey="batteries"
      fields={fields}
      translationFields={translationFields}
      fetcher={adminEquipmentService.getBattery.bind(adminEquipmentService)}
      creator={adminEquipmentService.createBattery.bind(adminEquipmentService)}
      updater={adminEquipmentService.updateBattery.bind(adminEquipmentService)}
      deleter={adminEquipmentService.deleteBattery.bind(adminEquipmentService)}
    />
  )
}
