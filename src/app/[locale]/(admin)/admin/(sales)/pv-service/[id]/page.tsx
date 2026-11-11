'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { ChevronLeft } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useHasCapability } from '@/lib/capabilities'
import { adminPvServiceService } from '@/services/admin-pv-service.service'
import {
  PV_SERVICE_REQUEST_STATUSES,
  type PvServiceRequest,
  type PvServiceRequestStatus,
} from '@/types/pv-service'

import {
  assigneeName,
  formatDateTime,
  formatKw,
  PV_SERVICE_QUERY_KEY,
  PV_SERVICE_STATUS_CLASS,
} from '../_components/pv-service-format'

const MAX_ANNUAL_FEE = 9_999_999_999

const ATTRIBUTION_FIELDS = [
  'utmSource',
  'utmMedium',
  'utmCampaign',
  'utmId',
  'utmTerm',
  'utmContent',
  'referrer',
  'landingPage',
  'gclid',
  'fbclid',
  'sessionKey',
] as const satisfies readonly (keyof PvServiceRequest)[]

function Fact({ label, value }: { label: string; value: ReactNode }) {
  const empty = value === null || value === undefined || value === ''
  return (
    <div>
      <dt className="text-base text-[#062E25]/75">{label}</dt>
      <dd className="text-base font-medium text-[#062E25] break-words">
        {empty ? '-' : value}
      </dd>
    </div>
  )
}

