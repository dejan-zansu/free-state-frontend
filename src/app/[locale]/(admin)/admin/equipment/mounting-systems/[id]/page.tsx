'use client'

import { EquipmentFormPage } from '@/components/admin/EquipmentFormPage'
import type { FieldDef, TranslationFieldDef } from '@/components/admin/EquipmentFormPage'
import { adminEquipmentService } from '@/services/admin-equipment.service'

const fields: FieldDef[] = [
  { name: 'manufacturerId', label: 'Manufacturer ID', type: 'text', required: true, section: 'General' },
  { name: 'modelNumber', label: 'Model Number', type: 'text', required: true, section: 'General' },
  { name: 'sku', label: 'SKU', type: 'text', section: 'General' },
  { name: 'type', label: 'Type', type: 'select', options: [
    { value: 'ROOF_MOUNT', label: 'Roof Mount' },
    { value: 'GROUND_MOUNT', label: 'Ground Mount' },
    { value: 'FLAT_ROOF', label: 'Flat Roof' },
    { value: 'FACADE', label: 'Facade' },
  ], section: 'Classification' },
  { name: 'roofType', label: 'Roof Type', type: 'select', options: [
    { value: 'TILE', label: 'Tile' },
    { value: 'METAL', label: 'Metal' },
    { value: 'FLAT', label: 'Flat' },
    { value: 'SLATE', label: 'Slate' },
    { value: 'BITUMEN', label: 'Bitumen' },
  ], section: 'Classification' },
  { name: 'material', label: 'Material', type: 'text', section: 'Specifications' },
  { name: 'coating', label: 'Coating', type: 'text', section: 'Specifications' },
  { name: 'snowLoadRatingPa', label: 'Snow Load Rating (Pa)', type: 'number', section: 'Specifications' },
  { name: 'windLoadRatingPa', label: 'Wind Load Rating (Pa)', type: 'number', section: 'Specifications' },
  { name: 'installationMethod', label: 'Installation Method', type: 'text', section: 'Installation' },
  { name: 'adjustableTilt', label: 'Adjustable Tilt', type: 'boolean', section: 'Installation' },
  { name: 'tiltAngleRange', label: 'Tilt Angle Range', type: 'text', placeholder: 'e.g. 10-60', section: 'Installation' },
  { name: 'warrantyYears', label: 'Warranty (years)', type: 'number', section: 'Availability' },
  { name: 'isActive', label: 'Active', type: 'boolean', section: 'Availability' },
  { name: 'isStocked', label: 'Stocked', type: 'boolean', section: 'Availability' },
  { name: 'leadTimeDays', label: 'Lead Time (days)', type: 'number', section: 'Availability' },
]

const translationFields: TranslationFieldDef[] = [
  { name: 'displayName', label: 'Display Name', type: 'text' },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'keyFeatures', label: 'Key Features', type: 'json' },
  { name: 'installationNotes', label: 'Installation Notes', type: 'textarea' },
]

export default function Page() {
  return (
    <EquipmentFormPage
      title="Mounting System"
      backPath="/admin/equipment/mounting-systems"
      queryKey="mounting-systems"
      fields={fields}
      translationFields={translationFields}
      fetcher={adminEquipmentService.getMountingSystem.bind(adminEquipmentService)}
      creator={adminEquipmentService.createMountingSystem.bind(adminEquipmentService)}
      updater={adminEquipmentService.updateMountingSystem.bind(adminEquipmentService)}
      deleter={adminEquipmentService.deleteMountingSystem.bind(adminEquipmentService)}
    />
  )
}
