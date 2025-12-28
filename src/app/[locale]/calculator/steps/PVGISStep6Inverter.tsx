'use client'

import { Check, Zap } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Inverter, usePVGISCalculatorStore } from '@/stores/pvgis-calculator.store'

// Mocked inverter data
const AVAILABLE_INVERTERS: Inverter[] = [
  {
    id: '1',
    name: '5kW String Inverter',
    power: 5,
    manufacturer: 'SolarEdge',
    efficiency: 97.5,
    price: 1500,
  },
  {
    id: '2',
    name: '10kW String Inverter',
    power: 10,
    manufacturer: 'Fronius',
    efficiency: 98.0,
    price: 2500,
  },
  {
    id: '3',
    name: '15kW Three-Phase Inverter',
    power: 15,
    manufacturer: 'SMA',
    efficiency: 98.2,
    price: 3500,
  },
  {
    id: '4',
    name: '20kW Hybrid Inverter',
    power: 20,
    manufacturer: 'Huawei',
    efficiency: 98.5,
    price: 4500,
  },
]

export default function PVGISStep6Inverter() {
  const { selectedPanel, panelCount, selectedInverter, selectInverter } = usePVGISCalculatorStore()

  const systemPowerKw = selectedPanel && panelCount
    ? (selectedPanel.power * panelCount) / 1000
    : 0

  // Recommend inverter based on system power (typically 0.8-1.0 ratio)
  const getRecommendation = (inverter: Inverter) => {
    const ratio = systemPowerKw / inverter.power
    if (ratio >= 0.8 && ratio <= 1.0) return 'Recommended'
    if (ratio > 1.0 && ratio <= 1.2) return 'Acceptable'
    if (ratio < 0.8) return 'Oversized'
    return 'Undersized'
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('de-CH').format(num)
  }

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Zap className='w-5 h-5 text-solar' />
            Select Inverter
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {systemPowerKw > 0 && (
            <div className='p-4 rounded-lg bg-solar/10 border border-solar/20'>
              <div className='text-sm font-medium'>Your System Capacity</div>
              <div className='text-2xl font-bold text-solar'>{systemPowerKw.toFixed(2)} kWp</div>
              <div className='text-xs text-muted-foreground mt-1'>
                Choose an inverter with power rating between {(systemPowerKw * 0.8).toFixed(1)} - {(systemPowerKw * 1.0).toFixed(1)} kW
              </div>
            </div>
          )}

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {AVAILABLE_INVERTERS.map((inverter) => {
              const recommendation = getRecommendation(inverter)
              const isRecommended = recommendation === 'Recommended'

              return (
                <button
                  key={inverter.id}
                  onClick={() => selectInverter(inverter)}
                  className={`relative p-4 border-2 rounded-lg text-left transition-all ${
                    selectedInverter?.id === inverter.id
                      ? 'border-solar bg-solar/5 shadow-md'
                      : isRecommended
                      ? 'border-energy/50 bg-energy/5'
                      : 'border-border hover:border-solar/50'
                  }`}
                >
                  {selectedInverter?.id === inverter.id && (
                    <div className='absolute top-2 right-2 w-6 h-6 bg-solar rounded-full flex items-center justify-center'>
                      <Check className='w-4 h-4 text-white' />
                    </div>
                  )}
                  {isRecommended && selectedInverter?.id !== inverter.id && (
                    <div className='absolute top-2 right-2 px-2 py-1 bg-energy text-white text-xs rounded-full'>
                      Recommended
                    </div>
                  )}
                  <div className='space-y-2'>
                    <h3 className='font-semibold'>{inverter.name}</h3>
                    <div className='text-2xl font-bold text-solar'>{inverter.power} kW</div>
                    <div className='space-y-1 text-sm text-muted-foreground'>
                      <div>{inverter.manufacturer}</div>
                      <div>Efficiency: {inverter.efficiency}%</div>
                      <div className={`text-xs ${
                        recommendation === 'Recommended' ? 'text-energy font-semibold' :
                        recommendation === 'Acceptable' ? 'text-yellow-600' :
                        'text-muted-foreground'
                      }`}>
                        {recommendation}
                      </div>
                      <div className='font-semibold text-foreground pt-2'>
                        CHF {formatNumber(inverter.price)}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {selectedInverter && (
            <div className='mt-4 p-4 border rounded-lg bg-muted/30'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <div className='text-xs text-muted-foreground'>Inverter Efficiency</div>
                  <div className='text-lg font-semibold'>{selectedInverter.efficiency}%</div>
                </div>
                <div>
                  <div className='text-xs text-muted-foreground'>System-to-Inverter Ratio</div>
                  <div className='text-lg font-semibold'>
                    {(systemPowerKw / selectedInverter.power).toFixed(2)}:1
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
