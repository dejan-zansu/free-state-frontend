'use client'

import { useTranslations } from 'next-intl'

import { EquipmentListPage } from '@/components/admin/EquipmentListPage'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { adminEquipmentService } from '@/services/admin-equipment.service'

export default function AdminHeatPumpsPage() {
  const t = useTranslations('admin.equipment')

  return (
    <EquipmentListPage
      title={t('titles.heatPumps')}
      queryKey="heat-pumps"
      fetcher={adminEquipmentService.listHeatPumps.bind(adminEquipmentService)}
      basePath="/admin/equipment/heat-pumps"
      createPath="/admin/equipment/heat-pumps/new"
      getKey={(item: any) => item.id}
      columns={[
        { header: t('columns.modelNumber'), accessor: (item: any) => <span className="font-mono">{item.modelNumber}</span> },
        { header: t('columns.manufacturer'), accessor: (item: any) => item.manufacturer?.code || '-' },
        { header: t('columns.type'), accessor: (item: any) => item.type || '-' },
        { header: t('columns.heating'), accessor: (item: any) => item.heatingCapacityKw ? `${item.heatingCapacityKw}kW` : '-' },
        { header: t('columns.cop'), accessor: (item: any) => item.copRating ?? '-' },
        { header: t('columns.status'), accessor: (item: any) => <StatusBadge status={item.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
      ]}
    />
  )
}
