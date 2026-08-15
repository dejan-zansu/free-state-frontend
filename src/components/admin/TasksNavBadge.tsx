'use client'

import { useQuery } from '@tanstack/react-query'

import { cn } from '@/lib/utils'
import { adminTaskService } from '@/services/admin-task.service'

export function TasksNavBadge() {
  const { data } = useQuery({
    queryKey: ['admin', 'tasks', 'summary'],
    queryFn: () => adminTaskService.summary(),
    refetchInterval: 60000,
  })

  if (!data || data.myOpen === 0) return null

  return (
    <span
      className={cn(
        'ml-auto inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold',
        data.myOverdue > 0 ? 'bg-red-600 text-white' : 'bg-[#062E25]/10 text-[#062E25]'
      )}
    >
      {data.myOpen}
    </span>
  )
}
