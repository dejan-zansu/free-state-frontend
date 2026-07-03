'use client'

import { useEffect, useState } from 'react'
import { Sun } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageLoader } from '@/components/ui/page-loader'
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

  const modelLabel = (model: string | null): string => {
    if (model === 'solar-free') return t('models.solarFree')
    if (model === 'solar-direct') return t('models.solarDirect')
    if (model === 'solar-abo') return t('models.solarAbo')
    return t('models.unknown')
  }

  if (loading) {
    return <PageLoader />
  }

  if (projects.length === 0) {
    return (
      <div className="max-w-5xl">
        <h1 className="text-2xl font-bold text-[#062E25] mb-8">{t('title')}</h1>
        <Card className="border-[#062E25]/10">
          <CardContent className="p-8 text-center">
            <Sun className="h-12 w-12 text-[#062E25]/20 mx-auto mb-4" />
            <p className="text-[#062E25]/60">{t('noProjects')}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-[#062E25] mb-8">{t('title')}</h1>

      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <Card key={project.id} className="border-[#062E25]/10">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-[#062E25]">{project.address}</p>
                  <p className="text-sm text-[#062E25]/60">
                    {modelLabel(project.solarModel)} {'·'}{' '}
                    {new Date(project.createdAt).toLocaleDateString('de-CH')}
                  </p>
                </div>
                <span className={statusPillClass(project.conversionStatus)}>
                  {t(`conversion.${project.conversionStatus}`)}
                </span>
              </div>
              <div className="flex gap-6 text-sm text-[#062E25]/80">
                <span>{formatKwp(project.system?.systemSizeKwp)} kWp</span>
                <span>CHF {formatNumber(project.system?.annualSavings)}</span>
              </div>
              <div className="flex gap-2">
                <Button asChild size="sm" className="bg-[#062E25] hover:bg-[#062E25]/90 text-white">
                  <Link href={`/${locale}/dashboard/project/${project.id}`}>{t('viewDetails')}</Link>
                </Button>
                {project.contract && (
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    style={{ borderColor: '#062E25', color: '#062E25' }}
                  >
                    <Link href={`/${locale}/dashboard/contract`}>{t('viewContract')}</Link>
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
