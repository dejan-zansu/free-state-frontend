'use client'

// Phone directory flag (doc 69 W1-9b) on the prospect detail page. Cold calls
// go only to numbers listed in the directory without the star, and the call
// queue's listed-only filter reads this flag. Saved through PATCH
// /prospects/:id (adminOutreachService.updateProspect).

import { useTranslations } from 'next-intl'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { adminOutreachService } from '@/services/admin-outreach.service'
import type { OutboundProspectDetail } from '@/types/admin-outreach'

export function CallFlagControl({
  prospect,
}: {
  prospect: OutboundProspectDetail
}) {
  const t = useTranslations('admin.outreach.callFlag')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (listedNoStar: boolean) =>
      adminOutreachService.updateProspect(prospect.id, {
        directoryListedNoStar: listedNoStar,
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['admin', 'outreach'] }),
  })

  // Without a number there is nothing to look up.
  if (!prospect.contactPhone) return null

  const state = prospect.directoryListedNoStar
  const stateLabel =
    state === true
      ? t('listedNoStar')
      : state === false
        ? t('starOrNotListed')
        : t('unchecked')

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-[#062E25]/75 uppercase tracking-wide">
              {t('title')}
            </h3>
            <p className="mt-1 text-[#062E25]">
              <a
                href={`tel:${prospect.contactPhone.replace(/\s/g, '')}`}
                className="tabular-nums underline underline-offset-2"
              >
                {prospect.contactPhone}
              </a>
              <span
                className={cn(
                  'ml-3 px-2 py-0.5 rounded',
                  state === true
                    ? 'bg-green-100 text-green-700'
                    : state === false
                      ? 'bg-red-100 text-red-700'
                      : 'bg-gray-100 text-gray-700'
                )}
              >
                {stateLabel}
              </span>
            </p>
            <p className="mt-1 text-[#062E25]/75">
              {prospect.directoryCheckedAt
                ? t('checkedAt', {
                    date: new Date(
                      prospect.directoryCheckedAt
                    ).toLocaleDateString('de-CH'),
                  })
                : t('hint')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={state === true ? 'default' : 'outline'}
              disabled={mutation.isPending}
              onClick={() => mutation.mutate(true)}
            >
              {t('markListed')}
            </Button>
            <Button
              variant={state === false ? 'default' : 'outline'}
              disabled={mutation.isPending}
              onClick={() => mutation.mutate(false)}
            >
              {t('markStar')}
            </Button>
          </div>
        </div>
        {mutation.isError && (
          <p className="mt-2 text-red-600">{t('saveFailed')}</p>
        )}
      </CardContent>
    </Card>
  )
}
