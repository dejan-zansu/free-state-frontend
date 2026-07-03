'use client'

import { useEffect, useState } from 'react'
import { Sun } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageLoader } from '@/components/ui/page-loader'
import { modelLabelKey } from '@/lib/model-label'
import { customerPortalService, type ProjectSummary } from '@/services/customer-portal.service'

const PILL_BASE = 'rounded-full text-sm font-medium px-3 py-1.5'

function statusPillClass(status: string): string {
  const color =
    status === 'contract_signed'
      ? 'bg-green-100 text-green-700'
      : status === 'offer_requested' || status === 'contract_pending'
        ? 'bg-amber-100 text-amber-700'
        : 'bg-blue-100 text-blue-700'
  return `${PILL_BASE} ${color}`
}

function formatKwp(value: number | null | undefined): string {
  return (value ?? 0).toLocaleString('de-CH', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })
}

function formatNumber(value: number | null | undefined): string {
  return Math.round(value ?? 0).toLocaleString('de-CH')
}

export default function ProjectPage() {
  const t = useTranslations('dashboard.project')
  const locale = useLocale()
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    customerPortalService
      .getProjects()
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const modelLabel = (model: string | null): string =>
    t(`models.${modelLabelKey(model)}`)

  if (loading) {
    return <PageLoader />
  }

  if (projects.length === 0) {
    return (
      <div className="max-w-5xl">
        <h1 className="text-2xl font-bold text-pine mb-8">{t('title')}</h1>
        <Card className="border-pine/10">
          <CardContent className="p-8 text-center">
            <Sun className="h-12 w-12 text-pine/20 mx-auto mb-4" />
            <p className="text-pine/60">{t('noProjects')}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-pine mb-8">{t('title')}</h1>

      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <Card key={project.id} className="border-pine/10">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-pine">{project.address}</p>
                  <p className="text-sm text-pine/60">
                    {modelLabel(project.solarModel)} {'·'}{' '}
                    {new Date(project.createdAt).toLocaleDateString('de-CH')}
                  </p>
                </div>
                <span className={statusPillClass(project.conversionStatus)}>
                  {t(`conversion.${project.conversionStatus}`)}
                </span>
              </div>
              <div className="flex gap-6 text-sm text-pine/80">
                <span>{formatKwp(project.system?.systemSizeKwp)} kWp</span>
                <span>CHF {formatNumber(project.system?.annualSavings)}</span>
              </div>
              <div className="flex gap-2">
                <Button asChild size="sm" className="bg-pine hover:bg-pine/90 text-white">
                  <Link href={`/${locale}/dashboard/project/${project.id}`}>{t('viewDetails')}</Link>
                </Button>
                {project.contract && (
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="border-pine text-pine hover:bg-pine/5"
                  >
                    <Link href={`/${locale}/dashboard/contract?projectId=${project.id}`}>{t('viewContract')}</Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
