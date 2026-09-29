'use client'

// Ownership panel on the prospect detail page (doc 69 W2-3 and W2-9):
// confidence, owner, segment, the evidence behind it, the parcel facts, the
// letter address and the owner-lookup state, with the "Eigentümer abfragen"
// button that queues a T0 lookup for a person to do in Terravis.

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ownerLookupService } from '@/services/outreach/owner-lookup.service'
import type {
  OutboundOwnershipEvidence,
  OutboundProspectDetail,
} from '@/types/admin-outreach'

import { CONFIDENCE_CLASSES } from './OwnershipBadge'

function day(iso: string | null | undefined): string {
  if (!iso) return '-'
  return new Date(iso).toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-[#062E25]/60">{label}</p>
      <p className="text-[#062E25]">{value ?? '-'}</p>
    </div>
  )
}

function EvidenceRow({ entry }: { entry: OutboundOwnershipEvidence }) {
  const t = useTranslations('admin.outreach.ownership')
  const locale = useLocale()
  const source = t.has(`evidenceSource.${entry.source}`)
    ? t(`evidenceSource.${entry.source}`)
    : entry.source
  return (
    <li className="border-l-2 border-[#062E25]/15 pl-2">
      <span className="tabular-nums text-[#062E25]/60">{day(entry.at)}</span>{' '}
      {source}:{' '}
      <span
        className={cn('rounded-full px-2', CONFIDENCE_CLASSES[entry.implies])}
      >
        {t(`confidence.${entry.implies}`)}
      </span>
      <span className="text-[#062E25]/60">
        {' '}
        ({t('panel.weight', { weight: entry.weight })},{' '}
        {t(`panel.by.${entry.by}`)})
      </span>
      {entry.ownerName && (
        <span>
          {' '}
          | {entry.ownerName}
          {entry.ownerUid ? ` ${entry.ownerUid}` : ''}
        </span>
      )}
      {entry.detail && (
        <span className="text-[#062E25]/60"> | {entry.detail}</span>
      )}
      {entry.ref?.lookupId && (
        <Link
          href={`/${locale}/admin/outreach/owner-lookup`}
          className="ml-1 text-blue-600 hover:underline"
        >
          {t('panel.toLookup')}
        </Link>
      )}
      {entry.ref?.url && (
        <a
          href={entry.ref.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-1 text-blue-600 hover:underline"
        >
          {t('panel.source')}
        </a>
      )}
    </li>
  )
}

export function OwnershipPanel(props: { prospect: OutboundProspectDetail }) {
  const t = useTranslations('admin.outreach.ownership')
  const tl = useTranslations('admin.outreach.ownerLookup')
  const locale = useLocale()
  const queryClient = useQueryClient()
  const p = props.prospect

  const enqueue = useMutation({
    mutationFn: () => ownerLookupService.enqueueForProspect(p.id, 'manual'),
    onSuccess: data => {
      if (data.lookupId && !data.skipped) toast.success(t('panel.queued'))
      else toast.error(t(`panel.skipped.${data.skipped ?? 'no_egrid'}`))
      queryClient.invalidateQueries({
        queryKey: ['admin', 'outreach', 'prospect', p.id],
      })
    },
    onError: () => toast.error(t('panel.queueFailed')),
  })

  const evidence = [...(p.ownershipEvidence ?? [])].sort((a, b) =>
    b.at.localeCompare(a.at)
  )
  const lookup = p.ownerLookup
  const lookupOpen = lookup?.status === 'QUEUED' || lookup?.status === 'CLAIMED'
  const postal = [
    p.postalName,
    [p.postalStreet, p.postalNumber].filter(Boolean).join(' '),
    [p.postalPostalCode, p.postalCity].filter(Boolean).join(' '),
    p.postalCountry && p.postalCountry !== 'CH' ? p.postalCountry : null,
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-semibold text-[#062E25]/75 uppercase tracking-wide">
            {t('title')}
          </h3>
          <div className="flex items-center gap-2">
            {lookup && (
              <span className="text-[#062E25]/75">
                {t('panel.lookup', {
                  status: tl(`status.${lookup.status}`),
                  tier: lookup.tier,
                  canton: lookup.canton,
                })}
                {lookup.resolution
                  ? `, ${tl(`resolution.${lookup.resolution}`)}`
                  : ''}
                {lookup.queriedAt ? `, ${day(lookup.queriedAt)}` : ''}
              </span>
            )}
            <Button
              size="sm"
              variant="outline"
              disabled={enqueue.isPending || lookupOpen}
              onClick={() => enqueue.mutate()}
            >
              {lookupOpen ? t('panel.lookupOpen') : t('panel.enqueue')}
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'rounded-full px-3 py-0.5 font-medium',
              CONFIDENCE_CLASSES[p.ownershipConfidence]
            )}
          >
            {t(`confidence.${p.ownershipConfidence}`)}
          </span>
          <span className="rounded-full bg-[#062E25]/5 px-3 py-0.5">
            {t(`partyRole.${p.partyRole}`)}
          </span>
          {p.segment && (
            <span
              className="rounded-full bg-[#062E25]/5 px-3 py-0.5"
              title={p.segmentReason ?? undefined}
            >
              {t(`segment.${p.segment}`)}
            </span>
          )}
          {p.entityClass && (
            <span className="rounded-full bg-[#062E25]/5 px-3 py-0.5">
              {t(`entityClass.${p.entityClass}`)}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Fact label={t('panel.owner')} value={p.ownerName} />
          <Fact label="UID" value={p.ownerUid} />
          <Fact
            label={t('panel.partyType')}
            value={p.ownerPartyType ? t(`partyType.${p.ownerPartyType}`) : null}
          />
          <Fact
            label={t('panel.ownerRow')}
            value={
              p.ownerProspectId ? (
                <Link
                  href={`/${locale}/admin/outreach/${p.ownerProspectId}`}
                  className="text-blue-600 hover:underline"
                >
                  {t('panel.open')}
                </Link>
              ) : null
            }
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Fact
            label="E-GRID"
            value={
              p.egrid ? <span className="font-mono">{p.egrid}</span> : null
            }
          />
          <Fact label={t('panel.parcel')} value={p.parcelNumber} />
          <Fact label={t('panel.district')} value={p.landRegistryDistrict} />
          <Fact
            label={t('panel.cantonBfs')}
            value={
              [p.buildingCanton, p.buildingBfs]
                .filter(v => v != null)
                .join(' ') || null
            }
          />
          <Fact
            label={t('panel.floorsDwellings')}
            value={
              p.floors != null || p.dwellings != null
                ? `${p.floors ?? '-'} / ${p.dwellings ?? '-'}`
                : null
            }
          />
          <Fact
            label={t('panel.energyArea')}
            value={p.energyRefAreaM2 != null ? `${p.energyRefAreaM2} m²` : null}
          />
          <Fact
            label={t('panel.parcelBuildings')}
            value={p.parcelEgids.length > 0 ? p.parcelEgids.join(', ') : null}
          />
          <Fact
            label={t('panel.parcelCompanies')}
            value={p.parcelCompanyCount}
          />
        </div>

        {(postal || p.portfolioName) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {postal && (
              <Fact
                label={t('panel.postal')}
                value={`${postal}${p.postalSource ? ` (${p.postalSource})` : ''}`}
              />
            )}
            {p.portfolioName && (
              <Fact
                label={t('panel.portfolio')}
                value={t('panel.portfolioValue', {
                  name: p.portfolioName,
                  count: p.portfolioEgids.length,
                })}
              />
            )}
          </div>
        )}

        <div>
          <p className="font-medium mb-1">{t('panel.evidence')}</p>
          {evidence.length === 0 ? (
            <p className="text-[#062E25]/60">{t('panel.noEvidence')}</p>
          ) : (
            <ul className="space-y-1">
              {evidence.map((entry, index) => (
                <EvidenceRow key={`${entry.at}-${index}`} entry={entry} />
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
