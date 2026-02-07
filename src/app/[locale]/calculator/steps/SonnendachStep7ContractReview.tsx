'use client'

import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Check,
  AlertTriangle,
  FileText,
  Package,
  Shield,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { contractService } from '@/services/contract.service'
import { useSonnendachCalculatorStore } from '@/stores/sonnendach-calculator.store'

// Package definitions
const PACKAGES = [
  {
    code: 'BASIC',
    warrantyYears: 5,
    priceMultiplier: 1.0,
    features: [
      'Full installation & commissioning',
      '5-year workmanship warranty',
      'Standard monitoring',
      'Phone support',
    ],
  },
  {
    code: 'COMFORT',
    warrantyYears: 10,
    priceMultiplier: 1.1,
    isRecommended: true,
    features: [
      'Everything in Basic',
      '10-year extended warranty',
      'Premium monitoring & alerts',
      'Annual maintenance check',
      'Priority support',
    ],
  },
  {
    code: 'PREMIUM',
    warrantyYears: 15,
    priceMultiplier: 1.22,
    features: [
      'Everything in Comfort',
      '15-year all-inclusive warranty',
      'Priority 24/7 support',
      'Free panel cleaning (every 2 years)',
      'Dedicated account manager',
    ],
  },
]

// Format number with Swiss thousand separator
function formatSwissNumber(num: number, decimals = 0): string {
  return num.toLocaleString('de-CH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

function formatCurrency(amount: number): string {
  return `CHF ${formatSwissNumber(amount, 2)}`
}

export default function SonnendachStep7ContractReview() {
  const t = useTranslations('sonnendach.step7ContractReview')
  const tCommon = useTranslations('common')

  const {
    selectedPackageCode,
    selectPackage,
    acknowledgments,
    addAcknowledgment,
    removeAcknowledgment,
    setContractPreview,
    setCreatedEntities,
    goToStep,
    nextStep,
    error,
    address,
    selectedPanel,
    selectedInverter,
    panelCount,
    getSystemSizeKwp,
    getEstimatedProductionKwh,
    getTotalInvestment,
    getSubsidies,
    getNetInvestment,
    getAnnualSavings,
    getPaybackYears,
    getCo2Savings,
    personalInfo,
    installationAddress,
    billingAddress,
    sameAsInstallation,
    propertyOwnership,
    consents,
    getSelectedSegments,
    roofProperties,
    restrictedAreas,
    consumption,
    getUsableArea,
  } = useSonnendachCalculatorStore()

  const [isCreatingContract, setIsCreatingContract] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  // Get calculations
  const systemSizeKwp = getSystemSizeKwp()
  const estimatedProduction = getEstimatedProductionKwh()
  const totalInvestment = getTotalInvestment()
  const subsidies = getSubsidies()
  const netInvestment = getNetInvestment()
  const annualSavings = getAnnualSavings()
  const paybackYears = getPaybackYears()
  const co2Savings = getCo2Savings()

  // Calculate package prices
  const packagesWithPrices = PACKAGES.map(pkg => ({
    ...pkg,
    price: Math.round(totalInvestment * pkg.priceMultiplier),
    netPrice: Math.round(totalInvestment * pkg.priceMultiplier - subsidies),
  }))

  const selectedPackage = packagesWithPrices.find(
    p => p.code === selectedPackageCode
  )

  // Handle acknowledgment toggle
  const toggleAcknowledgment = (type: string) => {
    if (acknowledgments.includes(type)) {
      removeAcknowledgment(type)
    } else {
      addAcknowledgment(type)
    }
  }

  // Required acknowledgments
  const requiredAcknowledgments = [
    'PRELIMINARY_QUOTE_NOTICE',
    'SITE_VISIT_CONSENT',
    'CONTRACT_REVIEW',
  ]

  const allAcknowledged = requiredAcknowledgments.every(ack =>
    acknowledgments.includes(ack)
  )

  // Handle create contract and proceed to signature
  const handleProceedToSign = async () => {
    if (!selectedPackageCode || !allAcknowledged) return

    setIsCreatingContract(true)
    setCreateError(null)

    try {
      const selectedSegments = getSelectedSegments()
      const usableArea = getUsableArea()

      // Build calculation data
      const calculationData = {
        address,
        latitude: 0, // These would come from selectedLocation
        longitude: 0,
        selectedSegments: selectedSegments.map(s => ({
          id: s.id,
          area: s.area,
          potentialKwh: s.electricityYield,
          tilt: s.tilt,
          orientation: s.azimuth,
          suitability: s.suitability.label,
        })),
        roofProperties: {
          roofType: roofProperties.roofType,
          buildingFloors: roofProperties.buildingFloors,
          roofMaterial: roofProperties.roofMaterial,
        },
        restrictedAreas: restrictedAreas.map(r => ({
          id: r.id,
          coordinates: r.coordinates,
          area: r.area,
          label: r.label,
        })),
        selectedPanel: {
          id: selectedPanel!.id,
          name: selectedPanel!.name,
          power: selectedPanel!.power,
          width: selectedPanel!.width,
          height: selectedPanel!.height,
          efficiency: selectedPanel!.efficiency,
          manufacturer: selectedPanel!.manufacturer,
          price: selectedPanel!.price,
        },
        selectedInverter: {
          id: selectedInverter!.id,
          name: selectedInverter!.name,
          power: selectedInverter!.power,
          efficiency: selectedInverter!.efficiency,
          manufacturer: selectedInverter!.manufacturer,
          price: selectedInverter!.price,
        },
        panelCount,
        consumption: {
          propertyType: consumption.propertyType,
          isNewBuilding: consumption.isNewBuilding,
          evChargingStations: consumption.evChargingStations,
          heatPumpHotWater: consumption.heatPumpHotWater,
          heatPumpHeating: consumption.heatPumpHeating,
          electricityProvider: consumption.electricityProvider,
          residents: consumption.residents,
          annualConsumptionKwh: consumption.annualConsumptionKwh,
          electricityTariff: consumption.electricityTariff,
          feedInTariff: consumption.feedInTariff,
        },
        usableArea,
        estimatedProductionKwh: estimatedProduction,
        systemSizeKwp,
        totalInvestment: selectedPackage?.price || totalInvestment,
        subsidies,
        netInvestment: selectedPackage?.netPrice || netInvestment,
        annualSavings,
        paybackYears,
        co2Savings,
      }

      const response = await contractService.createFromCalculator({
        personal: personalInfo,
        installationAddress,
        billingAddress: sameAsInstallation ? undefined : billingAddress,
        sameAsInstallation,
        ownership: propertyOwnership,
        consents,
        calculation: calculationData,
        packageCode: selectedPackageCode,
      })

      // Store created entities and contract preview
      setCreatedEntities({
        userId: response.userId,
        projectId: response.projectId,
        contractId: response.contractId,
      })

      setContractPreview({
        contractId: response.contractId,
        contractNumber: response.contractNumber,
        grossAmount: selectedPackage?.price || totalInvestment,
        subsidyAmount: subsidies,
        netAmount: selectedPackage?.netPrice || netInvestment,
        pdfUrl: response.pdfUrl || '',
      })

      // Proceed to signature step
      nextStep()
    } catch (err) {
      console.error('Failed to create contract:', err)
      setCreateError(
        err instanceof Error ? err.message : 'Failed to create contract'
      )
    } finally {
      setIsCreatingContract(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">{t('title')}</h2>
          <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>

        {(error || createError) && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error || createError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sun className="h-5 w-5 text-energy" />
                {t('systemSummary.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-energy">{panelCount}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('systemSummary.panels')}
                  </p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-energy">
                    {formatSwissNumber(systemSizeKwp, 2)}
                  </p>
                  <p className="text-sm text-muted-foreground">kWp</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-energy">
                    {formatSwissNumber(estimatedProduction)}
                  </p>
                  <p className="text-sm text-muted-foreground">kWh/Jahr</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-2xl font-bold text-energy">
                    {formatSwissNumber(co2Savings)}
                  </p>
                  <p className="text-sm text-muted-foreground">kg CO₂/Jahr</p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">
                    {t('systemSummary.address')}:
                  </span>{' '}
                  {address}
                </p>
                <p className="text-sm mt-1">
                  <span className="font-medium">
                    {t('systemSummary.equipment')}:
                  </span>{' '}
                  {panelCount}× {selectedPanel?.name} + {selectedInverter?.name}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5 text-energy" />
                {t('packages.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {packagesWithPrices.map(pkg => (
                  <div
                    key={pkg.code}
                    onClick={() => selectPackage(pkg.code)}
                    className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedPackageCode === pkg.code
                        ? 'border-energy bg-energy/5'
                        : 'border-border hover:border-energy/50'
                    }`}
                  >
                    {pkg.isRecommended && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-2 py-0.5 text-xs font-medium bg-energy text-white rounded-full">
                        {t('packages.recommended')}
                      </span>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-lg">
                        {t(`packages.${pkg.code.toLowerCase()}.name`)}
                      </h3>
                      {selectedPackageCode === pkg.code && (
                        <Check className="h-5 w-5 text-energy" />
                      )}
                    </div>

                    <div className="mb-4">
                      <p className="text-2xl font-bold">
                        {formatCurrency(pkg.price)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t('packages.netPrice')}: {formatCurrency(pkg.netPrice)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mb-3 text-sm">
                      <Shield className="h-4 w-4 text-energy" />
                      <span>
                        {pkg.warrantyYears} {t('packages.yearsWarranty')}
                      </span>
                    </div>

                    <ul className="space-y-2">
                      {pkg.features.slice(0, 4).map((feature, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-xs text-muted-foreground"
                        >
                          <Check className="h-3 w-3 text-energy mt-0.5 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {selectedPackage && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-energy" />
                  {t('priceSummary.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      {t('priceSummary.grossPrice')}
                    </span>
                    <span className="font-medium">
                      {formatCurrency(selectedPackage.price)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-green-600">
                    <span>{t('priceSummary.subsidies')}</span>
                    <span>- {formatCurrency(subsidies)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="font-bold">
                      {t('priceSummary.netPrice')}
                    </span>
                    <span className="font-bold text-lg text-energy">
                      {formatCurrency(selectedPackage.netPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>{t('priceSummary.annualSavings')}</span>
                    <span>{formatCurrency(annualSavings)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>{t('priceSummary.payback')}</span>
                    <span>
                      ~{formatSwissNumber(paybackYears, 1)}{' '}
                      {t('priceSummary.years')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-amber-200 bg-amber-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-amber-800">
                <AlertTriangle className="h-5 w-5" />
                {t('importantNotice.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-amber-900">
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  {t('importantNotice.point1')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  {t('importantNotice.point2')}
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  {t('importantNotice.point3')}
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Check className="h-5 w-5 text-energy" />
                {t('acknowledgments.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="ack-preliminary"
                  checked={acknowledgments.includes('PRELIMINARY_QUOTE_NOTICE')}
                  onCheckedChange={() =>
                    toggleAcknowledgment('PRELIMINARY_QUOTE_NOTICE')
                  }
                />
                <Label
                  htmlFor="ack-preliminary"
                  className="text-sm font-normal cursor-pointer leading-relaxed"
                >
                  {t('acknowledgments.preliminary')}
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="ack-sitevisit"
                  checked={acknowledgments.includes('SITE_VISIT_CONSENT')}
                  onCheckedChange={() =>
                    toggleAcknowledgment('SITE_VISIT_CONSENT')
                  }
                />
                <Label
                  htmlFor="ack-sitevisit"
                  className="text-sm font-normal cursor-pointer leading-relaxed"
                >
                  {t('acknowledgments.siteVisit')}
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="ack-contract"
                  checked={acknowledgments.includes('CONTRACT_REVIEW')}
                  onCheckedChange={() =>
                    toggleAcknowledgment('CONTRACT_REVIEW')
                  }
                />
                <Label
                  htmlFor="ack-contract"
                  className="text-sm font-normal cursor-pointer leading-relaxed"
                >
                  {t('acknowledgments.contractReview')}
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => goToStep(6)}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            {tCommon('back')}
          </Button>

          <Button
            onClick={handleProceedToSign}
            disabled={
              !selectedPackageCode || !allAcknowledged || isCreatingContract
            }
            className="gap-2 bg-energy hover:bg-energy/90"
          >
            {isCreatingContract ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                {t('creatingContract')}
              </>
            ) : (
              <>
                {t('proceedToSign')}
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
