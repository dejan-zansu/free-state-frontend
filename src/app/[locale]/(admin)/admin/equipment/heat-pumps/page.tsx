'use client'

import { EquipmentListPage } from '@/components/admin/EquipmentListPage'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { adminEquipmentService } from '@/services/admin-equipment.service'

export default function AdminHeatPumpsPage() {
  return (
    <EquipmentListPage
      title="Heat Pumps"
      fetcher={adminEquipmentService.listHeatPumps.bind(adminEquipmentService)}
      basePath="/admin/equipment/heat-pumps"
      createPath="/admin/equipment/heat-pumps/new"
      getKey={(item: any) => item.id}
      columns={[
        { header: 'Model Number', accessor: (item: any) => <span className="font-mono">{item.modelNumber}</span> },
        { header: 'Manufacturer', accessor: (item: any) => item.manufacturer?.code || '-' },
        { header: 'Type', accessor: (item: any) => item.type || '-' },
        { header: 'Heating', accessor: (item: any) => item.heatingCapacityKw ? `${item.heatingCapacityKw}kW` : '-' },
        { header: 'COP', accessor: (item: any) => item.copRating ?? '-' },
        { header: 'Status', accessor: (item: any) => <StatusBadge status={item.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
      ]}
    />
  )
}
