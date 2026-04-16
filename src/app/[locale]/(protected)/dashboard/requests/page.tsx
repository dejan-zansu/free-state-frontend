'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight } from 'lucide-react'

import { PageLoader } from '@/components/ui/page-loader'
import { Card, CardContent } from '@/components/ui/card'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { dataRequestService } from '@/services/data-request.service'
import type { DataRequestListItem } from '@/types/data-request'

const groupTitle: Record<'action' | 'waiting' | 'closed', string> = {
  action: 'Action required',
  waiting: 'Awaiting review',
  closed: 'Closed',
}

const bucket = (s: DataRequestListItem): 'action' | 'waiting' | 'closed' => {
  if (s.status === 'OPEN' || s.status === 'CHANGES_REQUESTED') return 'action'
  if (s.status === 'SUBMITTED') return 'waiting'
  return 'closed'
}

export default function CustomerRequestsPage() {
  const locale = useLocale()
  const { data: items = [], isLoading } = useQuery<DataRequestListItem[]>({
    queryKey: ['me', 'data-requests'],
    queryFn: () => dataRequestService.customerList(),
  })

  if (isLoading) return <PageLoader />

  const groups: Record<'action' | 'waiting' | 'closed', DataRequestListItem[]> = {
    action: [],
    waiting: [],
    closed: [],
  }
  for (const it of items) groups[bucket(it)].push(it)

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-[#062E25] mb-1">Requests</h1>
      <p className="text-[#062E25]/60 mb-8">Data the Free State team has asked you for.</p>

      {(['action', 'waiting', 'closed'] as const).map((k) =>
        groups[k].length === 0 ? null : (
          <div key={k} className="mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-[#062E25]/50 mb-2">
              {groupTitle[k]}
            </h2>
            <div className="space-y-2">
              {groups[k].map((r) => (
                <Link
                  key={r.id}
                  href={`/${locale}/dashboard/requests/${r.id}`}
                  className="block"
                >
                  <Card className="border-[#062E25]/10 hover:border-[#062E25]/30 transition-colors">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[#062E25]">{r.title}</p>
                        <p className="text-xs text-[#062E25]/50">
                          {new Date(r.createdAt).toLocaleDateString('de-CH')}
                          {r.dueDate &&
                            ` · due ${new Date(r.dueDate).toLocaleDateString('de-CH')}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
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

      {items.length === 0 && (
        <Card className="border-[#062E25]/10">
          <CardContent className="p-6 text-center text-[#062E25]/60">
            You have no data requests.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
