'use client'

import { useQuery } from '@tanstack/react-query'
import { ChevronLeft } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  INBOX_POLL_MS,
  inboxProspectId,
  inboxSeenUpTo,
} from '@/lib/outbound-inbox'
import {
  LEAD_TURN_TONE,
  assigneeName,
  leadDecisionsAllowed,
  leadIsClosed,
  leadIsOver,
  leadSinceText,
  leadStateKey,
} from '@/lib/outbound-lead-work'
import { adminOutreachService } from '@/services/admin-outreach.service'
import type { OutboundProspectDetail } from '@/types/admin-outreach'
import type { InboxItem } from '@/types/outreach/inbox'

import {
  OUTLINE_BUTTON,
  isNotFoundError,
} from '../../../residential-leads/[id]/leadUtils'
import { ActivityDialog } from '../../_components/owner-first/LogActivityControl'
import {
  LEAD_DECISION_TERMINAL_STATUSES,
  LeadPill,
  leadCrmHref,
  leadProspectKey,
} from '../../[id]/_lead/lead-shared'
import { LeadLaterDialog } from '../../[id]/_lead/LeadDialogs'
import { LeadTimeline } from '../../[id]/_lead/LeadTimeline'
import { InboxError } from './InboxList'
import { InboxDoneDialog, InboxNotLeadDialog } from './InboxMarkDialogs'

const STACKED_LAYOUT = '(max-width: 1023px)'

type OpenDialog = 'lead' | 'notLead' | 'done' | 'later' | null

function ConversationHead({ prospect }: { prospect: OutboundProspectDetail }) {
  const tw = useTranslations('admin.outreach.work')
  const tl = useTranslations('admin.outreach.leads')
  const locale = useLocale()
  const { work } = prospect
  const since = leadSinceText(work, prospect.crmLead?.reference)
  const place = [prospect.addressCity, prospect.addressCanton]
    .filter(Boolean)
    .join(' ')
  const line = [
    prospect.contactName?.trim(),
    place,
    assigneeName(prospect.assignedTo) ?? tl('unassigned'),
    prospect.reference,
  ].filter(Boolean)

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <h2 className="min-w-0 break-words text-xl font-bold text-[#062E25]">
          {prospect.companyName}
        </h2>
        <LeadPill tone={LEAD_TURN_TONE[work.turn]}>
          {tw(leadStateKey(work.state))}
        </LeadPill>
        {since && (
          <span
            className={
              work.late ? 'font-semibold text-red-700' : 'text-[#062E25]/75'
            }
          >
            {tw(since.key, since.values)}
          </span>
        )}
        {work.doNotContact && (
          <LeadPill tone="red">{tw('doNotContact')}</LeadPill>
        )}
      </div>
      <p className="mt-1 break-words text-[#062E25]/75">{line.join(' · ')}</p>
      {work.state === 'ENTWURF_PRUEFEN' && (
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[#062E25]">
          <span>{tw('draft.title')}</span>
          <Link
            href={`/${locale}/admin/outreach/${prospect.id}`}
            className="font-semibold underline underline-offset-2"
          >
            {tw('nextStepButton.REVIEW_DRAFT')}
          </Link>
        </p>
      )}
    </>
  )
}

function ConversationMarks({
  prospect,
  onEnterAnswer,
}: {
  prospect: OutboundProspectDetail
  onEnterAnswer?: (prospect: OutboundProspectDetail) => void
}) {
  const t = useTranslations('admin.outreach.inbox')
  const locale = useLocale()
  const [dialog, setDialog] = useState<OpenDialog>(null)
  const close = () => setDialog(null)

  const { work, crmLead, owner } = prospect
  const hasLead = prospect.leads.length > 0
  const isHint = work.kind === 'EIGENTUEMER_HINWEIS'
  const decisions =
    leadDecisionsAllowed(work, crmLead) &&
    prospect.status !== 'CONVERTED' &&
    !prospect.commercialLeadId
  const ownerWaits =
    work.state === 'EIGENTUEMER_KONTAKTIEREN' && work.ownerStep === 'REPLIED'
  const crmHref = decisions ? null : leadCrmHref(prospect, locale)
  const canQualify = (!hasLead || isHint) && !work.readOnly && !crmHref

  const mark = (key: string, target: OpenDialog) => (
    <Button
      size="lg"
      variant="outline"
      onClick={() => setDialog(target)}
      className={OUTLINE_BUTTON}
    >
      {t(`marks.${key}`)}
    </Button>
  )
  const link = (key: string, href: string) => (
    <Button asChild size="lg" variant="outline" className={OUTLINE_BUTTON}>
      <Link href={href}>{t(`marks.${key}`)}</Link>
    </Button>
  )

  return (
    <div
      role="group"
      aria-label={t('marks.aria')}
      className="flex flex-wrap gap-2"
    >
      {canQualify && mark('lead', 'lead')}
      {decisions && !leadIsOver(work) && mark('notLead', 'notLead')}
      {decisions && !leadIsClosed(work) && !ownerWaits && mark('done', 'done')}
      {ownerWaits &&
        owner?.row &&
        link('openOwner', `/${locale}/admin/outreach/${owner.row.id}`)}
      {decisions &&
        !LEAD_DECISION_TERMINAL_STATUSES.includes(prospect.status) &&
        mark('later', 'later')}
      {crmHref && link('openCrm', crmHref)}
      {onEnterAnswer && (
        <Button
          size="lg"
          variant="outline"
          onClick={() => onEnterAnswer(prospect)}
          className={OUTLINE_BUTTON}
        >
          {t('enterAnswer')}
        </Button>
      )}
      <Button
        asChild
        size="lg"
        variant="ghost"
        className="px-3 text-base text-[#062E25]/75 hover:text-[#062E25] sm:ml-auto"
      >
        <Link href={`/${locale}/admin/outreach/${prospect.id}`}>
          {t('marks.openProspect')}
        </Link>
      </Button>

      <ActivityDialog
        prospect={prospect}
        kind={dialog === 'lead' ? 'QRL' : null}
        onClose={close}
      />
      {dialog === 'notLead' && (
        <InboxNotLeadDialog prospect={prospect} onClose={close} />
      )}
      {dialog === 'done' && (
        <InboxDoneDialog prospect={prospect} onClose={close} />
      )}
      {dialog === 'later' && (
        <LeadLaterDialog prospect={prospect} onClose={close} />
      )}
    </div>
  )
}

