'use client'

import {
  ArrowRight,
  Clock,
  Leaf,
  PanelTop,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageLoader } from '@/components/ui/page-loader'
import {
  customerPortalService,
  type DashboardData,
} from '@/services/customer-portal.service'
import { DataRequestActionRequiredCard } from '@/components/dashboard/DataRequestActionRequiredCard'

const STATUS_META: Record<string, { labelKey: string; descKey: string; color: string }> = {
  no_project: {
    labelKey: 'statusNoProjectLabel',
    descKey: 'statusNoProjectDesc',
    color: 'bg-gray-100 text-gray-700',
  },
  calculation_complete: {
    labelKey: 'statusCalcCompleteLabel',
    descKey: 'statusCalcCompleteDesc',
    color: 'bg-blue-100 text-blue-700',
  },
  offer_requested: {
    labelKey: 'statusOfferRequestedLabel',
    descKey: 'statusOfferRequestedDesc',
    color: 'bg-amber-100 text-amber-700',
  },
  contract_pending: {
    labelKey: 'statusContractPendingLabel',
    descKey: 'statusContractPendingDesc',
    color: 'bg-orange-100 text-orange-700',
  },
  contract_signed: {
    labelKey: 'statusContractSignedLabel',
    descKey: 'statusContractSignedDesc',
    color: 'bg-green-100 text-green-700',
  },
}

const ACTIVITY_KEYS: Record<string, string> = {
  account_created: 'activityAccountCreated',
  calculation_completed: 'activityCalculationCompleted',
  offer_requested: 'activityOfferRequested',
  contract_created: 'activityContractCreated',
  contract_signed: 'activityContractSigned',
}

export default function DashboardPage() {
  const t = useTranslations('dashboard.overview')
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
    return <PageLoader />
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <p className="text-[#062E25]/60">{t('failedToLoad')}</p>
      </div>
    )
  }

  const meta = STATUS_META[data.status] || STATUS_META.no_project

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-[#062E25] mb-1">
        {t('welcome', { firstName: data.user.firstName })}
      </h1>
      <p className="text-[#062E25]/60 mb-8">{t('subtitle')}</p>

      <DataRequestActionRequiredCard />

      <Card className="mb-8 border-[#062E25]/10">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <span
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${meta.color}`}
              >
                {t(meta.labelKey)}
              </span>
              <p className="text-sm text-[#062E25]/60">{t(meta.descKey)}</p>
            </div>
            {data.status === 'no_project' && (
              <Button
                asChild
                className="bg-[#062E25] hover:bg-[#062E25]/90 text-white"
              >
                <Link href={`/${locale}/calculator`}>
                  {t('startCalculator')} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
            {data.status === 'contract_pending' && data.contract && (
              <Button
                asChild
                className="bg-[#062E25] hover:bg-[#062E25]/90 text-white"
              >
                <Link href={`/${locale}/dashboard/contract`}>
                  {t('viewContract')} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {data.stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-[#062E25]/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <PanelTop className="h-5 w-5 text-[#062E25]/40" />
                <span className="text-sm text-[#062E25]/60">{t('systemSize')}</span>
              </div>
              <p className="text-2xl font-bold text-[#062E25]">
                {data.stats.systemSizeKwp.toFixed(1)}{' '}
                <span className="text-sm font-normal">{t('kwp')}</span>
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#062E25]/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                <span className="text-sm text-[#062E25]/60">
                  {t('annualProduction')}
                </span>
              </div>
              <p className="text-2xl font-bold text-[#062E25]">
                {Math.round(data.stats.annualProductionKwh).toLocaleString(
                  'de-CH'
                )}{' '}
                <span className="text-sm font-normal">{t('kwh')}</span>
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#062E25]/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="text-sm text-[#062E25]/60">
                  {t('annualSavings')}
                </span>
              </div>
              <p className="text-2xl font-bold text-[#062E25]">
                {t('chf')}{' '}
                {Math.round(data.stats.annualSavings).toLocaleString('de-CH')}
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#062E25]/10">
            <CardContent className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <Leaf className="h-5 w-5 text-emerald-500" />
                <span className="text-sm text-[#062E25]/60">{t('co2Savings')}</span>
              </div>
              <p className="text-2xl font-bold text-[#062E25]">
                {Math.round(data.stats.co2Savings).toLocaleString('de-CH')}{' '}
                <span className="text-sm font-normal">{t('kgPerYear')}</span>
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {data.project && (
        <Card className="mb-8 border-[#062E25]/10">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold text-[#062E25]">
                {t('yourProject')}
              </h2>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="self-start sm:self-auto"
                style={{ borderColor: '#062E25', color: '#062E25' }}
              >
                <Link href={`/${locale}/dashboard/project`}>{t('viewDetails')}</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#062E25]/60">{t('address')}</p>
                <p className="font-medium text-[#062E25]">
                  {data.project.address}
                </p>
              </div>
              <div>
                <p className="text-[#062E25]/60">{t('package')}</p>
                <p className="font-medium text-[#062E25]">
                  {data.project.package}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {data.activity.length > 0 && (
        <Card className="border-[#062E25]/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">
              {t('activity')}
            </h2>
            <div className="space-y-4">
              {data.activity.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-[#062E25]/30 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#062E25]">
                      {ACTIVITY_KEYS[item.type] ? t(ACTIVITY_KEYS[item.type]) : item.type}
                    </p>
                    <p className="text-sm text-[#062E25]/40">
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
