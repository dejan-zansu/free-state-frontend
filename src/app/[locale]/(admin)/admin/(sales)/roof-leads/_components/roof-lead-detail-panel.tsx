'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SheetTitle } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { adminRoofLeadService } from '@/services/admin-roof-lead.service'
import type { RoofLeadActivity, RoofLeadStatus } from '@/types/roof-lead'

import {
  formatDate,
  formatNumber,
  formatPoints,
  ROOF_LEAD_STATUS_CLASS,
  ROOF_LEAD_STATUSES,
  ROOF_LEADS_QUERY_KEY,
  roofLeadAddress,
  roofLeadPvDetail,
  roofLeadYear,
  swissImageUrl,
} from './roof-lead-format'

function Fact({
  label,
  value,
}: {
  label: string
  value: string | number | null | undefined
}) {
  return (
    <div>
      <dt className="text-base text-[#062E25]/75">{label}</dt>
      <dd className="text-base font-medium text-[#062E25] break-words">
        {value === null || value === undefined || value === '' ? '-' : value}
      </dd>
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-semibold text-[#062E25] mb-3">{children}</h3>
  )
}

function statusChange(activity: RoofLeadActivity) {
  if (activity.type !== 'STATUS_CHANGED') return null
  const change = activity.payload?.status as
    | { from?: string; to?: string }
    | undefined
  return change?.from && change.to ? { from: change.from, to: change.to } : null
}

export function RoofLeadDetailPanel({ id }: { id: string }) {
  const t = useTranslations('admin.roofLeads')
  const tc = useTranslations('admin.common')
  const queryClient = useQueryClient()

  const {
    data: lead,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [...ROOF_LEADS_QUERY_KEY, 'detail', id],
    queryFn: () => adminRoofLeadService.get(id),
  })

  const [status, setStatus] = useState<RoofLeadStatus>('NEW')
  const [notes, setNotes] = useState('')
  const [wonAmount, setWonAmount] = useState('')

  useEffect(() => {
    if (!lead) return
    setStatus(lead.status)
    setNotes(lead.notes ?? '')
    setWonAmount(lead.wonAmountChf === null ? '' : String(lead.wonAmountChf))
  }, [lead])

  const parsedAmount = wonAmount.trim() === '' ? null : Number(wonAmount)
  const amountValid =
    parsedAmount === null ||
    (Number.isFinite(parsedAmount) && parsedAmount >= 0)

  const updateMutation = useMutation({
    mutationFn: () =>
      adminRoofLeadService.update(id, {
        status,
        notes: notes.trim() || null,
        wonAmountChf: parsedAmount,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROOF_LEADS_QUERY_KEY })
    },
  })

  if (isLoading || isError || !lead) {
    return (
      <>
        <SheetTitle className="sr-only">{t('title')}</SheetTitle>
        {isLoading ? (
          <AdminPageLoader className="h-64" />
        ) : (
          <p className="text-base text-[#062E25]">{tc('failedToLoad')}</p>
        )}
      </>
    )
  }

  const address = roofLeadAddress(lead) || lead.key
  const scoreParts = Object.entries(lead.scoreParts ?? {})
  const pvDetail = roofLeadPvDetail(lead)
  const blockNoticeKey = `contactBlockNotice.${lead.contactBlock}`
  const exclusionKey = `exclusionReason.${lead.exclusionReason}`

  return (
    <div className="space-y-6">
      <div className="pr-8">
        {lead.companyName && (
          <p className="text-base text-[#062E25]/75">{lead.companyName}</p>
        )}
        <SheetTitle className="text-xl font-bold text-[#062E25]">
          {address}
        </SheetTitle>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <StatusBadge
            status={lead.status}
            namespace="admin.roofLeads.statusLabels"
            className={`text-base ${ROOF_LEAD_STATUS_CLASS[lead.status] ?? ''}`}
          />
          <span className="text-base text-[#062E25]">
            {t(`segment.${lead.segment}`)}
          </span>
        </div>
      </div>

      {lead.contactBlock && (
        <p
          role="alert"
          className="rounded-md bg-red-50 p-3 text-base font-medium text-red-800"
        >
          {t.has(blockNoticeKey) ? t(blockNoticeKey) : lead.contactBlock}
        </p>
      )}

      {lead.x !== null && lead.y !== null ? (
        <figure>
          <img
            src={swissImageUrl(lead.x, lead.y, lead.footprintM2)}
            alt={t('pictureAlt', { address })}
            loading="lazy"
            className="w-full aspect-square object-cover rounded-lg border border-[#062E25]/10"
          />
          <figcaption className="mt-1 text-base text-[#062E25]/75">
            {t('pictureCaption')}
          </figcaption>
        </figure>
      ) : (
        <p className="text-base text-[#062E25]/75">{t('noPicture')}</p>
      )}

      <section>
        <SectionHeading>{t('sectionScore')}</SectionHeading>
        <ul className="space-y-1">
          {scoreParts.map(([part, points]) => {
            const partKey = `scorePart.${part}`
            return (
              <li
                key={part}
                className="flex items-center justify-between gap-3 text-base text-[#062E25]"
              >
                <span>{t.has(partKey) ? t(partKey) : part}</span>
                <span className="font-medium">{formatPoints(points)}</span>
              </li>
            )
          })}
          <li className="flex items-center justify-between gap-3 border-t border-[#062E25]/10 pt-1 text-base font-semibold text-[#062E25]">
            <span>{t('scoreTotal')}</span>
            <span>{lead.score}</span>
          </li>
        </ul>
        {lead.scoreVersion && (
          <p className="mt-1 text-base text-[#062E25]/75">
            {t('scoreVersion', { version: lead.scoreVersion })}
          </p>
        )}
      </section>

      <section>
        <SectionHeading>{t('sectionManage')}</SectionHeading>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="roof-lead-status"
              className="text-base text-[#062E25] mb-1 block"
            >
              {t('colStatus')}
            </label>
            <Select
              value={status}
              onValueChange={value => setStatus(value as RoofLeadStatus)}
            >
              <SelectTrigger id="roof-lead-status" className="w-full text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROOF_LEAD_STATUSES.map(option => (
                  <SelectItem key={option} value={option} className="text-base">
                    {t(`statusLabels.${option}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label
              htmlFor="roof-lead-won-amount"
              className="text-base text-[#062E25] mb-1 block"
            >
              {t('wonAmount')}
            </label>
            <Input
              id="roof-lead-won-amount"
              type="number"
              min={0}
              step="any"
              inputMode="decimal"
              value={wonAmount}
              onChange={e => setWonAmount(e.target.value)}
              aria-invalid={!amountValid}
              className="md:text-base"
            />
            {!amountValid && (
              <p className="mt-1 text-base text-red-700" role="alert">
                {t('wonAmountInvalid')}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="roof-lead-notes"
              className="text-base text-[#062E25] mb-1 block"
            >
              {t('notes')}
            </label>
            <Textarea
              id="roof-lead-notes"
              value={notes}
              maxLength={5000}
              onChange={e => setNotes(e.target.value)}
              className="min-h-[120px] text-base"
            />
          </div>
          <Button
            className="text-base"
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending || !amountValid}
          >
            {t('save')}
          </Button>
          {updateMutation.isSuccess && (
            <p className="text-green-700 text-base" role="status">
              {t('saved')}
            </p>
          )}
          {updateMutation.isError && (
            <p className="text-red-700 text-base" role="alert">
              {t('saveFailed')}
            </p>
          )}
        </div>
      </section>

      <section>
        <SectionHeading>{t('sectionBuilding')}</SectionHeading>
        <dl className="grid grid-cols-2 gap-3">
          <Fact label={t('colYear')} value={roofLeadYear(lead)} />
          <Fact label={t('municipality')} value={lead.municipalityName} />
          <Fact label={t('buildingRef')} value={lead.buildingRef} />
          <Fact label={t('buildingClass')} value={lead.buildingClass} />
          <Fact
            label={t('footprint')}
            value={
              lead.footprintM2 !== null
                ? `${formatNumber(lead.footprintM2)} m²`
                : null
            }
          />
          <Fact
            label={t('roofArea')}
            value={
              lead.roofAreaM2 !== null
                ? `${formatNumber(lead.roofAreaM2)} m²`
                : null
            }
          />
          <Fact label={t('roofForm')} value={t(`form.${lead.roofForm}`)} />
          <Fact label={t('dwellings')} value={lead.dwellings} />
          <Fact label={t('floors')} value={lead.floors} />
          <Fact
            label={t('colPv')}
            value={[t(`pv.${lead.pvState}`), pvDetail]
              .filter(Boolean)
              .join(', ')}
          />
          <Fact
            label={t('roofPermit')}
            value={lead.roofPermitAt ? formatDate(lead.roofPermitAt) : null}
          />
          <Fact
            label={t('colImagery')}
            value={
              lead.imageryVerdict ? t(`imagery.${lead.imageryVerdict}`) : null
            }
          />
        </dl>
        {lead.imageryNotes && (
          <p className="mt-3 text-base text-[#062E25] whitespace-pre-wrap">
            {lead.imageryNotes}
          </p>
        )}
        {lead.exclusionReason && (
          <p className="mt-3 text-base text-[#062E25]">
            {t('exclusionNotice', {
              reason: t.has(exclusionKey)
                ? t(exclusionKey)
                : lead.exclusionReason,
            })}
          </p>
        )}
      </section>

      <section>
        <SectionHeading>{t('sectionContact')}</SectionHeading>
        <dl className="grid grid-cols-2 gap-3">
          <Fact label={t('company')} value={lead.companyName} />
          <Fact label={t('owner')} value={lead.ownerName} />
          <Fact label={t('ownerSource')} value={lead.ownerSource} />
          <Fact label={t('contactName')} value={lead.contactName} />
          <Fact label={t('contactEmail')} value={lead.contactEmail} />
          <Fact label={t('contactPhone')} value={lead.contactPhone} />
          <Fact
            label={t('contactSource')}
            value={
              lead.contactSource === 'roof_renovation'
                ? t('contactSourceRequest')
                : lead.contactSource
            }
          />
          <Fact
            label={t('contactedAt')}
            value={lead.contactedAt ? formatDate(lead.contactedAt) : null}
          />
        </dl>
      </section>

      <section>
        <SectionHeading>{t('sectionActivity')}</SectionHeading>
        {lead.activities.length === 0 ? (
          <p className="text-base text-[#062E25]/75">{t('noActivity')}</p>
        ) : (
          <ul className="space-y-2">
            {lead.activities.map(activity => {
              const typeKey = `activity.${activity.type}`
              const change = statusChange(activity)
              return (
                <li key={activity.id} className="text-base text-[#062E25]">
                  <span className="text-[#062E25]/75">
                    {formatDate(activity.createdAt)}
                  </span>{' '}
                  {t.has(typeKey) ? t(typeKey) : activity.type}
                  {change && (
                    <>
                      {' '}
                      {t('statusChange', {
                        from: t.has(`statusLabels.${change.from}`)
                          ? t(`statusLabels.${change.from}`)
                          : change.from,
                        to: t.has(`statusLabels.${change.to}`)
                          ? t(`statusLabels.${change.to}`)
                          : change.to,
                      })}
                    </>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
