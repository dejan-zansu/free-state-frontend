'use client'

import { useMutation } from '@tanstack/react-query'
import { Loader2, UserCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  LEAD_FOLLOW_UP_TONE_CLASS,
  LEAD_QUICK_FOLLOW_UPS,
  assigneeName,
  formatLeadDate,
  leadErrorKey,
  leadFollowUpLine,
  leadIsClosed,
  zurichDateInput,
  zurichDatePlusDays,
} from '@/lib/outbound-lead-work'
import { cn } from '@/lib/utils'
import { adminOutreachService } from '@/services/admin-outreach.service'
import { useUser } from '@/stores/auth.store'
import type { OutboundProspectDetail } from '@/types/admin-outreach'
import type { LeadWorkPatch } from '@/types/outreach/kpi'

import { OUTLINE_BUTTON } from '../../../residential-leads/[id]/leadUtils'
import { useLeadAssignees, useLeadCache } from './lead-shared'

const NONE = '__none__'
const SAVE_DELAY_MS = 700

export function LeadWorkStrip({
  prospect,
}: {
  prospect: OutboundProspectDetail
}) {
  const t = useTranslations('admin.outreach.work')
  const tl = useTranslations('admin.outreach.leads')
  const user = useUser()
  const { applySnapshot } = useLeadCache(prospect.id)
  const { data: assignees } = useLeadAssignees()
  const { work, assignedTo } = prospect

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingDate = useRef<string | null>(null)
  const serverDate = zurichDateInput(work.followUp.at)
  const [draftDate, setDraftDate] = useState(serverDate)

  useEffect(() => {
    setDraftDate(serverDate)
  }, [serverDate])

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current)
    },
    []
  )

  const update = useMutation({
    mutationFn: (patch: LeadWorkPatch) =>
      adminOutreachService.updateWork(prospect.id, patch),
    onSuccess: snapshot => {
      applySnapshot(snapshot)
    },
  })

  const options = [...(assignees ?? [])]
  if (assignedTo && !options.some(option => option.id === assignedTo.id)) {
    options.unshift({
      id: assignedTo.id,
      name: assigneeName(assignedTo) ?? '-',
      role: '',
    })
  }

  const showError = (error: unknown) => toast.error(t(leadErrorKey(error)))

  const assign = (assignedToId: string | null) => {
    const name = options.find(option => option.id === assignedToId)?.name
    update.mutate(
      { assignedToId },
      {
        onSuccess: () =>
          toast.success(
            assignedToId
              ? t('toast.assigned', { name: name ?? '-' })
              : t('toast.unassigned')
          ),
        onError: showError,
      }
    )
  }

  const saveFollowUp = (value: string | null) => {
    update.mutate(
      { followUpAt: value },
      {
        onSuccess: () =>
          toast.success(
            value
              ? t('toast.followUpSet', { date: formatLeadDate(value) })
              : t('toast.followUpCleared')
          ),
        onError: error => {
          setDraftDate(serverDate)
          showError(error)
        },
      }
    )
  }

  const cancelPendingSave = () => {
    if (timer.current) clearTimeout(timer.current)
    timer.current = null
    pendingDate.current = null
  }

  const flushPendingSave = () => {
    const value = pendingDate.current
    if (value === null) return
    cancelPendingSave()
    saveFollowUp(value)
  }

  const handleDateChange = (value: string) => {
    setDraftDate(value)
    cancelPendingSave()
    if (!value || value === serverDate) return
    const year = Number(value.slice(0, 4))
    if (year < 2000 || year > 2100) return
    pendingDate.current = value
    timer.current = setTimeout(flushPendingSave, SAVE_DELAY_MS)
  }

  const applyQuick = (days: number) => {
    cancelPendingSave()
    const value = zurichDatePlusDays(days)
    setDraftDate(value)
    saveFollowUp(value)
  }

  const clearFollowUp = () => {
    cancelPendingSave()
    setDraftDate('')
    saveFollowUp(null)
  }

  const closed = leadIsClosed(work)
  const isMine = !!user && assignedTo?.id === user.id
  const line = leadFollowUpLine(work)
  const overdue = line?.tone === 'red'

  return (
    <div
      className={cn(
        'mt-5 grid gap-6 border-t border-[#062E25]/10 pt-5',
        !closed && 'xl:grid-cols-2'
      )}
    >
      <div>
        <label
          htmlFor="lead-assignee"
          className="mb-1.5 block text-base font-medium text-[#062E25]"
        >
          {t('strip.assignee')}
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select
            value={assignedTo?.id ?? NONE}
            onValueChange={value => assign(value === NONE ? null : value)}
            disabled={update.isPending}
          >
            <SelectTrigger
              id="lead-assignee"
              className="h-10 w-full text-base text-[#062E25] data-[size=default]:h-10 sm:flex-1"
            >
              <SelectValue placeholder={tl('unassigned')} />
            </SelectTrigger>
            <SelectContent className="sales-type-scale">
              <SelectItem value={NONE} className="text-base">
                {tl('unassigned')}
              </SelectItem>
              {options.map(option => (
                <SelectItem
                  key={option.id}
                  value={option.id}
                  className="text-base"
                >
                  {option.id === user?.id
                    ? tl('assigneeSelf', { name: option.name })
                    : option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {user && !isMine && (
            <Button
              variant="outline"
              size="lg"
              disabled={update.isPending}
              onClick={() => assign(user.id)}
              className={OUTLINE_BUTTON}
            >
              <UserCheck />
              {t('strip.assignMe')}
            </Button>
          )}
        </div>
      </div>

      {!closed && (
        <div>
          <label
            htmlFor="lead-follow-up"
            className="mb-1.5 block text-base font-medium text-[#062E25]"
          >
            {t('strip.followUpAt')}
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <Input
              id="lead-follow-up"
              type="date"
              value={draftDate}
              onChange={event => handleDateChange(event.target.value)}
              onBlur={() => {
                flushPendingSave()
                if (!draftDate) setDraftDate(serverDate)
              }}
              className={cn(
                'h-10 w-full text-base md:text-base text-[#062E25] sm:w-48',
                overdue && 'border-red-400 text-red-700',
                line?.tone === 'amber' && 'border-amber-400'
              )}
            />
            {update.isPending && (
              <Loader2
                className="size-4 animate-spin text-[#062E25]/60"
                aria-hidden
              />
            )}
            {overdue && (
              <span className="text-base font-semibold text-red-700">
                {t('strip.overdue')}
              </span>
            )}
            {work.followUp.at && line && !overdue && line.tone !== 'plain' && (
              <span
                className={cn(
                  'text-base',
                  LEAD_FOLLOW_UP_TONE_CLASS[line.tone]
                )}
              >
                {t(line.text.key, line.text.values)}
              </span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {LEAD_QUICK_FOLLOW_UPS.map(item => (
              <Button
                key={item.key}
                type="button"
                variant="outline"
                disabled={update.isPending}
                onClick={() => applyQuick(item.days)}
                className={OUTLINE_BUTTON}
              >
                {t(item.key)}
              </Button>
            ))}
            {work.followUp.at && (
              <Button
                type="button"
                variant="ghost"
                disabled={update.isPending}
                onClick={clearFollowUp}
                className="text-base text-[#062E25]/75 hover:text-[#062E25]"
              >
                {t('strip.remove')}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
