'use client'

import { Home, Building2 } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

import { useSolarAboCalculatorStore, type SolarAboPackage } from '@/stores/solar-abo-calculator.store'
import { cn } from '@/lib/utils'

const packages: { type: SolarAboPackage; icon: React.ReactNode; labelKey: string; descKey: string; href: string }[] = [
  { type: 'home', icon: <Home className='h-8 w-8' />, labelKey: 'home', descKey: 'homeDesc', href: '/solar-abo/solar-abo-home' },
  { type: 'multi', icon: <Building2 className='h-8 w-8' />, labelKey: 'multi', descKey: 'multiDesc', href: '/solar-abo/solar-abo-multi' },
]

export default function Step1PackageSelection() {
  const t = useTranslations('solarAboCalculator.step1')
  const { selectedPackage, setSelectedPackage, nextStep } = useSolarAboCalculatorStore()

  const handleSelect = (type: SolarAboPackage) => {
    setSelectedPackage(type)
    nextStep()
  }

  return (
    <div className='h-full overflow-y-auto'>
      <div className='container mx-auto px-4 pt-8 pb-16 max-w-lg'>
        <div className='mb-8'>
          <h1 className='text-2xl font-bold'>{t('title')}</h1>
          <p className='mt-2 text-muted-foreground'>{t('helper')}</p>
        </div>

        <div className='space-y-4'>
          {packages.map((pkg) => (
            <button
              key={pkg.type}
              type='button'
              onClick={() => handleSelect(pkg.type)}
              className={cn(
                'flex w-full items-center gap-5 rounded-xl border-2 bg-card p-5 text-left transition-all',
                'hover:border-primary/50 hover:bg-primary/5',
                selectedPackage === pkg.type
                  ? 'border-primary bg-primary/5'
                  : 'border-border'
              )}
            >
              <div
                className={cn(
                  'flex h-14 w-14 shrink-0 items-center justify-center rounded-lg',
                  selectedPackage === pkg.type ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {pkg.icon}
              </div>
              <div className='flex-1'>
                <span className='text-lg font-semibold'>{t(`options.${pkg.labelKey}`)}</span>
                <p className='mt-1 text-sm text-muted-foreground'>{t(`options.${pkg.descKey}`)}</p>
              </div>
            </button>
          ))}
        </div>

        <div className='mt-8 text-center'>
          <p className='text-sm text-muted-foreground'>
            {t('learnMore')}{' '}
            <Link href='/solar-abo/solar-abo-home' className='text-primary underline'>
              SolarAbo Home
            </Link>
            {' '}{t('or')}{' '}
            <Link href='/solar-abo/solar-abo-multi' className='text-primary underline'>
              SolarAbo Multi
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