function ConversationSkeleton() {
  return (
    <div className="flex flex-col gap-3 p-4">
      <Skeleton className="h-7 w-2/3" />
      <Skeleton className="h-5 w-1/2" />
      <Skeleton className="mt-4 h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  )
}

export function InboxConversation({
  conversationKey,
  item,
  markOnOpen,
  onSeen,
  onBack,
  onEnterAnswer,
}: {
  conversationKey: string
  item: InboxItem | undefined
  markOnOpen: boolean
  onSeen: (upTo: string) => void
  onBack: () => void
  onEnterAnswer?: (prospect: OutboundProspectDetail) => void
}) {
  const t = useTranslations('admin.outreach.inbox')
  const td = useTranslations('admin.outreach.detail')
  const prospectId = inboxProspectId(conversationKey)
  const scrollRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const marked = useRef(!markOnOpen)

  const query = useQuery({
    queryKey: leadProspectKey(prospectId ?? ''),
    queryFn: () => adminOutreachService.getProspect(prospectId ?? ''),
    enabled: prospectId !== null,
    refetchInterval: INBOX_POLL_MS,
    refetchOnMount: 'always',
  })
  const prospect = query.data
  const loadedId = prospect?.id
  const missing =
    prospectId === null || (!prospect && isNotFoundError(query.error))

  useLayoutEffect(() => {
    if (!loadedId) return
    const box = scrollRef.current
    if (box) box.scrollTop = box.scrollHeight
    if (window.matchMedia(STACKED_LAYOUT).matches) {
      endRef.current?.scrollIntoView({ block: 'end' })
    }
  }, [loadedId])

  useEffect(() => {
    if (!prospect || marked.current) return
    marked.current = true
    const upTo = inboxSeenUpTo(
      item,
      prospect.work.lastCustomerTouch?.at ?? null
    )
    if (upTo) onSeen(upTo)
  }, [prospect, item, onSeen])

  const body = () => {
    if (missing) {
      return (
        <p className="p-6 text-center text-[#062E25]">
          {t('conversation.notFound')}
        </p>
      )
    }
    if (!prospect) {
      return query.isError ? (
        <InboxError
          text={t('conversation.loadFailed')}
          retrying={query.isFetching}
          onRetry={() => query.refetch()}
        />
      ) : (
        <ConversationSkeleton />
      )
    }
    return (
      <>
        <div className="shrink-0 border-b border-[#062E25]/10 p-4">
          <ConversationHead prospect={prospect} />
        </div>
        <div
          ref={scrollRef}
          className="p-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto"
        >
          <LeadTimeline prospect={prospect} order="oldest" />
        </div>
        <div
          ref={endRef}
          className="shrink-0 scroll-mb-6 border-t border-[#062E25]/10 p-4"
        >
          <ConversationMarks
            prospect={prospect}
            onEnterAnswer={onEnterAnswer}
          />
        </div>
      </>
    )
  }

  return (
    <section
      aria-label={t('conversation.aria')}
      className="flex min-w-0 flex-col rounded-xl border border-[#062E25]/10 bg-white lg:h-full lg:min-h-0 lg:overflow-hidden"
    >
      <button
        type="button"
        onClick={onBack}
        className="inline-flex min-h-11 items-center gap-1 self-start px-4 pt-2 text-base font-medium text-[#062E25]/75 outline-none hover:text-[#062E25] focus-visible:underline lg:hidden"
      >
        <ChevronLeft aria-hidden className="size-5" />
        {td('back')}
      </button>
      {body()}
    </section>
  )
}
