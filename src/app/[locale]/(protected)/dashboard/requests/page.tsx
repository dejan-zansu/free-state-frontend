'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, Inbox } from 'lucide-react'

import { PageLoader } from '@/components/ui/page-loader'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { dataRequestService } from '@/services/data-request.service'
import type { DataRequestListItem } from '@/types/data-request'

const groupTitleKey: Record<'action' | 'waiting' | 'closed', string> = {
  action: 'groupAction',
  waiting: 'groupWaiting',
  closed: 'groupClosed',
}

const bucket = (s: DataRequestListItem): 'action' | 'waiting' | 'closed' => {
  if (s.status === 'OPEN' || s.status === 'CHANGES_REQUESTED') return 'action'
  if (s.status === 'SUBMITTED') return 'waiting'
  return 'closed'
}

export default function CustomerRequestsPage() {
  const locale = useLocale()
  const t = useTranslations('dashboard.requests')
  const { data: items = [], isLoading } = useQuery<DataRequestListItem[]>({
    queryKey: ['me', 'data-requests'],
    queryFn: () => dataRequestService.customerList(),
  })

  if (isLoading) return <PageLoader />

  const groups: Record<'action' | 'waiting' | 'closed', DataRequestListItem[]> =
    {
      action: [],
      waiting: [],
      closed: [],
    }
  for (const it of items) groups[bucket(it)].push(it)

  if (items.length === 0) {
    return (
      <div className="max-w-5xl">
        <h1 className="text-2xl font-bold text-[#062E25] mb-8">{t('title')}</h1>
        <Card className="border-[#062E25]/10">
          <CardContent className="p-8 text-center">
            <Inbox className="h-12 w-12 text-[#062E25]/20 mx-auto mb-4" />
            <p className="text-[#062E25]/60 mb-2">{t('empty')}</p>
            <p className="text-sm text-[#062E25]/40">{t('emptyHelp')}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-[#062E25] mb-1">{t('title')}</h1>
      <p className="text-[#062E25]/60 mb-8">{t('subtitle')}</p>

      {(['action', 'waiting', 'closed'] as const).map(k =>
        groups[k].length === 0 ? null : (
          <div key={k} className="mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#062E25]/50 mb-2">
              {t(groupTitleKey[k])}
            </h2>
            <div className="space-y-2">
              {groups[k].map(r => (
                <Link
                  key={r.id}
                  href={`/${locale}/dashboard/requests/${r.id}`}
                  className="block"
                >
                  <Card className="border-[#062E25]/10 hover:border-[#062E25]/30 transition-colors">
                    <CardContent className="p-4 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-[#062E25] truncate">
                          {r.title}
                        </p>
                        <p className="text-sm text-[#062E25]/50">
                          {new Date(r.createdAt).toLocaleDateString('de-CH')}
                          {r.dueDate &&
                            ` · ${t('due', { date: new Date(r.dueDate).toLocaleDateString('de-CH') })}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <StatusBadge status={r.status} />
                        <ArrowRight className="h-4 w-4 text-[#062E25]/40" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  )
}
