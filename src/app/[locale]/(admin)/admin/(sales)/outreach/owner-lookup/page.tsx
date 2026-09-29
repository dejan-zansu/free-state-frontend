'use client'

// Owner-lookup queue (doc 69 W2-9, Terravis-ready). An operator claims the
// next parcels of a canton, looks each up by hand in the Terravis web UI (or
// a cantonal portal), and captures the extract here by paste, PDF drop or
// form. The server resolves it deterministically into owner rows, tenant
// flags and letters. This page only shows portal links, it never calls
// Terravis or a cantonal portal.

import { useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { ChevronLeft } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ownerLookupService } from '@/services/outreach/owner-lookup.service'
import type { ClaimSource } from '@/types/outreach/owner-lookup'

import { CantonCards } from '../_components/owner-first/owner-lookup/CantonCards'
import { ClaimedBatch } from '../_components/owner-first/owner-lookup/ClaimedBatch'
import { apiErrorCode } from '../_components/owner-first/owner-lookup/format'
import { LookupStatsPanel } from '../_components/owner-first/owner-lookup/LookupStatsPanel'
import { LookupTable } from '../_components/owner-first/owner-lookup/LookupLists'
import { OperatorsAdmin } from '../_components/owner-first/owner-lookup/OperatorsAdmin'

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-semibold text-[#062E25]/75 uppercase tracking-wide mb-3">
      {children}
    </h2>
  )
}

export default function AdminOutreachOwnerLookupPage() {
  const locale = useLocale()
  const t = useTranslations('admin.outreach.ownerLookup')
  const queryClient = useQueryClient()
  const [canton, setCanton] = useState<string | null>(null)
  const [claiming, setClaiming] = useState<string | null>(null)

  const queue = useQuery({
    queryKey: ['admin', 'outreach', 'owner-lookup', 'queue', canton],
    queryFn: () => ownerLookupService.getQueue(canton),
    refetchInterval: 60_000,
  })
  const stats = useQuery({
    queryKey: ['admin', 'outreach', 'owner-lookup', 'stats'],
    queryFn: () => ownerLookupService.getStats(30),
  })

  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: ['admin', 'outreach', 'owner-lookup'],
    })

  const claim = useMutation({
    mutationFn: (input: { canton: string; source: ClaimSource }) =>
      ownerLookupService.claim(input),
    onMutate: input => setClaiming(`${input.canton}:${input.source}`),
    onSuccess: data => {
      if (data.claimedIds.length === 0) toast.error(t('claimNothing'))
      else toast.success(t('claimDone', { count: data.claimedIds.length }))
      refresh()
    },
    onError: error => {
      const code = apiErrorCode(error)
      const key = code ? `errors.${code}` : null
      toast.error(key && t.has(key) ? t(key) : t('errors.generic'))
    },
    onSettled: () => setClaiming(null),
  })

  const view = queue.data

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <h1 className="text-2xl font-bold text-[#062E25]">{t('title')}</h1>
        <Button variant="outline" asChild className="gap-2">
          <Link href={`/${locale}/admin/outreach`}>
            <ChevronLeft className="w-4 h-4" />
            {t('backToList')}
          </Link>
        </Button>
      </div>
      <p className="mb-4 text-[#062E25]/75 max-w-3xl">{t('intro')}</p>

      {queue.isLoading ? (
        <AdminPageLoader />
      ) : queue.isError || !view ? (
        <p className="mb-6 p-3 rounded bg-red-50 text-red-700">
          {t('loadFailed')}
        </p>
      ) : (
        <>
          {!view.operator && (
            <p className="mb-4 p-3 rounded bg-amber-50 text-amber-800">
              {t('noOperator')}
            </p>
          )}
          {view.operator && !view.operator.active && (
            <p className="mb-4 p-3 rounded bg-amber-50 text-amber-800">
              {t('operatorInactive')}
            </p>
          )}
          {view.operator && (
            <p className="mb-4 text-[#062E25]/75">
              {t('operatorLabel', { label: view.operator.terravisUserLabel })}
            </p>
          )}

          <CantonCards
            cards={view.cards}
            selected={canton}
            isOperator={Boolean(view.operator?.active)}
            claiming={claiming}
            onSelect={setCanton}
            onClaim={(code, source) => claim.mutate({ canton: code, source })}
          />

          <SectionTitle>{t('claimedTitle')}</SectionTitle>
          <ClaimedBatch items={view.claimed} onDone={refresh} />

          {canton && (
            <Card className="border-[#062E25]/10 mb-6">
              <CardContent className="p-4">
                <SectionTitle>{t('queueTitle', { canton })}</SectionTitle>
                <LookupTable items={view.queuePreview} mode="queued" />
              </CardContent>
            </Card>
          )}

          <Card className="border-[#062E25]/10 mb-6">
            <CardContent className="p-4">
              <SectionTitle>{t('doneTitle')}</SectionTitle>
              <LookupTable items={view.doneToday} mode="done" />
            </CardContent>
          </Card>
        </>
      )}

      <Card className="border-[#062E25]/10 mb-6">
        <CardContent className="p-4">
          <SectionTitle>{t('statsTitle')}</SectionTitle>
          {stats.data ? (
            <LookupStatsPanel stats={stats.data} />
          ) : stats.isLoading ? (
            <AdminPageLoader />
          ) : (
            <p className="text-red-700">{t('loadFailed')}</p>
          )}
          {stats.data && (
            <p className="mt-2 text-[#062E25]/60">
              {t(`gbix.${stats.data.gbix}`)}
            </p>
          )}
        </CardContent>
      </Card>

      {view?.isAdmin && (
        <Card className="border-[#062E25]/10 mb-6">
          <CardContent className="p-4">
            <SectionTitle>{t('operators.title')}</SectionTitle>
            <OperatorsAdmin />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
