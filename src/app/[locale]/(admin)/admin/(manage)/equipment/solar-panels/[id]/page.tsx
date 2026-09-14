'use client'

import { EquipmentFormPage } from '@/components/admin/EquipmentFormPage'
import type { FieldDef, TranslationFieldDef } from '@/components/admin/EquipmentFormPage'
import { adminEquipmentService } from '@/services/admin-equipment.service'

const fields: FieldDef[] = [
  { name: 'imageUrl', label: 'Image', type: 'image', section: 'General' },
  { name: 'seriesId', label: 'Series ID', type: 'text', section: 'General' },
  { name: 'modelNumber', label: 'Model Number', type: 'text', required: true, section: 'General' },
  { name: 'sku', label: 'SKU', type: 'text', section: 'General' },
  { name: 'pmaxStcW', label: 'Pmax STC (W)', type: 'number', required: true, section: 'STC Performance' },
  { name: 'vmpStcV', label: 'Vmp STC (V)', type: 'number', section: 'STC Performance' },
  { name: 'impStcA', label: 'Imp STC (A)', type: 'number', section: 'STC Performance' },
  { name: 'vocStcV', label: 'Voc STC (V)', type: 'number', section: 'STC Performance' },
  { name: 'iscStcA', label: 'Isc STC (A)', type: 'number', section: 'STC Performance' },
  { name: 'efficiencyStcPercent', label: 'Efficiency STC (%)', type: 'number', step: '0.01', section: 'STC Performance' },
  { name: 'pmaxNoctW', label: 'Pmax NOCT (W)', type: 'number', section: 'NOCT Performance' },
  { name: 'vmpNoctV', label: 'Vmp NOCT (V)', type: 'number', section: 'NOCT Performance' },
  { name: 'impNoctA', label: 'Imp NOCT (A)', type: 'number', section: 'NOCT Performance' },
  { name: 'vocNoctV', label: 'Voc NOCT (V)', type: 'number', section: 'NOCT Performance' },
  { name: 'iscNoctA', label: 'Isc NOCT (A)', type: 'number', section: 'NOCT Performance' },
  { name: 'tempCoeffPmaxPercent', label: 'Temp Coeff Pmax (%/K)', type: 'number', step: '0.001', section: 'Temperature Coefficients' },
  { name: 'tempCoeffVocPercent', label: 'Temp Coeff Voc (%/K)', type: 'number', step: '0.001', section: 'Temperature Coefficients' },
  { name: 'tempCoeffIscPercent', label: 'Temp Coeff Isc (%/K)', type: 'number', step: '0.001', section: 'Temperature Coefficients' },
  { name: 'powerTolerancePercent', label: 'Power Tolerance (%)', type: 'number', step: '0.1', section: 'Temperature Coefficients' },
  { name: 'isActive', label: 'Active', type: 'boolean', section: 'Availability' },
  { name: 'isStocked', label: 'Stocked', type: 'boolean', section: 'Availability' },
  { name: 'leadTimeDays', label: 'Lead Time (days)', type: 'number', section: 'Availability' },
  { name: 'minimumOrderQuantity', label: 'Min Order Qty', type: 'number', section: 'Availability' },
]

const translationFields: TranslationFieldDef[] = [
  { name: 'displayName', label: 'Display Name', type: 'text' },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'keyFeatures', label: 'Key Features', type: 'json' },
  { name: 'certifications', label: 'Certifications', type: 'text' },
]

export default function Page() {
  return (
    <EquipmentFormPage
      title="Solar Panel"
      backPath="/admin/equipment/solar-panels"
      queryKey="solar-panels"
      fields={fields}
      translationFields={translationFields}
      fetcher={adminEquipmentService.getSolarPanel.bind(adminEquipmentService)}
      creator={adminEquipmentService.createSolarPanel.bind(adminEquipmentService)}
      updater={adminEquipmentService.updateSolarPanel.bind(adminEquipmentService)}
      deleter={adminEquipmentService.deleteSolarPanel.bind(adminEquipmentService)}
    />
  )
}
