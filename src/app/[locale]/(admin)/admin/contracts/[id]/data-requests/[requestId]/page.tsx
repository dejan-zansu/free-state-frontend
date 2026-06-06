'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import {
  ArrowLeft,
  Check,
  FileIcon,
  MessageSquareWarning,
  X,
} from 'lucide-react'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { dataRequestService } from '@/services/data-request.service'
import type { AdminDataRequestDetail } from '@/types/data-request'

export default function AdminDataRequestDetailPage() {
  const params = useParams()
  const locale = useLocale()
  const router = useRouter()
  const qc = useQueryClient()
  const t = useTranslations('admin.dataRequests')
  const requestId = params.requestId as string
  const contractId = params.id as string

  const [changesNote, setChangesNote] = useState('')
  const [changesOpen, setChangesOpen] = useState(false)

  const { data: request, isLoading } = useQuery<AdminDataRequestDetail>({
    queryKey: ['admin', 'data-request', requestId],
    queryFn: () => dataRequestService.adminGet(requestId),
  })

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['admin', 'data-request', requestId] })
    qc.invalidateQueries({
      queryKey: ['admin', 'data-requests', 'contract', contractId],
    })
  }

  const accept = useMutation({
    mutationFn: () => dataRequestService.adminAccept(requestId),
    onSuccess: invalidate,
  })

  const cancel = useMutation({
    mutationFn: () => dataRequestService.adminCancel(requestId),
    onSuccess: () => {
      invalidate()
      router.push(`/${locale}/admin/contracts/${contractId}`)
    },
  })

  const requestChanges = useMutation({
    mutationFn: () =>
      dataRequestService.adminRequestChanges(requestId, changesNote.trim()),
    onSuccess: () => {
      invalidate()
      setChangesOpen(false)
      setChangesNote('')
    },
  })

  if (isLoading) return <AdminPageLoader className="h-64" />
  if (!request) return <p className="text-[#062E25]/60">{t('notFound')}</p>

  return (
    <div className="max-w-4xl">
      <Link
        href={`/${locale}/admin/contracts/${contractId}`}
        className="inline-flex items-center gap-2 text-sm text-[#062E25]/60 hover:text-[#062E25] mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> {t('backToContract')}
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-[#062E25]">{request.title}</h1>
        <StatusBadge status={request.status} />
      </div>

      {request.description && (
        <p className="text-sm text-[#062E25]/70 mb-4">{request.description}</p>
      )}
      {request.dueDate && (
        <p className="text-sm text-[#062E25]/60 mb-6">
          {t('due', { date: new Date(request.dueDate).toLocaleDateString('de-CH') })}
        </p>
      )}

      <div className="space-y-4 mb-8">
        {request.items.map(item => (
          <Card key={item.id} className="border-[#062E25]/10">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-[#062E25]">{item.label}</h3>
                <span className="text-sm text-[#062E25]/50 uppercase tracking-wide">
                  {t(`itemTypes.${item.type}`)}
                </span>
              </div>
              {item.description && (
                <p className="text-sm text-[#062E25]/60 mb-3">
                  {item.description}
                </p>
              )}

              {(item.type === 'PHOTO' || item.type === 'DOCUMENT') && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(item.fileUrls ?? []).length === 0 && (
                    <p className="col-span-full text-sm text-[#062E25]/40">
                      {t('noFiles')}
                    </p>
                  )}
                  {(item.fileUrls ?? []).map((url, i) => {
                    const isPdf = url.toLowerCase().endsWith('.pdf')
                    if (isPdf) {
                      return (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex flex-col items-center justify-center gap-2 p-4 border border-[#062E25]/10 rounded hover:bg-[#062E25]/5"
                        >
                          <FileIcon className="h-8 w-8 text-[#062E25]/60" />
                          <span className="text-sm text-[#062E25]/70 truncate w-full text-center">
                            {t('document', { index: i + 1 })}
                          </span>
                        </a>
                      )
                    }
                    return (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="relative aspect-square rounded overflow-hidden bg-muted"
                      >
                        <Image
                          src={url}
                          alt=""
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </a>
                    )
                  })}
                </div>
              )}

              {item.type === 'TEXT' && (
                <p className="text-sm text-[#062E25] whitespace-pre-wrap bg-[#062E25]/5 rounded p-3">
                  {item.textValue || (
                    <span className="text-[#062E25]/40">
                      {t('noAnswer')}
                    </span>
                  )}
                </p>
              )}

              {item.type === 'CONFIRMATION' && (
                <p className="text-sm">
                  {item.confirmed === true ? (
                    <span className="inline-flex items-center gap-2 text-green-700">
                      <Check className="h-4 w-4" /> {t('confirmed')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-[#062E25]/40">
                      <X className="h-4 w-4" /> {t('notConfirmed')}
                    </span>
                  )}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {request.status === 'CHANGES_REQUESTED' && request.reviewNote && (
        <Card className="border-yellow-300 bg-yellow-50 mb-6">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <MessageSquareWarning className="h-5 w-5 text-yellow-700 shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-900">
                  {t('changesRequested')}
                </p>
                <p className="text-sm text-yellow-900/80 mt-1">
                  {request.reviewNote}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-3">
        {request.status === 'SUBMITTED' && (
          <>
            <Button onClick={() => accept.mutate()} disabled={accept.isPending}>
              {accept.isPending ? t('accepting') : t('accept')}
            </Button>
            <Button variant="outline" onClick={() => setChangesOpen(true)}>
              {t('requestChanges')}
            </Button>
          </>
        )}
        {(request.status === 'OPEN' ||
          request.status === 'SUBMITTED' ||
          request.status === 'CHANGES_REQUESTED') && (
          <Button
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => cancel.mutate()}
            disabled={cancel.isPending}
          >
            {cancel.isPending ? t('cancelling') : t('cancelRequest')}
          </Button>
        )}
      </div>

      {changesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-semibold text-[#062E25] mb-3">
              {t('requestChangesTitle')}
            </h3>
            <p className="text-sm text-[#062E25]/60 mb-3">
              {t('requestChangesDescription')}
            </p>
            <Textarea
              rows={4}
              value={changesNote}
              onChange={e => setChangesNote(e.target.value)}
              placeholder={t('requestChangesPlaceholder')}
            />
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setChangesOpen(false)}>
                {t('cancel')}
              </Button>
              <Button
                onClick={() => requestChanges.mutate()}
                disabled={requestChanges.isPending || !changesNote.trim()}
              >
                {requestChanges.isPending ? t('sending') : t('send')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
