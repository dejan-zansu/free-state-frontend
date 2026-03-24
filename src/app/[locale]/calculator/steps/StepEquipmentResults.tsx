'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { PanelTop } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useSolarAboCalculatorStore } from '@/stores/solar-abo-calculator.store'
import { equipmentService } from '@/services/equipment.service'
import type {
  SolarPanelItem,
  InverterItem,
  BatteryItem,
  MountingSystemItem,
  EmsItem,
  HeatPumpItem,
} from '@/types/equipment'

import ResultsMetricsGrid from '../components/ResultsMetricsGrid'
import MonthlyProductionChart from '../components/MonthlyProductionChart'
import ResultsActions from '../components/ResultsActions'
import EquipmentCategoryCard from '../components/EquipmentCategoryCard'
import EquipmentPricingSummary from '../components/EquipmentPricingSummary'

export default function StepEquipmentResults() {
  const t = useTranslations('solarAboCalculator.results')
  const tDirect = useTranslations('solarAboCalculator.solarDirect')
  const tNav = useTranslations('solarAboCalculator.navigation')
  const locale = useLocale()
  const store = useSolarAboCalculatorStore()

  const [error, setError] = useState<string | null>(null)
  const [panels, setPanels] = useState<SolarPanelItem[]>([])
  const [inverters, setInverters] = useState<InverterItem[]>([])
  const [batteries, setBatteries] = useState<BatteryItem[]>([])
  const [mountingSystems, setMountingSystems] = useState<MountingSystemItem[]>([])
  const [emsList, setEmsList] = useState<EmsItem[]>([])
  const [heatPumps, setHeatPumps] = useState<HeatPumpItem[]>([])
  const [loadingEquipment, setLoadingEquipment] = useState(true)

  const annualProduction = store.getAnnualProduction()
  const annualSavings = store.getAnnualSavings()
  const selfConsumptionRate = store.getSelfConsumptionRate()
  const co2Savings = store.getCo2Savings()
  const systemSizeKwp = store.getSystemSizeKwp()
  const panelCount = store.getEstimatedPanelCount()
  const selectedArea = store.getSelectedArea()
  const monthlyProduction = store.getMonthlyProduction()
  const estimatedConsumption = store.getEstimatedConsumption()
  const subsidyAmount = store.getSubsidyAmount()
  const netAmount = store.getNetAmount()
  const roofType = store.getRoofType()
  const hasHeatPumpDevice = store.devices.heatPumpHeating
  const energyBalance = estimatedConsumption > 0
    ? Math.round((annualProduction / estimatedConsumption) * 100)
    : 0

  useEffect(() => {
    const roofTypeFilter = roofType === 'flat' ? 'FLAT' : 'PITCHED'
    Promise.all([
      equipmentService.getSolarPanels(locale),
      equipmentService.getInverters(locale),
      equipmentService.getBatteries(locale),
      equipmentService.getMountingSystems(locale, 'CH', roofTypeFilter),
      equipmentService.getEms(locale),
      hasHeatPumpDevice ? equipmentService.getHeatPumps(locale) : Promise.resolve([]),
    ])
      .then(([p, i, b, m, e, h]) => {
        setPanels(p)
        setInverters(i)
        setBatteries(b)
        setMountingSystems(m)
        setEmsList(e)
        setHeatPumps(h)

        if (p.length > 0 && !store.selectedSolarPanelId) {
          const first = p[0]
          const area = (first.lengthMm * first.widthMm) / 1_000_000
          store.setSelectedEquipment('solarPanel', first.id, first.pmaxStcW, area)
        }
        if (i.length > 0 && !store.selectedInverterId) {
          const match = i.find(inv => inv.ratedPowerKw >= systemSizeKwp * 0.8) || i[0]
          store.setSelectedEquipment('inverter', match.id)
        }
        if (m.length > 0 && !store.selectedMountingSystemId) {
          store.setSelectedEquipment('mountingSystem', m[0].id)
        }
      })
      .catch(() => {})
      .finally(() => setLoadingEquipment(false))
  }, [locale])

  const refreshQuote = useCallback(() => {
    store.fetchEquipmentQuote(locale)
  }, [locale])

  useEffect(() => {
    if (!loadingEquipment) refreshQuote()
  }, [
    loadingEquipment,
    store.selectedSolarPanelId,
    store.selectedInverterId,
    store.selectedBatteryId,
    store.selectedMountingSystemId,
    store.selectedEmsId,
    store.selectedHeatPumpId,
    refreshQuote,
  ])

  const handlePanelSelect = (id: string | null) => {
    if (!id) return
    const panel = panels.find(p => p.id === id)
    if (panel) {
      const area = (panel.lengthMm * panel.widthMm) / 1_000_000
      store.setSelectedEquipment('solarPanel', id, panel.pmaxStcW, area)
    }
  }

  const panelOptions = panels.map(p => ({
    id: p.id,
    displayName: p.displayName,
    manufacturer: p.manufacturer,
    specs: `${p.pmaxStcW}W, ${p.efficiencyStcPercent}%${p.cellTechnology ? `, ${p.cellTechnology}` : ''}`,
    price: p.price,
    currency: p.currency,
    imageUrl: p.imageUrl,
  }))

  const inverterOptions = inverters.map(i => ({
    id: i.id,
    displayName: i.displayName,
    manufacturer: i.manufacturer,
    specs: `${i.ratedPowerKw} kW${i.hasBatterySupport ? ', battery ready' : ''}${i.mpptCount ? `, ${i.mpptCount} MPPT` : ''}`,
    price: i.price,
    currency: i.currency,
    imageUrl: i.imageUrl,
  }))

  const batteryOptions = batteries.map(b => ({
    id: b.id,
    displayName: b.displayName,
    manufacturer: b.manufacturer,
    specs: `${b.capacityKwh} kWh${b.usableCapacityKwh ? ` (${b.usableCapacityKwh} usable)` : ''}${b.chemistry ? `, ${b.chemistry}` : ''}`,
    price: b.price,
    currency: b.currency,
    imageUrl: b.imageUrl,
  }))

  const mountingOptions = mountingSystems.map(m => ({
    id: m.id,
    displayName: m.displayName,
    manufacturer: m.manufacturer,
    specs: `${m.type}${m.material ? `, ${m.material}` : ''}`,
    price: m.price,
    currency: m.currency,
    imageUrl: m.imageUrl,
  }))

  const emsOptions = emsList.map(e => ({
    id: e.id,
    displayName: e.displayName,
    manufacturer: e.manufacturer,
    specs: `${e.type}${e.maxInverters ? `, up to ${e.maxInverters} inverters` : ''}`,
    price: e.price,
    currency: e.currency,
    imageUrl: e.imageUrl,
  }))

  const heatPumpOptions = heatPumps.map(h => ({
    id: h.id,
    displayName: h.displayName,
    manufacturer: h.manufacturer,
    specs: `${h.heatingCapacityKw} kW${h.copRating ? `, COP ${h.copRating}` : ''}, ${h.type.replace('_', '/')}`,
    price: h.price,
    currency: h.currency,
    imageUrl: h.imageUrl,
  }))

  return (
    <div>
      <div className='container mx-auto px-4 pt-8 pb-16 max-w-4xl'>
        <h1 className='text-2xl font-bold'>{tDirect('title')}</h1>
        <p className='mt-2 text-muted-foreground'>{tDirect('subtitle')}</p>

        <div className='mt-8'>
          <ResultsMetricsGrid
            annualProduction={annualProduction}
            annualSavings={annualSavings}
            selfConsumptionRate={selfConsumptionRate}
            co2Savings={co2Savings}
            energyBalance={energyBalance}
            roofImage={store.roofImage}
            address={store.address}
          />
        </div>

        <div className='mt-8 grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-3'>
            <div className='flex items-center gap-2 mb-1'>
              <PanelTop className='h-5 w-5 text-primary' />
              <h2 className='text-lg font-semibold'>{tDirect('equipment')}</h2>
            </div>

            <Card className='bg-[#F5F7EE]/50 border-[#062E25]/5'>
              <CardContent className='pt-4 pb-3'>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>{t('system.size')}</span>
                  <span className='font-semibold'>{systemSizeKwp.toFixed(1)} kWp</span>
                </div>
                <div className='flex justify-between text-sm mt-1'>
                  <span className='text-muted-foreground'>{t('system.panels')}</span>
                  <span className='font-semibold'>{panelCount} panels</span>
                </div>
                <div className='flex justify-between text-sm mt-1'>
                  <span className='text-muted-foreground'>{t('system.area')}</span>
                  <span className='font-semibold'>{Math.round(selectedArea)} m²</span>
                </div>
              </CardContent>
            </Card>

            <EquipmentCategoryCard
              title={tDirect('panels')}
              required
              options={panelOptions}
              selectedId={store.selectedSolarPanelId}
              onSelect={handlePanelSelect}
              loading={loadingEquipment}
            />

            <EquipmentCategoryCard
              title={tDirect('inverter')}
              required
              options={inverterOptions}
              selectedId={store.selectedInverterId}
              onSelect={(id) => store.setSelectedEquipment('inverter', id)}
              loading={loadingEquipment}
            />

            <EquipmentCategoryCard
              title={tDirect('battery')}
              required={false}
              options={batteryOptions}
              selectedId={store.selectedBatteryId}
              onSelect={(id) => store.setSelectedEquipment('battery', id)}
              loading={loadingEquipment}
            />

            <EquipmentCategoryCard
              title={tDirect('mountingSystem')}
              required
              options={mountingOptions}
              selectedId={store.selectedMountingSystemId}
              onSelect={(id) => store.setSelectedEquipment('mountingSystem', id)}
              loading={loadingEquipment}
            />

            <EquipmentCategoryCard
              title={tDirect('ems')}
              required={false}
              options={emsOptions}
              selectedId={store.selectedEmsId}
              onSelect={(id) => store.setSelectedEquipment('ems', id)}
              loading={loadingEquipment}
            />

            {hasHeatPumpDevice && (
              <EquipmentCategoryCard
                title={tDirect('heatPump')}
                required={false}
                options={heatPumpOptions}
                selectedId={store.selectedHeatPumpId}
                onSelect={(id) => store.setSelectedEquipment('heatPump', id)}
                loading={loadingEquipment}
              />
            )}
          </div>

          <div className='space-y-6'>
            <EquipmentPricingSummary
              quote={store.equipmentQuote}
              loading={store.equipmentQuoteLoading}
              subsidyAmount={subsidyAmount}
              netAmount={netAmount}
              annualSavings={annualSavings}
            />
          </div>
        </div>

        <div className='mt-8'>
          <MonthlyProductionChart monthlyProduction={monthlyProduction} />
        </div>

        {error && (
          <div className='mt-4 text-sm text-destructive bg-destructive/10 p-3 rounded-md'>
            {error}
          </div>
        )}

        <div className='mt-10'>
          <ResultsActions onError={setError} />
        </div>

        <div className='fixed bottom-0 left-0 right-0 z-50 flex justify-end gap-4 px-6 py-4' style={{ background: 'rgba(234, 237, 223, 0.85)', backdropFilter: 'blur(12px)' }}>
          <Button variant='outline' onClick={store.prevStep} style={{ borderColor: '#062E25', color: '#062E25' }}>
            {tNav('back')}
          </Button>
        </div>
      </div>
    </div>
  )
}
