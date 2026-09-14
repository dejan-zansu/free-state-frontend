'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, Download, Pencil, Trash2 } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { TaskPriorityBadge } from '@/components/admin/TaskPriorityBadge'
import { TaskStatusBadge } from '@/components/admin/TaskStatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { formatFileSize } from '@/lib/format-file-size'
import { adminTaskService } from '@/services/admin-task.service'
import type {
  InternalTaskActivity,
  InternalTaskAttachment,
  InternalTaskPriority,
  InternalTaskStatus,
  InternalTaskUpdateInput,
  UserLite,
} from '@/types/admin'

const STATUSES: InternalTaskStatus[] = ['OPEN', 'IN_PROGRESS', 'BLOCKED', 'DONE', 'CANCELLED']
const PRIORITIES: InternalTaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']

function fmtDate(value: string): string {
  return new Date(value).toLocaleDateString('de-CH')
}

function fmtDateTime(value: string): string {
  return new Date(value).toLocaleString('de-CH', { dateStyle: 'short', timeStyle: 'short' })
}

function localToday(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export default function AdminTaskDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const locale = useLocale()
  const router = useRouter()
  const t = useTranslations('admin.tasks')
  const tc = useTranslations('admin.common')
  const queryClient = useQueryClient()

  const [saving, setSaving] = useState(false)
  const [headerError, setHeaderError] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const [description, setDescription] = useState('')
  const [descriptionSaved, setDescriptionSaved] = useState(false)
  const [descriptionError, setDescriptionError] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [commentBusy, setCommentBusy] = useState(false)
  const [commentError, setCommentError] = useState<string | null>(null)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [commentDraft, setCommentDraft] = useState('')
  const [uploadBusy, setUploadBusy] = useState(false)
  const [attachmentError, setAttachmentError] = useState<string | null>(null)
  const [showActivity, setShowActivity] = useState(false)
  const [dueDateDraft, setDueDateDraft] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const syncedDescription = useRef<{ id: string; value: string } | null>(null)

  const { data: task, isLoading } = useQuery({
    queryKey: ['admin', 'tasks', 'detail', id],
    queryFn: () => adminTaskService.getById(id),
  })

  const { data: team = [] } = useQuery<UserLite[]>({
    queryKey: ['admin', 'tasks', 'team'],
    queryFn: () => adminTaskService.team(),
  })

  useEffect(() => {
    if (!task) return
    const serverValue = task.description ?? ''
    const synced = syncedDescription.current
    if (!synced || synced.id !== task.id || description === synced.value) {
      setDescription(serverValue)
    }
    syncedDescription.current = { id: task.id, value: serverValue }
  }, [task, description])

  const serverDueDate = task?.dueDate?.slice(0, 10) ?? ''

  useEffect(() => {
    setDueDateDraft(serverDueDate)
  }, [serverDueDate])

  const userName = (user: UserLite | null) =>
    user ? `${user.firstName} ${user.lastName}` : t('detail.unknownUser')

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['admin', 'tasks'] })

  const update = async (
    input: InternalTaskUpdateInput,
    setError: (message: string | null) => void = setHeaderError,
  ) => {
    setSaving(true)
    setError(null)
    try {
      await adminTaskService.update(id, input)
      await invalidate()
      return true
    } catch {
      setError(t('detail.error'))
      return false
    } finally {
      setSaving(false)
    }
  }

  const saveTitle = async () => {
    if (!titleDraft.trim()) return
    const ok = await update({ title: titleDraft.trim() })
    if (ok) setEditingTitle(false)
  }

  const saveDescription = async () => {
    const trimmed = description.trim()
    const ok = await update({ description: trimmed || null }, setDescriptionError)
    if (ok) {
      setDescription(trimmed)
      setDescriptionSaved(true)
    }
  }

  const commitDueDate = () => {
    if (dueDateDraft === serverDueDate) return
    update({ dueDate: dueDateDraft || null })
  }

  const deleteTask = async () => {
    if (!window.confirm(t('detail.confirmDeleteTask'))) return
    setSaving(true)
    setHeaderError(null)
    try {
      await adminTaskService.remove(id)
      queryClient.removeQueries({ queryKey: ['admin', 'tasks', 'detail', id] })
      invalidate()
      router.push(`/${locale}/admin/tasks`)
    } catch {
      setHeaderError(t('detail.error'))
      setSaving(false)
    }
  }

  const addComment = async () => {
    if (!newComment.trim()) return
    setCommentBusy(true)
    setCommentError(null)
    try {
      await adminTaskService.addComment(id, newComment.trim())
      setNewComment('')
      await invalidate()
    } catch {
      setCommentError(t('detail.error'))
    } finally {
      setCommentBusy(false)
    }
  }

  const saveComment = async (commentId: string) => {
    if (!commentDraft.trim()) return
    setCommentBusy(true)
    setCommentError(null)
    try {
      await adminTaskService.updateComment(id, commentId, commentDraft.trim())
      setEditingCommentId(null)
      await invalidate()
    } catch {
      setCommentError(t('detail.error'))
    } finally {
      setCommentBusy(false)
    }
  }

  const deleteComment = async (commentId: string) => {
    if (!window.confirm(t('detail.confirmDeleteComment'))) return
    setCommentBusy(true)
    setCommentError(null)
    try {
      await adminTaskService.deleteComment(id, commentId)
      await invalidate()
    } catch {
      setCommentError(t('detail.error'))
    } finally {
      setCommentBusy(false)
    }
  }

  const uploadFile = async (file: File) => {
    setUploadBusy(true)
    setAttachmentError(null)
    try {
      await adminTaskService.uploadAttachment(id, file)
      await invalidate()
    } catch {
      setAttachmentError(t('detail.uploadError'))
    } finally {
      setUploadBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const downloadFile = async (attachment: InternalTaskAttachment) => {
    setAttachmentError(null)
    try {
      const { blob, fileName } = await adminTaskService.downloadAttachment(
        id,
        attachment.id,
        attachment.fileName,
      )
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch {
      setAttachmentError(t('detail.error'))
    }
  }

  const deleteAttachment = async (attachmentId: string) => {
    if (!window.confirm(t('detail.confirmDeleteAttachment'))) return
    setAttachmentError(null)
    try {
      await adminTaskService.deleteAttachment(id, attachmentId)
      await invalidate()
    } catch {
      setAttachmentError(t('detail.error'))
    }
  }

  const payloadString = (
    payload: Record<string, unknown> | null,
    key: string,
  ): string | null => {
    const value = payload?.[key]
    return typeof value === 'string' ? value : null
  }

  const activityDetail = (activity: InternalTaskActivity): string | null => {
    const from = payloadString(activity.payload, 'from')
    const to = payloadString(activity.payload, 'to')
    switch (activity.type) {
      case 'STATUS_CHANGED': {
        if (!from || !to) return null
        const fromLabel = STATUSES.includes(from as InternalTaskStatus)
          ? t(`statusLabels.${from}`)
          : from
        const toLabel = STATUSES.includes(to as InternalTaskStatus)
          ? t(`statusLabels.${to}`)
          : to
        return `${fromLabel} → ${toLabel}`
      }
      case 'PRIORITY_CHANGED': {
        if (!from || !to) return null
        const fromLabel = PRIORITIES.includes(from as InternalTaskPriority)
          ? t(`priorityLabels.${from}`)
          : from
        const toLabel = PRIORITIES.includes(to as InternalTaskPriority)
          ? t(`priorityLabels.${to}`)
          : to
        return `${fromLabel} → ${toLabel}`
      }
      case 'ASSIGNED': {
        const fromName = payloadString(activity.payload, 'fromUserName')
        const toName = payloadString(activity.payload, 'toUserName') ?? t('unassigned')
        return fromName ? `${fromName} → ${toName}` : toName
      }
      case 'DUE_DATE_CHANGED':
        return `${from ? fmtDate(from) : '-'} → ${to ? fmtDate(to) : '-'}`
      default:
        return null
    }
  }

  if (isLoading) return <AdminPageLoader className="h-64" />

  if (!task) return <p className="text-[#062E25]">{tc('notFound')}</p>

  const overdue =
    !!task.dueDate &&
    task.status !== 'DONE' &&
    task.status !== 'CANCELLED' &&
    task.dueDate.slice(0, 10) < localToday()

  return (
    <div>
      <div className="mb-4">
        <Button
          variant="ghost"
          onClick={() => router.push(`/${locale}/admin/tasks`)}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          {t('detail.back')}
        </Button>
      </div>

      <Card className="border-[#062E25]/10 mb-6">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <p className="font-mono text-sm text-[#062E25]/75">{task.reference}</p>
                <TaskStatusBadge status={task.status} />
                <TaskPriorityBadge priority={task.priority} />
              </div>
              {editingTitle ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={titleDraft}
                    onChange={e => setTitleDraft(e.target.value)}
                    className="max-w-xl"
                  />
                  <Button
                    size="sm"
                    onClick={saveTitle}
                    disabled={saving || !titleDraft.trim()}
                  >
                    {t('detail.save')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingTitle(false)}
                  >
                    {t('detail.cancel')}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-[#062E25]">{task.title}</h1>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t('detail.editTitle')}
                    onClick={() => {
                      setTitleDraft(task.title)
                      setEditingTitle(true)
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <p className="text-sm text-[#062E25]/75 mt-1">
                {t('detail.createdByLine', {
                  name: userName(task.createdBy),
                  date: fmtDate(task.createdAt),
                })}
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={deleteTask}
              disabled={saving}
              className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-1" /> {t('detail.delete')}
            </Button>
          </div>

          {headerError && (
            <p className="text-sm text-destructive mt-3">{headerError}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div>
              <Label className="text-sm text-[#062E25] mb-1 block">
                {t('detail.status')}
              </Label>
              <Select
                value={task.status}
                onValueChange={v => update({ status: v as InternalTaskStatus })}
                disabled={saving}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => (
                    <SelectItem key={s} value={s}>
                      {t(`statusLabels.${s}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm text-[#062E25] mb-1 block">
                {t('detail.priority')}
              </Label>
              <Select
                value={task.priority}
                onValueChange={v => update({ priority: v as InternalTaskPriority })}
                disabled={saving}
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
            <div>
              <Label className="text-sm text-[#062E25] mb-1 block">
                {t('detail.assignee')}
              </Label>
              <Select
                value={task.assignedTo?.id ?? '__none__'}
                onValueChange={v =>
                  update({ assignedToId: v === '__none__' ? null : v })
                }
                disabled={saving}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('unassigned')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">{t('unassigned')}</SelectItem>
                  {team.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.firstName} {member.lastName}
                    </SelectItem>
                  ))}
                  {task.assignedTo &&
                    !team.some(member => member.id === task.assignedTo?.id) && (
                      <SelectItem value={task.assignedTo.id}>
                        {task.assignedTo.firstName} {task.assignedTo.lastName}
                      </SelectItem>
                    )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm text-[#062E25] mb-1 block">
                {t('detail.dueDate')}
              </Label>
              <Input
                type="date"
                value={dueDateDraft}
                onChange={e => setDueDateDraft(e.target.value)}
                onBlur={commitDueDate}
                onKeyDown={e => {
                  if (e.key === 'Enter') e.currentTarget.blur()
                }}
                disabled={saving}
              />
              {task.dueDate && (
                <div className="mt-1 flex items-center gap-2">
                  {overdue && (
                    <span className="text-sm text-red-600 font-medium">
                      {t('overdue')}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setDueDateDraft('')
                      update({ dueDate: null })
                    }}
                    className="text-sm text-[#062E25]/75 hover:text-[#062E25] underline"
                  >
                    {t('detail.clearDueDate')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#062E25]/10 mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-[#062E25] mb-4">
            {t('detail.description')}
          </h2>
          <Textarea
            value={description}
            onChange={e => {
              setDescription(e.target.value)
              setDescriptionSaved(false)
            }}
            rows={5}
            placeholder={t('detail.descriptionPlaceholder')}
            className="mb-2"
          />
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={saveDescription}
              disabled={saving || description === (task.description ?? '')}
              className="bg-[#062E25] hover:bg-[#062E25]/90 text-white"
            >
              {t('detail.save')}
            </Button>
            {descriptionSaved && (
              <span className="text-sm text-green-700">{t('detail.saved')}</span>
            )}
            {descriptionError && (
              <span className="text-sm text-destructive">{descriptionError}</span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#062E25]/10 mb-6">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-[#062E25] mb-4">
            {t('detail.comments')}
          </h2>
          {task.comments.length === 0 ? (
            <p className="text-[#062E25]/75 mb-4">{t('detail.noComments')}</p>
          ) : (
            <ul className="mb-4">
              {task.comments.map(comment => (
                <li
                  key={comment.id}
                  className="py-3 border-b border-[#062E25]/5 last:border-0"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{userName(comment.author)}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#062E25]/75">
                        {fmtDateTime(comment.createdAt)}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingCommentId(comment.id)
                          setCommentDraft(comment.body)
                        }}
                      >
                        {t('detail.edit')}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteComment(comment.id)}
                      >
                        {t('detail.delete')}
                      </Button>
                    </div>
                  </div>
                  {editingCommentId === comment.id ? (
                    <div className="mt-2">
                      <Textarea
                        rows={3}
                        value={commentDraft}
                        onChange={e => setCommentDraft(e.target.value)}
                      />
                      <div className="mt-2 flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingCommentId(null)}
                        >
                          {t('detail.cancel')}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => saveComment(comment.id)}
                          disabled={commentBusy || !commentDraft.trim()}
                        >
                          {t('detail.save')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-[#062E25]/80 mt-1 whitespace-pre-wrap">
                      {comment.body}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
          <Textarea
            rows={3}
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder={t('detail.commentPlaceholder')}
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            {commentError ? (
              <p className="text-sm text-destructive">{commentError}</p>
            ) : (
              <span />
            )}
            <Button onClick={addComment} disabled={commentBusy || !newComment.trim()}>
              {t('detail.addComment')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#062E25]/10 mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#062E25]">
              {t('detail.attachments')}
            </h2>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0]
                if (f) uploadFile(f)
              }}
            />
            <Button onClick={() => fileRef.current?.click()} disabled={uploadBusy}>
              {uploadBusy ? t('detail.uploading') : t('detail.upload')}
            </Button>
          </div>
          {attachmentError && (
            <p className="text-sm text-destructive mb-3">{attachmentError}</p>
          )}
          {task.attachments.length === 0 ? (
            <p className="text-[#062E25]/75">{t('detail.noAttachments')}</p>
          ) : (
            <ul>
              {task.attachments.map(attachment => (
                <li
                  key={attachment.id}
                  className="flex items-center justify-between gap-3 py-3 border-b border-[#062E25]/5 last:border-0"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {attachment.fileName}
                    </p>
                    <p className="text-sm text-[#062E25]/75">
                      {formatFileSize(attachment.sizeBytes)}
                      <span className="ml-2">{userName(attachment.uploadedBy)}</span>
                      <span className="ml-2">{fmtDate(attachment.uploadedAt)}</span>
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => downloadFile(attachment)}
                    >
                      <Download className="h-4 w-4 mr-1" /> {t('detail.download')}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteAttachment(attachment.id)}
                    >
                      {t('detail.delete')}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="border-[#062E25]/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#062E25]">
              {t('detail.activity')}
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowActivity(v => !v)}
            >
              {showActivity ? t('detail.hideActivity') : t('detail.showActivity')}
            </Button>
          </div>
          {showActivity &&
            (task.activities.length === 0 ? (
              <p className="text-[#062E25]/75 mt-4">{t('detail.noActivity')}</p>
            ) : (
              <ul className="mt-4">
                {task.activities.map(activity => {
                  const detail = activityDetail(activity)
                  return (
                    <li
                      key={activity.id}
                      className="py-2 border-b border-[#062E25]/5 last:border-0"
                    >
                      <p className="text-sm text-[#062E25]">
                        <span className="font-medium">
                          {t(`activityLabels.${activity.type}`)}
                        </span>
                        {detail && <span className="ml-2">{detail}</span>}
                      </p>
                      <p className="text-sm text-[#062E25]/75">
                        {userName(activity.actor)} · {fmtDateTime(activity.createdAt)}
                      </p>
                    </li>
                  )
                })}
              </ul>
            ))}
        </CardContent>
      </Card>
    </div>
  )
}
