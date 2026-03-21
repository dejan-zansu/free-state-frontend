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
  { name: 'type', label: 'Type', type: 'select', options: [
    { value: 'AIR_WATER', label: 'Air-Water' },
    { value: 'BRINE_WATER', label: 'Brine-Water' },
    { value: 'WATER_WATER', label: 'Water-Water' },
  ], section: 'General' },
  { name: 'heatingCapacityKw', label: 'Heating Capacity (kW)', type: 'number', step: '0.01', required: true, section: 'Performance' },
  { name: 'coolingCapacityKw', label: 'Cooling Capacity (kW)', type: 'number', step: '0.01', section: 'Performance' },
  { name: 'copRating', label: 'COP Rating', type: 'number', step: '0.01', section: 'Performance' },
  { name: 'scopRating', label: 'SCOP Rating', type: 'number', step: '0.01', section: 'Performance' },
  { name: 'powerInputKw', label: 'Power Input (kW)', type: 'number', step: '0.01', section: 'Electrical' },
  { name: 'voltageV', label: 'Voltage (V)', type: 'number', section: 'Electrical' },
  { name: 'gridConnection', label: 'Grid Connection', type: 'select', options: [
    { value: 'SINGLE_PHASE', label: 'Single Phase' },
    { value: 'THREE_PHASE', label: 'Three Phase' },
  ], section: 'Electrical' },
  { name: 'flowTempMaxC', label: 'Max Flow Temp (C)', type: 'number', section: 'Temperature' },
  { name: 'operatingTempMinC', label: 'Operating Temp Min (C)', type: 'number', section: 'Temperature' },
  { name: 'operatingTempMaxC', label: 'Operating Temp Max (C)', type: 'number', section: 'Temperature' },
  { name: 'refrigerantType', label: 'Refrigerant Type', type: 'text', section: 'Specifications' },
  { name: 'noiseLevelDb', label: 'Noise Level (dB)', type: 'number', step: '0.1', section: 'Specifications' },
  { name: 'dimensionsWidthMm', label: 'Width (mm)', type: 'number', section: 'Physical' },
  { name: 'dimensionsHeightMm', label: 'Height (mm)', type: 'number', section: 'Physical' },
  { name: 'dimensionsDepthMm', label: 'Depth (mm)', type: 'number', section: 'Physical' },
  { name: 'weightKg', label: 'Weight (kg)', type: 'number', step: '0.1', section: 'Physical' },
  { name: 'protectionRating', label: 'Protection Rating', type: 'text', placeholder: 'e.g. IP55', section: 'Physical' },
  { name: 'hasIntegratedTank', label: 'Integrated Tank', type: 'boolean', section: 'Features' },
  { name: 'tankCapacityL', label: 'Tank Capacity (L)', type: 'number', section: 'Features' },
  { name: 'hasSgReady', label: 'SG Ready', type: 'boolean', section: 'Features' },
  { name: 'hasSmartGridInterface', label: 'Smart Grid Interface', type: 'boolean', section: 'Features' },
  { name: 'warrantyYears', label: 'Warranty (years)', type: 'number', section: 'Availability' },
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
      title="Heat Pump"
      backPath="/admin/equipment/heat-pumps"
      queryKey="heat-pumps"
      fields={fields}
      translationFields={translationFields}
      fetcher={adminEquipmentService.getHeatPump.bind(adminEquipmentService)}
      creator={adminEquipmentService.createHeatPump.bind(adminEquipmentService)}
      updater={adminEquipmentService.updateHeatPump.bind(adminEquipmentService)}
      deleter={adminEquipmentService.deleteHeatPump.bind(adminEquipmentService)}
    />
  )
}
