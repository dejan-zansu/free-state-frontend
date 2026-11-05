'use client'

import { useMutation } from '@tanstack/react-query'
import { ChevronLeft, MapPin, Mail, Phone } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LEAD_INTEREST_TONE,
  LEAD_KIND_TONE,
  leadContactBlocked,
  leadDecisionsAllowed,
  leadErrorKey,
  leadHasCustomerTouch,
  leadInterestKey,
  leadIsClosed,
  leadKindHintKey,
  leadKindKey,
  leadNextStepButtonKey,
  leadReasonKey,
  leadShownReason,
} from '@/lib/outbound-lead-work'
import { mapsHref, telHref } from '@/lib/sales-lead'
import { adminOutreachService } from '@/services/admin-outreach.service'
import type { OutboundProspectDetail } from '@/types/admin-outreach'

import {
  OUTLINE_BUTTON,
  PRIMARY_BUTTON,
} from '../../../residential-leads/[id]/leadUtils'
import { ContactLine } from '../../../residential-leads/[id]/parts'
import {
  ActivityDialog,
  type ActivityKind,
} from '../../_components/owner-first/LogActivityControl'
import {
  LEAD_COMPOSER_TEXT_ID,
  LEAD_DECISION_TERMINAL_STATUSES,
  LeadPill,
  leadAddress,
  leadCrmHref,
  useLeadCache,
} from './lead-shared'
import {
  LeadCallDialog,
  LeadDecisionDialog,
  LeadLaterDialog,
  LeadOwnerDialog,
} from './LeadDialogs'

type OpenDialog = 'call' | 'owner' | 'later' | 'decline' | 'hintDone' | null

