'use client'

import { useTranslations } from 'next-intl'

import { EquipmentListPage } from '@/components/admin/EquipmentListPage'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { adminEquipmentService } from '@/services/admin-equipment.service'

export default function AdminPackagesPage() {
  const t = useTranslations('admin.equipment')

  return (
    <EquipmentListPage
      title={t('titles.packages')}
      queryKey="packages"
      fetcher={adminEquipmentService.listPackages.bind(adminEquipmentService)}
      basePath="/admin/equipment/packages"
      createPath="/admin/equipment/packages/new"
      getKey={(item: any) => item.id}
      columns={[
        { header: t('columns.code'), accessor: (item: any) => <span className="font-mono">{item.code}</span> },
        { header: t('columns.name'), accessor: (item: any) => item.translations?.[0]?.name || item.code },
        { header: t('columns.pricePerKwp'), accessor: (item: any) => item.pricePerKwp ? `${item.currency || 'CHF'} ${Number(item.pricePerKwp).toLocaleString('de-CH')}` : '-' },
        { header: t('columns.items'), accessor: (item: any) => item._count?.items ?? 0 },
        { header: t('columns.minKwp'), accessor: (item: any) => item.minCapacityKwp ?? '-' },
        { header: t('columns.maxKwp'), accessor: (item: any) => item.maxCapacityKwp ?? '-' },
        { header: t('columns.status'), accessor: (item: any) => <StatusBadge status={item.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
      ]}
    />
  )
}
