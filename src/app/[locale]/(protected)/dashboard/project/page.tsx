'use client'

import { useEffect, useState } from 'react'
import { Zap, TrendingUp, Leaf, PanelTop, Sun, MapPin } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { customerPortalService, type ProjectSummary } from '@/services/customer-portal.service'

export default function ProjectPage() {
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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#062E25]" />
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="max-w-5xl">
        <h1 className="text-2xl font-bold text-[#062E25] mb-8">My Project</h1>
        <Card className="border-[#062E25]/10">
          <CardContent className="p-8 text-center">
            <Sun className="h-12 w-12 text-[#062E25]/20 mx-auto mb-4" />
            <p className="text-[#062E25]/60">No projects yet. Start with our solar calculator.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const project = projects[0]
  const sys = project.system

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-[#062E25] mb-8">My Project</h1>

      <Card className="mb-6 border-[#062E25]/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <MapPin className="h-5 w-5 text-[#062E25]/40 mt-0.5" />
            <div>
              <p className="font-semibold text-[#062E25]">{project.address}</p>
              <p className="text-sm text-[#062E25]/60">
                Package: {project.package} &middot; Status: {project.status}
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
                <p className="text-sm text-[#062E25]/60">kWp System Size</p>
              </CardContent>
            </Card>
            <Card className="border-[#062E25]/10">
              <CardContent className="p-5">
                <Zap className="h-5 w-5 text-yellow-500 mb-2" />
                <p className="text-2xl font-bold text-[#062E25]">
                  {Math.round(sys.annualProductionKwh).toLocaleString('de-CH')}
                </p>
                <p className="text-sm text-[#062E25]/60">kWh/year Production</p>
              </CardContent>
            </Card>
            <Card className="border-[#062E25]/10">
              <CardContent className="p-5">
                <TrendingUp className="h-5 w-5 text-green-500 mb-2" />
                <p className="text-2xl font-bold text-[#062E25]">
                  CHF {Math.round(sys.annualSavings).toLocaleString('de-CH')}
                </p>
                <p className="text-sm text-[#062E25]/60">Annual Savings</p>
              </CardContent>
            </Card>
            <Card className="border-[#062E25]/10">
              <CardContent className="p-5">
                <Leaf className="h-5 w-5 text-emerald-500 mb-2" />
                <p className="text-2xl font-bold text-[#062E25]">
                  {Math.round(sys.co2Savings).toLocaleString('de-CH')}
                </p>
                <p className="text-sm text-[#062E25]/60">kg CO₂/year Saved</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-[#062E25]/10">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-[#062E25] mb-4">System Details</h2>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                <div>
                  <p className="text-[#062E25]/60">Estimated Panels</p>
                  <p className="font-medium text-[#062E25]">~{sys.panelCount}</p>
                </div>
                <div>
                  <p className="text-[#062E25]/60">Self-Consumption Rate</p>
                  <p className="font-medium text-[#062E25]">{Math.round(sys.selfConsumptionRate * 100)}%</p>
                </div>
                <div>
                  <p className="text-[#062E25]/60">Annual Consumption</p>
                  <p className="font-medium text-[#062E25]">
                    {Math.round(sys.estimatedConsumption).toLocaleString('de-CH')} kWh
                  </p>
                </div>
                <div>
                  <p className="text-[#062E25]/60">Contract Status</p>
                  <p className="font-medium text-[#062E25]">
                    {project.contract ? project.contract.signatureStatus : 'No contract yet'}
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
