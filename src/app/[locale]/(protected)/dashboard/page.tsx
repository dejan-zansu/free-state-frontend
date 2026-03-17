'use client'

import { useEffect, useState } from 'react'
import { Zap, TrendingUp, Leaf, PanelTop, ArrowRight, Clock } from 'lucide-react'
import Link from 'next/link'
import { useLocale } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { customerPortalService, type DashboardData } from '@/services/customer-portal.service'

const STATUS_CONFIG: Record<string, { label: string; color: string; description: string }> = {
  no_project: {
    label: 'Get Started',
    color: 'bg-gray-100 text-gray-700',
    description: 'Use our solar calculator to explore your options.',
  },
  calculation_complete: {
    label: 'Calculation Complete',
    color: 'bg-blue-100 text-blue-700',
    description: 'Your solar analysis is ready. Request an offer or sign a contract.',
  },
  offer_requested: {
    label: 'Offer Requested',
    color: 'bg-amber-100 text-amber-700',
    description: 'Our team is reviewing your property. We will contact you for a site visit.',
  },
  contract_pending: {
    label: 'Contract Pending',
    color: 'bg-orange-100 text-orange-700',
    description: 'Your contract is ready for signature.',
  },
  contract_signed: {
    label: 'Contract Signed',
    color: 'bg-green-100 text-green-700',
    description: 'Your contract is signed. Installation planning will begin soon.',
  },
}

const ACTIVITY_LABELS: Record<string, string> = {
  account_created: 'Account created',
  calculation_completed: 'Solar calculation completed',
  offer_requested: 'Offer requested',
  contract_created: 'Contract generated',
  contract_signed: 'Contract signed',
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const locale = useLocale()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    customerPortalService
      .getDashboard()
      .then(setData)
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

  if (!data) {
    return (
      <div className="text-center py-16">
        <p className="text-[#062E25]/60">Failed to load dashboard data.</p>
      </div>
    )
  }

  const statusConfig = STATUS_CONFIG[data.status] || STATUS_CONFIG.no_project

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-[#062E25] mb-1">
        Welcome back, {data.user.firstName}
      </h1>
      <p className="text-[#062E25]/60 mb-8">Here is an overview of your solar project.</p>

      <Card className="mb-8 border-[#062E25]/10">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
              <p className="text-sm text-[#062E25]/60">{statusConfig.description}</p>
            </div>
            {data.status === 'no_project' && (
              <Button asChild className="bg-[#062E25] hover:bg-[#062E25]/90 text-white">
                <Link href={`/${locale}/calculator`}>
                  Start Calculator <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
            {data.status === 'contract_pending' && data.contract && (
              <Button asChild className="bg-[#062E25] hover:bg-[#062E25]/90 text-white">
                <Link href={`/${locale}/dashboard/contract`}>
                  View Contract <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {data.stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-[#062E25]/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <PanelTop className="h-5 w-5 text-[#062E25]/40" />
                <span className="text-sm text-[#062E25]/60">System Size</span>
              </div>
              <p className="text-2xl font-bold text-[#062E25]">
                {data.stats.systemSizeKwp.toFixed(1)} <span className="text-sm font-normal">kWp</span>
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#062E25]/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span className="text-sm text-[#062E25]/60">Annual Production</span>
              </div>
              <p className="text-2xl font-bold text-[#062E25]">
                {Math.round(data.stats.annualProductionKwh).toLocaleString('de-CH')} <span className="text-sm font-normal">kWh</span>
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#062E25]/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="text-sm text-[#062E25]/60">Annual Savings</span>
              </div>
              <p className="text-2xl font-bold text-[#062E25]">
                CHF {Math.round(data.stats.annualSavings).toLocaleString('de-CH')}
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#062E25]/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <Leaf className="h-5 w-5 text-emerald-500" />
                <span className="text-sm text-[#062E25]/60">CO₂ Savings</span>
              </div>
              <p className="text-2xl font-bold text-[#062E25]">
                {Math.round(data.stats.co2Savings).toLocaleString('de-CH')} <span className="text-sm font-normal">kg/yr</span>
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {data.project && (
        <Card className="mb-8 border-[#062E25]/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#062E25]">Your Project</h2>
              <Button variant="outline" size="sm" asChild style={{ borderColor: '#062E25', color: '#062E25' }}>
                <Link href={`/${locale}/dashboard/project`}>View Details</Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#062E25]/60">Address</p>
                <p className="font-medium text-[#062E25]">{data.project.address}</p>
              </div>
              <div>
                <p className="text-[#062E25]/60">Package</p>
                <p className="font-medium text-[#062E25]">{data.project.package}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {data.activity.length > 0 && (
        <Card className="border-[#062E25]/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">Activity</h2>
            <div className="space-y-4">
              {data.activity.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-[#062E25]/30 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#062E25]">
                      {ACTIVITY_LABELS[item.type] || item.type}
                    </p>
                    <p className="text-xs text-[#062E25]/40">
                      {new Date(item.date).toLocaleDateString('de-CH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
