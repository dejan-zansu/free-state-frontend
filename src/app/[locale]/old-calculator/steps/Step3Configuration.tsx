'use client'

import { Sun, Zap, Home, Plug, Battery, ThermometerSun } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCalculatorStore } from '@/stores/calculator.store'

// Swiss electricity suppliers (sample)
const electricitySuppliers = [
  { id: 'standard', name: 'Standard Tariff', purchaseRate: 25, feedInRate: 12 },
  { id: 'ewz', name: 'EWZ (Zürich)', purchaseRate: 27, feedInRate: 14 },
  { id: 'bkw', name: 'BKW (Bern)', purchaseRate: 24, feedInRate: 11 },
  { id: 'axpo', name: 'Axpo', purchaseRate: 26, feedInRate: 13 },
  { id: 'alpiq', name: 'Alpiq', purchaseRate: 25, feedInRate: 12 },
  { id: 'ckw', name: 'CKW (Luzern)', purchaseRate: 23, feedInRate: 10 },
]

// Panel capacity options
const panelOptions = [
  { watts: 350, label: '350W Standard' },
  { watts: 400, label: '400W High Efficiency' },
  { watts: 450, label: '450W Premium' },
  { watts: 500, label: '500W Ultra Premium' },
]

export default function Step3Configuration() {
  const {
    buildingInsights,
    panelCount,
    panelCapacityWatts,
    annualConsumptionKwh,
    purchaseRateRp,
    feedInRateRp,
    electricitySupplier,
    setPanelCount,
    setPanelCapacityWatts,
    setAnnualConsumptionKwh,
    setPurchaseRateRp,
    setFeedInRateRp,
    setElectricitySupplier,
  } = useCalculatorStore()

  const solarPotential = buildingInsights?.solarPotential
  const maxPanels = solarPotential?.maxArrayPanelsCount || 100
  const configs = solarPotential?.solarPanelConfigs || []

  // Calculate system stats
  const systemCapacityKw = (panelCount * panelCapacityWatts) / 1000
  const panelCapacityRatio = panelCapacityWatts / (solarPotential?.panelCapacityWatts || 400)

  // Find closest config for energy estimate
  const closestConfig =
    configs.find((c) => c.panelsCount >= panelCount) || configs[configs.length - 1]
  const estimatedYearlyKwh = closestConfig
    ? closestConfig.yearlyEnergyDcKwh * panelCapacityRatio * 0.85
    : 0

  // Handle supplier change
  const handleSupplierChange = (supplierId: string) => {
    const supplier = electricitySuppliers.find((s) => s.id === supplierId)
    if (supplier) {
      setElectricitySupplier(supplier.name)
      setPurchaseRateRp(supplier.purchaseRate)
      setFeedInRateRp(supplier.feedInRate)
    }
  }

  const formatNumber = (num: number) => num.toLocaleString('de-CH', { maximumFractionDigits: 0 })
  const formatDecimal = (num: number) => num.toLocaleString('de-CH', { maximumFractionDigits: 1 })

  return (
    <div className='grid lg:grid-cols-2 gap-6'>
      {/* Left: System Configuration */}
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Sun className='w-5 h-5 text-solar' />
              Solar System Configuration
            </CardTitle>
            <CardDescription>Customize your solar panel installation</CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Panel Count Slider */}
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <Label>Number of Panels</Label>
                <span className='font-bold text-lg'>{panelCount}</span>
              </div>
              <Slider
                value={[panelCount]}
                onValueChange={([value]) => setPanelCount(value)}
                min={1}
                max={maxPanels}
                step={1}
                className='w-full'
              />
              <div className='flex justify-between text-xs text-muted-foreground'>
                <span>1 panel</span>
                <span>{maxPanels} panels (max)</span>
              </div>
            </div>

            {/* Panel Capacity */}
            <div className='space-y-2'>
              <Label>Panel Capacity</Label>
              <Select
                value={panelCapacityWatts.toString()}
                onValueChange={(value) => setPanelCapacityWatts(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {panelOptions.map((option) => (
                    <SelectItem key={option.watts} value={option.watts.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* System Summary */}
            <div className='p-4 rounded-xl bg-solar/10 border border-solar/20'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-muted-foreground'>System Size</p>
                  <p className='text-2xl font-bold text-solar'>
                    {formatDecimal(systemCapacityKw)} kWp
                  </p>
                </div>
                <div>
                  <p className='text-sm text-muted-foreground'>Est. Production</p>
                  <p className='text-2xl font-bold text-energy'>
                    {formatNumber(estimatedYearlyKwh)} kWh/yr
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Equipment */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Battery className='w-5 h-5 text-energy' />
              Additional Equipment
            </CardTitle>
            <CardDescription>Optional equipment to maximize savings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <button className='w-full p-4 rounded-xl border-2 border-dashed border-muted hover:border-solar/50 transition-colors text-left'>
                <div className='flex items-center gap-3'>
                  <Battery className='w-6 h-6 text-muted-foreground' />
                  <div>
                    <p className='font-medium'>Battery Storage</p>
                    <p className='text-sm text-muted-foreground'>
                      Increase self-consumption to 70%+
                    </p>
                  </div>
                </div>
              </button>
              <button className='w-full p-4 rounded-xl border-2 border-dashed border-muted hover:border-solar/50 transition-colors text-left'>
                <div className='flex items-center gap-3'>
                  <Plug className='w-6 h-6 text-muted-foreground' />
                  <div>
                    <p className='font-medium'>EV Charging Station</p>
                    <p className='text-sm text-muted-foreground'>Charge your electric vehicle</p>
                  </div>
                </div>
              </button>
              <button className='w-full p-4 rounded-xl border-2 border-dashed border-muted hover:border-solar/50 transition-colors text-left'>
                <div className='flex items-center gap-3'>
                  <ThermometerSun className='w-6 h-6 text-muted-foreground' />
                  <div>
                    <p className='font-medium'>Heat Pump</p>
                    <p className='text-sm text-muted-foreground'>Efficient heating & cooling</p>
                  </div>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right: Energy Profile */}
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Zap className='w-5 h-5 text-solar' />
              Energy Consumption
            </CardTitle>
            <CardDescription>Your current electricity usage</CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Annual Consumption */}
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <Label>Annual Consumption</Label>
                <span className='font-bold'>{formatNumber(annualConsumptionKwh)} kWh</span>
              </div>
              <Slider
                value={[annualConsumptionKwh]}
                onValueChange={([value]) => setAnnualConsumptionKwh(value)}
                min={1000}
                max={20000}
                step={100}
              />
              <div className='flex justify-between text-xs text-muted-foreground'>
                <span>1,000 kWh (small)</span>
                <span>20,000 kWh (large)</span>
              </div>
            </div>

            {/* Consumption presets */}
            <div className='grid grid-cols-3 gap-2'>
              {[
                { label: 'Small', kwh: 2500, icon: Home },
                { label: 'Average', kwh: 4500, icon: Home },
                { label: 'Large', kwh: 8000, icon: Home },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => setAnnualConsumptionKwh(preset.kwh)}
                  className={`p-3 rounded-lg border text-center transition-colors ${
                    annualConsumptionKwh === preset.kwh
                      ? 'border-solar bg-solar/10'
                      : 'border-border hover:border-solar/50'
                  }`}
                >
                  <p className='text-sm font-medium'>{preset.label}</p>
                  <p className='text-xs text-muted-foreground'>{formatNumber(preset.kwh)} kWh</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Plug className='w-5 h-5 text-energy' />
              Electricity Tariffs
            </CardTitle>
            <CardDescription>Your electricity supplier and rates</CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Supplier Selection */}
            <div className='space-y-2'>
              <Label>Electricity Supplier</Label>
              <Select
                value={electricitySuppliers.find((s) => s.name === electricitySupplier)?.id || 'standard'}
                onValueChange={handleSupplierChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {electricitySuppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Rates */}
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label>Purchase Rate (Rp/kWh)</Label>
                <Input
                  type='number'
                  value={purchaseRateRp}
                  onChange={(e) => setPurchaseRateRp(Number(e.target.value))}
                  min={0}
                  max={100}
                />
              </div>
              <div className='space-y-2'>
                <Label>Feed-in Rate (Rp/kWh)</Label>
                <Input
                  type='number'
                  value={feedInRateRp}
                  onChange={(e) => setFeedInRateRp(Number(e.target.value))}
                  min={0}
                  max={100}
                />
              </div>
            </div>

            {/* Rate explanation */}
            <div className='p-3 rounded-lg bg-muted/50 text-sm'>
              <p className='text-muted-foreground'>
                <strong>Purchase rate:</strong> What you pay for grid electricity
              </p>
              <p className='text-muted-foreground'>
                <strong>Feed-in rate:</strong> What you earn for excess solar energy
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Energy Balance Preview */}
        <Card className='border-energy/30 bg-energy/5'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-lg'>Energy Balance Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Consumption</span>
                <span className='font-medium'>{formatNumber(annualConsumptionKwh)} kWh/yr</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-muted-foreground'>Production</span>
                <span className='font-medium text-energy'>
                  {formatNumber(estimatedYearlyKwh)} kWh/yr
                </span>
              </div>
              <div className='border-t pt-3 flex justify-between'>
                <span className='font-medium'>Coverage</span>
                <span className='font-bold text-lg text-solar'>
                  {Math.round((estimatedYearlyKwh / annualConsumptionKwh) * 100)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

