'use client'

import { ThermometerSun, Flame, Droplets, Car, Waves } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DeviceToggle } from '@/components/solar-abo-calculator'
import { useSolarAboCalculatorStore, type HighPowerDevices } from '@/stores/solar-abo-calculator.store'

const deviceOptions: { key: keyof HighPowerDevices; icon: React.ReactNode; labelKey: string }[] = [
  { key: 'heatPumpHeating', icon: <ThermometerSun className='h-5 w-5' />, labelKey: 'heatPumpHeating' },
  { key: 'electricHeating', icon: <Flame className='h-5 w-5' />, labelKey: 'electricHeating' },
  { key: 'electricBoiler', icon: <Droplets className='h-5 w-5' />, labelKey: 'electricBoiler' },
  { key: 'evChargingStation', icon: <Car className='h-5 w-5' />, labelKey: 'evChargingStation' },
  { key: 'swimmingPoolSauna', icon: <Waves className='h-5 w-5' />, labelKey: 'swimmingPoolSauna' },
]

export default function Step3Devices() {
  const t = useTranslations('solarAboCalculator.step3')
  const tNav = useTranslations('solarAboCalculator.navigation')
  const { devices, setDevice, prevStep } = useSolarAboCalculatorStore()

  return (
    <div className='h-full overflow-y-auto'>
      <div className='container mx-auto px-4 py-8 max-w-lg'>
        <div className='mb-8'>
          <h1 className='text-2xl font-bold'>{t('title')}</h1>
          <p className='mt-2 text-muted-foreground'>{t('helper')}</p>
        </div>

        <Card>
          <CardContent className='pt-2'>
            {deviceOptions.map((option) => (
              <DeviceToggle
                key={option.key}
                icon={option.icon}
                label={t(`devices.${option.labelKey}`)}
                checked={devices[option.key]}
                onCheckedChange={(checked) => setDevice(option.key, checked)}
              />
            ))}
          </CardContent>
        </Card>

        <div className='mt-8 flex gap-4'>
          <Button variant='outline' onClick={prevStep}>
            {tNav('back')}
          </Button>
          <Button className='flex-1'>
            {tNav('next')}
          </Button>
        </div>
      </div>
    </div>
  )
}
