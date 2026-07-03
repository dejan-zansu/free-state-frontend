'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { customerPortalService, type WorkspacePayload } from '@/services/customer-portal.service'
import { PageLoader } from '@/components/ui/page-loader'
import { WorkspaceHero } from '@/components/workspace/WorkspaceHero'
import { ConfigurationPanel } from '@/components/workspace/ConfigurationPanel'
import { WorkspaceCharts } from '@/components/workspace/WorkspaceCharts'
import { FinancialSection } from '@/components/workspace/FinancialSection'
import { EquipmentSection } from '@/components/workspace/EquipmentSection'
import { WorkspaceActions } from '@/components/workspace/WorkspaceActions'
import { WorkspaceSignSection } from '@/components/workspace/WorkspaceSignSection'
import { StageTimeline } from '@/components/dashboard/StageTimeline'

export function ProjectWorkspace({ projectId }: { projectId: string }) {
  const t = useTranslations('dashboard.workspace')
  const locale = useLocale()
  const [data, setData] = useState<WorkspacePayload | null>(null)
  const [failed, setFailed] = useState(false)
  const loadedRef = useRef(false)

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

  if (failed) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center space-y-4">
        <p className="text-base text-pine/70">{t('notFound')}</p>
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

  return (
    <div className="bg-[linear-gradient(180deg,rgba(242,244,232,1)_45%,rgba(220,233,230,1)_84%)]">
      <div className="mx-auto max-w-5xl px-4 pb-24 pt-6 space-y-12">
        <WorkspaceHero data={data} />
        <ConfigurationPanel data={data} onRefresh={load} />
        <WorkspaceCharts data={data} />
        <FinancialSection data={data} />
        <EquipmentSection data={data} />
        <StageTimeline milestones={data.milestones} />
        <WorkspaceSignSection data={data} onRefresh={load} />
        <WorkspaceActions data={data} onRefresh={load} />
      </div>
    </div>
  )
}
