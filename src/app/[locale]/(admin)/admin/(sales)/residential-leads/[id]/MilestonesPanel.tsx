'use client'

import { useMutation } from '@tanstack/react-query'
import { Loader2, Pencil } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  followUpDateValue,
  followUpIsoFromDateValue,
  formatDate,
} from '@/lib/sales-lead'
import { salesLeadErrorKey } from '@/lib/sales-lead-errors'
import { cn } from '@/lib/utils'
import { salesLeadService } from '@/services/sales-lead.service'
import type {
  Milestone,
  MilestoneStage,
  MilestoneStatus,
} from '@/types/milestone'

import { useLeadCache } from './leadMutations'
import { CARD_CLASS, OUTLINE_BUTTON, PRIMARY_BUTTON } from './leadUtils'
import { Pill } from './parts'

const STAGE_ORDER: MilestoneStage[] = [
  'CONSULTATION',
  'ON_SITE_VISIT',
  'FINAL_OFFER',
  'INSTALLATION',
]

const STAGE_KEYS: Record<MilestoneStage, string> = {
  CONSULTATION: 'stageConsultation',
  ON_SITE_VISIT: 'stageOnSiteVisit',
  FINAL_OFFER: 'stageFinalOffer',
  INSTALLATION: 'stageInstallation',
}

const STATUS_TONES: Record<MilestoneStatus, string> = {
  PENDING: 'bg-gray-100 text-gray-700',
  ACTIVE: 'bg-blue-100 text-blue-700',
  DONE: 'bg-green-100 text-green-700',
}

const STATUSES: MilestoneStatus[] = ['PENDING', 'ACTIVE', 'DONE']

