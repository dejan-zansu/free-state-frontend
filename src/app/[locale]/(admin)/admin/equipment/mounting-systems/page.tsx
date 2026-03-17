'use client'

import { EquipmentListPage } from '@/components/admin/EquipmentListPage'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { adminEquipmentService } from '@/services/admin-equipment.service'

export default function AdminMountingSystemsPage() {
  return (
    <EquipmentListPage
      title="Mounting Systems"
      fetcher={adminEquipmentService.listMountingSystems.bind(adminEquipmentService)}
      basePath="/admin/equipment/mounting-systems"
      createPath="/admin/equipment/mounting-systems/new"
      getKey={(item: any) => item.id}
      columns={[
        { header: 'Model Number', accessor: (item: any) => <span className="font-mono">{item.modelNumber}</span> },
        { header: 'Manufacturer', accessor: (item: any) => item.manufacturer?.code || '-' },
        { header: 'Type', accessor: (item: any) => item.type || '-' },
        { header: 'Roof Type', accessor: (item: any) => item.roofType || '-' },
        { header: 'Status', accessor: (item: any) => <StatusBadge status={item.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
      ]}
    />
  )
}
