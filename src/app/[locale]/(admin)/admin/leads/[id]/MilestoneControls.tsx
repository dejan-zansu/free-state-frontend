'use client'

import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { adminService } from '@/services/admin.service'
import type { Milestone, MilestoneStage, MilestoneStatus } from '@/types/milestone'

const STAGE_ORDER: MilestoneStage[] = [
  'CONSULTATION',
  'ON_SITE_VISIT',
  'FINAL_OFFER',
  'INSTALLATION',
]

const STAGE_LABEL_KEYS: Record<MilestoneStage, string> = {
  CONSULTATION: 'stageConsultation',
  ON_SITE_VISIT: 'stageOnSiteVisit',
  FINAL_OFFER: 'stageFinalOffer',
  INSTALLATION: 'stageInstallation',
}

function toDateInput(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

function StageRow({
  projectId,
  milestone,
}: {
  projectId: string
  milestone: Milestone
}) {
  const t = useTranslations('admin.milestones')
  const tStages = useTranslations('dashboard.stages')
  const queryClient = useQueryClient()

  const [status, setStatus] = useState<MilestoneStatus>(milestone.status)
  const [scheduledAt, setScheduledAt] = useState<string>(
    toDateInput(milestone.scheduledAt)
  )
  const [note, setNote] = useState<string>(milestone.note ?? '')
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (dirty) return
    setStatus(milestone.status)
    setScheduledAt(toDateInput(milestone.scheduledAt))
    setNote(milestone.note ?? '')
  }, [dirty, milestone.status, milestone.scheduledAt, milestone.note])

  const mutation = useMutation({
    mutationFn: () =>
      adminService.updateProjectMilestone(projectId, milestone.stage, {
        status,
        scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        note: note.trim() ? note.trim() : null,
      }),
    onSuccess: () => {
      setDirty(false)
      queryClient.invalidateQueries({ queryKey: ['admin-milestones', projectId] })
    },
  })

  return (
    <div className="rounded-lg border border-[#062E25]/10 p-4">
      <p className="mb-3 font-semibold text-[#062E25]">
        {tStages(STAGE_LABEL_KEYS[milestone.stage])}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-[#062E25]/60">
            {t('statusLabel')}
          </label>
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value as MilestoneStatus)
              setDirty(true)
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">{t('statusPending')}</SelectItem>
              <SelectItem value="ACTIVE">{t('statusActive')}</SelectItem>
              <SelectItem value="DONE">{t('statusDone')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-[#062E25]/60">
            {t('scheduledLabel')}
          </label>
          <input
            type="date"
            value={scheduledAt}
            onChange={(event) => {
              setScheduledAt(event.target.value)
              setDirty(true)
            }}
            className="h-10 w-full rounded-md border border-[#062E25]/20 px-3 text-sm text-[#062E25]"
          />
        </div>
      </div>
      <div className="mt-3">
        <label className="mb-1 block text-sm text-[#062E25]/60">{t('noteLabel')}</label>
        <Textarea
          value={note}
          onChange={(event) => {
            setNote(event.target.value)
            setDirty(true)
          }}
          placeholder={t('notePlaceholder')}
          rows={2}
        />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Button
          size="sm"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="bg-[#062E25] text-white hover:bg-[#062E25]/90"
        >
          {mutation.isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t('saving')}
            </span>
          ) : (
            t('save')
          )}
        </Button>
        {mutation.isSuccess && <span className="text-sm text-green-600">{t('saved')}</span>}
        {mutation.isError && <span className="text-sm text-red-600">{t('saveFailed')}</span>}
      </div>
    </div>
  )
}

export function MilestoneControls({ projectId }: { projectId: string }) {
  const t = useTranslations('admin.milestones')
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-milestones', projectId],
    queryFn: () => adminService.getProjectMilestones(projectId),
  })

  const byStage = new Map((data ?? []).map((m) => [m.stage, m]))
  const ordered = STAGE_ORDER.map((stage) => byStage.get(stage)).filter(
    (m): m is Milestone => Boolean(m)
  )

  return (
    <Card className="border-[#062E25]/10">
      <CardContent className="p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-[#062E25]">{t('title')}</h2>
          <p className="mt-1 text-sm text-[#062E25]/60">{t('subtitle')}</p>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-[#062E25]/40" />
          </div>
        ) : isError ? (
          <p className="text-sm text-red-600">{t('loadFailed')}</p>
        ) : ordered.length === 0 ? (
          <p className="text-sm text-[#062E25]/50">{t('empty')}</p>
        ) : (
          <div className="space-y-3">
            {ordered.map((milestone) => (
              <StageRow key={milestone.stage} projectId={projectId} milestone={milestone} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default MilestoneControls
