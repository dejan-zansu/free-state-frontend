'use client'

import { EquipmentListPage } from '@/components/admin/EquipmentListPage'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { adminEquipmentService } from '@/services/admin-equipment.service'

export default function AdminInvertersPage() {
  return (
    <EquipmentListPage
      title="Inverters"
      fetcher={adminEquipmentService.listInverters.bind(adminEquipmentService)}
      basePath="/admin/equipment/inverters"
      createPath="/admin/equipment/inverters/new"
      getKey={(item: any) => item.id}
      columns={[
        { header: 'Model Number', accessor: (item: any) => <span className="font-mono">{item.modelNumber}</span> },
        { header: 'Manufacturer', accessor: (item: any) => item.manufacturer?.code || '-' },
        { header: 'Type', accessor: (item: any) => item.type || '-' },
        { header: 'Power', accessor: (item: any) => item.ratedPowerKw ? `${item.ratedPowerKw}kW` : '-' },
        { header: 'MPPT Count', accessor: (item: any) => item.mpptCount ?? '-' },
        { header: 'Status', accessor: (item: any) => <StatusBadge status={item.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
      ]}
    />
  )
}
