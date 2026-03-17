'use client'

import { EquipmentListPage } from '@/components/admin/EquipmentListPage'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { adminEquipmentService } from '@/services/admin-equipment.service'

export default function AdminManufacturersPage() {
  return (
    <EquipmentListPage
      title="Manufacturers"
      fetcher={adminEquipmentService.listManufacturers.bind(adminEquipmentService)}
      basePath="/admin/equipment/manufacturers"
      createPath="/admin/equipment/manufacturers/new"
      getKey={(item: any) => item.id}
      columns={[
        { header: 'Code', accessor: (item: any) => <span className="font-mono">{item.code}</span> },
        { header: 'Name', accessor: (item: any) => item.translations?.[0]?.name || item.code },
        { header: 'Website', accessor: (item: any) => item.website || '-' },
        { header: 'Status', accessor: (item: any) => <StatusBadge status={item.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
        { header: 'Products', accessor: (item: any) => {
          const c = item._count || {}
          return `${(c.solarPanelSeries || 0) + (c.inverters || 0) + (c.batteries || 0) + (c.mountingSystems || 0) + (c.energyManagementSystems || 0) + (c.heatPumps || 0)}`
        }},
      ]}
    />
  )
}
