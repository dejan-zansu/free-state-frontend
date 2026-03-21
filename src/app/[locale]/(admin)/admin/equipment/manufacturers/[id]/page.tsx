'use client'

import { EquipmentFormPage } from '@/components/admin/EquipmentFormPage'
import type { FieldDef, TranslationFieldDef } from '@/components/admin/EquipmentFormPage'
import { adminEquipmentService } from '@/services/admin-equipment.service'

const fields: FieldDef[] = [
  { name: 'code', label: 'Code', type: 'text', required: true, section: 'General' },
  { name: 'website', label: 'Website', type: 'text', placeholder: 'https://...', section: 'General' },
  { name: 'logoUrl', label: 'Logo', type: 'image', section: 'General' },
  { name: 'isActive', label: 'Active', type: 'boolean', section: 'Status' },
]

const translationFields: TranslationFieldDef[] = [
  { name: 'name', label: 'Name', type: 'text' },
  { name: 'description', label: 'Description', type: 'textarea' },
]

export default function Page() {
  return (
    <EquipmentFormPage
      title="Manufacturer"
      backPath="/admin/equipment/manufacturers"
      queryKey="manufacturers"
      fields={fields}
      translationFields={translationFields}
      fetcher={adminEquipmentService.getManufacturer.bind(adminEquipmentService)}
      creator={adminEquipmentService.createManufacturer.bind(adminEquipmentService)}
      updater={adminEquipmentService.updateManufacturer.bind(adminEquipmentService)}
      deleter={adminEquipmentService.deleteManufacturer.bind(adminEquipmentService)}
    />
  )
}
