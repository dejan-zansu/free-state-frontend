'use client'

import { Battery, Car, DollarSign, Droplets, Flame, Zap } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { usePVGISCalculatorStore } from '@/stores/pvgis-calculator.store'

export default function PVGISStep7AdditionalParams() {
  const { additionalParams, updateAdditionalParams } = usePVGISCalculatorStore()

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('de-CH').format(num)
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <DollarSign className='w-5 h-5 text-solar' />
            Additional Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* VAT */}
          <div className='flex items-center justify-between p-4 border rounded-lg'>
            <div className='flex items-center gap-3'>
              <DollarSign className='w-5 h-5 text-muted-foreground' />
              <div>
                <Label className='font-semibold'>VAT Payable</Label>
                <p className='text-sm text-muted-foreground'>
                  Include 8.1% Swiss VAT in calculations
                </p>
              </div>
            </div>
            <Switch
              checked={additionalParams.vatPayable}
              onCheckedChange={(checked) => updateAdditionalParams({ vatPayable: checked })}
            />
          </div>

          {/* Charging Station */}
          <div className='flex items-center justify-between p-4 border rounded-lg'>
            <div className='flex items-center gap-3'>
              <Car className='w-5 h-5 text-muted-foreground' />
              <div>
                <Label className='font-semibold'>EV Charging Station</Label>
                <p className='text-sm text-muted-foreground'>
                  Add electric vehicle charging station
                </p>
              </div>
            </div>
            <Switch
              checked={additionalParams.chargingStation}
              onCheckedChange={(checked) => updateAdditionalParams({ chargingStation: checked })}
            />
          </div>

          {/* Hot Water Heat Pump */}
          <div className='flex items-center justify-between p-4 border rounded-lg'>
            <div className='flex items-center gap-3'>
              <Droplets className='w-5 h-5 text-muted-foreground' />
              <div>
                <Label className='font-semibold'>Hot Water Heat Pump</Label>
                <p className='text-sm text-muted-foreground'>
                  Include hot water heat pump system
                </p>
              </div>
            </div>
            <Switch
              checked={additionalParams.hotWaterHeatPump}
              onCheckedChange={(checked) => updateAdditionalParams({ hotWaterHeatPump: checked })}
            />
          </div>

          {/* Heating Heat Pump */}
          <div className='flex items-center justify-between p-4 border rounded-lg'>
            <div className='flex items-center gap-3'>
              <Flame className='w-5 h-5 text-muted-foreground' />
              <div>
                <Label className='font-semibold'>Heating Heat Pump</Label>
                <p className='text-sm text-muted-foreground'>
                  Include heating heat pump system
                </p>
              </div>
            </div>
            <Switch
              checked={additionalParams.heatingHeatPump}
              onCheckedChange={(checked) => updateAdditionalParams({ heatingHeatPump: checked })}
            />
          </div>

          {/* Electricity Supplier */}
          <div className='space-y-2'>
            <Label className='flex items-center gap-2'>
              <Battery className='w-4 h-4' />
              Electricity Supplier
            </Label>
            <Input
              type='text'
              value={additionalParams.electricitySupplier}
              onChange={(e) => updateAdditionalParams({ electricitySupplier: e.target.value })}
              placeholder='e.g., EWZ, Axpo, Romande Energie'
            />
          </div>

          {/* Electricity Consumption */}
          <div className='space-y-2'>
            <Label className='flex items-center gap-2'>
              <Zap className='w-4 h-4' />
              Annual Electricity Consumption
            </Label>
            <div className='flex items-center gap-2'>
              <Input
                type='number'
                value={additionalParams.electricityConsumption}
                onChange={(e) => updateAdditionalParams({ electricityConsumption: parseFloat(e.target.value) || 0 })}
                min={0}
                step={100}
              />
              <span className='text-sm text-muted-foreground whitespace-nowrap'>kWh/year</span>
            </div>
            <p className='text-xs text-muted-foreground'>
              Average Swiss household: 4,500 kWh/year
            </p>
          </div>

          {/* Electricity Tariff */}
          <div className='space-y-2'>
            <Label>Electricity Tariff (Purchase Price)</Label>
            <div className='flex items-center gap-2'>
              <Input
                type='number'
                value={additionalParams.electricityTariff}
                onChange={(e) => updateAdditionalParams({ electricityTariff: parseFloat(e.target.value) || 0 })}
                min={0}
                step={0.01}
                placeholder='0.0 for automatic'
              />
              <span className='text-sm text-muted-foreground whitespace-nowrap'>CHF/kWh</span>
            </div>
            <p className='text-xs text-muted-foreground'>
              {additionalParams.electricityTariff === 0
                ? 'Automatic: ~0.20 CHF/kWh (Swiss average)'
                : `${formatNumber(additionalParams.electricityTariff * 1000)} Rp/kWh`}
            </p>
          </div>

          {/* Feed-in Tariff */}
          <div className='space-y-2'>
            <Label>Feed-in Tariff (Sale Price)</Label>
            <div className='flex items-center gap-2'>
              <Input
                type='number'
                value={additionalParams.feedInTariff}
                onChange={(e) => updateAdditionalParams({ feedInTariff: parseFloat(e.target.value) || 0 })}
                min={0}
                step={0.01}
                placeholder='0.0 for automatic'
              />
              <span className='text-sm text-muted-foreground whitespace-nowrap'>CHF/kWh</span>
            </div>
            <p className='text-xs text-muted-foreground'>
              {additionalParams.feedInTariff === 0
                ? 'Automatic: ~0.08 CHF/kWh (Swiss average)'
                : `${formatNumber(additionalParams.feedInTariff * 1000)} Rp/kWh`}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
