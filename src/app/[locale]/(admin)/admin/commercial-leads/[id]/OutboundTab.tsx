'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { ExternalLink } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { OutboundEmail, OutboundLeadThread } from '@/types/admin-outreach'

function ThreadEmail({ email }: { email: OutboundEmail }) {
  const t = useTranslations('admin.commercialLeads.outbound')
  const [expanded, setExpanded] = useState(false)
  const inbound = email.direction === 'INBOUND'
  const date = email.sentAt ?? email.receivedAt ?? email.createdAt

  return (
    <li className={cn(
      'p-3 rounded-lg',
      inbound ? 'border border-blue-200 bg-blue-50/60 mr-6' : 'bg-[#062E25]/5 ml-6',
    )}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-medium break-all">
          {inbound ? (email.fromAddress ?? t('inbound')) : email.subject}
        </p>
        <span className="text-[#062E25]/60 whitespace-nowrap">
          {new Date(date).toLocaleString('de-CH')}
        </span>
      </div>
      <p className="text-[#062E25]/75">
        {inbound ? t('inbound') : t('outbound', { step: email.sequenceStep })}
      </p>
      {email.bodyText && (
        <>
          <button onClick={() => setExpanded((v) => !v)} className="text-blue-600 hover:underline mt-1">
            {expanded ? t('showLess') : t('showBody')}
          </button>
          {expanded && (
            <p className="mt-2 whitespace-pre-wrap break-words text-[#062E25]">{email.bodyText}</p>
          )}
        </>
      )}
    </li>
  )
}

export default function OutboundTab({ thread }: { thread: OutboundLeadThread }) {
  const t = useTranslations('admin.commercialLeads.outbound')
  const locale = useLocale()
  const emails = thread.emails.filter((e) => !(e.direction === 'OUTBOUND' && e.status === 'DRAFT'))

  return (
    <Card><CardContent className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <p className="font-mono text-[#062E25]/75">{thread.reference}</p>
        <Link href={`/${locale}/admin/outreach/${thread.id}`}
              className="text-blue-600 hover:underline inline-flex items-center gap-1">
          {t('openProspect')}<ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
      {emails.length === 0 ? (
        <p className="text-[#062E25]/75">{t('noEmails')}</p>
      ) : (
        <ol className="space-y-2">
          {emails.map((e) => <ThreadEmail key={e.id} email={e} />)}
        </ol>
      )}
    </CardContent></Card>
  )
}
