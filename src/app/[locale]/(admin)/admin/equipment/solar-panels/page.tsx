'use client'

import { EquipmentListPage } from '@/components/admin/EquipmentListPage'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { adminEquipmentService } from '@/services/admin-equipment.service'

export default function AdminSolarPanelsPage() {
  return (
    <EquipmentListPage
      title="Solar Panels"
      fetcher={adminEquipmentService.listSolarPanels.bind(adminEquipmentService)}
      basePath="/admin/equipment/solar-panels"
      createPath="/admin/equipment/solar-panels/new"
      getKey={(item: any) => item.id}
      columns={[
        { header: 'Model Number', accessor: (item: any) => <span className="font-mono">{item.modelNumber}</span> },
        { header: 'Series', accessor: (item: any) => item.series?.code || '-' },
        { header: 'Manufacturer', accessor: (item: any) => item.series?.manufacturer?.code || '-' },
        { header: 'Power', accessor: (item: any) => item.pmaxStcW ? `${item.pmaxStcW}Wp` : '-' },
        { header: 'Efficiency', accessor: (item: any) => item.efficiencyStcPercent ? `${item.efficiencyStcPercent}%` : '-' },
        { header: 'Status', accessor: (item: any) => <StatusBadge status={item.isActive ? 'ACTIVE' : 'INACTIVE'} /> },
      ]}
    />
  )
}
