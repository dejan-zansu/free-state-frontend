'use client'

import { useEffect, useState } from 'react'
import { Zap, TrendingUp, Leaf, PanelTop, Sun, MapPin } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Card, CardContent } from '@/components/ui/card'
import { PageLoader } from '@/components/ui/page-loader'
import { customerPortalService, type ProjectSummary } from '@/services/customer-portal.service'

export default function ProjectPage() {
  const t = useTranslations('dashboard.project')
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    customerPortalService
      .getProjects()
      .then(setProjects)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <PageLoader />
  }

  if (projects.length === 0) {
    return (
      <div className="max-w-5xl">
        <h1 className="text-2xl font-bold text-[#062E25] mb-8">{t('title')}</h1>
        <Card className="border-[#062E25]/10">
          <CardContent className="p-8 text-center">
            <Sun className="h-12 w-12 text-[#062E25]/20 mx-auto mb-4" />
            <p className="text-[#062E25]/60">{t('noProjects')}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const project = projects[0]
  const sys = project.system

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-[#062E25] mb-8">{t('title')}</h1>

      <Card className="mb-6 border-[#062E25]/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <MapPin className="h-5 w-5 text-[#062E25]/40 mt-0.5" />
            <div>
              <p className="font-semibold text-[#062E25]">{project.address}</p>
              <p className="text-sm text-[#062E25]/60">
                {t('package')}: {project.package} &middot; {t('status')}: {project.status}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {sys && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                <div>
                  <p className="text-[#062E25]/60">{t('estimatedPanels')}</p>
                  <p className="font-medium text-[#062E25]">~{sys.panelCount}</p>
                </div>
                <div>
                  <p className="text-[#062E25]/60">{t('selfConsumption')}</p>
                  <p className="font-medium text-[#062E25]">{Math.round(sys.selfConsumptionRate * 100)}%</p>
                </div>
                <div>
                  <p className="text-[#062E25]/60">{t('annualConsumption')}</p>
                  <p className="font-medium text-[#062E25]">
                    {Math.round(sys.estimatedConsumption).toLocaleString('de-CH')} kWh
                  </p>
                </div>
                <div>
                  <p className="text-[#062E25]/60">{t('contractStatus')}</p>
                  <p className="font-medium text-[#062E25]">
                    {project.contract ? project.contract.signatureStatus : t('noContract')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
