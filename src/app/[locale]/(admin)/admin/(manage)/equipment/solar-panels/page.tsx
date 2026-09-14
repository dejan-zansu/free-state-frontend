'use client'

import { useTranslations } from 'next-intl'

import { EquipmentListPage } from '@/components/admin/EquipmentListPage'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { adminEquipmentService } from '@/services/admin-equipment.service'

export default function AdminSolarPanelsPage() {
  const t = useTranslations('admin.equipment')

  return (
    <EquipmentListPage
      title={t('titles.solarPanels')}
      queryKey="solar-panels"
      fetcher={adminEquipmentService.listSolarPanels.bind(adminEquipmentService)}
      basePath="/admin/equipment/solar-panels"
      createPath="/admin/equipment/solar-panels/new"
      getKey={(item: any) => item.id}
      columns={[
        { header: t('columns.modelNumber'), accessor: (item: any) => <span className="font-mono">{item.modelNumber}</span> },
        { header: t('columns.series'), accessor: (item: any) => item.series?.code || '-' },
        { header: t('columns.manufacturer'), accessor: (item: any) => item.series?.manufacturer?.code || '-' },
        { header: t('columns.power'), accessor: (item: any) => item.pmaxStcW ? `${item.pmaxStcW}Wp` : '-' },
        { header: t('columns.efficiency'), accessor: (item: any) => item.efficiencyStcPercent ? `${item.efficiencyStcPercent}%` : '-' },
        { header: t('columns.status'), accessor: (item: any) => <StatusBadge status={item.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
      ]}
    />
  )
}
