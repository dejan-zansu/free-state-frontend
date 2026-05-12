'use client'

import { useTranslations } from 'next-intl'

import { EquipmentListPage } from '@/components/admin/EquipmentListPage'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { adminEquipmentService } from '@/services/admin-equipment.service'

export default function AdminEvChargersPage() {
  const t = useTranslations('admin.equipment')

  return (
    <EquipmentListPage
      title={t('titles.evChargers')}
      queryKey="ev-chargers"
      fetcher={adminEquipmentService.listEvChargers.bind(adminEquipmentService)}
      basePath="/admin/equipment/ev-chargers"
      createPath="/admin/equipment/ev-chargers/new"
      getKey={(item: any) => item.id}
      columns={[
        { header: t('columns.modelNumber'), accessor: (item: any) => <span className="font-mono">{item.modelNumber}</span> },
        { header: t('columns.manufacturer'), accessor: (item: any) => item.manufacturer?.code || '-' },
        { header: t('columns.type'), accessor: (item: any) => item.type || '-' },
        { header: t('columns.power'), accessor: (item: any) => item.ratedPowerKw ? `${item.ratedPowerKw}kW` : '-' },
        { header: t('columns.priceChf'), accessor: (item: any) => item.priceChf != null ? `CHF ${Number(item.priceChf).toLocaleString('de-CH')}` : '-' },
        { header: t('columns.public'), accessor: (item: any) => <StatusBadge status={item.isPublic ? 'ACTIVE' : 'INACTIVE'} /> },
        { header: t('columns.status'), accessor: (item: any) => <StatusBadge status={item.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
      ]}
    />
  )
}
