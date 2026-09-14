'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { CreateWorkspaceDialog } from '@/components/admin/workspaces/CreateWorkspaceDialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAdminQuery } from '@/hooks/use-admin-query'
import { useHasCapability } from '@/lib/capabilities'
import { adminWorkspaceService } from '@/services/admin-workspace.service'
import type { ListQuery } from '@/types/admin'
import type { WorkspaceListItem } from '@/types/workspace'

const VIEWS = ['all', 'mine', 'archived'] as const

function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export default function AdminWorkspacesPage() {
  const locale = useLocale()
  const t = useTranslations('admin.workspaces')
  const tc = useTranslations('admin.common')
  const canCreate = useHasCapability('projects.create')
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetcher = (q: ListQuery) => {
    const view = (q.view as string) || 'all'
    const query: Record<string, string | number | undefined> = {
      page: q.page,
      limit: q.limit,
      search: q.search as string | undefined,
    }
    if (view === 'mine') query.mine = 'true'
    if (view === 'archived') query.status = 'ARCHIVED'
    return adminWorkspaceService.list(query)
  }

  const {
    data,
    isLoading,
    error,
    page,
    totalPages,
    setPage,
    setSearch,
    setFilter,
    filters,
  } = useAdminQuery<WorkspaceListItem>('workspaces', fetcher, {
    initialFilters: { view: 'all' },
  })

  const view = filters.view ?? 'all'

  const changeView = (v: string) => {
    setFilter('view', v)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#062E25]">{t('title')}</h1>
        {canCreate && (
          <Button
            onClick={() => setDialogOpen(true)}
            className="bg-[#062E25] hover:bg-[#062E25]/90 text-white"
          >
            <Plus className="h-4 w-4 mr-1" /> {t('create')}
          </Button>
        )}
      </div>

      <Tabs value={view} onValueChange={changeView} className="mb-4">
        <TabsList>
          {VIEWS.map(v => (
            <TabsTrigger key={v} value={v}>
              {t(`tabs.${v}`)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card className="border-[#062E25]/10">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Input
              placeholder={t('searchPlaceholder')}
              className="max-w-xs"
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {isLoading ? (
            <AdminPageLoader />
          ) : error ? (
            <p className="text-center py-8 text-sm text-destructive">
              {tc('failedToLoad')}
            </p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('columns.number')}</TableHead>
                    <TableHead>{t('columns.name')}</TableHead>
                    <TableHead>{t('columns.address')}</TableHead>
                    <TableHead>{t('columns.members')}</TableHead>
                    <TableHead>{t('columns.lastActivity')}</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map(workspace => (
                    <TableRow key={workspace.id}>
                      <TableCell className="font-mono text-sm text-[#062E25]/75">
                        {workspace.number}
                      </TableCell>
                      <TableCell className="font-medium text-[#062E25]">
                        {workspace.name}
                      </TableCell>
                      <TableCell className="text-sm text-[#062E25]/75">
                        {workspace.siteAddress || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center -space-x-2">
                          {workspace.members.slice(0, 3).map(member => (
                            <span
                              key={member.id}
                              title={`${member.user.firstName} ${member.user.lastName}`}
                              className="flex h-6 w-6 items-center justify-center rounded-full bg-[#062E25]/10 text-xs font-medium text-[#062E25] ring-2 ring-white"
                            >
                              {initials(
                                member.user.firstName,
                                member.user.lastName
                              )}
                            </span>
                          ))}
                          {workspace.members.length > 3 && (
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#062E25]/5 text-xs font-medium text-[#062E25]/75 ring-2 ring-white">
                              +{workspace.members.length - 3}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-[#062E25]/75">
                        {workspace.activities[0]
                          ? new Date(
                              workspace.activities[0].createdAt
                            ).toLocaleDateString('de-CH')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Button asChild variant="outline" size="sm">
                          <Link
                            href={`/${locale}/admin/workspaces/${workspace.id}`}
                          >
                            {t('open')}
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {data.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-[#062E25]/75"
                      >
                        {t('empty')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="flex items-center justify-end mt-4 pt-4 border-t border-[#062E25]/10">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                    aria-label={t('previousPage')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-[#062E25]/75">
                    {tc('page', { page, totalPages })}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                    aria-label={t('nextPage')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <CreateWorkspaceDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
