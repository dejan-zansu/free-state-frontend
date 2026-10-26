'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  Clock,
  Loader2,
  Mail,
  Phone,
  User,
  UserPlus,
  Zap,
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import type { MouseEvent } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  followUpState,
  formatDate,
  formatDateTime,
  formatRelative,
  personName,
  telHref,
} from '@/lib/sales-lead'
import { salesLeadErrorKey } from '@/lib/sales-lead-errors'
import { cn } from '@/lib/utils'
import { salesLeadService } from '@/services/sales-lead.service'
import { useUser } from '@/stores/auth.store'
import type { SalesLeadActivity, SalesLeadListItem } from '@/types/sales-lead'

import {
  formatChf,
  formatKwp,
  isInteractiveTarget,
  leadHref,
  useRelativeLocale,
} from './lead-format'

const BADGE_BASE =
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium whitespace-nowrap sm:text-base'

export function useRowNavigation(leadId: string) {
  const router = useRouter()
  const locale = useLocale()
  const href = leadHref(locale, leadId)

  const onClick = (event: MouseEvent<HTMLElement>) => {
    if (isInteractiveTarget(event.target)) return
    if (window.getSelection()?.toString()) return
    router.push(href)
  }

  return { href, onClick }
}

export function ContactLinks({
  user,
  className,
}: {
  user: SalesLeadListItem['customer']['user']
  className?: string
}) {
  const phone = user.phone?.trim()
  const email = user.email?.trim()
  if (!phone && !email) return null

  const linkClass =
    'inline-flex min-w-0 max-w-full items-center gap-2 text-base text-[#062E25]/80 underline-offset-2 outline-none hover:text-[#062E25] hover:underline focus-visible:text-[#062E25] focus-visible:underline'

  return (
    <div className={cn('flex min-w-0 flex-col items-start gap-1', className)}>
      {phone ? (
        <a href={telHref(phone)} className={linkClass}>
          <Phone aria-hidden className="size-4 shrink-0" />
          <span className="truncate">{phone}</span>
        </a>
      ) : null}
      {email ? (
        <a href={`mailto:${email}`} className={linkClass} title={email}>
          <Mail aria-hidden className="size-4 shrink-0" />
          <span className="truncate">{email}</span>
        </a>
      ) : null}
    </div>
  )
}

export function LeadBadges({
  lead,
  className,
}: {
  lead: SalesLeadListItem
  className?: string
}) {
  const t = useTranslations('admin.salesLeads.list')
  const showOwner = !lead.isPropertyOwner
  const showOffer = lead.offerCount > 0
  const showConsult = lead.consultationBooked
  if (!showOwner && !showOffer && !showConsult) return null

  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {showOwner ? (
        <span className={cn(BADGE_BASE, 'bg-amber-100 text-amber-800')}>
          {t('badges.notOwner')}
        </span>
      ) : null}
      {showOffer ? (
        <span className={cn(BADGE_BASE, 'bg-emerald-100 text-emerald-800')}>
          {t('badges.offerRequested')}
        </span>
      ) : null}
      {showConsult ? (
        <span className={cn(BADGE_BASE, 'bg-blue-100 text-blue-800')}>
          {t('badges.consultationBooked')}
        </span>
      ) : null}
    </div>
  )
}

export function SystemSummary({
  project,
}: {
  project: SalesLeadListItem['project']
}) {
  const t = useTranslations('admin.salesLeads.list')
  if (!project) return null

  const kwp = formatKwp(project.systemKwp)
  const savings = formatChf(project.annualSavingsChf)

  let text: string | null = null
  if (kwp && savings) text = t('systemSummary.full', { kwp, savings })
  else if (kwp) text = t('systemSummary.kwp', { kwp })
  else if (savings) text = t('systemSummary.savings', { savings })
  if (!text) return null

  return (
    <span className="flex min-w-0 items-start gap-1.5 text-base text-[#062E25]/75">
      <Zap aria-hidden className="mt-1 size-4 shrink-0" />
      <span className="min-w-0">{text}</span>
    </span>
  )
}

export function AssignToMeButton({
  leadId,
  className,
}: {
  leadId: string
  className?: string
}) {
  const t = useTranslations('admin.salesLeads.list')
  const te = useTranslations('admin.salesLeads.errors')
  const user = useUser()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (userId: string) =>
      salesLeadService.update(leadId, { assignedToId: userId }),
    onSuccess: detail => {
      queryClient.setQueryData(['sales-lead', leadId], detail)
      queryClient.invalidateQueries({ queryKey: ['sales-leads'] })
      toast.success(t('assignedToast'))
    },
    onError: error => {
      toast.error(te(salesLeadErrorKey(error)))
    },
  })

  return (
    <Button
      type="button"
      variant="outline"
      disabled={!user?.id || mutation.isPending}
      onClick={() => {
        if (user?.id) mutation.mutate(user.id)
      }}
      className={cn(
        'h-10 border-[#062E25]/25 px-3 text-base text-[#062E25] hover:bg-[#F5F7EE]',
        className
      )}
    >
      {mutation.isPending ? (
        <Loader2 aria-hidden className="animate-spin" />
      ) : (
        <UserPlus aria-hidden />
      )}
      {t('assignToMe')}
    </Button>
  )
}

