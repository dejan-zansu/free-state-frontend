'use client'

import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Leaf,
  Loader2,
  MapPin,
  PanelTop,
  Sun,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Link from 'next/link'
import { useParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { PageLoader } from '@/components/ui/page-loader'
import { customerPortalService, type ProjectSummary } from '@/services/customer-portal.service'
import {
  residentialCalculatorService,
  type CalculatorPackage,
} from '@/services/residential-calculator.service'

export default function ProjectDetailPage() {
  const t = useTranslations('dashboard.project')
  const to = useTranslations('dashboard.overview')
  const locale = useLocale()
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<ProjectSummary | null>(null)
  const [packages, setPackages] = useState<CalculatorPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [reportDownloading, setReportDownloading] = useState(false)
  const [reportError, setReportError] = useState<string | null>(null)
  const [offerSubmitting, setOfferSubmitting] = useState(false)
  const [offerError, setOfferError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setNotFound(false)
    ;(async () => {
      try {
        await customerPortalService.getProjectById(id)
        const projects = await customerPortalService.getProjects()
        const found = projects.find((p) => p.id === id) ?? null
        if (!active) return
        if (found) {
          setProject(found)
        } else {
          setNotFound(true)
        }
      } catch {
        if (active) setNotFound(true)
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [id])

  useEffect(() => {
    residentialCalculatorService
      .getPackages(locale)
      .then(setPackages)
      .catch(console.error)
  }, [locale])

  const handleDownloadReport = async () => {
    setReportDownloading(true)
    setReportError(null)
    try {
      await customerPortalService.downloadProjectReport(id)
    } catch {
      setReportError(to('reportError'))
    } finally {
      setReportDownloading(false)
    }
  }

  const handleRequestOffer = async () => {
    setOfferSubmitting(true)
    setOfferError(null)
    try {
      await residentialCalculatorService.requestOffer({ projectId: id })
      const projects = await customerPortalService.getProjects()
      const found = projects.find((p) => p.id === id) ?? null
      if (found) setProject(found)
    } catch {
      setOfferError(to('offerError'))
    } finally {
      setOfferSubmitting(false)
    }
  }

  if (loading) {
    return <PageLoader />
  }

  if (notFound || !project) {
    return (
      <div className="max-w-5xl">
        <h1 className="text-2xl font-bold text-[#062E25] mb-8">{t('title')}</h1>
        <Card className="border-[#062E25]/10">
          <CardContent className="p-8 text-center">
            <Sun className="h-12 w-12 text-[#062E25]/20 mx-auto mb-4" />
            <p className="text-[#062E25]/60 mb-4">{t('noProjects')}</p>
            <Button asChild variant="outline" style={{ borderColor: '#062E25', color: '#062E25' }}>
              <Link href={`/${locale}/dashboard/project`}>{t('back')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const sys = project.system
  const statusLabel = t.has(`statuses.${project.status}`)
    ? t(`statuses.${project.status}`)
    : project.status
  const packageLabel = t.has(`packages.${project.package}`)
    ? t(`packages.${project.package}`)
    : (packages.find((p) => p.code === project.package)?.name ?? project.package)
  const signatureLabel = project.contract
    ? t.has(`signatureStatuses.${project.contract.signatureStatus}`)
      ? t(`signatureStatuses.${project.contract.signatureStatus}`)
      : project.contract.signatureStatus
    : t('noContract')

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <Link
          href={`/${locale}/dashboard/project`}
          className="inline-flex items-center gap-1 text-sm text-[#062E25]/60 hover:text-[#062E25] mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('back')}
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-[#062E25]">{t('title')}</h1>
          <div className="flex flex-wrap gap-2 self-start sm:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadReport}
              disabled={reportDownloading}
              style={{ borderColor: '#062E25', color: '#062E25' }}
            >
              <Download className="h-4 w-4 mr-2" />
              {reportDownloading ? to('downloadingReport') : to('downloadReport')}
            </Button>
            {project.conversionStatus === 'calculation_complete' && (
              <Button
                onClick={handleRequestOffer}
                disabled={offerSubmitting}
                size="sm"
                className="bg-[#062E25] hover:bg-[#062E25]/90 text-white"
              >
                {offerSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {to('requestingOffer')}
                  </>
                ) : (
                  <>
                    {to('requestOfferCta')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
        {(reportError || offerError) && (
          <p className="text-sm text-red-600 mt-2">{reportError ?? offerError}</p>
        )}
      </div>

      <Card className="mb-6 border-[#062E25]/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-[#062E25]/40 mt-0.5" />
            <div>
              <p className="font-semibold text-[#062E25]">{project.address}</p>
              <p className="text-sm text-[#062E25]/60">
                {t('package')}: {packageLabel} {'·'} {t('status')}: {statusLabel}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {sys && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card className="border-[#062E25]/10">
              <CardContent className="p-5">
                <PanelTop className="h-5 w-5 text-[#062E25]/40 mb-2" />
                <p className="text-2xl font-bold text-[#062E25]">{sys.systemSizeKwp.toFixed(1)}</p>
                <p className="text-sm text-[#062E25]/60">{t('systemSize')}</p>
              </CardContent>
            </Card>
            <Card className="border-[#062E25]/10">
              <CardContent className="p-5">
                <Zap className="h-5 w-5 text-yellow-500 mb-2" />
                <p className="text-2xl font-bold text-[#062E25]">
                  {Math.round(sys.annualProductionKwh).toLocaleString('de-CH')}
                </p>
                <p className="text-sm text-[#062E25]/60">{t('production')}</p>
              </CardContent>
            </Card>
            <Card className="border-[#062E25]/10">
              <CardContent className="p-5">
                <TrendingUp className="h-5 w-5 text-green-500 mb-2" />
                <p className="text-2xl font-bold text-[#062E25]">
                  CHF {Math.round(sys.annualSavings).toLocaleString('de-CH')}
                </p>
                <p className="text-sm text-[#062E25]/60">{t('annualSavings')}</p>
              </CardContent>
            </Card>
            <Card className="border-[#062E25]/10">
              <CardContent className="p-5">
                <Leaf className="h-5 w-5 text-emerald-500 mb-2" />
                <p className="text-2xl font-bold text-[#062E25]">
                  {Math.round(sys.co2Savings).toLocaleString('de-CH')}
                </p>
                <p className="text-sm text-[#062E25]/60">{t('co2Saved')}</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-[#062E25]/10">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-[#062E25] mb-4">{t('systemDetails')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                <div>
                  <p className="text-[#062E25]/60">{t('estimatedPanels')}</p>
                  <p className="font-medium text-[#062E25]">~{sys.panelCount}</p>
                </div>
                <div>
                  <p className="text-[#062E25]/60">{t('selfConsumption')}</p>
                  <p className="font-medium text-[#062E25]">
                    {Math.round(sys.selfConsumptionRate * 100)}%
                  </p>
                </div>
                <div>
                  <p className="text-[#062E25]/60">{t('annualConsumption')}</p>
                  <p className="font-medium text-[#062E25]">
                    {Math.round(sys.estimatedConsumption).toLocaleString('de-CH')} kWh
                  </p>
                </div>
                <div>
                  <p className="text-[#062E25]/60">{t('contractStatus')}</p>
                  <p className="font-medium text-[#062E25]">{signatureLabel}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
