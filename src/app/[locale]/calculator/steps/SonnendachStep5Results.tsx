'use client'

import {
  ChevronLeft,
  Zap,
  Ruler,
  TrendingUp,
  Leaf,
  Building2,
  CheckCircle2,
  Download,
  Loader2,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import RoofVisualizationMap, {
  type RoofVisualizationMapRef,
} from '@/components/calculator/RoofVisualizationMap'
import { reportService } from '@/services/report.service'
import { useSonnendachCalculatorStore } from '@/stores/sonnendach-calculator.store'
import { SUITABILITY_CLASSES } from '@/types/sonnendach'

export default function SonnendachStep5Results() {
  const t = useTranslations('sonnendach.step5')
  const {
    building,
    address,
    selectedArea,
    selectedPotentialKwh,
    selectedPanel,
    selectedInverter,
    panelCount,
    restrictedAreas,
    consumption,
    getSelectedSegments,
    getUsableArea,
    getTotalRestrictedArea,
    goToStep,
    reset,
  } = useSonnendachCalculatorStore()

  const mapRef = useRef<RoofVisualizationMapRef>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const usableArea = getUsableArea()
  const totalRestrictedArea = getTotalRestrictedArea()

  const selectedSegments = getSelectedSegments()

  // Calculate aggregated stats
  const averageTilt =
    selectedSegments.length > 0
      ? Math.round(
          selectedSegments.reduce((sum, s) => sum + s.tilt, 0) /
            selectedSegments.length
        )
      : 0

  // Get dominant orientation
  const orientationCounts = selectedSegments.reduce(
    (acc, s) => {
      acc[s.azimuthCardinal] = (acc[s.azimuthCardinal] || 0) + s.area
      return acc
    },
    {} as Record<string, number>
  )
  const dominantOrientation =
    Object.entries(orientationCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    'N/A'

  // Calculate CO2 savings (Swiss grid factor: ~26g CO2/kWh, but offset vs EU average: ~400g)
  const co2SavingsKg = Math.round(selectedPotentialKwh * 0.4) // 400g per kWh

  // Use actual panel data from selection
  const systemSizeKwp =
    selectedPanel && panelCount
      ? Math.round(((selectedPanel.power * panelCount) / 1000) * 10) / 10
      : 0

  // Financial estimates using actual equipment costs
  const panelCost = selectedPanel ? selectedPanel.price * panelCount : 0
  const inverterCost = selectedInverter ? selectedInverter.price : 0
  const installationCost = Math.round(systemSizeKwp * 800) // Installation labor ~800 CHF/kWp
  const estimatedCost = panelCost + inverterCost + installationCost
  const federalSubsidy = Math.round(600 + systemSizeKwp * 350) // Simplified Swiss subsidy
  const netCost = estimatedCost - Math.min(federalSubsidy, estimatedCost * 0.3)

  // Electricity price assumptions
  const purchasePrice = 0.25 // CHF/kWh
  const feedInTariff = 0.12 // CHF/kWh
  const selfConsumptionRate = 0.3 // 30% self-consumption

  const selfConsumedKwh = selectedPotentialKwh * selfConsumptionRate
  const exportedKwh = selectedPotentialKwh * (1 - selfConsumptionRate)
  const yearlySavings = Math.round(
    selfConsumedKwh * purchasePrice + exportedKwh * feedInTariff
  )
  const paybackYears =
    yearlySavings > 0 ? Math.round((netCost / yearlySavings) * 10) / 10 : 0

  // Download report handler
  const handleDownloadReport = async () => {
    console.log('[Report] Starting download...')
    setIsDownloading(true)
    setDownloadError(null)

    try {
      // Capture the roof visualization map
      console.log('[Report] Capturing map image...')
      let roofImage: string | undefined
      if (mapRef.current) {
        const capturedImage = await mapRef.current.captureImage()
        if (capturedImage) {
          roofImage = capturedImage
          console.log('[Report] Map captured, size:', capturedImage.length)
        }
      }

      // Calculate coordinates from selected segments
      let latitude = 0
      let longitude = 0
      if (selectedSegments.length > 0) {
        const firstSegment = selectedSegments[0]
        const coords = firstSegment.geometry.coordinatesWGS84?.[0] || []
        if (coords.length > 0) {
          latitude = coords.reduce((sum, c) => sum + c[1], 0) / coords.length
          longitude = coords.reduce((sum, c) => sum + c[0], 0) / coords.length
        }
      }

      // Build roof polygon from selected segments
      const roofPolygonCoords: Array<{ lat: number; lng: number }> = []
      for (const segment of selectedSegments) {
        const coords = segment.geometry.coordinatesWGS84?.[0] || []
        for (const coord of coords) {
          roofPolygonCoords.push({ lat: coord[1], lng: coord[0] })
        }
      }

      // Generate monthly production estimate (distributed by Swiss solar patterns)
      const monthlyFactors = [
        0.04, 0.05, 0.08, 0.1, 0.12, 0.12, 0.13, 0.12, 0.1, 0.07, 0.04, 0.03,
      ]
      const monthlyProduction = monthlyFactors.map(f =>
        Math.round(selectedPotentialKwh * f)
      )

      console.log('[Report] Calling API with:', {
        latitude,
        longitude,
        panelCount,
        yearlyProduction: selectedPotentialKwh,
        hasRoofImage: !!roofImage,
        roofImageLength: roofImage?.length || 0,
      })
      await reportService.downloadSonnendachReport({
        latitude,
        longitude,
        address: address || 'Solar Installation',
        countryCode: 'CH',
        panelCount,
        panelPower: selectedPanel?.power || 400,
        panelWidth: selectedPanel?.width,
        panelHeight: selectedPanel?.height,
        panelName: selectedPanel?.name,
        inverterName: selectedInverter?.name,
        inverterPower: selectedInverter?.power,
        roofArea: selectedArea,
        roofPolygon:
          roofPolygonCoords.length >= 3
            ? {
                coordinates: roofPolygonCoords,
                area: selectedArea,
              }
            : undefined,
        roofImage,
        orientation: 180, // Default south
        tilt: averageTilt,
        yearlyProduction: selectedPotentialKwh,
        monthlyProduction,
        dailyAverage: Math.round(selectedPotentialKwh / 365),
        co2Reduction: co2SavingsKg,
        panelCost,
        inverterCost,
        installationCost,
        totalInvestment: estimatedCost,
        vatRate: 0,
        subsidies: federalSubsidy,
        netInvestment: netCost,
        annualSavings: yearlySavings,
        totalSavings: yearlySavings * 30,
        netYield: yearlySavings * 30 - netCost,
        paybackYears,
        electricityTariff: purchasePrice,
        feedInTariff: feedInTariff,
        selfConsumptionRate: selfConsumptionRate,
        annualConsumption: consumption?.annualConsumptionKwh || 4500,
        language: 'de',
      })
      console.log('[Report] Download completed!')
    } catch (error) {
      console.error('[Report] Failed:', error)
      setDownloadError(
        error instanceof Error ? error.message : 'Failed to download report'
      )
    } finally {
      console.log('[Report] Finished')
      setIsDownloading(false)
    }
  }

  if (!building) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">{t('noData')}</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Roof Visualization */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              {t('roofVisualization')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RoofVisualizationMap
              ref={mapRef}
              height="350px"
              showLegend={true}
              className="rounded-lg overflow-hidden"
            />
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Zap className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {selectedPotentialKwh.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">kWh/year</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Ruler className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {Math.round(usableArea * 10) / 10}
              </p>
              <p className="text-sm text-muted-foreground">
                m² {t('usableArea')}
              </p>
              {totalRestrictedArea > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  ({selectedArea} - {Math.round(totalRestrictedArea * 10) / 10}{' '}
                  {t('restricted')})
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Building2 className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{panelCount}</p>
              <p className="text-sm text-muted-foreground">{t('panels')}</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Leaf className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold">
                {co2SavingsKg.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">kg CO2/year</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Selected Roof Segments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                {t('selectedRoofs')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedSegments.map(segment => {
                const suitability =
                  SUITABILITY_CLASSES[segment.suitability.class]
                return (
                  <div
                    key={segment.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{
                          backgroundColor: suitability?.color || '#888',
                        }}
                      />
                      <div>
                        <p className="font-medium capitalize">
                          {suitability?.label}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {segment.azimuthCardinal} facing, {segment.tilt}° tilt
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{segment.area} m²</p>
                      <p className="text-xs text-muted-foreground">
                        {segment.electricityYield.toLocaleString()} kWh
                      </p>
                    </div>
                  </div>
                )
              })}

              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t('totalRoofArea')}
                  </span>
                  <span className="font-medium">{selectedArea} m²</span>
                </div>
                {totalRestrictedArea > 0 && (
                  <>
                    <div className="flex justify-between text-sm text-destructive">
                      <span>
                        {t('restrictedAreas')} ({restrictedAreas.length})
                      </span>
                      <span className="font-medium">
                        -{Math.round(totalRestrictedArea * 10) / 10} m²
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold">
                      <span className="text-muted-foreground">
                        {t('usableArea')}
                      </span>
                      <span className="text-primary">
                        {Math.round(usableArea * 10) / 10} m²
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t('averageTilt')}
                  </span>
                  <span className="font-medium">{averageTilt}°</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t('dominantOrientation')}
                  </span>
                  <span className="font-medium">{dominantOrientation}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t('systemSize')}
                  </span>
                  <span className="font-medium">{systemSizeKwp} kWp</span>
                </div>
                {selectedPanel && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t('panelType')}
                    </span>
                    <span className="font-medium">{selectedPanel.name}</span>
                  </div>
                )}
                {selectedInverter && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t('inverter')}
                    </span>
                    <span className="font-medium">{selectedInverter.name}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Financial Estimate */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                {t('financialEstimate')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {t('estimatedCost')}
                  </span>
                  <span className="font-medium">
                    CHF {estimatedCost.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>{t('federalSubsidy')}</span>
                  <span className="font-medium">
                    - CHF{' '}
                    {Math.min(
                      federalSubsidy,
                      estimatedCost * 0.3
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>{t('netCost')}</span>
                  <span>CHF {netCost.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t('yearlySavings')}
                  </span>
                  <span className="font-medium text-green-600">
                    CHF {yearlySavings.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {t('paybackPeriod')}
                  </span>
                  <span className="font-medium">{paybackYears} years</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
                {t('disclaimer')}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Download Error */}
        {downloadError && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {downloadError}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => goToStep(4)}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            {t('back')}
          </Button>
          <Button onClick={reset} variant="outline" className="gap-2">
            {t('startOver')}
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadReport}
            disabled={isDownloading}
            className="gap-2"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('downloadingReport')}
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                {t('downloadReport')}
              </>
            )}
          </Button>
          <Button className="flex-1 gap-2">{t('requestQuote')}</Button>
        </div>
      </div>
    </div>
  )
}
