'use client'

import { useQuery } from '@tanstack/react-query'
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
  followUpDateValue,
  followUpIsoFromDateValue,
  followUpIsoInDays,
  followUpState,
  isClosedStatus,
  personName,
} from '@/lib/sales-lead'
import { salesLeadErrorKey } from '@/lib/sales-lead-errors'
import { cn } from '@/lib/utils'
import { salesLeadService } from '@/services/sales-lead.service'
import { useUser } from '@/stores/auth.store'
import type { SalesLeadDetail, SalesLeadPerson } from '@/types/sales-lead'

import { useLeadUpdate } from './leadMutations'
import { OUTLINE_BUTTON } from './leadUtils'

const NONE = '__none__'
const SAVE_DELAY_MS = 700

const QUICK_FOLLOW_UPS = [
  { key: 'tomorrow', days: 1 },
  { key: 'inThreeDays', days: 3 },
  { key: 'inOneWeek', days: 7 },
] as const

export function WorkStrip({ lead }: { lead: SalesLeadDetail }) {
  const t = useTranslations('admin.salesLeads.detail')
  const tErr = useTranslations('admin.salesLeads.errors')
  const user = useUser()
  const update = useLeadUpdate(lead.id)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingDate = useRef<string | null>(null)

  const serverDate = followUpDateValue(lead.nextFollowUp)
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

  const teamQuery = useQuery({
    queryKey: ['sales-lead-team'],
    queryFn: () => salesLeadService.team(),
    staleTime: 5 * 60 * 1000,
  })

  const members: SalesLeadPerson[] = [...(teamQuery.data ?? [])]
  if (
    lead.assignedTo &&
    !members.some(member => member.id === lead.assignedTo?.id)
  ) {
    members.unshift(lead.assignedTo)
  }

  const onError = (error: unknown) =>
    toast.error(tErr(salesLeadErrorKey(error)))

  const assign = (assignedToId: string | null, message: string) => {
    update.mutate(
      { assignedToId },
      { onSuccess: () => toast.success(message), onError }
    )
  }

  const saveFollowUp = (iso: string | null) => {
    update.mutate(
      { nextFollowUp: iso },
      {
        onSuccess: () =>
          toast.success(
            iso ? t('toast.followUpSaved') : t('toast.followUpCleared')
          ),
        onError: error => {
          setDraftDate(serverDate)
          onError(error)
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
    saveFollowUp(followUpIsoFromDateValue(value))
  }

  const handleDateChange = (value: string) => {
    setDraftDate(value)
    cancelPendingSave()
    if (!value) return
    const year = Number(value.slice(0, 4))
    if (year < 2000 || year > 2100) return
    if (value === serverDate) return
    pendingDate.current = value
    timer.current = setTimeout(flushPendingSave, SAVE_DELAY_MS)
  }

  const applyQuick = (days: number) => {
    cancelPendingSave()
    const iso = followUpIsoInDays(days)
    setDraftDate(followUpDateValue(iso))
    saveFollowUp(iso)
  }

  const clearFollowUp = () => {
    cancelPendingSave()
    setDraftDate('')
    saveFollowUp(null)
  }

  const state = followUpState(lead.nextFollowUp, lead.status)
  const closed = isClosedStatus(lead.status)
  const isMine = !!user && lead.assignedTo?.id === user.id

  return (
    <div
      className={cn(
        'mt-6 grid gap-6 border-t border-[#062E25]/10 pt-6',
        !closed && 'xl:grid-cols-2'
      )}
    >
      <div>
        <label
          htmlFor="work-assignee"
          className="mb-1.5 block text-base font-medium text-[#062E25]"
        >
          {t('work.assignee')}
        </label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select
            value={lead.assignedTo?.id ?? NONE}
            onValueChange={value =>
              value === NONE
                ? assign(null, t('toast.unassigned'))
                : assign(value, t('toast.assigned'))
            }
            disabled={update.isPending}
          >
            <SelectTrigger
              id="work-assignee"
              className="h-10 w-full text-base text-[#062E25] data-[size=default]:h-10 sm:flex-1"
            >
              <SelectValue placeholder={t('work.unassigned')} />
            </SelectTrigger>
            <SelectContent className="sales-type-scale">
              <SelectItem value={NONE} className="text-base">
                {t('work.unassigned')}
              </SelectItem>
              {members.map(member => (
                <SelectItem
                  key={member.id}
                  value={member.id}
                  className="text-base"
                >
                  {personName(member)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {user && !isMine && (
            <Button
              variant="outline"
              size="lg"
              disabled={update.isPending}
              onClick={() => assign(user.id, t('toast.assigned'))}
              className={OUTLINE_BUTTON}
            >
              <UserCheck />
              {t('work.assignToMe')}
            </Button>
          )}
        </div>
        {teamQuery.isError && (
          <p className="mt-1.5 text-base text-red-700">
            {t('work.teamFailed')}
          </p>
        )}
      </div>

      {!closed && (
        <div>
          <label
            htmlFor="work-follow-up"
            className="mb-1.5 block text-base font-medium text-[#062E25]"
          >
            {t('work.followUp')}
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <Input
              id="work-follow-up"
              type="date"
              value={draftDate}
              onChange={event => handleDateChange(event.target.value)}
              onBlur={() => {
                flushPendingSave()
                if (!draftDate) setDraftDate(serverDate)
              }}
              className={cn(
                'h-10 w-full text-base md:text-base text-[#062E25] sm:w-48',
                state === 'overdue' && 'border-red-400 text-red-700',
                state === 'today' && 'border-amber-400'
              )}
            />
            {update.isPending && (
              <Loader2
                className="size-4 animate-spin text-[#062E25]/60"
                aria-hidden
              />
            )}
            {state === 'overdue' && (
              <span className="text-base font-semibold text-red-700">
                {t('work.overdue')}
              </span>
            )}
            {state === 'today' && (
              <span className="text-base font-semibold text-amber-700">
                {t('work.dueToday')}
              </span>
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {QUICK_FOLLOW_UPS.map(item => (
              <Button
                key={item.key}
                type="button"
                variant="outline"
                disabled={update.isPending}
                onClick={() => applyQuick(item.days)}
                className={OUTLINE_BUTTON}
              >
                {t(`work.${item.key}`)}
              </Button>
            ))}
            {lead.nextFollowUp && (
              <Button
                type="button"
                variant="ghost"
                disabled={update.isPending}
                onClick={clearFollowUp}
                className="text-base text-[#062E25]/75 hover:text-[#062E25]"
              >
                {t('work.clear')}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
