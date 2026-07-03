'use client'

import { useTranslations } from 'next-intl'
import { EquipmentList } from '@/components/results/EquipmentList'
import { type EquipmentDetail } from '@/components/results/EquipmentDetailCard'
import { WarrantyCallout } from '@/components/results/WarrantyCallout'
import { SectionHeader } from '@/components/ui/section-header'
import type { WorkspacePayload } from '@/services/customer-portal.service'
import type { CalculatorPackage } from '@/services/residential-calculator.service'

function getEquipmentCategory(equipmentType: string): EquipmentDetail['category'] | null {
  switch (equipmentType) {
    case 'SOLAR_PANEL':
      return 'PANEL'
    case 'INVERTER':
      return 'INVERTER'
    case 'BATTERY':
    case 'BATTERY_STORAGE':
      return 'BATTERY'
    case 'MOUNTING_SYSTEM':
      return 'MOUNTING'
    case 'EMS':
      return 'EMS'
    case 'HEAT_PUMP':
      return 'HEAT_PUMP'
    default:
      return null
  }
}

function mapPackageEquipment(pkg: CalculatorPackage | null): EquipmentDetail[] {
  if (!pkg) return []
  return pkg.equipment
    .map(item => {
      const category = getEquipmentCategory(item.equipmentType)
      if (!category) return null
      const specs: Record<string, string | number> = {}
      if (item.panelWattageW) specs.peakPowerW = item.panelWattageW
      const detail: EquipmentDetail = {
        category,
        brand: '',
        model: item.name ?? item.equipmentType,
        imageUrl: item.imageUrl ?? null,
        quantity: item.quantity,
        specs,
      }
      return detail
    })
    .filter((d): d is EquipmentDetail => d !== null)
}

export function EquipmentSection({ data }: { data: WorkspacePayload }) {
  const t = useTranslations('dashboard.workspace')
  const model = data.calculation.solarModel

  if (model !== 'solar-direct' && model !== 'solar-abo') return null
  if (!data.package) return null

  const items = mapPackageEquipment(data.package)
  if (items.length === 0) return null

  return (
    <section className="space-y-6">
      <SectionHeader title={t('equipmentTitle')} />
      <EquipmentList items={items} />
      <WarrantyCallout installerYears={data.package.installerWarrantyYears ?? 2} productSummary={''} />
    </section>
  )
}
