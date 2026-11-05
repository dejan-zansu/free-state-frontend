'use client'

import { useTranslations } from 'next-intl'

import { formatLeadDate } from '@/lib/outbound-lead-work'
import type { OutboundProspectDetail } from '@/types/admin-outreach'

import { leadMailSender } from './lead-shared'

export function LeadDraftContext({
  prospect,
}: {
  prospect: OutboundProspectDetail
}) {
  const t = useTranslations('admin.outreach.work')
  const draft = prospect.work.draft
  if (!draft) return null
  const answered = draft.answersEmailId
    ? prospect.emails.find(email => email.id === draft.answersEmailId)
    : null

  return (
    <>
      {draft.stale && (
        <p className="font-semibold text-amber-800">{t('draft.stale')}</p>
      )}
      {answered && (
        <div>
          <p className="text-[#062E25]/75">
            {t('draft.answers', {
              who: leadMailSender(prospect, answered),
              date: formatLeadDate(answered.receivedAt ?? answered.createdAt),
            })}
          </p>
          <p className="mt-1 max-h-60 overflow-y-auto whitespace-pre-wrap break-words rounded-xl bg-white px-3.5 py-3 text-base text-[#062E25]">
            {answered.bodyText}
          </p>
        </div>
      )}
    </>
  )
}
