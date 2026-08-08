'use client'

import { Clock } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { PageLoader } from '@/components/ui/page-loader'
import {
  customerPortalService,
  type DashboardData,
} from '@/services/customer-portal.service'
import { DataRequestActionRequiredCard } from '@/components/dashboard/DataRequestActionRequiredCard'
import SolarStatGrid from '@/components/dashboard/SolarStatGrid'
import { StageTimeline } from '@/components/dashboard/StageTimeline'
import { WorkspaceDisclosure } from '@/components/workspace/WorkspaceDisclosure'

const PRIMARY_ACTION =
  'inline-flex min-h-11 items-center justify-center rounded-full bg-pine px-6 py-2.5 text-base font-medium text-white transition-colors hover:bg-pine/90'

const ACTIVITY_KEYS: Record<string, string> = {
  account_created: 'activityAccountCreated',
  calculation_completed: 'activityCalculationCompleted',
  offer_requested: 'activityOfferRequested',
  contract_created: 'activityContractCreated',
  contract_signed: 'activityContractSigned',
}

export default function DashboardPage() {
  const t = useTranslations('dashboard.overview')
  const tProject = useTranslations('dashboard.project')
  const tSections = useTranslations('dashboard.workspace.sections')
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
        <p className="text-pine/60">{t('failedToLoad')}</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-pine mb-1">
        {t('welcome', { firstName: data.user.firstName })}
      </h1>
      <p className="text-pine/60 mb-8">{t('subtitle')}</p>

      <DataRequestActionRequiredCard />

      {data.stats && (
        <div className="mb-8">
          <SolarStatGrid
            systemSizeKwp={data.stats.systemSizeKwp}
            annualProductionKwh={data.stats.annualProductionKwh}
            annualSavings={data.stats.annualSavings}
            co2Savings={data.stats.co2Savings}
            labels={{
              systemSize: t('systemSize'),
              kwp: t('kwp'),
              annualProduction: t('annualProduction'),
              kwh: t('kwh'),
              annualSavings: t('annualSavings'),
              chf: t('chf'),
              co2Savings: t('co2Savings'),
              kgPerYear: t('kgPerYear'),
            }}
          />
        </div>
      )}

      <div className="mb-8">
        {data.project ? (
          <Link
            href={`/${locale}/dashboard/project/${data.project.id}`}
            className={PRIMARY_ACTION}
          >
            {tProject('card.open')}
          </Link>
        ) : (
          <Link href={`/${locale}/calculator`} className={PRIMARY_ACTION}>
            {t('startCalculator')}
          </Link>
        )}
      </div>

      <div className="mb-8">
        <StageTimeline milestones={data.milestones ?? []} />
      </div>

      {data.activity.length > 0 && (
        <WorkspaceDisclosure
          title={t('activity')}
          toggleLabel={tSections('toggleAria', { title: t('activity') })}
        >
          <div className="space-y-4">
            {data.activity.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-pine/30 shrink-0" />
                <div className="flex-1">
                  <p className="text-base font-medium text-pine">
                    {ACTIVITY_KEYS[item.type] ? t(ACTIVITY_KEYS[item.type]) : item.type}
                  </p>
                  <p className="text-base text-pine/60">
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
        </WorkspaceDisclosure>
      )}
    </div>
  )
}
