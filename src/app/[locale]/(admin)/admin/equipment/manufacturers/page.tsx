'use client'

import { useTranslations } from 'next-intl'

import { EquipmentListPage } from '@/components/admin/EquipmentListPage'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { adminEquipmentService } from '@/services/admin-equipment.service'

export default function AdminManufacturersPage() {
  const t = useTranslations('admin.equipment')

  return (
    <EquipmentListPage
      title={t('titles.manufacturers')}
      queryKey="manufacturers"
      fetcher={adminEquipmentService.listManufacturers.bind(adminEquipmentService)}
      basePath="/admin/equipment/manufacturers"
      createPath="/admin/equipment/manufacturers/new"
      getKey={(item: any) => item.id}
      columns={[
        { header: t('columns.code'), accessor: (item: any) => <span className="font-mono">{item.code}</span> },
        { header: t('columns.name'), accessor: (item: any) => item.translations?.[0]?.name || item.code },
        { header: t('columns.website'), accessor: (item: any) => item.website || '-' },
        { header: t('columns.status'), accessor: (item: any) => <StatusBadge status={item.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
        { header: t('columns.products'), accessor: (item: any) => {
          const c = item._count || {}
          return `${(c.solarPanelSeries || 0) + (c.inverters || 0) + (c.batteries || 0) + (c.mountingSystems || 0) + (c.energyManagementSystems || 0) + (c.heatPumps || 0)}`
        }},
      ]}
    />
  )
}
