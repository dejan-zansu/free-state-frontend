'use client'

// One card per canton: Terravis extracts billed today against the operator's
// target (at most 10, the SIX limit), CHF spent today, the open queue by tier
// and the manual portal lookups where the canton publishes a cap. The claim
// buttons take the next items in score order.

import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { CantonCard, ClaimSource } from '@/types/outreach/owner-lookup'

import { chf } from './format'

const TIER_ORDER = ['T0', 'CAL', 'T1', 'T1b', 'T2', 'T3', 'T4']

export function CantonCards(props: {
  cards: CantonCard[]
  selected: string | null
  isOperator: boolean
  claiming: string | null
  onSelect: (canton: string | null) => void
  onClaim: (canton: string, source: ClaimSource) => void
}) {
  const t = useTranslations('admin.outreach.ownerLookup')
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 mb-6">
      {props.cards.map(card => {
        const terravisLeft = Math.max(
          0,
          card.terravisTarget - card.terravisUsed - card.claimedByMe
        )
        const portalLeft = Math.max(0, card.portalTarget - card.portalUsed)
        const tiers = TIER_ORDER.filter(tier => card.queuedByTier[tier])
        const active = props.selected === card.canton
        return (
          <Card
            key={card.canton}
            className={cn(
              'border-[#062E25]/10 cursor-pointer',
              active && 'border-[#062E25] ring-1 ring-[#062E25]'
            )}
            onClick={() => props.onSelect(active ? null : card.canton)}
          >
            <CardContent className="p-4 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-[#062E25]">
                  {card.canton}
                </span>
                <span className="text-[#062E25]/60">
                  {chf(card.registry?.extractFeeChf)}
                </span>
              </div>
              <p className="tabular-nums">
                {t('cards.terravis', {
                  used: card.terravisUsed,
                  target: card.terravisTarget,
                })}
              </p>
              <p className="tabular-nums text-[#062E25]/75">
                {t('cards.chfToday', { chf: chf(card.chfToday) })}
              </p>
              {card.portalTarget > 0 && (
                <p className="tabular-nums">
                  {t('cards.portal', {
                    used: card.portalUsed,
                    target: card.portalTarget,
                  })}
                </p>
              )}
              <p className="text-[#062E25]/75">
                {t('cards.queued', { count: card.queued })}
                {tiers.length > 0 && (
                  <span>
                    {' '}
                    (
                    {tiers
                      .map(tier => `${tier} ${card.queuedByTier[tier]}`)
                      .join(', ')}
                    )
                  </span>
                )}
              </p>
              {card.claimedByMe > 0 && (
                <p className="text-[#062E25]">
                  {t('cards.claimed', { count: card.claimedByMe })}
                </p>
              )}
              {props.isOperator && (
                <div
                  className="flex flex-wrap gap-2 pt-1"
                  onClick={event => event.stopPropagation()}
                >
                  <Button
                    size="sm"
                    disabled={
                      terravisLeft === 0 ||
                      card.queued === 0 ||
                      props.claiming !== null
                    }
                    onClick={() => props.onClaim(card.canton, 'TERRAVIS_UI')}
                  >
                    {props.claiming === `${card.canton}:TERRAVIS_UI`
                      ? t('cards.claiming')
                      : t('cards.claimTerravis', {
                          count: Math.min(terravisLeft, card.queued),
                        })}
                  </Button>
                  {card.portalTarget > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={
                        portalLeft === 0 ||
                        card.queued === 0 ||
                        props.claiming !== null
                      }
                      onClick={() =>
                        props.onClaim(card.canton, 'CANTONAL_PORTAL')
                      }
                    >
                      {t('cards.claimPortal', {
                        count: Math.min(portalLeft, card.queued),
                      })}
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
