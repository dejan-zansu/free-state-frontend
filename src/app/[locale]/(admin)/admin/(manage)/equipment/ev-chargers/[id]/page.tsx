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
    { value: 'AC', label: 'AC' },
    { value: 'DC', label: 'DC' },
    { value: 'HYBRID', label: 'Hybrid' },
  ], section: 'General' },
  { name: 'ratedPowerKw', label: 'Rated Power (kW)', type: 'number', step: '0.1', required: true, section: 'Performance' },
  { name: 'maxPowerKw', label: 'Max Power (kW)', type: 'number', step: '0.1', section: 'Performance' },
  { name: 'numberOfOutlets', label: 'Outlets', type: 'number', section: 'Performance' },
  { name: 'connectorTypes', label: 'Connector Types', type: 'text', placeholder: 'Type 2, CCS', section: 'Performance' },
  { name: 'gridConnection', label: 'Grid Connection', type: 'text', placeholder: 'single-phase / three-phase', section: 'Electrical' },
  { name: 'voltageV', label: 'Voltage (V)', type: 'number', section: 'Electrical' },
  { name: 'maxCurrentA', label: 'Max Current (A)', type: 'number', step: '0.1', section: 'Electrical' },
  { name: 'hasRfid', label: 'RFID', type: 'boolean', section: 'Features' },
  { name: 'hasAppControl', label: 'App Control', type: 'boolean', section: 'Features' },
  { name: 'hasLoadBalancing', label: 'Load Balancing', type: 'boolean', section: 'Features' },
  { name: 'hasMidMeter', label: 'MID Meter', type: 'boolean', section: 'Features' },
  { name: 'isScalable', label: 'Scalable', type: 'boolean', section: 'Features' },
  { name: 'dimensionsWidthMm', label: 'Width (mm)', type: 'number', section: 'Physical' },
  { name: 'dimensionsHeightMm', label: 'Height (mm)', type: 'number', section: 'Physical' },
  { name: 'dimensionsDepthMm', label: 'Depth (mm)', type: 'number', section: 'Physical' },
  { name: 'weightKg', label: 'Weight (kg)', type: 'number', step: '0.1', section: 'Physical' },
  { name: 'protectionRating', label: 'Protection Rating', type: 'text', placeholder: 'IP55', section: 'Physical' },
  { name: 'operatingTempMinC', label: 'Operating Temp Min (C)', type: 'number', section: 'Temperature' },
  { name: 'operatingTempMaxC', label: 'Operating Temp Max (C)', type: 'number', section: 'Temperature' },
  { name: 'compatibleEms', label: 'Compatible EMS', type: 'text', section: 'Compatibility' },
  { name: 'warrantyYears', label: 'Warranty (years)', type: 'number', section: 'Availability' },
  { name: 'leadTimeDays', label: 'Lead Time (days)', type: 'number', section: 'Availability' },
  { name: 'isStocked', label: 'Stocked', type: 'boolean', section: 'Availability' },
  { name: 'isActive', label: 'Active', type: 'boolean', section: 'Availability' },
  { name: 'priceChf', label: 'Price (CHF)', type: 'number', step: '0.01', section: 'Pricing' },
  { name: 'isPublic', label: 'Public (visible in calculator)', type: 'boolean', section: 'Pricing' },
]

const translationFields: TranslationFieldDef[] = [
  { name: 'displayName', label: 'Display Name', type: 'text' },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'keyFeatures', label: 'Key Features', type: 'json' },
]

export default function Page() {
  return (
    <EquipmentFormPage
      title="EV Charger"
      backPath="/admin/equipment/ev-chargers"
      queryKey="ev-chargers"
      fields={fields}
      translationFields={translationFields}
      fetcher={adminEquipmentService.getEvCharger.bind(adminEquipmentService)}
      creator={adminEquipmentService.createEvCharger.bind(adminEquipmentService)}
      updater={adminEquipmentService.updateEvCharger.bind(adminEquipmentService)}
      deleter={adminEquipmentService.deleteEvCharger.bind(adminEquipmentService)}
    />
  )
}
