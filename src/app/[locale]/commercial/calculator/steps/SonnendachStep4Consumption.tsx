'use client'

import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSonnendachCalculatorStore } from '@/stores/sonnendach-calculator.store'

export default function SonnendachStep4Consumption() {
  const t = useTranslations('sonnendach.step4Commercial')
  const tNav = useTranslations('sonnendach.navigation')

  const {
    consumption,
    setConsumption,
    goToStep,
    nextStep,
    getSelectedSegments,
  } = useSonnendachCalculatorStore()

  const selectedSegments = getSelectedSegments()

  if (selectedSegments.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-sm text-[#062E25]/50">{t('noSegments')}</p>
        <Button variant="outline" onClick={() => goToStep(1)}>
          {t('backToSelection')}
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="container mx-auto px-4 pt-8 pb-24 max-w-2xl">
        <h1 className="text-2xl sm:text-3xl font-medium text-[#062E25]">
          {t('title')}
        </h1>
        <p className="mt-2 text-sm text-[#062E25]/60">
          {t('subtitle')}
        </p>

        <div className="mt-8 space-y-8">
          <div>
            <h2 className="text-base font-semibold text-[#062E25] mb-4">
              {t('buildingSection')}
            </h2>
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-[#062E25]/70">{t('buildingType')}</Label>
                <Select
                  value={consumption.propertyType}
                  onValueChange={value =>
                    setConsumption({
                      propertyType: value as 'residential' | 'commercial' | 'industrial' | 'agricultural',
                    })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={t('selectBuildingType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="commercial">{t('types.office')}</SelectItem>
                    <SelectItem value="industrial">{t('types.warehouse')}</SelectItem>
                    <SelectItem value="residential">{t('types.retail')}</SelectItem>
                    <SelectItem value="agricultural">{t('types.agricultural')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm text-[#062E25]/70">{t('isNewBuilding')}</Label>
                <Select
                  value={consumption.isNewBuilding ? 'yes' : 'no'}
                  onValueChange={value =>
                    setConsumption({ isNewBuilding: value === 'yes' })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">{t('no')}</SelectItem>
                    <SelectItem value="yes">{t('yes')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[#062E25] mb-4">
              {t('consumptionSection')}
            </h2>
            <div className="space-y-4">
              <div>
                <Label className="text-sm text-[#062E25]/70">{t('annualConsumption')}</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="number"
                    value={consumption.annualConsumptionKwh || ''}
                    onChange={e =>
                      setConsumption({
                        annualConsumptionKwh: Number(e.target.value) || 0,
                      })
                    }
                    placeholder={t('annualConsumptionPlaceholder')}
                  />
                  <span className="text-sm text-[#062E25]/50 shrink-0">kWh</span>
                </div>
                <p className="text-sm text-[#062E25]/40 mt-1">{t('annualConsumptionHint')}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-base font-semibold text-[#062E25] mb-4">
              {t('tariffSection')}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-[#062E25]/70">{t('electricityTariff')}</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="number"
                    value={consumption.electricityTariffAuto ? '' : consumption.electricityTariff}
                    onChange={e =>
                      setConsumption({
                        electricityTariff: Number(e.target.value) || 0,
                        electricityTariffAuto: false,
                      })
                    }
                    placeholder={consumption.electricityTariffAuto ? '25' : ''}
                  />
                  <span className="text-sm text-[#062E25]/50 shrink-0">Rp/kWh</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Checkbox
                    id="autoTariff"
                    checked={consumption.electricityTariffAuto}
                    onCheckedChange={v =>
                      setConsumption({ electricityTariffAuto: v === true })
                    }
                  />
                  <Label htmlFor="autoTariff" className="text-sm text-[#062E25]/40">
                    {t('useAverage')}
                  </Label>
                </div>
              </div>

              <div>
                <Label className="text-sm text-[#062E25]/70">{t('feedInTariff')}</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="number"
                    value={consumption.feedInTariffAuto ? '' : consumption.feedInTariff}
                    onChange={e =>
                      setConsumption({
                        feedInTariff: Number(e.target.value) || 0,
                        feedInTariffAuto: false,
                      })
                    }
                    placeholder={consumption.feedInTariffAuto ? '12' : ''}
                  />
                  <span className="text-sm text-[#062E25]/50 shrink-0">Rp/kWh</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Checkbox
                    id="autoFeedIn"
                    checked={consumption.feedInTariffAuto}
                    onCheckedChange={v =>
                      setConsumption({ feedInTariffAuto: v === true })
                    }
                  />
                  <Label htmlFor="autoFeedIn" className="text-sm text-[#062E25]/40">
                    {t('useAverage')}
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className="fixed bottom-0 left-0 right-0 z-50 flex justify-end gap-3 px-6 py-4"
          style={{
            background: 'rgba(234, 237, 223, 0.85)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <Button
            variant="outline"
            onClick={() => goToStep(3)}
            style={{ borderColor: '#062E25', color: '#062E25' }}
          >
            {tNav('back')}
          </Button>
          <Button
            onClick={nextStep}
            className="bg-[#062E25] text-white hover:bg-[#062E25]/90"
          >
            {tNav('next')}
          </Button>
        </div>
      </div>
    </div>
  )
}
