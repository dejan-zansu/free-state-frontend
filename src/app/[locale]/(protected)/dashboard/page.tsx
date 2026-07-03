'use client'

import { ArrowRight, Check, Clock, Download, Loader2, Mail } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageLoader } from '@/components/ui/page-loader'
import {
  customerPortalService,
  type DashboardData,
} from '@/services/customer-portal.service'
import { residentialCalculatorService } from '@/services/residential-calculator.service'
import { DataRequestActionRequiredCard } from '@/components/dashboard/DataRequestActionRequiredCard'
import SolarStatGrid from '@/components/dashboard/SolarStatGrid'
import { StageTimeline } from '@/components/dashboard/StageTimeline'

const STATUS_META: Record<string, { labelKey: string; descKey: string; color: string }> = {
  no_project: {
    labelKey: 'statusNoProjectLabel',
    descKey: 'statusNoProjectDesc',
    color: 'bg-gray-100 text-gray-700',
  },
  calculation_complete: {
    labelKey: 'statusCalcCompleteLabel',
    descKey: 'statusCalcCompleteDesc',
    color: 'bg-blue-100 text-blue-700',
  },
  offer_requested: {
    labelKey: 'statusOfferRequestedLabel',
    descKey: 'statusOfferRequestedDesc',
    color: 'bg-amber-100 text-amber-700',
  },
  contract_pending: {
    labelKey: 'statusContractPendingLabel',
    descKey: 'statusContractPendingDesc',
    color: 'bg-orange-100 text-orange-700',
  },
  contract_signed: {
    labelKey: 'statusContractSignedLabel',
    descKey: 'statusContractSignedDesc',
    color: 'bg-green-100 text-green-700',
  },
}

const ACTIVITY_KEYS: Record<string, string> = {
  account_created: 'activityAccountCreated',
  calculation_completed: 'activityCalculationCompleted',
  offer_requested: 'activityOfferRequested',
  contract_created: 'activityContractCreated',
  contract_signed: 'activityContractSigned',
}

