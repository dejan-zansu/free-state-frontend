'use client'

import Link from 'next/link'
import { useLocale } from 'next-intl'
import { useParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { ArrowLeft, MessageSquareWarning } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageLoader } from '@/components/ui/page-loader'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { DataRequestItemInput } from '@/components/dashboard/DataRequestItemInput'
import { dataRequestService } from '@/services/data-request.service'
import type { DataRequest, DataRequestItem } from '@/types/data-request'

const isComplete = (item: DataRequestItem): boolean => {
  if (!item.required) return true
  if (item.type === 'PHOTO' || item.type === 'DOCUMENT') {
    const urls = item.fileUrls ?? []
    const min = item.minCount ?? 1
    return urls.length >= min
  }
  if (item.type === 'TEXT') return Boolean(item.textValue && item.textValue.trim().length > 0)
  if (item.type === 'CONFIRMATION') return item.confirmed === true
  return false
}

export default function CustomerRequestDetailPage() {
  const locale = useLocale()
  const params = useParams()
  const id = params.id as string
  const qc = useQueryClient()
  const [local, setLocal] = useState<DataRequest | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { data, isLoading } = useQuery<DataRequest>({
    queryKey: ['me', 'data-request', id],
    queryFn: () => dataRequestService.customerGet(id),
  })

  useEffect(() => {
    if (data) setLocal(data)
  }, [data])

  const submit = useMutation({
    mutationFn: () => dataRequestService.customerSubmit(id),
    onSuccess: () => {
      setSubmitError(null)
      qc.invalidateQueries({ queryKey: ['me', 'data-request', id] })
      qc.invalidateQueries({ queryKey: ['me', 'data-requests'] })
    },
    onError: (err: unknown) => {
      setSubmitError(err instanceof Error ? err.message : 'Submit failed')
    },
  })

  if (isLoading || !local) return <PageLoader />

  const editable = local.status === 'OPEN' || local.status === 'CHANGES_REQUESTED'
  const allComplete = local.items.every(isComplete)

  const patchItem = (itemId: string, patch: Partial<DataRequestItem>) => {
    setLocal((prev) =>
      prev
        ? { ...prev, items: prev.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)) }
        : prev
    )
  }

  return (
    <div className="max-w-3xl">
      <Link
        href={`/${locale}/dashboard/requests`}
        className="inline-flex items-center gap-2 text-sm text-[#062E25]/60 hover:text-[#062E25] mb-4"
      >
        <ArrowLeft className="h-4 w-4" /> Back to requests
      </Link>

      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-2xl font-bold text-[#062E25]">{local.title}</h1>
        <StatusBadge status={local.status} />
      </div>
      {local.description && (
        <p className="text-[#062E25]/70 mb-2">{local.description}</p>
      )}
      {local.dueDate && (
        <p className="text-sm text-[#062E25]/60 mb-4">
          Due {new Date(local.dueDate).toLocaleDateString('de-CH')}
        </p>
      )}

      {local.status === 'CHANGES_REQUESTED' && local.reviewNote && (
        <Card className="border-yellow-300 bg-yellow-50 mb-6">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <MessageSquareWarning className="h-5 w-5 text-yellow-700 shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-900">The team left a note</p>
                <p className="text-sm text-yellow-900/80 mt-1">{local.reviewNote}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {local.status === 'SUBMITTED' && (
        <Card className="border-blue-200 bg-blue-50 mb-6">
          <CardContent className="p-4 text-sm text-blue-900">
            Your submission is being reviewed. You will get an email when it is accepted or if
            changes are needed.
          </CardContent>
        </Card>
      )}

      <div className="space-y-3 mb-8">
        {local.items.map((item) => (
          <DataRequestItemInput
            key={item.id}
            requestId={id}
            item={item}
            disabled={!editable}
            onChange={(patch) => patchItem(item.id, patch)}
          />
        ))}
      </div>

      {editable && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-[#062E25]/60">
            {allComplete
              ? 'All required items are filled. You can submit.'
              : 'Fill all required items to enable submit.'}
          </p>
          <Button
            onClick={() => submit.mutate()}
            disabled={!allComplete || submit.isPending}
          >
            {submit.isPending ? 'Submitting…' : 'Submit'}
          </Button>
        </div>
      )}
      {submitError && <p className="text-sm text-red-600 mt-3">{submitError}</p>}
    </div>
  )
}
