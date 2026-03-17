'use client'

import { EquipmentListPage } from '@/components/admin/EquipmentListPage'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { adminEquipmentService } from '@/services/admin-equipment.service'

export default function AdminPackagesPage() {
  return (
    <EquipmentListPage
      title="Packages"
      fetcher={adminEquipmentService.listPackages.bind(adminEquipmentService)}
      basePath="/admin/equipment/packages"
      createPath="/admin/equipment/packages/new"
      getKey={(item: any) => item.id}
      columns={[
        { header: 'Code', accessor: (item: any) => <span className="font-mono">{item.code}</span> },
        { header: 'Name', accessor: (item: any) => item.translations?.[0]?.name || item.code },
        { header: 'Min kWp', accessor: (item: any) => item.minKwp ?? '-' },
        { header: 'Max kWp', accessor: (item: any) => item.maxKwp ?? '-' },
        { header: 'Contract Years', accessor: (item: any) => item.contractYears ?? '-' },
        { header: 'Status', accessor: (item: any) => <StatusBadge status={item.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
      ]}
    />
  )
}
