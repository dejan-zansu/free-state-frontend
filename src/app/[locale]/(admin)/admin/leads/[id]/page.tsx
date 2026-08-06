'use client'

import { Download, ExternalLink, Loader2 } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { StatusBadge } from '@/components/admin/StatusBadge'
import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { CalculationSnapshotCard } from '@/components/admin/calculation/CalculationSnapshotCard'
import { ContractsCard } from '@/components/admin/calculation/ContractsCard'
import { CustomerInputsCard } from '@/components/admin/calculation/CustomerInputsCard'
import { FinancialsCard } from '@/components/admin/calculation/FinancialsCard'
import { MonthlyProductionCard } from '@/components/admin/calculation/MonthlyProductionCard'
import { RoofDetailsCard } from '@/components/admin/calculation/RoofDetailsCard'
import { fmtChf } from '@/components/admin/calculation/format'
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
import { adminEquipmentService } from '@/services/admin-equipment.service'
import type { AdminLeadDetail, SalesRep } from '@/types/admin'
import { MilestoneControls } from './MilestoneControls'

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

export default function AdminLeadDetailPage() {
  const params = useParams()
  const locale = useLocale()
  const t = useTranslations('admin.leads')
  const tc = useTranslations('admin.common')
  const tl = useTranslations('admin.statusLabels')
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

  const { data: packagesResponse } = useQuery({
    queryKey: ['admin', 'equipment', 'packages', 'all'],
    queryFn: () =>
      adminEquipmentService.listPackages({ limit: 100 }) as Promise<{
        data: { code: string; translations?: { name: string }[] }[]
      }>,
  })

  const packageNames = new Map(
    (packagesResponse?.data ?? []).map(p => [
      p.code,
      p.translations?.[0]?.name || p.code,
    ]),
  )

  const packageLabel = (code: string | null | undefined) => {
    if (!code) return '-'
    if (t.has(`packages.${code}`)) return t(`packages.${code}`)
    return packageNames.get(code) ?? code
  }

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
  const financials = lead.financials
  const monthly = calc?.monthlyProductionKwh ?? []

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
        <CalculationSnapshotCard
          calc={calc}
          selectedPackage={project?.selectedPackage ?? null}
          packageLabel={packageLabel}
        />
      )}

      {financials && <FinancialsCard financials={financials} calc={calc ?? null} />}

      {hasCalculation && <MonthlyProductionCard monthly={monthly} />}

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
              <div>
                <label className="text-sm text-[#062E25]/60">
                  {t('dateOfBirth')}
                </label>
                <p className="font-medium text-[#062E25]">
                  {lead.customer.user.dateOfBirth
                    ? new Date(lead.customer.user.dateOfBirth).toLocaleDateString('de-CH')
                    : '-'}
                </p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">
                  {t('nationality')}
                </label>
                <p className="font-medium text-[#062E25]">
                  {lead.customer.user.nationality || '-'}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[#062E25]/10">
              <label className="text-sm text-[#062E25]/60">
                {t('propertyOwner')}
              </label>
              <div className="mt-1">
                {lead.project == null ? (
                  <span className="font-medium text-[#062E25]">-</span>
                ) : lead.project.isPropertyOwner ? (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                    {t('owner')}
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
                    {t('notOwner')}
                  </span>
                )}
              </div>
              {lead.project != null &&
                !lead.project.isPropertyOwner &&
                (lead.customer.propertyOwnerName ||
                  lead.customer.propertyOwnerEmail ||
                  lead.customer.propertyOwnerPhone) && (
                  <div className="mt-3">
                    <label className="text-sm text-[#062E25]/60">
                      {t('ownerContact')}
                    </label>
                    <div className="mt-1 grid grid-cols-2 gap-4">
                      {lead.customer.propertyOwnerName && (
                        <div>
                          <label className="text-sm text-[#062E25]/60">
                            {t('ownerName')}
                          </label>
                          <p className="font-medium text-[#062E25]">
                            {lead.customer.propertyOwnerName}
                          </p>
                        </div>
                      )}
                      {lead.customer.propertyOwnerEmail && (
                        <div>
                          <label className="text-sm text-[#062E25]/60">
                            {t('ownerEmail')}
                          </label>
                          <p className="font-medium text-[#062E25] break-all">
                            {lead.customer.propertyOwnerEmail}
                          </p>
                        </div>
                      )}
                      {lead.customer.propertyOwnerPhone && (
                        <div>
                          <label className="text-sm text-[#062E25]/60">
                            {t('ownerPhone')}
                          </label>
                          <p className="font-medium text-[#062E25]">
                            {lead.customer.propertyOwnerPhone}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
            </div>
            {(lead.customer.notes || lead.customer.addressAdditional) && (
              <div className="mt-4 pt-4 border-t border-[#062E25]/10 space-y-3">
                {lead.customer.notes && (
                  <div>
                    <label className="text-sm text-[#062E25]/60">
                      {t('customerRemarks')}
                    </label>
                    <p className="font-medium text-[#062E25] whitespace-pre-wrap">
                      {lead.customer.notes}
                    </p>
                  </div>
                )}
                {lead.customer.addressAdditional && (
                  <div>
                    <label className="text-sm text-[#062E25]/60">
                      {t('addressAdditional')}
                    </label>
                    <p className="font-medium text-[#062E25] whitespace-pre-wrap">
                      {lead.customer.addressAdditional}
                    </p>
                  </div>
                )}
              </div>
            )}
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
                <p className="font-medium text-[#062E25]">
                  {tl.has(lead.source) ? tl(lead.source) : lead.source}
                </p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">{t('interestedPackage')}</label>
                <p className="font-medium text-[#062E25]">
                  {packageLabel(lead.interestedPackage)}
                </p>
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

      {project && (
        <div className="mb-6">
          <MilestoneControls projectId={project.id} />
        </div>
      )}

      {hasCalculation && calc && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <CustomerInputsCard calc={calc} />
          <RoofDetailsCard calc={calc} project={project ?? null} />
        </div>
      )}

      <ContractsCard contracts={contracts} />

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
