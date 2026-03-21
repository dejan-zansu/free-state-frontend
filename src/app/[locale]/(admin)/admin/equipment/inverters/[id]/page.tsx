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
    { value: 'STRING', label: 'String' },
    { value: 'MICRO', label: 'Micro' },
    { value: 'HYBRID', label: 'Hybrid' },
    { value: 'CENTRAL', label: 'Central' },
  ], section: 'General' },
  { name: 'ratedPowerKw', label: 'Rated Power (kW)', type: 'number', step: '0.01', required: true, section: 'Performance' },
  { name: 'maxEfficiencyPercent', label: 'Max Efficiency (%)', type: 'number', step: '0.01', section: 'Performance' },
  { name: 'europeanEfficiencyPercent', label: 'European Efficiency (%)', type: 'number', step: '0.01', section: 'Performance' },
  { name: 'mpptCount', label: 'MPPT Count', type: 'number', section: 'MPPT' },
  { name: 'maxInputsPerMppt', label: 'Max Inputs per MPPT', type: 'number', section: 'MPPT' },
  { name: 'maxInputVoltageV', label: 'Max Input Voltage (V)', type: 'number', section: 'MPPT' },
  { name: 'operatingVoltageRangeV', label: 'Operating Voltage Range (V)', type: 'text', section: 'MPPT' },
  { name: 'gridConnection', label: 'Grid Connection', type: 'select', options: [
    { value: 'SINGLE_PHASE', label: 'Single Phase' },
    { value: 'THREE_PHASE', label: 'Three Phase' },
  ], section: 'Grid & Output' },
  { name: 'ratedOutputPowerW', label: 'Rated Output Power (W)', type: 'number', section: 'Grid & Output' },
  { name: 'hasBatterySupport', label: 'Battery Support', type: 'boolean', section: 'Features' },
  { name: 'hasBackupSupport', label: 'Backup Support', type: 'boolean', section: 'Features' },
  { name: 'dimensionsWidthMm', label: 'Width (mm)', type: 'number', section: 'Physical' },
  { name: 'dimensionsHeightMm', label: 'Height (mm)', type: 'number', section: 'Physical' },
  { name: 'dimensionsDepthMm', label: 'Depth (mm)', type: 'number', section: 'Physical' },
  { name: 'weightKg', label: 'Weight (kg)', type: 'number', step: '0.1', section: 'Physical' },
  { name: 'protectionRating', label: 'Protection Rating', type: 'text', placeholder: 'e.g. IP65', section: 'Physical' },
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
      title="Inverter"
      backPath="/admin/equipment/inverters"
      queryKey="inverters"
      fields={fields}
      translationFields={translationFields}
      fetcher={adminEquipmentService.getInverter.bind(adminEquipmentService)}
      creator={adminEquipmentService.createInverter.bind(adminEquipmentService)}
      updater={adminEquipmentService.updateInverter.bind(adminEquipmentService)}
      deleter={adminEquipmentService.deleteInverter.bind(adminEquipmentService)}
    />
  )
}
