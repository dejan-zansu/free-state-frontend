'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { dataRequestService } from '@/services/data-request.service'
import type { DataRequestListItem } from '@/types/data-request'

export function DataRequestActionRequiredCard() {
  const locale = useLocale()
  const { data: items = [] } = useQuery<DataRequestListItem[]>({
    queryKey: ['me', 'data-requests'],
    queryFn: () => dataRequestService.customerList(),
  })

  const pending = items.filter(
    (i) => i.status === 'OPEN' || i.status === 'CHANGES_REQUESTED'
  )
  if (pending.length === 0) return null

  return (
    <Card className="border-amber-200 bg-amber-50 mb-6">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-amber-900">
              {pending.length === 1
                ? '1 request needs your attention'
                : `${pending.length} requests need your attention`}
            </p>
            <ul className="text-sm text-amber-900/80 mt-1 space-y-0.5">
              {pending.slice(0, 3).map((r) => (
                <li key={r.id}>· {r.title}</li>
              ))}
              {pending.length > 3 && <li>· and {pending.length - 3} more</li>}
            </ul>
          </div>
          <Button
            asChild
            size="sm"
            className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
          >
            <Link href={`/${locale}/dashboard/requests`}>
              Open <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
