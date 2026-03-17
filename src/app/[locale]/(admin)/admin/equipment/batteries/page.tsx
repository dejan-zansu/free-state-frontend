'use client'

import { EquipmentListPage } from '@/components/admin/EquipmentListPage'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { adminEquipmentService } from '@/services/admin-equipment.service'

export default function AdminBatteriesPage() {
  return (
    <EquipmentListPage
      title="Batteries"
      fetcher={adminEquipmentService.listBatteries.bind(adminEquipmentService)}
      basePath="/admin/equipment/batteries"
      createPath="/admin/equipment/batteries/new"
      getKey={(item: any) => item.id}
      columns={[
        { header: 'Model Number', accessor: (item: any) => <span className="font-mono">{item.modelNumber}</span> },
        { header: 'Manufacturer', accessor: (item: any) => item.manufacturer?.code || '-' },
        { header: 'Capacity', accessor: (item: any) => item.capacityKwh ? `${item.capacityKwh}kWh` : '-' },
        { header: 'Chemistry', accessor: (item: any) => item.chemistry || '-' },
        { header: 'Warranty', accessor: (item: any) => item.warrantyYears ? `${item.warrantyYears}yr` : '-' },
        { header: 'Status', accessor: (item: any) => <StatusBadge status={item.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
      ]}
    />
  )
}
