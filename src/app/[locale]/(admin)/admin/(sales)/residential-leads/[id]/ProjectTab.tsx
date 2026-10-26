'use client'

import { FolderOpen } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { StatusBadge } from '@/components/admin/StatusBadge'
import { Card, CardContent } from '@/components/ui/card'
import { formatDate, formatDateTime } from '@/lib/sales-lead'
import { cn } from '@/lib/utils'
import type { SalesLeadDetail } from '@/types/sales-lead'

import { ContractsPanel } from './ContractsPanel'
import { CARD_CLASS } from './leadUtils'
import { MilestonesPanel } from './MilestonesPanel'
import { EmptyPanel, Field } from './parts'

export function ProjectTab({ lead }: { lead: SalesLeadDetail }) {
  const t = useTranslations('admin.salesLeads.detail')
  const project = lead.project

  if (!project) {
    return (
      <EmptyPanel icon={<FolderOpen className="size-8" />}>
        {t('project.empty')}
      </EmptyPanel>
    )
  }

  const inspection = lead.inspection

  return (
    <div>
      <Card className={cn(CARD_CLASS, 'mb-6')}>
        <CardContent className="p-4 sm:p-6">
          <h2 className="mb-4 text-lg font-semibold text-[#062E25]">
            {t('project.summaryTitle')}
          </h2>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label={t('project.status')}>
              <StatusBadge
                status={project.status}
                className="px-3 text-sm sm:text-base"
              />
            </Field>
            <Field label={t('project.created')}>
              {formatDate(project.createdAt)}
            </Field>
          </dl>
        </CardContent>
      </Card>

      <MilestonesPanel leadId={lead.id} milestones={lead.milestones ?? []} />

      {inspection && (
        <Card className={cn(CARD_CLASS, 'mb-6')}>
          <CardContent className="p-4 sm:p-6">
            <h2 className="mb-4 text-lg font-semibold text-[#062E25]">
              {t('project.inspection.title')}
            </h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label={t('project.inspection.status')}>
                <StatusBadge
                  status={inspection.status}
                  className="px-3 text-sm sm:text-base"
                />
              </Field>
              <Field label={t('project.inspection.scheduled')}>
                {formatDateTime(inspection.scheduledAt)}
              </Field>
              <Field label={t('project.inspection.completed')}>
                {inspection.completedAt
                  ? formatDateTime(inspection.completedAt)
                  : '-'}
              </Field>
            </dl>
          </CardContent>
        </Card>
      )}

      <ContractsPanel contracts={project.contracts ?? []} />
    </div>
  )
}
