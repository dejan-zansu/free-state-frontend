'use client'

import { Download, ExternalLink, Loader2 } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { StatusBadge } from '@/components/admin/StatusBadge'
import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { adminService } from '@/services/admin.service'
import type { AdminLeadDetail, SalesRep } from '@/types/admin'

const LEAD_STATUSES = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'PROPOSAL_SENT',
  'NEGOTIATION',
  'WON',
  'LOST',
  'ON_HOLD',
]

const MONTH_KEYS = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
] as const

function fmtNumber(n: number | null | undefined, digits = 0) {
  if (n == null || Number.isNaN(n)) return '-'
  return n.toLocaleString('de-CH', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

function fmtChf(n: number | string | null | undefined) {
  if (n == null) return '-'
  const value = typeof n === 'string' ? parseFloat(n) : n
  if (Number.isNaN(value)) return '-'
  return `CHF ${value.toLocaleString('de-CH', { maximumFractionDigits: 0 })}`
}

export default function AdminLeadDetailPage() {
  const params = useParams()
  const locale = useLocale()
  const t = useTranslations('admin.leads')
  const tc = useTranslations('admin.common')
  const tl = useTranslations('admin.statusLabels')
  const tMonths = useTranslations('admin.leads.months')
  const queryClient = useQueryClient()
  const [saving, setSaving] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [notesInitialized, setNotesInitialized] = useState(false)

  const { data: lead, isLoading } = useQuery<AdminLeadDetail>({
    queryKey: ['admin', 'lead', params.id],
    queryFn: async () => {
      const data = await adminService.getLeadById(params.id as string)
      if (!notesInitialized) {
        setNotes(data.notes || '')
        setNotesInitialized(true)
      }
      return data
    },
  })

  const { data: salesReps = [] } = useQuery<SalesRep[]>({
    queryKey: ['admin', 'sales-reps'],
    queryFn: () => adminService.listSalesReps(),
  })

  const handleUpdate = async (data: Record<string, string | null>) => {
    if (!lead) return
    setSaving(true)
    try {
      await adminService.updateLead(lead.id, data)
      queryClient.invalidateQueries({ queryKey: ['admin', 'lead', params.id] })
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDownload = async () => {
    if (!lead) return
    setDownloading(true)
    setDownloadError(null)
    try {
      await adminService.downloadLeadReport(lead.id, lead.propertyAddress)
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t('reportDownloadFailed')
      setDownloadError(message)
    } finally {
      setDownloading(false)
    }
  }

  if (isLoading) {
    return <AdminPageLoader className="h-64" />
  }

  if (!lead) {
    return <p className="text-[#062E25]/60">{tc('notFound')}</p>
  }

  const project = lead.project
  const calc = project?.solarCalculation
  const contracts = project?.contracts ?? []
  const hasCalculation = !!calc
  const monthly = calc?.monthlyProductionKwh ?? []
  const maxMonthly = monthly.length > 0 ? Math.max(...monthly) : 0
  const roofSegments = calc?.roofSegments ?? []
  const totalRoofArea = roofSegments.reduce(
    (sum, s) => sum + (typeof s.area === 'number' ? s.area : 0),
    0,
  )
  const avgTilt =
    roofSegments.length > 0
      ? roofSegments.reduce(
          (sum, s) => sum + (typeof s.tilt === 'number' ? s.tilt : 0),
          0,
        ) / roofSegments.length
      : null
  const avgAzimuth =
    roofSegments.length > 0
      ? roofSegments.reduce(
          (sum, s) => sum + (typeof s.azimuth === 'number' ? s.azimuth : 0),
          0,
        ) / roofSegments.length
      : null
  const selfConsumptionPct =
    calc?.selfConsumptionRate != null
      ? Math.round(calc.selfConsumptionRate * 100)
      : null
  const devices = calc?.devices ?? null
  const activeDeviceKeys = devices
    ? (Object.keys(devices) as (keyof typeof devices)[]).filter(k => devices[k])
    : []

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-[#062E25]">
          {lead.customer.user.firstName} {lead.customer.user.lastName}
        </h1>
        <StatusBadge status={lead.status} />
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={downloading || !hasCalculation}
            className="border-[#062E25]/20 text-[#062E25] hover:bg-[#062E25]/5"
          >
            {downloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {t('downloadReport')}
          </Button>
        </div>
      </div>

      {downloadError && (
        <div className="mb-4 text-base text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg">
          {downloadError}
        </div>
      )}

      {!hasCalculation && (
        <Card className="border-amber-200 bg-amber-50 mb-6">
          <CardContent className="p-4">
            <p className="text-base text-amber-900">
              {t('noCalculation')}
            </p>
          </CardContent>
        </Card>
      )}

      {hasCalculation && calc && (
        <Card className="border-[#062E25]/10 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[#062E25]">
                {t('calculatorSnapshot')}
              </h2>
              {calc.solarModel && (
                <span className="text-base font-medium px-3 py-1 rounded-full bg-[#062E25]/5 text-[#062E25]">
                  {calc.solarModel === 'solar-free'
                    ? t('solarModelFree')
                    : t('solarModelDirect')}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl bg-[#F5F7EE] p-4">
                <p className="text-base text-[#062E25]/60">{t('systemSize')}</p>
                <p className="text-2xl font-bold text-[#062E25] tabular-nums">
                  {calc.totalSystemCapacityKw != null
                    ? `${fmtNumber(calc.totalSystemCapacityKw, 1)} kWp`
                    : '-'}
                </p>
                {calc.panelCount != null && (
                  <p className="text-base text-[#062E25]/50 tabular-nums">
                    {t('panelsCount', { count: calc.panelCount })}
                  </p>
                )}
              </div>
              <div className="rounded-xl bg-[#F5F7EE] p-4">
                <p className="text-base text-[#062E25]/60">{t('annualProduction')}</p>
                <p className="text-2xl font-bold text-[#062E25] tabular-nums">
                  {calc.annualProductionKwh != null
                    ? `${fmtNumber(calc.annualProductionKwh)} kWh`
                    : '-'}
                </p>
              </div>
              <div className="rounded-xl bg-[#062E25] text-white p-4">
                <p className="text-base text-white/70">{t('annualSavings')}</p>
                <p className="text-2xl font-bold tabular-nums">
                  {fmtChf(calc.annualSavingsChf)}
                </p>
              </div>
              <div className="rounded-xl bg-[#F5F7EE] p-4">
                <p className="text-base text-[#062E25]/60">{t('co2Offset')}</p>
                <p className="text-2xl font-bold text-[#062E25] tabular-nums">
                  {calc.carbonOffsetKg != null
                    ? `${fmtNumber(calc.carbonOffsetKg)} kg`
                    : '-'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div>
                <p className="text-base text-[#062E25]/60">{t('selfConsumption')}</p>
                <p className="text-xl font-semibold text-[#062E25] tabular-nums">
                  {selfConsumptionPct != null ? `${selfConsumptionPct}%` : '-'}
                </p>
              </div>
              <div>
                <p className="text-base text-[#062E25]/60">{t('annualConsumption')}</p>
                <p className="text-xl font-semibold text-[#062E25] tabular-nums">
                  {calc.annualConsumptionKwh != null
                    ? `${fmtNumber(calc.annualConsumptionKwh)} kWh`
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-base text-[#062E25]/60">{t('ppaDiscount')}</p>
                <p className="text-xl font-semibold text-[#062E25] tabular-nums">
                  {calc.ppaDiscountPercent != null
                    ? `${calc.ppaDiscountPercent}%`
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-base text-[#062E25]/60">{t('recommendedPackage')}</p>
                <p className="text-xl font-semibold text-[#062E25]">
                  {calc.recommendedPackage || project?.selectedPackage || '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {hasCalculation && monthly.length === 12 && maxMonthly > 0 && (
        <Card className="border-[#062E25]/10 mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">
              {t('monthlyProduction')}
            </h2>
            <div className="grid grid-cols-12 gap-2 items-end h-36">
              {monthly.map((value, i) => {
                const heightPct = maxMonthly > 0 ? (value / maxMonthly) * 100 : 0
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="w-full flex-1 flex items-end">
                      <div
                        className="w-full bg-[#B7FE1A] rounded-t"
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-sm text-[#062E25]/60 uppercase">
                      {tMonths(MONTH_KEYS[i])}
                    </span>
                    <span className="text-sm text-[#062E25] tabular-nums">
                      {fmtNumber(value)}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="border-[#062E25]/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">
              {t('contact')}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-[#062E25]/60">{t('name')}</label>
                <p className="font-medium text-[#062E25]">
                  {lead.customer.user.firstName} {lead.customer.user.lastName}
                </p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">{t('email')}</label>
                <p className="font-medium text-[#062E25] break-all">
                  {lead.customer.user.email}
                </p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">{t('phone')}</label>
                <p className="font-medium text-[#062E25]">
                  {lead.customer.user.phone ? (
                    <a
                      href={`tel:${lead.customer.user.phone}`}
                      className="text-[#062E25] hover:underline"
                    >
                      {lead.customer.user.phone}
                    </a>
                  ) : (
                    '-'
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">
                  {t('preferredLanguage')}
                </label>
                <p className="font-medium text-[#062E25] uppercase">
                  {lead.customer.user.preferredLanguage || '-'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#062E25]/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">
              {t('leadInfo')}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm text-[#062E25]/60">{t('propertyAddress')}</label>
                <p className="font-medium text-[#062E25]">{lead.propertyAddress}</p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">{t('source')}</label>
                <p className="font-medium text-[#062E25]">{lead.source}</p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">{t('interestedPackage')}</label>
                <p className="font-medium text-[#062E25]">{lead.interestedPackage || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">{t('estimatedBudget')}</label>
                <p className="font-medium text-[#062E25]">
                  {lead.estimatedBudget
                    ? `CHF ${lead.estimatedBudget.toLocaleString('de-CH')}`
                    : '-'}
                </p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">{t('created')}</label>
                <p className="font-medium text-[#062E25]">
                  {new Date(lead.createdAt).toLocaleDateString('de-CH')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {hasCalculation && calc && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="border-[#062E25]/10">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-[#062E25] mb-4">
                {t('customerInputs')}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[#062E25]/60">
                    {t('householdSize')}
                  </label>
                  <p className="font-medium text-[#062E25] tabular-nums">
                    {calc.householdSize ?? '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-[#062E25]/60">
                    {t('buildingType')}
                  </label>
                  <p className="font-medium text-[#062E25]">
                    {calc.buildingType || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-[#062E25]/60">
                    {t('roofCovering')}
                  </label>
                  <p className="font-medium text-[#062E25]">
                    {calc.roofCovering || '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-[#062E25]/60">
                    {t('devices')}
                  </label>
                  {activeDeviceKeys.length === 0 ? (
                    <p className="font-medium text-[#062E25]">{t('noDevices')}</p>
                  ) : (
                    <ul className="mt-1 space-y-1">
                      {activeDeviceKeys.map(key => (
                        <li
                          key={key}
                          className="text-base font-medium text-[#062E25]"
                        >
                          • {t(`deviceNames.${key}`)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#062E25]/10">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-[#062E25] mb-4">
                {t('roofDetails')}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[#062E25]/60">
                    {t('totalRoofArea')}
                  </label>
                  <p className="font-medium text-[#062E25] tabular-nums">
                    {totalRoofArea > 0 ? `${fmtNumber(totalRoofArea, 1)} m²` : '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-[#062E25]/60">
                    {t('roofSegments')}
                  </label>
                  <p className="font-medium text-[#062E25] tabular-nums">
                    {roofSegments.length}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-[#062E25]/60">
                    {t('averageTilt')}
                  </label>
                  <p className="font-medium text-[#062E25] tabular-nums">
                    {avgTilt != null ? `${fmtNumber(avgTilt, 1)}°` : '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-[#062E25]/60">
                    {t('averageAzimuth')}
                  </label>
                  <p className="font-medium text-[#062E25] tabular-nums">
                    {avgAzimuth != null ? `${fmtNumber(avgAzimuth, 1)}°` : '-'}
                  </p>
                </div>
                {project && (
                  <>
                    <div>
                      <label className="text-sm text-[#062E25]/60">
                        {t('coordinates')}
                      </label>
                      <p className="font-medium text-[#062E25] tabular-nums">
                        {project.propertyLat.toFixed(5)},{' '}
                        {project.propertyLng.toFixed(5)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-[#062E25]/60">
                        {t('projectStatus')}
                      </label>
                      <p className="font-medium text-[#062E25]">
                        {project.status}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {contracts.length > 0 && (
        <Card className="border-[#062E25]/10 mb-6">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">
              {t('contractsTitle')}
            </h2>
            <div className="space-y-3">
              {contracts.map(contract => (
                <Link
                  key={contract.id}
                  href={`/${locale}/admin/contracts/${contract.id}`}
                  className="flex items-center justify-between p-4 rounded-xl border border-[#062E25]/10 bg-white hover:bg-[#F5F7EE] transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-[#062E25]">
                        {contract.contractNumber}
                      </p>
                      <StatusBadge status={contract.status} />
                    </div>
                    <p className="text-base text-[#062E25]/60 mt-1">
                      {t('contractCreatedOn', {
                        date: new Date(contract.createdAt).toLocaleDateString(
                          'de-CH',
                        ),
                      })}
                      {contract.customerSignedAt &&
                        ` · ${t('signedOn', {
                          date: new Date(
                            contract.customerSignedAt,
                          ).toLocaleDateString('de-CH'),
                        })}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-base font-semibold text-[#062E25] tabular-nums">
                      {fmtChf(contract.netAmount)}
                    </p>
                    <ExternalLink className="h-4 w-4 text-[#062E25]/50" />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-[#062E25]/10">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-[#062E25] mb-4">
            {t('manage')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-[#062E25]/60 mb-1 block">{t('status')}</label>
              <Select
                value={lead.status}
                onValueChange={v => handleUpdate({ status: v })}
                disabled={saving}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_STATUSES.map(s => (
                    <SelectItem key={s} value={s}>
                      {tl(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm text-[#062E25]/60 mb-1 block">{t('assignedTo')}</label>
              <Select
                value={lead.assignedTo?.id || '__none__'}
                onValueChange={v =>
                  handleUpdate({ assignedToId: v === '__none__' ? null : v })
                }
                disabled={saving}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('unassigned')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">{t('unassigned')}</SelectItem>
                  {salesReps.map(rep => (
                    <SelectItem key={rep.id} value={rep.id}>
                      {rep.firstName} {rep.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-[#062E25]/60 mb-1 block">{t('notes')}</label>
              <Textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={4}
                className="mb-2"
              />
              <Button
                size="sm"
                onClick={() => handleUpdate({ notes })}
                disabled={saving || notes === (lead.notes || '')}
                className="bg-[#062E25] hover:bg-[#062E25]/90 text-white"
              >
                {t('saveNotes')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