export default function DashboardPage() {
  const t = useTranslations('dashboard.overview')
  const [data, setData] = useState<DashboardData | null>(null)
  const locale = useLocale()
  const [loading, setLoading] = useState(true)
  const [offerSubmitting, setOfferSubmitting] = useState(false)
  const [offerError, setOfferError] = useState<string | null>(null)
  const [reportDownloading, setReportDownloading] = useState(false)
  const [reportError, setReportError] = useState<string | null>(null)
  const [emailSending, setEmailSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  useEffect(() => {
    customerPortalService
      .getDashboard()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleRequestOffer = async () => {
    if (!data?.project) return
    setOfferSubmitting(true)
    setOfferError(null)
    try {
      await residentialCalculatorService.requestOffer({ projectId: data.project.id })
      const refreshed = await customerPortalService.getDashboard()
      setData(refreshed)
    } catch {
      setOfferError(t('offerError'))
    } finally {
      setOfferSubmitting(false)
    }
  }

  const handleDownloadReport = async () => {
    if (!data?.project) return
    setReportDownloading(true)
    setReportError(null)
    try {
      await customerPortalService.downloadProjectReport(data.project.id)
    } catch {
      setReportError(t('reportError'))
    } finally {
      setReportDownloading(false)
    }
  }

  const handleEmailReport = async () => {
    if (!data?.project) return
    setEmailSending(true)
    setReportError(null)
    try {
      await residentialCalculatorService.emailReport({ projectId: data.project.id })
      setEmailSent(true)
      setTimeout(() => setEmailSent(false), 3000)
    } catch {
      setReportError(t('reportError'))
    } finally {
      setEmailSending(false)
    }
  }

  if (loading) {
    return <PageLoader />
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <p className="text-[#062E25]/60">{t('failedToLoad')}</p>
      </div>
    )
  }

  const meta = STATUS_META[data.status] || STATUS_META.no_project

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-[#062E25] mb-1">
        {t('welcome', { firstName: data.user.firstName })}
      </h1>
      <p className="text-[#062E25]/60 mb-8">{t('subtitle')}</p>

      <DataRequestActionRequiredCard />

      <Card className="mb-8 border-[#062E25]/10">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <span
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${meta.color}`}
              >
                {t(meta.labelKey)}
              </span>
              <p className="text-sm text-[#062E25]/60">{t(meta.descKey)}</p>
            </div>
            {data.status === 'no_project' && (
              <Button
                asChild
                className="bg-[#062E25] hover:bg-[#062E25]/90 text-white"
              >
                <Link href={`/${locale}/calculator`}>
                  {t('startCalculator')} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
            {data.status === 'calculation_complete' && data.project && (
              <div className="space-y-2">
                <Button
                  onClick={handleRequestOffer}
                  disabled={offerSubmitting}
                  className="bg-[#062E25] hover:bg-[#062E25]/90 text-white"
                >
                  {offerSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t('requestingOffer')}
                    </>
                  ) : (
                    <>
                      {t('requestOfferCta')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                {offerError && <p className="text-sm text-red-600">{offerError}</p>}
              </div>
            )}
            {data.status === 'contract_pending' && data.contract && (
              <Button
                asChild
                className="bg-[#062E25] hover:bg-[#062E25]/90 text-white"
              >
                <Link href={`/${locale}/dashboard/contract`}>
                  {t('viewContract')} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {data.stats && (
        <div className="mb-8">
          <SolarStatGrid
            systemSizeKwp={data.stats.systemSizeKwp}
            annualProductionKwh={data.stats.annualProductionKwh}
            annualSavings={data.stats.annualSavings}
            co2Savings={data.stats.co2Savings}
            labels={{
              systemSize: t('systemSize'),
              kwp: t('kwp'),
              annualProduction: t('annualProduction'),
              kwh: t('kwh'),
              annualSavings: t('annualSavings'),
              chf: t('chf'),
              co2Savings: t('co2Savings'),
              kgPerYear: t('kgPerYear'),
            }}
          />
        </div>
      )}

      <div className="mb-8">
        <h2 className="mb-1 text-lg font-semibold text-[#062E25]">
          {t('whatsNext')}
        </h2>
        <p className="mb-4 text-base text-[#062E25]/60">{t('whatsNextSubtitle')}</p>
        <StageTimeline milestones={data.milestones ?? []} />
      </div>

      {data.project && (
        <Card className="mb-8 border-[#062E25]/10">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold text-[#062E25]">
                {t('yourProject')}
              </h2>
              <div className="flex flex-wrap gap-2 self-start sm:self-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadReport}
                  disabled={reportDownloading}
                  style={{ borderColor: '#062E25', color: '#062E25' }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {reportDownloading ? t('downloadingReport') : t('downloadReport')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEmailReport}
                  disabled={emailSending}
                  style={{ borderColor: '#062E25', color: '#062E25' }}
                >
                  {emailSent ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      {t('reportEmailSent')}
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      {emailSending ? t('sendingReport') : t('emailReport')}
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  style={{ borderColor: '#062E25', color: '#062E25' }}
                >
                  <Link href={`/${locale}/dashboard/project`}>{t('viewDetails')}</Link>
                </Button>
              </div>
            </div>
            {reportError && <p className="text-sm text-red-600 mb-4">{reportError}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[#062E25]/60">{t('address')}</p>
                <p className="font-medium text-[#062E25]">
                  {data.project.address}
                </p>
              </div>
              <div>
                <p className="text-[#062E25]/60">{t('package')}</p>
                <p className="font-medium text-[#062E25]">
                  {data.project.package}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {data.activity.length > 0 && (
        <Card className="border-[#062E25]/10">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-[#062E25] mb-4">
              {t('activity')}
            </h2>
            <div className="space-y-4">
              {data.activity.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-[#062E25]/30 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#062E25]">
                      {ACTIVITY_KEYS[item.type] ? t(ACTIVITY_KEYS[item.type]) : item.type}
                    </p>
                    <p className="text-sm text-[#062E25]/40">
                      {new Date(item.date).toLocaleDateString('de-CH', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