function MilestoneRow({
  leadId,
  milestone,
}: {
  leadId: string
  milestone: Milestone
}) {
  const t = useTranslations('admin.salesLeads.detail')
  const tErr = useTranslations('admin.salesLeads.errors')
  const tStages = useTranslations('dashboard.stages')
  const { setMilestone } = useLeadCache(leadId)
  const [editing, setEditing] = useState(false)
  const [status, setStatus] = useState<MilestoneStatus>(milestone.status)
  const [date, setDate] = useState(followUpDateValue(milestone.scheduledAt))
  const [note, setNote] = useState(milestone.note ?? '')

  const mutation = useMutation({
    mutationFn: () =>
      salesLeadService.updateMilestone(leadId, milestone.stage, {
        status,
        scheduledAt: followUpIsoFromDateValue(date),
        note: note.trim() ? note.trim() : null,
      }),
    onSuccess: updated => {
      setMilestone(updated)
      setEditing(false)
      toast.success(t('toast.milestoneSaved'))
    },
    onError: error => toast.error(tErr(salesLeadErrorKey(error))),
  })

  const startEditing = () => {
    setStatus(milestone.status)
    setDate(followUpDateValue(milestone.scheduledAt))
    setNote(milestone.note ?? '')
    setEditing(true)
  }

  const stageName = tStages(STAGE_KEYS[milestone.stage])
  const fieldId = `milestone-${milestone.stage}`

  return (
    <li
      className={cn(
        'rounded-xl border p-4',
        milestone.status === 'ACTIVE'
          ? 'border-blue-200 bg-blue-50/50'
          : 'border-[#062E25]/10'
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-base font-semibold text-[#062E25]">
            {stageName}
          </h3>
          <Pill tone={STATUS_TONES[milestone.status]}>
            {t(`project.milestones.status.${milestone.status}`)}
          </Pill>
        </div>
        {!editing && (
          <Button
            variant="outline"
            onClick={startEditing}
            aria-label={t('project.milestones.editStage', { stage: stageName })}
            className={OUTLINE_BUTTON}
          >
            <Pencil />
            {t('project.milestones.edit')}
          </Button>
        )}
      </div>

      {!editing && (
        <div className="mt-2 grid gap-1 text-base text-[#062E25]">
          <p>
            {milestone.scheduledAt
              ? t('project.milestones.scheduled', {
                  date: formatDate(milestone.scheduledAt),
                })
              : t('project.milestones.noDate')}
            {milestone.status === 'DONE' && milestone.completedAt && (
              <span className="text-[#062E25]/75">
                {' · '}
                {t('project.milestones.completed', {
                  date: formatDate(milestone.completedAt),
                })}
              </span>
            )}
          </p>
          {milestone.note && (
            <div className="mt-1 rounded-lg bg-[#F5F7EE] p-3">
              <p className="mb-1 text-base font-medium text-amber-800">
                {t('project.milestones.noteVisible')}
              </p>
              <p className="whitespace-pre-wrap break-words">
                {milestone.note}
              </p>
            </div>
          )}
        </div>
      )}

      {editing && (
        <form
          className="mt-4 grid gap-4"
          onSubmit={event => {
            event.preventDefault()
            if (!mutation.isPending) mutation.mutate()
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor={`${fieldId}-status`}
                className="mb-1.5 block text-base font-medium text-[#062E25]"
              >
                {t('project.milestones.statusLabel')}
              </label>
              <Select
                value={status}
                onValueChange={value => setStatus(value as MilestoneStatus)}
                disabled={mutation.isPending}
              >
                <SelectTrigger
                  id={`${fieldId}-status`}
                  className="h-10 w-full text-base text-[#062E25] data-[size=default]:h-10"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="sales-type-scale">
                  {STATUSES.map(item => (
                    <SelectItem key={item} value={item} className="text-base">
                      {t(`project.milestones.status.${item}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label
                htmlFor={`${fieldId}-date`}
                className="mb-1.5 block text-base font-medium text-[#062E25]"
              >
                {t('project.milestones.dateLabel')}
              </label>
              <Input
                id={`${fieldId}-date`}
                type="date"
                value={date}
                onChange={event => setDate(event.target.value)}
                disabled={mutation.isPending}
                className="h-10 text-base md:text-base text-[#062E25]"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor={`${fieldId}-note`}
              className="mb-1.5 block text-base font-medium text-[#062E25]"
            >
              {t('project.milestones.noteLabel')}
            </label>
            <Textarea
              id={`${fieldId}-note`}
              rows={2}
              value={note}
              onChange={event => setNote(event.target.value)}
              disabled={mutation.isPending}
              placeholder={t('project.milestones.notePlaceholder')}
              className="text-base md:text-base text-[#062E25]"
            />
            <p className="mt-1.5 rounded-lg bg-amber-50 px-3 py-2 text-base text-amber-900">
              {t('project.milestones.noteWarning')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              disabled={mutation.isPending}
              className={PRIMARY_BUTTON}
            >
              {mutation.isPending && <Loader2 className="animate-spin" />}
              {mutation.isPending
                ? t('project.milestones.saving')
                : t('project.milestones.save')}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={mutation.isPending}
              onClick={() => setEditing(false)}
              className={OUTLINE_BUTTON}
            >
              {t('project.milestones.cancel')}
            </Button>
          </div>
        </form>
      )}
    </li>
  )
}

export function MilestonesPanel({
  leadId,
  milestones,
}: {
  leadId: string
  milestones: Milestone[]
}) {
  const t = useTranslations('admin.salesLeads.detail')

  const byStage = new Map(milestones.map(item => [item.stage, item]))
  const ordered = STAGE_ORDER.map(stage => byStage.get(stage)).filter(
    (item): item is Milestone => Boolean(item)
  )

  return (
    <Card className={cn(CARD_CLASS, 'mb-6')}>
      <CardContent className="p-4 sm:p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[#062E25]">
            {t('project.milestones.title')}
          </h2>
          <p className="mt-1 text-base text-[#062E25]/75">
            {t('project.milestones.subtitle')}
          </p>
        </div>
        {ordered.length === 0 ? (
          <p className="text-base text-[#062E25]/75">
            {t('project.milestones.empty')}
          </p>
        ) : (
          <ol className="grid gap-3">
            {ordered.map(milestone => (
              <MilestoneRow
                key={milestone.stage}
                leadId={leadId}
                milestone={milestone}
              />
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
