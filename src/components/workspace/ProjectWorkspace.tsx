'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { Download, Loader2 } from 'lucide-react'
import { customerPortalService, type WorkspacePayload } from '@/services/customer-portal.service'
import { PageLoader } from '@/components/ui/page-loader'
import { WorkspaceHero } from '@/components/workspace/WorkspaceHero'
import { WorkspaceMoney } from '@/components/workspace/WorkspaceMoney'
import { WorkspaceFacts } from '@/components/workspace/WorkspaceFacts'
import { WorkspaceNextStep } from '@/components/workspace/WorkspaceNextStep'
import { WorkspaceDisclosure } from '@/components/workspace/WorkspaceDisclosure'
import { NumbersSection } from '@/components/workspace/NumbersSection'
import { ConfigurationPanel } from '@/components/workspace/ConfigurationPanel'
import { WorkspaceCharts } from '@/components/workspace/WorkspaceCharts'
import { EquipmentSection } from '@/components/workspace/EquipmentSection'
import { WorkspaceSignSection } from '@/components/workspace/WorkspaceSignSection'
import { StageTimeline } from '@/components/dashboard/StageTimeline'
import { trackFunnelEvent } from '@/lib/analytics/funnel-events'

export function ProjectWorkspace({ projectId }: { projectId: string }) {
  const t = useTranslations('dashboard.workspace')
  const locale = useLocale()
  const [data, setData] = useState<WorkspacePayload | null>(null)
  const [failed, setFailed] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const loadedRef = useRef(false)
  const resultsEventRef = useRef<string | null>(null)

  const load = useCallback(async () => {
    try {
      const payload = await customerPortalService.getProjectWorkspace(projectId)
      loadedRef.current = true
      setData(payload)
    } catch {
      if (!loadedRef.current) setFailed(true)
    }
  }, [projectId])

  useEffect(() => {
    loadedRef.current = false
    setFailed(false)
    setData(null)
  }, [projectId])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!data) return
    if (resultsEventRef.current === projectId) return
    const kwp = data.calculation?.systemSizeKwp ?? 0
    const production = data.calculation?.annualProductionKwh ?? 0
    if (kwp <= 0 || production <= 0) return
    resultsEventRef.current = projectId
    const consumption = data.calculation?.annualConsumptionKwh ?? 0
    const rate = data.calculation?.selfConsumptionRate ?? 0
    const tariff = data.rates?.electricityChfPerKwh ?? 0
    const selfConsumedKwh = Math.min(production * rate, consumption)
    trackFunnelEvent('results_viewed', {
      meta: {
        projectId,
        kWp: kwp,
        annualProductionKwh: production,
        subsidyChf: data.rates?.subsidy?.estimatedAmountChf ?? null,
        selfConsumptionValueChf: Math.round(selfConsumedKwh * tariff),
        model: data.financials?.solarModel ?? null,
        conversionStatus: data.conversionStatus ?? null,
      },
    })
  }, [data, projectId])

  const handleDownload = useCallback(async () => {
    if (!data) return
    setDownloading(true)
    try {
      await customerPortalService.downloadProjectReport(data.project.id)
    } catch {
    } finally {
      setDownloading(false)
    }
  }, [data])

  if (failed) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center space-y-4">
        <p className="text-base text-pine">{t('notFound')}</p>
        <Link
          href={`/${locale}/dashboard/project`}
          className="text-base font-medium text-pine underline"
        >
          {t('backToProjects')}
        </Link>
      </div>
    )
  }
  if (!data) return <PageLoader />

  const showTimeline = data.conversionStatus !== 'calculation_complete'

  return (
    <div className="bg-[linear-gradient(180deg,rgba(242,244,232,1)_45%,rgba(220,233,230,1)_84%)]">
      <div className="mx-auto max-w-5xl px-4 pb-24 pt-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-base font-medium text-pine/75">
            {t('hero.eyebrow')}
          </h1>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2 text-base text-pine/75 underline underline-offset-4 hover:text-pine disabled:opacity-60"
          >
            {downloading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Download className="h-4 w-4" aria-hidden />
            )}
            {downloading
              ? t('hero.header.downloadPending')
              : t('hero.header.download')}
          </button>
        </div>

        <WorkspaceHero data={data} />

        <WorkspaceMoney data={data} onRefresh={load} />

        <WorkspaceFacts data={data} />

        <WorkspaceNextStep data={data} onRefresh={load} />

        <div className="space-y-3">
          <WorkspaceDisclosure
            title={t('sections.numbers')}
            helper={t('sections.numbersHelper')}
            toggleLabel={t('sections.toggleAria', { title: t('sections.numbers') })}
          >
            <NumbersSection data={data} />
          </WorkspaceDisclosure>

          <WorkspaceDisclosure
            title={t('sections.energy')}
            helper={t('sections.energyHelper')}
            toggleLabel={t('sections.toggleAria', { title: t('sections.energy') })}
          >
            <WorkspaceCharts data={data} onRefresh={load} />
          </WorkspaceDisclosure>

          <WorkspaceDisclosure
            title={t('sections.equipment')}
            toggleLabel={t('sections.toggleAria', { title: t('sections.equipment') })}
          >
            <EquipmentSection data={data} />
          </WorkspaceDisclosure>

          <WorkspaceDisclosure
            title={t('sections.config')}
            toggleLabel={t('sections.toggleAria', { title: t('sections.config') })}
          >
            <ConfigurationPanel data={data} onRefresh={load} isOpen />
          </WorkspaceDisclosure>
        </div>

        {showTimeline && <StageTimeline milestones={data.milestones} />}

        {data.contract != null && (
          <WorkspaceSignSection data={data} onRefresh={load} />
        )}
      </div>
    </div>
  )
}
