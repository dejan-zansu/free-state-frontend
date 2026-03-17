'use client'

import { EquipmentListPage } from '@/components/admin/EquipmentListPage'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { adminEquipmentService } from '@/services/admin-equipment.service'

export default function AdminEmsPage() {
  return (
    <EquipmentListPage
      title="Energy Management Systems"
      fetcher={adminEquipmentService.listEms.bind(adminEquipmentService)}
      basePath="/admin/equipment/ems"
      createPath="/admin/equipment/ems/new"
      getKey={(item: any) => item.id}
      columns={[
        { header: 'Model Number', accessor: (item: any) => <span className="font-mono">{item.modelNumber}</span> },
        { header: 'Manufacturer', accessor: (item: any) => item.manufacturer?.code || '-' },
        { header: 'Type', accessor: (item: any) => item.type || '-' },
        { header: 'Power', accessor: (item: any) => item.powerConsumptionW ? `${item.powerConsumptionW}W` : '-' },
        { header: 'Status', accessor: (item: any) => <StatusBadge status={item.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
      ]}
    />
  )
}
