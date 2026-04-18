'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { activityLabel } from '@/lib/commercial-lead-labels'
import type { CommercialLeadActivity } from '@/types/commercial-lead'

export default function ActivityTab({ activities }: { activities: CommercialLeadActivity[] }) {
  const t = useTranslations('admin.commercialLeads.detail')
  if (activities.length === 0) {
    return <Card><CardContent className="p-6 text-[#062E25]/50">{t('noActivity')}</CardContent></Card>
  }
  return (
    <Card><CardContent className="p-0">
      <ol>
        {activities.map((a) => (
          <li key={a.id} className="px-4 py-3 border-b border-[#062E25]/5 last:border-0">
            <div className="flex items-center justify-between">
              <p className="font-medium">{activityLabel[a.type]}</p>
              <span className="text-sm text-[#062E25]/50">{new Date(a.createdAt).toLocaleString('de-CH')}</span>
            </div>
            {a.actor && (
              <p className="text-sm text-[#062E25]/60">{a.actor.firstName} {a.actor.lastName}</p>
            )}
            {a.payload && Object.keys(a.payload).length > 0 && (
              <pre className="mt-1 text-sm text-[#062E25]/60 whitespace-pre-wrap">{JSON.stringify(a.payload, null, 2)}</pre>
            )}
          </li>
        ))}
      </ol>
    </CardContent></Card>
  )
}
