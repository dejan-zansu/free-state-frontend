'use client'

import { useQuery } from '@tanstack/react-query'

import { INBOX_POLL_MS, INBOX_SUMMARY_QUERY_KEY } from '@/lib/outbound-inbox'
import { cn } from '@/lib/utils'
import { outreachInboxService } from '@/services/outreach/inbox.service'

export function InboxNavBadge() {
  const { data } = useQuery({
    queryKey: INBOX_SUMMARY_QUERY_KEY,
    queryFn: () => outreachInboxService.summary(),
    refetchInterval: INBOX_POLL_MS,
  })

  if (!data || data.waiting === 0) return null

  return (
    <span
      className={cn(
        'ml-auto inline-flex min-w-6 items-center justify-center rounded-full px-1.5 text-base font-semibold',
        data.late > 0
          ? 'bg-red-600 text-white'
          : 'bg-[#062E25]/10 text-[#062E25]'
      )}
    >
      {data.waiting}
    </span>
  )
}