function SectionCard({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <Card className="border-[#062E25]/10">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-[#062E25] mb-4">{title}</h2>
        {children}
      </CardContent>
    </Card>
  )
}

function ManageCard({ request }: { request: PvServiceRequest }) {
  const t = useTranslations('admin.pvService.detail')
  const tl = useTranslations('admin.pvService')
  const queryClient = useQueryClient()

  const [status, setStatus] = useState<PvServiceRequestStatus>(request.status)
  const [notes, setNotes] = useState(request.adminNotes ?? '')
  const [annualFee, setAnnualFee] = useState(
    request.annualFeeChf === null ? '' : String(request.annualFeeChf)
  )

  useEffect(() => {
    setStatus(request.status)
    setNotes(request.adminNotes ?? '')
    setAnnualFee(
      request.annualFeeChf === null ? '' : String(request.annualFeeChf)
    )
  }, [request])

  const parsedFee = annualFee.trim() === '' ? null : Number(annualFee)
  const feeValid =
    parsedFee === null ||
    (Number.isFinite(parsedFee) &&
      parsedFee >= 0 &&
      parsedFee <= MAX_ANNUAL_FEE)

  const updateMutation = useMutation({
    mutationFn: () =>
      adminPvServiceService.update(request.id, {
        status,
        adminNotes: notes.trim() || null,
        annualFeeChf: parsedFee,
      }),
    onSuccess: updated => {
      queryClient.setQueryData(
        [...PV_SERVICE_QUERY_KEY, 'detail', request.id],
        updated
      )
      queryClient.invalidateQueries({ queryKey: PV_SERVICE_QUERY_KEY })
    },
  })

  return (
    <SectionCard title={t('sectionManage')}>
      <div className="space-y-4">
        <div>
          <label
            htmlFor="pv-service-status"
            className="text-base text-[#062E25] mb-1 block"
          >
            {t('status')}
          </label>
          <Select
            value={status}
            onValueChange={value => setStatus(value as PvServiceRequestStatus)}
          >
            <SelectTrigger id="pv-service-status" className="w-full text-base">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PV_SERVICE_REQUEST_STATUSES.map(option => (
                <SelectItem key={option} value={option} className="text-base">
                  {tl(`statusLabels.${option}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label
            htmlFor="pv-service-annual-fee"
            className="text-base text-[#062E25] mb-1 block"
          >
            {t('annualFee')}
          </label>
          <Input
            id="pv-service-annual-fee"
            type="number"
            min={0}
            step="any"
            inputMode="decimal"
            value={annualFee}
            onChange={e => setAnnualFee(e.target.value)}
            aria-invalid={!feeValid}
            aria-describedby="pv-service-annual-fee-hint"
            className="md:text-base"
          />
          <p
            id="pv-service-annual-fee-hint"
            className="mt-1 text-base text-[#062E25]/75"
          >
            {t('annualFeeHint')}
          </p>
          {!feeValid && (
            <p className="mt-1 text-base text-red-700" role="alert">
              {t('annualFeeInvalid')}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="pv-service-notes"
            className="text-base text-[#062E25] mb-1 block"
          >
            {t('adminNotes')}
          </label>
          <Textarea
            id="pv-service-notes"
            value={notes}
            maxLength={5000}
            onChange={e => setNotes(e.target.value)}
            className="min-h-[160px] text-base md:text-base"
          />
        </div>
        <Button
          className="text-base"
          onClick={() => updateMutation.mutate()}
          disabled={updateMutation.isPending || !feeValid}
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
    </SectionCard>
  )
}

export default function AdminPvServiceDetailPage() {
  const params = useParams<{ id: string }>()
  const id = params.id
  const locale = useLocale()
  const t = useTranslations('admin.pvService.detail')
  const tl = useTranslations('admin.pvService')
  const tc = useTranslations('admin.common')
  const canOpenOutreach = useHasCapability('outreach.manage')

  const {
    data: request,
    isLoading,
    error,
  } = useQuery({
    queryKey: [...PV_SERVICE_QUERY_KEY, 'detail', id],
    queryFn: () => adminPvServiceService.get(id),
    retry: (count, err) =>
      !(isAxiosError(err) && err.response?.status === 404) && count < 2,
  })

  const backLink = (
    <Button variant="ghost" className="gap-2 text-base mb-4" asChild>
      <Link href={`/${locale}/admin/pv-service`}>
        <ChevronLeft className="w-4 h-4" />
        {t('back')}
      </Link>
    </Button>
  )

  if (isLoading) return <AdminPageLoader className="h-64" />

  if (!request) {
    const notFound = isAxiosError(error) && error.response?.status === 404
    return (
      <div>
        {backLink}
        <p className="text-base text-[#062E25]" role="alert">
          {notFound ? tc('notFound') : tc('failedToLoad')}
        </p>
      </div>
    )
  }

  const label = (group: string, value: string | null) => {
    if (!value) return null
    const key = `${group}.${value}`
    return tl.has(key) ? tl(key) : value
  }

  return (
    <div>
      {backLink}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#062E25] break-words">
          {request.companyName}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <StatusBadge
            status={request.status}
            namespace="admin.pvService.statusLabels"
            className={`text-base ${PV_SERVICE_STATUS_CLASS[request.status] ?? ''}`}
          />
          <span className="text-base text-[#062E25]/75">
            {t('received', { date: formatDateTime(request.createdAt) })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title={t('sectionContact')}>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Fact label={t('companyName')} value={request.companyName} />
            <Fact label={t('contactName')} value={request.contactName} />
            <Fact
              label={t('email')}
              value={
                <a
                  href={`mailto:${request.email}`}
                  className="underline hover:no-underline"
                >
                  {request.email}
                </a>
              }
            />
            <Fact
              label={t('phone')}
              value={
                <a
                  href={`tel:${request.phone.replace(/\s+/g, '')}`}
                  className="underline hover:no-underline"
                >
                  {request.phone}
                </a>
              }
            />
            <Fact
              label={t('address')}
              value={`${request.street}, ${request.postalCode} ${request.city}`}
            />
            <Fact
              label={t('locale')}
              value={request.locale ? request.locale.toUpperCase() : null}
            />
            <Fact
              label={t('assignedTo')}
              value={assigneeName(request.assignedTo)}
            />
            <Fact
              label={t('updatedAt')}
              value={formatDateTime(request.updatedAt)}
            />
          </dl>
        </SectionCard>

        <ManageCard request={request} />

        <SectionCard title={t('sectionPlant')}>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Fact label={t('plantKw')} value={formatKw(request.plantKw)} />
            <Fact
              label={t('commissioningYear')}
              value={request.commissioningYear}
            />
            <Fact
              label={t('inverterBrand')}
              value={label('inverterBrand', request.inverterBrand)}
            />
            <Fact
              label={t('installerStatus')}
              value={label('installerStatus', request.installerStatus)}
            />
          </dl>
          <div className="mt-4">
            <p className="text-base text-[#062E25]/75">{t('interests')}</p>
            {request.interests.length === 0 ? (
              <p className="text-base font-medium text-[#062E25]">
                {t('noInterests')}
              </p>
            ) : (
              <ul className="mt-1 flex flex-wrap gap-2">
                {request.interests.map(interest => (
                  <li
                    key={interest}
                    className="rounded-full bg-[#062E25]/5 px-3 py-1 text-base text-[#062E25]"
                  >
                    {label('interests', interest)}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="mt-4">
            <p className="text-base text-[#062E25]/75">{t('message')}</p>
            <p className="text-base text-[#062E25] whitespace-pre-wrap break-words">
              {request.message || '-'}
            </p>
          </div>
        </SectionCard>

        <SectionCard title={t('sectionSource')}>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Fact
              label={t('placement')}
              value={label('placement', request.placement)}
            />
            <Fact
              label={t('consentPrivacy')}
              value={request.consentPrivacy ? tl('yes') : tl('no')}
            />
            <Fact
              label={t('outboundProspect')}
              value={
                request.outboundProspectId ? (
                  canOpenOutreach ? (
                    <Link
                      href={`/${locale}/admin/outreach/${request.outboundProspectId}`}
                      className="underline hover:no-underline"
                    >
                      {t('openProspect')}
                    </Link>
                  ) : (
                    request.outboundProspectId
                  )
                ) : null
              }
            />
            {ATTRIBUTION_FIELDS.map(field => (
              <Fact key={field} label={t(field)} value={request[field]} />
            ))}
          </dl>
        </SectionCard>
      </div>
    </div>
  )
}
