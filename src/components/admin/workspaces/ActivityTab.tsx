'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { adminWorkspaceService } from '@/services/admin-workspace.service'
import type { WorkspaceDetail } from '@/types/workspace'

interface ActivityTabProps {
  workspace: WorkspaceDetail
}

export function ActivityTab({ workspace }: ActivityTabProps) {
  const t = useTranslations('admin.workspaces')
  const tc = useTranslations('admin.common')

  const activitySummary = (payload: Record<string, unknown>): string | null => {
    if (typeof payload.name === 'string') return payload.name
    if (typeof payload.fileName === 'string') return payload.fileName
    if (typeof payload.level === 'string') {
      const key = `levels.${payload.level}`
      return t.has(key) ? t(key) : payload.level
    }
    return null
  }

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['admin', 'workspaces', workspace.id, 'activity'],
    queryFn: ({ pageParam }) =>
      adminWorkspaceService.activity(workspace.id, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: last => last.nextCursor ?? undefined,
  })

  if (isLoading) {
    return <AdminPageLoader className="h-64" />
  }

  if (isError) {
    return (
      <Card className="border-[#062E25]/10">
        <CardContent className="p-6">
          <p className="text-sm text-red-700">{tc('failedToLoad')}</p>
        </CardContent>
      </Card>
    )
  }

  const items = data?.pages.flatMap(page => page.items) ?? []

  if (items.length === 0) {
    return (
      <Card className="border-[#062E25]/10">
        <CardContent className="p-6">
          <p className="text-sm text-[#062E25]/75">{t('activity.empty')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="border-[#062E25]/10">
        <CardContent className="p-0">
          <ol>
            {items.map(activity => {
              const summary = activitySummary(activity.payload)
              return (
                <li
                  key={activity.id}
                  className="px-4 py-3 border-b border-[#062E25]/5 last:border-0"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-[#062E25]">
                      {t(`activity.types.${activity.type}`)}
                    </p>
                    <span className="text-sm text-[#062E25]/75">
                      {new Date(activity.createdAt).toLocaleString('de-CH')}
                    </span>
                  </div>
                  <p className="text-sm text-[#062E25]/75">
                    {activity.actor
                      ? `${activity.actor.firstName} ${activity.actor.lastName}`
                      : t('activity.system')}
                  </p>
                  {summary && (
                    <p className="text-sm text-[#062E25]">{summary}</p>
                  )}
                </li>
              )
            })}
          </ol>
        </CardContent>
      </Card>
      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {t('activity.loadMore')}
          </Button>
        </div>
      )}
    </div>
  )
}