export function LeadHeader({
  prospect,
  hasLead,
  hasDraft,
  canReply,
  canPromote,
  onOpenDraft,
  onWrite,
  onPromote,
  onOpenContact,
}: {
  prospect: OutboundProspectDetail
  hasLead: boolean
  hasDraft: boolean
  canReply: boolean
  canPromote: boolean
  onOpenDraft: () => void
  onWrite: () => void
  onPromote: () => void
  onOpenContact: () => void
}) {
  const t = useTranslations('admin.outreach.work')
  const tl = useTranslations('admin.outreach.leads')
  const td = useTranslations('admin.outreach.detail')
  const tc = useTranslations('admin.salesLeads.detail.contact')
  const locale = useLocale()
  const { refresh } = useLeadCache(prospect.id)
  const [dialog, setDialog] = useState<OpenDialog>(null)
  const [activityKind, setActivityKind] = useState<ActivityKind | null>(null)
  const keepFocusAfterMenu = useRef(false)

  const { work, crmLead, owner } = prospect
  const address = leadAddress(prospect)
  const phone = prospect.contactPhone?.trim() || null
  const crmHref = leadCrmHref(prospect, locale)
  const isHint = work.kind === 'EIGENTUEMER_HINWEIS'
  const decisions =
    leadDecisionsAllowed(work, crmLead) &&
    prospect.status !== 'CONVERTED' &&
    !prospect.commercialLeadId
  const canSnooze =
    decisions && !LEAD_DECISION_TERMINAL_STATUSES.includes(prospect.status)
  const showWork = !hasLead || !leadIsClosed(work)
  const canQualify = (!hasLead || isHint) && !work.readOnly
  const canHandOver = canPromote && !crmLead && !work.readOnly
  const interestLabel = work.interest ? t(leadInterestKey(work.interest)) : null
  const kindLabel = work.kind ? t(leadKindKey(work.kind)) : null
  const shownReason = leadShownReason(work)
  const reasonLabel = shownReason ? t(leadReasonKey(shownReason)) : null
  const showReason =
    reasonLabel !== null &&
    reasonLabel !== interestLabel &&
    reasonLabel !== kindLabel

  const letter = useMutation({
    mutationFn: () =>
      adminOutreachService.logActivity(prospect.id, { type: 'LETTER_SENT' }),
    onSuccess: () => {
      toast.success(t('toast.letterLogged'))
      refresh()
    },
    onError: error => toast.error(t(leadErrorKey(error))),
  })

  const primary = () => {
    const step = hasLead && !leadContactBlocked(work) ? work.nextStep : null
    if (!step) return null
    const label = t(leadNextStepButtonKey(step))
    const button = (onClick: () => void) => (
      <Button size="lg" onClick={onClick} className={PRIMARY_BUTTON}>
        {label}
      </Button>
    )
    switch (step) {
      case 'REVIEW_DRAFT':
        return button(onOpenDraft)
      case 'CALL':
        return (
          <Button
            size="lg"
            onClick={() => setDialog('call')}
            className={PRIMARY_BUTTON}
          >
            <Phone />
            {label}
          </Button>
        )
      case 'REPLY':
      case 'FOLLOW_UP':
        if (!prospect.contactEmail) return button(onOpenContact)
        return canReply || hasDraft ? button(onWrite) : null
      case 'CAPTURE_OWNER':
        return button(() => setDialog('owner'))
      case 'OPEN_OWNER':
        return owner?.row ? (
          <Button asChild size="lg" className={PRIMARY_BUTTON}>
            <Link href={`/${locale}/admin/outreach/${owner.row.id}`}>
              {label}
            </Link>
          </Button>
        ) : null
      case 'OPEN_CRM':
        return crmHref ? (
          <Button asChild size="lg" className={PRIMARY_BUTTON}>
            <Link href={crmHref}>{label}</Link>
          </Button>
        ) : null
    }
  }

  return (
    <header className="mb-6">
      <Link
        href={
          hasLead
            ? `/${locale}/admin/outreach/leads`
            : `/${locale}/admin/outreach`
        }
        className="inline-flex items-center gap-1 text-base font-medium text-[#062E25]/75 hover:text-[#062E25]"
      >
        <ChevronLeft className="size-4" />
        {hasLead ? t('header.back') : td('back')}
      </Link>

      <div className="mt-3 grid gap-5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-start">
        <div className="min-w-0">
          <h1 className="break-words text-xl font-bold text-[#062E25] sm:text-2xl">
            {prospect.companyName}
          </h1>
          {address && (
            <a
              href={mapsHref(address)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-start gap-1.5 text-base text-[#062E25]/75 hover:text-[#062E25] hover:underline"
            >
              <MapPin className="mt-1 size-4 shrink-0" />
              <span className="break-words">{address}</span>
            </a>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1">
            {prospect.contactName ? (
              <span className="break-words text-base font-semibold text-[#062E25]">
                {prospect.contactRole
                  ? tl('personRole', {
                      name: prospect.contactName,
                      role: prospect.contactRole,
                    })
                  : prospect.contactName}
              </span>
            ) : (
              <span className="text-base text-[#062E25]/75">
                {tl('noPerson')}
              </span>
            )}
            {phone ? (
              <ContactLine
                icon={<Phone className="size-4" />}
                href={telHref(phone)}
                value={phone}
                copyLabel={tc('copyPhone')}
              />
            ) : (
              <p className="flex items-center gap-2 text-base text-[#062E25]/60">
                <Phone className="size-4 shrink-0" />
                {tl('noPhone')}
              </p>
            )}
            {prospect.contactEmail && (
              <ContactLine
                icon={<Mail className="size-4" />}
                href={`mailto:${prospect.contactEmail}`}
                value={prospect.contactEmail}
                copyLabel={tc('copyEmail')}
              />
            )}
          </div>
          {hasLead && (work.kind || interestLabel || showReason) && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {work.kind && (
                <LeadPill
                  tone={LEAD_KIND_TONE[work.kind]}
                  title={t(leadKindHintKey(work.kind))}
                >
                  {kindLabel}
                </LeadPill>
              )}
              {interestLabel && (
                <LeadPill tone={LEAD_INTEREST_TONE}>{interestLabel}</LeadPill>
              )}
              {showReason && (
                <span className="text-[#062E25]/75">{reasonLabel}</span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-start gap-2 max-sm:[&>*]:w-full xl:max-w-[32.5rem] xl:justify-end">
          {primary()}
          {crmHref && !(hasLead && work.nextStep === 'OPEN_CRM') && (
            <Button
              asChild
              size="lg"
              variant="outline"
              className={OUTLINE_BUTTON}
            >
              <Link href={crmHref}>{t('nextStepButton.OPEN_CRM')}</Link>
            </Button>
          )}
          {showWork && (
            <>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setDialog('call')}
                className={OUTLINE_BUTTON}
              >
                {t('header.logCall')}
              </Button>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="lg"
                    variant="outline"
                    className={OUTLINE_BUTTON}
                  >
                    {t('header.more')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="sales-type-scale w-72 max-w-[calc(100vw-2rem)]"
                  onCloseAutoFocus={event => {
                    if (!keepFocusAfterMenu.current) return
                    keepFocusAfterMenu.current = false
                    event.preventDefault()
                    document
                      .getElementById(LEAD_COMPOSER_TEXT_ID)
                      ?.focus({ preventScroll: true })
                  }}
                >
                  {canReply && !hasDraft && (
                    <DropdownMenuItem
                      onSelect={() => {
                        keepFocusAfterMenu.current = true
                        onWrite()
                      }}
                    >
                      {leadHasCustomerTouch(work)
                        ? t('header.writeReply')
                        : td('composeButton')}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onSelect={() => setActivityKind('MEETING_BOOKED')}
                  >
                    {t('header.meeting')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => setActivityKind('MEETING_HELD')}
                  >
                    {t('header.visit')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => setActivityKind('OFFER_SENT')}
                  >
                    {t('header.offerSent')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={letter.isPending}
                    onSelect={() => letter.mutate()}
                  >
                    {t('header.letter')}
                  </DropdownMenuItem>
                  {(canQualify || canHandOver || canSnooze) && (
                    <DropdownMenuSeparator />
                  )}
                  {canQualify && (
                    <DropdownMenuItem onSelect={() => setActivityKind('QRL')}>
                      {t('header.toQrl')}
                    </DropdownMenuItem>
                  )}
                  {canHandOver && (
                    <DropdownMenuItem onSelect={onPromote}>
                      {t('header.toSales')}
                    </DropdownMenuItem>
                  )}
                  {canSnooze && (
                    <DropdownMenuItem onSelect={() => setDialog('later')}>
                      {t('header.later')}
                    </DropdownMenuItem>
                  )}
                  {decisions && <DropdownMenuSeparator />}
                  {decisions && isHint && (
                    <DropdownMenuItem onSelect={() => setDialog('hintDone')}>
                      {t('header.hintDone')}
                    </DropdownMenuItem>
                  )}
                  {decisions && (
                    <DropdownMenuItem
                      onSelect={() => setDialog('decline')}
                      className="text-red-700 focus:text-red-700"
                    >
                      {t('header.decline')}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>

      {dialog === 'call' && (
        <LeadCallDialog prospect={prospect} onClose={() => setDialog(null)} />
      )}
      {dialog === 'owner' && (
        <LeadOwnerDialog prospect={prospect} onClose={() => setDialog(null)} />
      )}
      {dialog === 'later' && (
        <LeadLaterDialog prospect={prospect} onClose={() => setDialog(null)} />
      )}
      {dialog === 'decline' && (
        <LeadDecisionDialog
          prospect={prospect}
          outcome="NOT_INTERESTED"
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === 'hintDone' && (
        <LeadDecisionDialog
          prospect={prospect}
          outcome="HINT_DONE"
          onClose={() => setDialog(null)}
        />
      )}
      <ActivityDialog
        prospect={prospect}
        kind={activityKind}
        onClose={() => setActivityKind(null)}
      />
    </header>
  )
}
