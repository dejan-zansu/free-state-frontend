'use client'

// The operator's claimed items, per canton. "5 E-GRIDs kopieren" copies the
// next five E-GRIDs for the Terravis multi search (newline or space, the
// separator Terravis accepts is not published). Each row shows what the
// operator checks against the Terravis hit (Gemeinde, parcel number, Los code
// with the quarter), the portal link and the land registry contact, and opens
// the capture panel.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { Copy, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import type { OwnerLookupItem } from '@/types/outreach/owner-lookup'

import { CapturePanel } from './CapturePanel'
import { address, copyText, elapsed, kwh } from './format'

const BATCH = 5

function useNow(intervalMs: number): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

export function RegistryFacts({ item }: { item: OwnerLookupItem }) {
  const t = useTranslations('admin.outreach.ownerLookup')
  const registry = item.registry
  if (!registry) return null
  const office = registry.landRegistryOffice
  const directory = registry.directory
  const link = item.deepLink ?? registry.portalUrl
  return (
    <div className="space-y-1 text-[#062E25]/75">
      {item.source === 'CANTONAL_PORTAL' && link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-600 hover:underline"
        >
          {registry.portalName ?? t('row.portal')}{' '}
          <ExternalLink className="w-4 h-4" />
        </a>
      ) : (
        link && (
          <p>
            {t('row.portal')}:{' '}
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {registry.portalName ?? link}
            </a>
          </p>
        )
      )}
      {office ? (
        <p>
          {office.name}
          {office.address ? `, ${office.address}` : ''}
          {office.phone ? `, ${office.phone}` : ''}
          {office.email ? `, ${office.email}` : ''}
        </p>
      ) : (
        directory && (
          <p>
            {directory.note}
            {directory.finderUrl && (
              <>
                {' '}
                <a
                  href={directory.finderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {t('row.officeFinder')}
                </a>
              </>
            )}
            {directory.offices.length > 0 && (
              <span>
                {' '}
                {directory.offices
                  .map(o => `${o.name} ${o.phone ?? ''}`.trim())
                  .join(' | ')}
              </span>
            )}
          </p>
        )
      )}
    </div>
  )
}

function LookupRow(props: {
  item: OwnerLookupItem
  now: number
  open: boolean
  onToggle: () => void
  onDone: () => void
}) {
  const t = useTranslations('admin.outreach.ownerLookup')
  const locale = useLocale()
  const { item } = props
  const trigger = item.trigger
  const reason = item.priorityReasons?.reason
  return (
    <div className="border-b border-[#062E25]/10 py-3 space-y-2">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <div className="lg:col-span-4 space-y-1">
          <p>
            <span className="rounded bg-[#062E25] px-2 py-0.5 text-white font-semibold mr-2">
              {item.tier}
            </span>
            <span
              title={(item.priorityReasons?.parts ?? [])
                .map(p => `${p.label} ${p.points > 0 ? '+' : ''}${p.points}`)
                .join(', ')}
            >
              {t('row.score', { score: item.priority.toFixed(1) })}
            </span>
            {reason ? (
              <span className="text-[#062E25]/60"> | {reason}</span>
            ) : null}
          </p>
          {trigger && (
            <p>
              <Link
                href={`/${locale}/admin/outreach/${trigger.id}`}
                className="text-blue-600 hover:underline"
              >
                {trigger.reference}
              </Link>{' '}
              {trigger.companyName}
            </p>
          )}
          <p className="text-[#062E25]/75">
            {address(trigger)} | {kwh(trigger?.roofKwhYear)} | ×
            {trigger?.companiesAtEgid ?? 1}
          </p>
          {item.prospects.length > 1 && (
            <p className="text-[#062E25]/60">
              {t('row.onParcel', {
                names: item.prospects.map(p => p.companyName).join(', '),
              })}
            </p>
          )}
        </div>
        <div className="lg:col-span-5 space-y-1">
          <p className="text-lg font-semibold tabular-nums">
            {item.municipalityName ?? item.municipalityBfs ?? '-'} |{' '}
            {t('row.parcel')} {item.parcelNumber ?? '-'}
            {item.losCode && (
              <span>
                {' '}
                | Los {item.losCode}
                {item.losQuarter ? ` (${item.losQuarter})` : ''}
              </span>
            )}
          </p>
          <p className="flex items-center gap-2 tabular-nums">
            <span className="font-mono">{item.egrid}</span>
            <Button
              variant="ghost"
              size="sm"
              aria-label={t('row.copyEgrid')}
              onClick={async () => {
                if (await copyText(item.egrid)) toast.success(t('row.copied'))
              }}
            >
              <Copy className="w-4 h-4" />
            </Button>
            {item.landRegistryDistrict != null && (
              <span className="text-[#062E25]/60">
                {t('row.district', { district: item.landRegistryDistrict })}
              </span>
            )}
          </p>
          <RegistryFacts item={item} />
          {item.replyExcerpt && (
            <p className="italic text-[#062E25]/75">
              &laquo;{item.replyExcerpt}&raquo;
            </p>
          )}
        </div>
        <div className="lg:col-span-3 flex flex-col items-start lg:items-end gap-2">
          <span className="tabular-nums text-[#062E25]/60">
            {t('row.timer', { time: elapsed(item.claimedAt, props.now) })}
          </span>
          <Button
            variant={props.open ? 'outline' : 'default'}
            onClick={props.onToggle}
          >
            {props.open ? t('row.closeCapture') : t('row.capture')}
          </Button>
        </div>
      </div>
      {props.open && <CapturePanel item={item} onDone={props.onDone} />}
    </div>
  )
}

export function ClaimedBatch(props: {
  items: OwnerLookupItem[]
  onDone: () => void
}) {
  const t = useTranslations('admin.outreach.ownerLookup')
  const now = useNow(1000)
  const [openId, setOpenId] = useState<string | null>(null)
  const cantons = [...new Set(props.items.map(item => item.canton))]

  const copyBatch = async (items: OwnerLookupItem[], separator: string) => {
    const egrids = items.slice(0, BATCH).map(item => item.egrid)
    if (await copyText(egrids.join(separator)))
      toast.success(t('batch.copied', { count: egrids.length }))
  }

  if (props.items.length === 0)
    return <p className="mb-6 text-[#062E25]/60">{t('batch.empty')}</p>

  return (
    <div className="space-y-6 mb-6">
      {cantons.map(canton => {
        const items = props.items.filter(item => item.canton === canton)
        const terravis = items.filter(item => item.source !== 'CANTONAL_PORTAL')
        return (
          <section key={canton}>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-[#062E25]">
                {t('batch.title', { canton, count: items.length })}
              </h3>
              {terravis.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyBatch(terravis, '\n')}
                  >
                    {t('batch.copyNewline', {
                      count: Math.min(BATCH, terravis.length),
                    })}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyBatch(terravis, ' ')}
                  >
                    {t('batch.copySpace', {
                      count: Math.min(BATCH, terravis.length),
                    })}
                  </Button>
                </>
              )}
            </div>
            {items.map(item => (
              <LookupRow
                key={item.id}
                item={item}
                now={now}
                open={openId === item.id}
                onToggle={() => setOpenId(openId === item.id ? null : item.id)}
                onDone={() => {
                  setOpenId(null)
                  props.onDone()
                }}
              />
            ))}
          </section>
        )
      })}
    </div>
  )
}
