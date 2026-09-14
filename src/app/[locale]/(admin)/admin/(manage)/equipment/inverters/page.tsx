'use client'

import { useTranslations } from 'next-intl'

import { EquipmentListPage } from '@/components/admin/EquipmentListPage'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { adminEquipmentService } from '@/services/admin-equipment.service'

export default function AdminInvertersPage() {
  const t = useTranslations('admin.equipment')

  return (
    <EquipmentListPage
      title={t('titles.inverters')}
      queryKey="inverters"
      fetcher={adminEquipmentService.listInverters.bind(adminEquipmentService)}
      basePath="/admin/equipment/inverters"
      createPath="/admin/equipment/inverters/new"
      getKey={(item: any) => item.id}
      columns={[
        { header: t('columns.modelNumber'), accessor: (item: any) => <span className="font-mono">{item.modelNumber}</span> },
        { header: t('columns.manufacturer'), accessor: (item: any) => item.manufacturer?.code || '-' },
        { header: t('columns.type'), accessor: (item: any) => item.type || '-' },
        { header: t('columns.power'), accessor: (item: any) => item.ratedPowerKw ? `${item.ratedPowerKw}kW` : '-' },
        { header: t('columns.mpptCount'), accessor: (item: any) => item.mpptCount ?? '-' },
        { header: t('columns.status'), accessor: (item: any) => <StatusBadge status={item.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
      ]}
    />
  )
}
