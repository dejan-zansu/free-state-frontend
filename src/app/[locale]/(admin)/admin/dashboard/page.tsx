'use client'

import { useEffect, useState } from 'react'
import { BarChart3, FileText, TrendingUp, Users } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { adminService } from '@/services/admin.service'
import type { DashboardStats } from '@/types/admin'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminService
      .getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#062E25]" />
      </div>
    )
  }

  if (!stats) {
    return <p className="text-[#062E25]/60">Failed to load dashboard stats.</p>
  }

  const cards = [
    {
      label: 'Total Users',
      value: stats.users.total,
      icon: Users,
      detail: `${stats.users.byRole.CUSTOMER || 0} customers, ${stats.users.byRole.SALES_REP || 0} reps`,
    },
    {
      label: 'Active Leads',
      value: stats.leads.total,
      icon: BarChart3,
      detail: `${stats.leads.byStatus.NEW || 0} new, ${stats.leads.byStatus.QUALIFIED || 0} qualified`,
    },
    {
      label: 'Contracts',
      value: stats.contracts.total,
      icon: FileText,
      detail: `${stats.contracts.byStatus.SIGNED || 0} signed, ${stats.contracts.byStatus.PENDING_SIGNATURE || 0} pending`,
    },
    {
      label: 'Revenue (Signed)',
      value: `CHF ${Math.round(stats.revenue.totalSigned).toLocaleString('de-CH')}`,
      icon: TrendingUp,
      detail: 'Total net amount from signed contracts',
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#062E25] mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <Card key={card.label} className="border-[#062E25]/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <card.icon className="h-5 w-5 text-[#062E25]/40" />
                <span className="text-sm text-[#062E25]/60">{card.label}</span>
              </div>
              <p className="text-2xl font-bold text-[#062E25] mb-1">{card.value}</p>
              <p className="text-xs text-[#062E25]/40">{card.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-[#062E25]/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">Leads by Status</h2>
            <div className="space-y-3">
              {Object.entries(stats.leads.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm text-[#062E25]/60">{status.replace(/_/g, ' ')}</span>
                  <span className="text-sm font-medium text-[#062E25]">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#062E25]/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">Contracts by Status</h2>
            <div className="space-y-3">
              {Object.entries(stats.contracts.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm text-[#062E25]/60">{status.replace(/_/g, ' ')}</span>
                  <span className="text-sm font-medium text-[#062E25]">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
