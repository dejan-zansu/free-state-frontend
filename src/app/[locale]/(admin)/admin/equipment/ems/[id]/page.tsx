'use client'

import { EquipmentFormPage } from '@/components/admin/EquipmentFormPage'
import type { FieldDef, TranslationFieldDef } from '@/components/admin/EquipmentFormPage'
import { adminEquipmentService } from '@/services/admin-equipment.service'

const fields: FieldDef[] = [
  { name: 'manufacturerId', label: 'Manufacturer ID', type: 'text', required: true, section: 'General' },
  { name: 'modelNumber', label: 'Model Number', type: 'text', required: true, section: 'General' },
  { name: 'sku', label: 'SKU', type: 'text', section: 'General' },
  { name: 'type', label: 'Type', type: 'text', section: 'General' },
  { name: 'powerConsumptionW', label: 'Power Consumption (W)', type: 'number', section: 'Specifications' },
  { name: 'maxCurrentDirectA', label: 'Max Current Direct (A)', type: 'number', section: 'Specifications' },
  { name: 'externalCtSupport', label: 'External CT Support', type: 'boolean', section: 'Specifications' },
  { name: 'maxInverters', label: 'Max Inverters', type: 'number', section: 'Capacity' },
  { name: 'maxChargers', label: 'Max Chargers', type: 'number', section: 'Capacity' },
  { name: 'maxHeatPumps', label: 'Max Heat Pumps', type: 'number', section: 'Capacity' },
  { name: 'dimensionsWidthMm', label: 'Width (mm)', type: 'number', section: 'Physical' },
  { name: 'dimensionsHeightMm', label: 'Height (mm)', type: 'number', section: 'Physical' },
  { name: 'dimensionsDepthMm', label: 'Depth (mm)', type: 'number', section: 'Physical' },
  { name: 'weightKg', label: 'Weight (kg)', type: 'number', step: '0.1', section: 'Physical' },
  { name: 'protectionRating', label: 'Protection Rating', type: 'text', placeholder: 'e.g. IP20', section: 'Physical' },
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
      title="Energy Management System"
      backPath="/admin/equipment/ems"
      queryKey="ems"
      fields={fields}
      translationFields={translationFields}
      fetcher={adminEquipmentService.getEms.bind(adminEquipmentService)}
      creator={adminEquipmentService.createEms.bind(adminEquipmentService)}
      updater={adminEquipmentService.updateEms.bind(adminEquipmentService)}
      deleter={adminEquipmentService.deleteEms.bind(adminEquipmentService)}
    />
  )
}