export function ResponsibleInfo({
  lead,
  buttonClassName,
  withIcon,
}: {
  lead: SalesLeadListItem
  buttonClassName?: string
  withIcon?: boolean
}) {
  const t = useTranslations('admin.salesLeads.list')
  if (lead.assignedTo) {
    const name = personName(lead.assignedTo) || t('unnamed')
    return (
      <span
        className="flex min-w-0 max-w-full items-center gap-2 font-medium text-[#062E25]"
        title={name}
      >
        {withIcon ? (
          <>
            <User aria-hidden className="size-4 shrink-0 text-[#062E25]/70" />
            <span className="sr-only">{t('columns.responsible')}</span>
          </>
        ) : null}
        <span className="truncate">{name}</span>
      </span>
    )
  }
  return <AssignToMeButton leadId={lead.id} className={buttonClassName} />
}

export function LastActivity({
  activity,
}: {
  activity: SalesLeadActivity | null
}) {
  const t = useTranslations('admin.salesLeads.list')
  const tl = useTranslations('admin.statusLabels')
  const relativeLocale = useRelativeLocale()

  if (!activity) {
    return <span className="text-[#062E25]/60">{t('activity.none')}</span>
  }

  const actorName = personName(activity.actor)
  const withActor = (what: string) =>
    actorName ? t('activity.by', { what, name: actorName }) : what

  let text: string
  let snippet: string | null = null

  switch (activity.type) {
    case 'NOTE': {
      const kind = activity.fromValue
      const what =
        kind === 'CALL'
          ? t('activity.call')
          : kind === 'EMAIL'
            ? t('activity.email')
            : kind === 'MEETING'
              ? t('activity.meeting')
              : t('activity.note')
      text = withActor(what)
      snippet = activity.toValue?.trim() || null
      break
    }
    case 'STATUS_CHANGED': {
      const target = activity.toValue ?? ''
      text = t('activity.statusChanged', {
        status: target && tl.has(target) ? tl(target) : target || '-',
      })
      break
    }
    case 'WON':
      text = t('activity.won')
      break
    case 'LOST':
      text = t('activity.lost')
      break
    case 'CONSULT_BOOKED':
      text = t('activity.consultBooked')
      break
    case 'OFFER_SENT':
      text = t('activity.offerSent')
      break
    default:
      text = '-'
  }

  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span
        className="font-medium text-[#062E25]"
        title={formatDateTime(activity.createdAt)}
      >
        {formatRelative(activity.createdAt, relativeLocale)}
      </span>
      <span className="text-[#062E25]/80">{text}</span>
      {snippet ? (
        <span
          className="line-clamp-2 break-words text-[#062E25]/60"
          title={snippet}
        >
          {snippet}
        </span>
      ) : null}
    </div>
  )
}

export function FollowUpInfo({ lead }: { lead: SalesLeadListItem }) {
  const t = useTranslations('admin.salesLeads.list')
  const state = followUpState(lead.nextFollowUp, lead.status)

  if (state === 'none') {
    return <span className="text-[#062E25]/60">-</span>
  }

  const date = formatDate(lead.nextFollowUp)

  if (state === 'overdue') {
    return (
      <span className="inline-flex flex-col text-red-700">
        <span className="inline-flex items-center gap-1.5 font-semibold">
          <AlertCircle aria-hidden className="size-4 shrink-0" />
          {date}
        </span>
        <span>{t('followUp.overdue')}</span>
      </span>
    )
  }

  if (state === 'today') {
    return (
      <span className="inline-flex flex-col text-amber-700">
        <span className="inline-flex items-center gap-1.5 font-semibold">
          <Clock aria-hidden className="size-4 shrink-0" />
          {date}
        </span>
        <span>{t('followUp.today')}</span>
      </span>
    )
  }

  return <span className="text-[#062E25]">{date}</span>
}

export function CreatedInfo({ lead }: { lead: SalesLeadListItem }) {
  const tl = useTranslations('admin.statusLabels')
  const relativeLocale = useRelativeLocale()

  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="text-[#062E25]" title={formatDateTime(lead.createdAt)}>
        {formatRelative(lead.createdAt, relativeLocale)}
      </span>
      <span className="text-[#062E25]/60">
        {tl.has(lead.source) ? tl(lead.source) : lead.source}
      </span>
    </div>
  )
}

export function CreatedLine({ lead }: { lead: SalesLeadListItem }) {
  const t = useTranslations('admin.salesLeads.list')
  const tl = useTranslations('admin.statusLabels')
  const relativeLocale = useRelativeLocale()

  return (
    <span className="text-[#062E25]/70" title={formatDateTime(lead.createdAt)}>
      {t('createdInfo', {
        when: formatRelative(lead.createdAt, relativeLocale),
        source: tl.has(lead.source) ? tl(lead.source) : lead.source,
      })}
    </span>
  )
}
