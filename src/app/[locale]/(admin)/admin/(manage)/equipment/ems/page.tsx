'use client'

import { useTranslations } from 'next-intl'

import { EquipmentListPage } from '@/components/admin/EquipmentListPage'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { adminEquipmentService } from '@/services/admin-equipment.service'

export default function AdminEmsPage() {
  const t = useTranslations('admin.equipment')

  return (
    <EquipmentListPage
      title={t('titles.ems')}
      queryKey="ems"
      fetcher={adminEquipmentService.listEms.bind(adminEquipmentService)}
      basePath="/admin/equipment/ems"
      createPath="/admin/equipment/ems/new"
      getKey={(item: any) => item.id}
      columns={[
        { header: t('columns.modelNumber'), accessor: (item: any) => <span className="font-mono">{item.modelNumber}</span> },
        { header: t('columns.manufacturer'), accessor: (item: any) => item.manufacturer?.code || '-' },
        { header: t('columns.type'), accessor: (item: any) => item.type || '-' },
        { header: t('columns.power'), accessor: (item: any) => item.powerConsumptionW ? `${item.powerConsumptionW}W` : '-' },
        { header: t('columns.status'), accessor: (item: any) => <StatusBadge status={item.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
      ]}
    />
  )
}
