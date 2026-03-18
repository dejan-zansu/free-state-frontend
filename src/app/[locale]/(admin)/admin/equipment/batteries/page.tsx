'use client'

import { useTranslations } from 'next-intl'

import { EquipmentListPage } from '@/components/admin/EquipmentListPage'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { adminEquipmentService } from '@/services/admin-equipment.service'

export default function AdminBatteriesPage() {
  const t = useTranslations('admin.equipment')

  return (
    <EquipmentListPage
      title={t('titles.batteries')}
      queryKey="batteries"
      fetcher={adminEquipmentService.listBatteries.bind(adminEquipmentService)}
      basePath="/admin/equipment/batteries"
      createPath="/admin/equipment/batteries/new"
      getKey={(item: any) => item.id}
      columns={[
        { header: t('columns.modelNumber'), accessor: (item: any) => <span className="font-mono">{item.modelNumber}</span> },
        { header: t('columns.manufacturer'), accessor: (item: any) => item.manufacturer?.code || '-' },
        { header: t('columns.capacity'), accessor: (item: any) => item.capacityKwh ? `${item.capacityKwh}kWh` : '-' },
        { header: t('columns.chemistry'), accessor: (item: any) => item.chemistry || '-' },
        { header: t('columns.warranty'), accessor: (item: any) => item.warrantyYears ? `${item.warrantyYears}yr` : '-' },
        { header: t('columns.status'), accessor: (item: any) => <StatusBadge status={item.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
      ]}
    />
  )
}
