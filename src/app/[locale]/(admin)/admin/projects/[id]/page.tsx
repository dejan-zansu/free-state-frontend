'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Download, ExternalLink, Loader2, Mail } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'

import { AdminPageLoader } from '@/components/admin/AdminPageLoader'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { CalculationSnapshotCard } from '@/components/admin/calculation/CalculationSnapshotCard'
import { ContractsCard } from '@/components/admin/calculation/ContractsCard'
import { CustomerInputsCard } from '@/components/admin/calculation/CustomerInputsCard'
import { FinancialsCard } from '@/components/admin/calculation/FinancialsCard'
import { JourneyCard } from '@/components/admin/calculation/JourneyCard'
import { MonthlyProductionCard } from '@/components/admin/calculation/MonthlyProductionCard'
import { RoofDetailsCard } from '@/components/admin/calculation/RoofDetailsCard'
import { fmtDateTime } from '@/components/admin/calculation/format'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { adminEquipmentService } from '@/services/admin-equipment.service'
import { adminService } from '@/services/admin.service'
import type { AdminProjectDetail, AdminSendOfferResult } from '@/types/admin'

export default function AdminProjectDetailPage() {
  const params = useParams()
  const locale = useLocale()
  const t = useTranslations('admin.projects')
  const tLeads = useTranslations('admin.leads')
  const tc = useTranslations('admin.common')
  const tl = useTranslations('admin.statusLabels')
  const queryClient = useQueryClient()

  const [downloading, setDownloading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [offerDialogOpen, setOfferDialogOpen] = useState(false)
  const [sendingOffer, setSendingOffer] = useState(false)
  const [offerResult, setOfferResult] = useState<AdminSendOfferResult | null>(
    null,
  )

  const { data: project, isLoading } = useQuery<AdminProjectDetail>({
    queryKey: ['admin', 'project', params.id],
    queryFn: () => adminService.getProjectById(params.id as string),
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
    if (tLeads.has(`packages.${code}`)) return tLeads(`packages.${code}`)
    return packageNames.get(code) ?? code
  }

  const handleDownload = async () => {
    if (!project) return
    setDownloading(true)
    setActionError(null)
    try {
      await adminService.downloadProjectReport(
        project.id,
        project.propertyAddress,
      )
    } catch (err: unknown) {
      setActionError(
        err instanceof Error ? err.message : tLeads('reportDownloadFailed'),
      )
    } finally {
      setDownloading(false)
    }
  }

  const handleSendOffer = async () => {
    if (!project) return
    setSendingOffer(true)
    setActionError(null)
    try {
      const result = await adminService.sendProjectOffer(project.id)
      setOfferResult(result)
      setOfferDialogOpen(false)
      queryClient.invalidateQueries({ queryKey: ['admin', 'project', params.id] })
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : t('offerSendFailed'))
      setOfferDialogOpen(false)
    } finally {
      setSendingOffer(false)
    }
  }

  if (isLoading) {
    return <AdminPageLoader className="h-64" />
  }

  if (!project) {
    return <p className="text-[#062E25]/60">{tc('notFound')}</p>
  }

  const calc = project.solarCalculation
  const hasCalculation = !!calc
  const user = project.customer.user
  const monthly = calc?.monthlyProductionKwh ?? []

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-[#062E25]">
          {user.firstName} {user.lastName}
        </h1>
        <StatusBadge status={project.status} />
        {!project.lead && (
          <span className="inline-flex items-center rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-700">
            {t('noOffer')}
          </span>
        )}
        <div className="ml-auto flex flex-wrap items-center gap-2">
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
            {t('downloadOffer')}
          </Button>
          <Button
            onClick={() => setOfferDialogOpen(true)}
            disabled={!hasCalculation}
            className="bg-[#062E25] hover:bg-[#062E25]/90 text-white"
          >
            <Mail className="mr-2 h-4 w-4" />
            {t('sendOffer')}
          </Button>
        </div>
      </div>

      {actionError && (
        <div className="mb-4 text-base text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg">
          {actionError}
        </div>
      )}

      {offerResult && (
        <div className="mb-4 text-base text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
          {t(`offerResult.${offerResult.status}`)}
        </div>
      )}

      {!hasCalculation && (
        <Card className="border-amber-200 bg-amber-50 mb-6">
          <CardContent className="p-4">
            <p className="text-base text-amber-900">{tLeads('noCalculation')}</p>
          </CardContent>
        </Card>
      )}

      <JourneyCard
        attribution={project.attribution}
        journey={project.journey}
      />

      {hasCalculation && calc && (
        <CalculationSnapshotCard
          calc={calc}
          selectedPackage={project.selectedPackage}
          packageLabel={packageLabel}
        />
      )}

      {project.financials && (
        <FinancialsCard financials={project.financials} calc={calc} />
      )}

      {hasCalculation && <MonthlyProductionCard monthly={monthly} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="border-[#062E25]/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">
              {tLeads('contact')}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-[#062E25]/60">
                  {tLeads('name')}
                </label>
                <p className="font-medium text-[#062E25]">
                  {user.firstName} {user.lastName}
                </p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">
                  {tLeads('email')}
                </label>
                <p className="font-medium text-[#062E25] break-all">
                  <a href={`mailto:${user.email}`} className="hover:underline">
                    {user.email}
                  </a>
                </p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">
                  {tLeads('phone')}
                </label>
                <p className="font-medium text-[#062E25]">
                  {user.phone ? (
                    <a href={`tel:${user.phone}`} className="hover:underline">
                      {user.phone}
                    </a>
                  ) : (
                    '-'
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">
                  {tLeads('preferredLanguage')}
                </label>
                <p className="font-medium text-[#062E25] uppercase">
                  {user.preferredLanguage || '-'}
                </p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">
                  {tLeads('dateOfBirth')}
                </label>
                <p className="font-medium text-[#062E25]">
                  {user.dateOfBirth
                    ? new Date(user.dateOfBirth).toLocaleDateString('de-CH')
                    : '-'}
                </p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">
                  {tLeads('nationality')}
                </label>
                <p className="font-medium text-[#062E25]">
                  {user.nationality || '-'}
                </p>
              </div>
              <div className="col-span-2">
                <label className="text-sm text-[#062E25]/60">
                  {t('billingAddress')}
                </label>
                <p className="font-medium text-[#062E25]">
                  {[
                    [project.customer.street, project.customer.streetNumber]
                      .filter(Boolean)
                      .join(' '),
                    [project.customer.postalCode, project.customer.city]
                      .filter(Boolean)
                      .join(' '),
                  ]
                    .filter(Boolean)
                    .join(', ') || '-'}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[#062E25]/10 flex flex-wrap gap-2">
              {user.emailVerified && (
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                  {t('emailVerified')}
                </span>
              )}
              {project.isPropertyOwner ? (
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                  {tLeads('owner')}
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
                  {tLeads('notOwner')}
                </span>
              )}
            </div>
            {(project.customer.notes || project.customer.addressAdditional) && (
              <div className="mt-4 pt-4 border-t border-[#062E25]/10 space-y-3">
                {project.customer.notes && (
                  <div>
                    <label className="text-sm text-[#062E25]/60">
                      {tLeads('customerRemarks')}
                    </label>
                    <p className="font-medium text-[#062E25] whitespace-pre-wrap">
                      {project.customer.notes}
                    </p>
                  </div>
                )}
                {project.customer.addressAdditional && (
                  <div>
                    <label className="text-sm text-[#062E25]/60">
                      {tLeads('addressAdditional')}
                    </label>
                    <p className="font-medium text-[#062E25] whitespace-pre-wrap">
                      {project.customer.addressAdditional}
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
              {t('projectInfo')}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm text-[#062E25]/60">
                  {tLeads('propertyAddress')}
                </label>
                <p className="font-medium text-[#062E25]">
                  {project.propertyAddress}
                </p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">
                  {tLeads('interestedPackage')}
                </label>
                <p className="font-medium text-[#062E25]">
                  {packageLabel(project.selectedPackage)}
                </p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">
                  {tLeads('projectStatus')}
                </label>
                <p className="font-medium text-[#062E25]">
                  {tl.has(project.status)
                    ? tl(project.status)
                    : project.status.replace(/_/g, ' ')}
                </p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">
                  {t('createdAt')}
                </label>
                <p className="font-medium text-[#062E25]">
                  {fmtDateTime(project.createdAt)}
                </p>
              </div>
              <div>
                <label className="text-sm text-[#062E25]/60">
                  {t('lastActivity')}
                </label>
                <p className="font-medium text-[#062E25]">
                  {fmtDateTime(project.updatedAt)}
                </p>
              </div>
              <div className="col-span-2 pt-4 border-t border-[#062E25]/10">
                <label className="text-sm text-[#062E25]/60">
                  {t('offerStatus')}
                </label>
                {project.lead ? (
                  <div className="mt-1 flex flex-wrap items-center gap-3">
                    <StatusBadge status={project.lead.status} />
                    <span className="text-base text-[#062E25]/60">
                      {project.lead.offerSentAt
                        ? t('offerSentOn', {
                            date: fmtDateTime(project.lead.offerSentAt),
                            count: project.lead.offerCount,
                          })
                        : t('leadWithoutOffer')}
                    </span>
                    <Link
                      href={`/${locale}/admin/leads/${project.lead.id}`}
                      className="inline-flex items-center gap-1 text-base font-medium text-[#062E25] hover:underline"
                    >
                      {t('openLead')}
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </div>
                ) : (
                  <p className="mt-1 font-medium text-red-700">
                    {t('neverRequestedOffer')}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {hasCalculation && calc && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <CustomerInputsCard calc={calc} />
          <RoofDetailsCard
            calc={calc}
            project={{
              propertyLat: project.propertyLat,
              propertyLng: project.propertyLng,
              status: project.status,
            }}
          />
        </div>
      )}

      <ContractsCard contracts={project.contracts} />

      <Dialog open={offerDialogOpen} onOpenChange={setOfferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('sendOfferConfirmTitle')}</DialogTitle>
            <DialogDescription>
              {t('sendOfferConfirmBody', { email: user.email })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOfferDialogOpen(false)}
              disabled={sendingOffer}
            >
              {tc('cancel')}
            </Button>
            <Button
              onClick={handleSendOffer}
              disabled={sendingOffer}
              className="bg-[#062E25] hover:bg-[#062E25]/90 text-white"
            >
              {sendingOffer && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t('sendOffer')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
