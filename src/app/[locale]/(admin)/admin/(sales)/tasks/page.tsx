'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, MessageSquare, Paperclip, Plus } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { TaskPriorityBadge } from '@/components/admin/TaskPriorityBadge'
import { TaskStatusBadge } from '@/components/admin/TaskStatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useAdminQuery } from '@/hooks/use-admin-query'
import { adminTaskService } from '@/services/admin-task.service'
import { useUser } from '@/stores/auth.store'
import type {
  InternalTaskCreateInput,
  InternalTaskListQuery,
  InternalTaskPriority,
  InternalTaskStatus,
  ListQuery,
  UserLite,
} from '@/types/admin'

const OPEN_STATUSES: InternalTaskStatus[] = ['OPEN', 'IN_PROGRESS', 'BLOCKED']
const STATUSES: InternalTaskStatus[] = ['OPEN', 'IN_PROGRESS', 'BLOCKED', 'DONE', 'CANCELLED']
const PRIORITIES: InternalTaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
const VIEWS = ['mine', 'open', 'createdByMe', 'done', 'all'] as const

function localToday(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function isOverdue(dueDate: string | null, status: InternalTaskStatus): boolean {
  if (!dueDate) return false
  if (status === 'DONE' || status === 'CANCELLED') return false
  return dueDate.slice(0, 10) < localToday()
}

export default function AdminTasksPage() {
  const locale = useLocale()
  const t = useTranslations('admin.tasks')
  const tc = useTranslations('admin.common')
  const user = useUser()
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: team = [] } = useQuery<UserLite[]>({
    queryKey: ['admin', 'tasks', 'team'],
    queryFn: () => adminTaskService.team(),
  })

  const fetcher = (q: ListQuery) => {
    const view = (q.view as string) || 'mine'
    const query: InternalTaskListQuery = {
      page: q.page,
      limit: q.limit,
      search: q.search as string | undefined,
    }
    if (q.priority) query.priority = q.priority as InternalTaskPriority
    if (q.assignee) query.assignedToId = q.assignee as string
    if (view === 'mine') {
      query.status = OPEN_STATUSES
      query.assignedToId = user?.id
    } else if (view === 'open') {
      query.status = OPEN_STATUSES
    } else if (view === 'createdByMe') {
      query.createdById = user?.id
    } else if (view === 'done') {
      query.status = ['DONE']
    } else if (q.status) {
      query.status = [q.status as InternalTaskStatus]
    }
    return adminTaskService.list(query)
  }

  const {
    data,
    isLoading,
    page,
    totalPages,
    total,
    setPage,
    setSearch,
    setFilter,
    filters,
  } = useAdminQuery('tasks', fetcher, { initialFilters: { view: 'mine' } })

  const view = filters.view ?? 'mine'

  const changeView = (v: string) => {
    setFilter('view', v)
    if (v !== 'all') setFilter('status', undefined)
    if (v === 'mine') setFilter('assignee', undefined)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#062E25]">{t('title')}</h1>
        <Button
          onClick={() => setDialogOpen(true)}
          className="bg-[#062E25] hover:bg-[#062E25]/90 text-white"
        >
          <Plus className="h-4 w-4 mr-1" /> {t('newTask')}
        </Button>
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
            <Select
              value={filters.priority ?? '__all__'}
              onValueChange={v =>
                setFilter('priority', v === '__all__' ? undefined : v)
              }
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder={t('allPriorities')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">{t('allPriorities')}</SelectItem>
                {PRIORITIES.map(p => (
                  <SelectItem key={p} value={p}>
                    {t(`priorityLabels.${p}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {view !== 'mine' && (
              <Select
                value={filters.assignee ?? '__all__'}
                onValueChange={v =>
                  setFilter('assignee', v === '__all__' ? undefined : v)
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder={t('allAssignees')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">{t('allAssignees')}</SelectItem>
                  {team.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.firstName} {member.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {view === 'all' && (
              <Select
                value={filters.status ?? '__all__'}
                onValueChange={v =>
                  setFilter('status', v === '__all__' ? undefined : v)
                }
              >
                <SelectTrigger className="w-44">
                  <SelectValue placeholder={t('allStatuses')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">{t('allStatuses')}</SelectItem>
                  {STATUSES.map(s => (
                    <SelectItem key={s} value={s}>
                      {t(`statusLabels.${s}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {isLoading ? (
            <AdminPageLoader />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('columns.reference')}</TableHead>
                    <TableHead>{t('columns.title')}</TableHead>
                    <TableHead>{t('columns.assignee')}</TableHead>
                    <TableHead>{t('columns.priority')}</TableHead>
                    <TableHead>{t('columns.status')}</TableHead>
                    <TableHead>{t('columns.dueDate')}</TableHead>
                    <TableHead />
                    <TableHead>{t('columns.updated')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map(task => (
                    <TableRow key={task.id}>
                      <TableCell className="font-mono text-sm text-[#062E25]/75">
                        {task.reference}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/${locale}/admin/tasks/${task.id}`}
                          className="font-medium text-[#062E25] hover:underline"
                        >
                          {task.title}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {task.assignedTo
                          ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
                          : t('unassigned')}
                      </TableCell>
                      <TableCell>
                        <TaskPriorityBadge priority={task.priority} />
                      </TableCell>
                      <TableCell>
                        <TaskStatusBadge status={task.status} />
                      </TableCell>
                      <TableCell>
                        {task.dueDate ? (
                          isOverdue(task.dueDate, task.status) ? (
                            <span className="text-red-600 font-medium">
                              {new Date(task.dueDate).toLocaleDateString('de-CH')}{' '}
                              ({t('overdue')})
                            </span>
                          ) : (
                            new Date(task.dueDate).toLocaleDateString('de-CH')
                          )
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-sm text-[#062E25]/75">
                          <MessageSquare className="h-3.5 w-3.5" />
                          {task._count.comments}
                          <Paperclip className="h-3.5 w-3.5 ml-2" />
                          {task._count.attachments}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-[#062E25]/75">
                        {new Date(task.updatedAt).toLocaleDateString('de-CH')}
                      </TableCell>
                    </TableRow>
                  ))}
                  {data.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-[#062E25]/75"
                      >
                        {t('noTasks')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#062E25]/10">
                <p className="text-sm text-[#062E25]/75">
                  {t('items', { count: total })}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
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
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <NewTaskDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        team={team}
        meId={user?.id}
      />
    </div>
  )
}

function NewTaskDialog({
  open,
  onClose,
  team,
  meId,
}: {
  open: boolean
  onClose: () => void
  team: UserLite[]
  meId: string | undefined
}) {
  const locale = useLocale()
  const router = useRouter()
  const t = useTranslations('admin.tasks')
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assigneeId, setAssigneeId] = useState('__none__')
  const [priority, setPriority] = useState<InternalTaskPriority>('MEDIUM')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setTitle('')
      setDescription('')
      setAssigneeId(meId ?? '__none__')
      setPriority('MEDIUM')
      setDueDate('')
      setError(null)
    }
  }, [open, meId])

  const mutation = useMutation({
    mutationFn: (input: InternalTaskCreateInput) => adminTaskService.create(input),
    onSuccess: task => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tasks'] })
      onClose()
      router.push(`/${locale}/admin/tasks/${task.id}`)
    },
    onError: () => {
      setError(t('dialog.errorCreateFailed'))
    },
  })

  const onSubmit = () => {
    setError(null)
    if (!title.trim()) {
      setError(t('dialog.errorTitleRequired'))
      return
    }
    mutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate || undefined,
      assignedToId: assigneeId === '__none__' ? undefined : assigneeId,
    })
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-[#062E25]">
            {t('dialog.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="task-title">{t('dialog.titleLabel')}</Label>
            <Input
              id="task-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={t('dialog.titlePlaceholder')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-desc">{t('dialog.descriptionLabel')}</Label>
            <Textarea
              id="task-desc"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{t('dialog.assigneeLabel')}</Label>
              <Select value={assigneeId} onValueChange={setAssigneeId}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">{t('unassigned')}</SelectItem>
                  {team.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.firstName} {member.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t('dialog.priorityLabel')}</Label>
              <Select
                value={priority}
                onValueChange={v => setPriority(v as InternalTaskPriority)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map(p => (
                    <SelectItem key={p} value={p}>
                      {t(`priorityLabels.${p}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-due">{t('dialog.dueDateLabel')}</Label>
            <Input
              id="task-due"
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              className="w-48"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t('dialog.cancel')}
          </Button>
          <Button onClick={onSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? t('dialog.creating') : t('dialog.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
