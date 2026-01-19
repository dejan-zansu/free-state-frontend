'use client'

import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Sun,
  Compass,
  RotateCcw,
  Info,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePVGISCalculatorStore } from '@/stores/pvgis-calculator.store'

export default function Step3RoofOrientation() {
  const t = useTranslations('calculator.step3')
  const {
    roofPolygon,
    panelPlacement,
    updatePanelPlacement,
    prevStep,
    nextStep,
  } = usePVGISCalculatorStore()

  const [selectedRoofType, setSelectedRoofType] = useState<string>('medium')

  // Roof types with translations
  const ROOF_TYPES = [
    {
      id: 'flat',
      name: t('roofType.types.flat.name'),
      defaultPitch: 15,
      description: t('roofType.types.flat.description'),
    },
    {
      id: 'low-slope',
      name: t('roofType.types.lowSlope.name'),
      defaultPitch: 15,
      description: t('roofType.types.lowSlope.description'),
    },
    {
      id: 'medium',
      name: t('roofType.types.medium.name'),
      defaultPitch: 30,
      description: t('roofType.types.medium.description'),
    },
    {
      id: 'steep',
      name: t('roofType.types.steep.name'),
      defaultPitch: 45,
      description: t('roofType.types.steep.description'),
    },
  ]

  // Orientation presets with translations
  const ORIENTATIONS = [
    { value: 180, label: t('panelDirection.orientations.south.label'), icon: '↓', description: t('panelDirection.orientations.south.description') },
    {
      value: 135,
      label: t('panelDirection.orientations.southEast.label'),
      icon: '↘',
      description: t('panelDirection.orientations.southEast.description'),
    },
    {
      value: 225,
      label: t('panelDirection.orientations.southWest.label'),
      icon: '↙',
      description: t('panelDirection.orientations.southWest.description'),
    },
    { value: 90, label: t('panelDirection.orientations.east.label'), icon: '→', description: t('panelDirection.orientations.east.description') },
    { value: 270, label: t('panelDirection.orientations.west.label'), icon: '←', description: t('panelDirection.orientations.west.description') },
    { value: 0, label: t('panelDirection.orientations.north.label'), icon: '↑', description: t('panelDirection.orientations.north.description') },
  ]

  // Initialize from store or set defaults
  useEffect(() => {
    // Don't auto-change roof type if user has explicitly selected flat roof
    if (selectedRoofType === 'flat') return

    // Determine roof type from current tilt
    const currentTilt = panelPlacement.tilt
    if (currentTilt <= 5) setSelectedRoofType('flat')
    else if (currentTilt <= 15) setSelectedRoofType('low-slope')
    else if (currentTilt <= 35) setSelectedRoofType('medium')
    else setSelectedRoofType('steep')
  }, [panelPlacement.tilt, selectedRoofType])

  const handleRoofTypeChange = (typeId: string) => {
    setSelectedRoofType(typeId)
    const roofType = ROOF_TYPES.find((t) => t.id === typeId)
    if (roofType) {
      if (typeId === 'flat') {
        // For flat roofs, set optimal tilt for ballasted systems and South orientation
        updatePanelPlacement({
          tilt: 15, // Sweet spot: good production, low cost, minimal shadowing
          orientation: 180, // Default to South (user can change)
        })
      } else {
        // For sloped roofs, panels mounted flush follow roof pitch
        updatePanelPlacement({ tilt: roofType.defaultPitch })
      }
    }
  }

  const handleOrientationChange = (value: string) => {
    updatePanelPlacement({ orientation: parseInt(value) })
  }

  const getOrientationLabel = (azimuth: number) => {
    const orientation = ORIENTATIONS.find((o) => o.value === azimuth)
    return orientation?.label || `${azimuth}°`
  }

  // Calculate estimated efficiency based on orientation and tilt
  // South-facing at 30-35° is optimal (100%), other orientations reduce efficiency
  const calculateEfficiencyFactor = () => {
    const orientation = panelPlacement.orientation
    const tilt = panelPlacement.tilt

    // Orientation factor (South = 1.0, East/West = 0.85, North = 0.5)
    let orientationFactor = 1.0
    if (orientation === 180) orientationFactor = 1.0 // South
    else if (orientation === 135 || orientation === 225)
      orientationFactor = 0.95 // SE/SW
    else if (orientation === 90 || orientation === 270)
      orientationFactor = 0.85 // E/W
    else if (orientation === 0) orientationFactor = 0.5 // North

    // Tilt factor (optimal is 30-35° for Swiss latitudes)
    let tiltFactor = 1.0
    const optimalTilt = 32
    const tiltDiff = Math.abs(tilt - optimalTilt)
    if (tiltDiff <= 5) tiltFactor = 1.0
    else if (tiltDiff <= 15) tiltFactor = 0.95
    else if (tiltDiff <= 30) tiltFactor = 0.85
    else tiltFactor = 0.7

    return Math.round(orientationFactor * tiltFactor * 100)
  }

  const efficiencyFactor = calculateEfficiencyFactor()

  const canProceed = roofPolygon !== null

  return (
    <div className='h-full flex flex-col'>
      <div className='flex-1 overflow-auto'>
        <div className='container mx-auto px-4 py-8 max-w-4xl'>
          <div className='space-y-6'>
            {/* Header */}
            <div className='text-center space-y-2'>
              <h1 className='text-2xl font-bold'>{t('title')}</h1>
              <p className='text-muted-foreground'>
                {t('subtitle')}
              </p>
            </div>

            {/* Roof Area Summary */}
            {roofPolygon && (
              <Card className='bg-primary/5 border-primary/20'>
                <CardContent className='py-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm text-muted-foreground'>
                        {t('availableRoofArea')}
                      </p>
                      <p className='text-2xl font-bold text-primary'>
                        {roofPolygon.area.toFixed(1)} m²
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm text-muted-foreground'>
                        {t('configurationEfficiency')}
                      </p>
                      <p
                        className={`text-2xl font-bold ${
                          efficiencyFactor >= 90
                            ? 'text-green-500'
                            : efficiencyFactor >= 75
                            ? 'text-yellow-500'
                            : 'text-red-500'
                        }`}
                      >
                        {efficiencyFactor}%
                      </p>
                      <p className='text-xs text-muted-foreground mt-0.5'>
                        {t('vsOptimal')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className='grid md:grid-cols-2 gap-6'>
              {/* Roof Type Selection */}
              <Card>
                <CardHeader className='pb-4'>
                  <CardTitle className='flex items-center gap-2 text-lg'>
                    <RotateCcw className='w-5 h-5' />
                    {t('roofType.title')}
                  </CardTitle>
                  <p className='text-xs text-muted-foreground mt-1'>
                    {selectedRoofType === 'flat'
                      ? t('roofType.flatDescription')
                      : t('roofType.slopedDescription')}
                  </p>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-2 gap-3'>
                    {ROOF_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => handleRoofTypeChange(type.id)}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          selectedRoofType === type.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <p className='font-medium'>{type.name}</p>
                        <p className='text-xs text-muted-foreground'>
                          {type.description}
                        </p>
                      </button>
                    ))}
                  </div>

                  {/* Panel tilt info (read-only) */}
                  <div className='pt-4 border-t'>
                    <div className='flex items-center justify-between p-3 rounded-lg bg-muted/50'>
                      <div>
                        <p className='text-sm font-medium'>{t('roofType.panelTiltAngle')}</p>
                        <p className='text-xs text-muted-foreground'>
                          {selectedRoofType === 'flat'
                            ? t('roofType.flatInfo')
                            : t('roofType.slopedInfo')}
                        </p>
                      </div>
                      <div className='text-right'>
                        <p className='text-2xl font-bold text-primary'>
                          {panelPlacement.tilt}°
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Orientation Selection */}
              <Card>
                <CardHeader className='pb-4'>
                  <CardTitle className='flex items-center gap-2 text-lg'>
                    <Compass className='w-5 h-5' />
                    {t('panelDirection.title')}
                  </CardTitle>
                  {selectedRoofType === 'flat' && (
                    <p className='text-xs text-muted-foreground mt-1'>
                      {t('panelDirection.flatDescription')}
                    </p>
                  )}
                  {selectedRoofType !== 'flat' && (
                    <p className='text-xs text-muted-foreground mt-1'>
                      {t('panelDirection.slopedDescription')}
                    </p>
                  )}
                </CardHeader>
                <CardContent className='space-y-4'>
                  <Select
                    value={panelPlacement.orientation.toString()}
                    onValueChange={handleOrientationChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('panelDirection.selectPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {ORIENTATIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value.toString()}>
                          <span className='flex items-center gap-2'>
                            <span className='text-lg'>{o.icon}</span>
                            <span>{o.label}</span>
                            <span className='text-muted-foreground text-xs ml-2'>
                              ({o.description})
                            </span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Visual compass */}
                  <div className='relative w-48 h-48 mx-auto'>
                    <div className='absolute inset-0 rounded-full border-2 border-muted' />
                    {/* Cardinal directions */}
                    <div className='absolute top-2 left-1/2 -translate-x-1/2 text-xs font-medium'>
                      N
                    </div>
                    <div className='absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-medium text-primary'>
                      S
                    </div>
                    <div className='absolute left-2 top-1/2 -translate-y-1/2 text-xs font-medium'>
                      W
                    </div>
                    <div className='absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium'>
                      E
                    </div>
                    {/* Sun indicator */}
                    <div
                      className='absolute w-10 h-10 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center'
                      style={{
                        top: '50%',
                        left: '50%',
                        transform: `translate(-50%, -50%) rotate(${panelPlacement.orientation}deg) translateY(-60px)`,
                      }}
                    >
                      <Sun className='w-8 h-8 text-primary' />
                    </div>
                    {/* Center dot */}
                    <div className='absolute top-1/2 left-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary' />
                    {/* Arrow to orientation */}
                    <div
                      className='absolute top-1/2 left-1/2 w-1 bg-primary origin-bottom'
                      style={{
                        height: '60px',
                        transform: `translate(-50%, -100%) rotate(${panelPlacement.orientation}deg)`,
                      }}
                    />
                  </div>

                  <p className='text-center text-sm'>
                    {t('panelDirection.direction')}{' '}
                    <span className='font-medium'>
                      {getOrientationLabel(panelPlacement.orientation)}
                    </span>{' '}
                    ({panelPlacement.orientation}°)
                  </p>

                  {/* Custom Azimuth Input */}
                  <div className='pt-4 border-t'>
                    <Label className='text-sm'>
                      {t('panelDirection.customDirection')}
                    </Label>
                    <div className='flex items-center gap-2 mt-2'>
                      <Input
                        type='number'
                        min={0}
                        max={359}
                        value={panelPlacement.orientation}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0
                          const normalized = Math.max(0, Math.min(359, val))
                          updatePanelPlacement({ orientation: normalized })
                        }}
                        className='w-24'
                      />
                      <span className='text-sm text-muted-foreground'>
                        {t('panelDirection.degrees')}
                      </span>
                    </div>
                    <p className='text-xs text-muted-foreground mt-1'>
                      {t('panelDirection.customInfo')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Flat Roof Info Alert */}
            {selectedRoofType === 'flat' && (
              <Alert className='bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900'>
                <Info className='w-4 h-4' />
                <AlertDescription>
                  <span className='font-medium'>{t('flatRoofAlert.title')} </span>
                  {t('flatRoofAlert.description')}
                </AlertDescription>
              </Alert>
            )}

            {/* Tips */}
            <Card className='bg-muted/50'>
              <CardContent className='py-4'>
                <div className='flex gap-3'>
                  <Sun className='w-5 h-5 text-primary shrink-0 mt-0.5' />
                  <div className='text-sm space-y-1'>
                    <p className='font-medium'>{t('optimizationTips.title')}</p>
                    <ul className='text-muted-foreground space-y-1'>
                      {t.raw('optimizationTips.tips').map((tip: string, index: number) => (
                        <li key={index}>• {tip}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className='shrink-0 border-t bg-background'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex justify-between max-w-4xl mx-auto'>
            <Button variant='outline' onClick={prevStep} className='gap-2'>
              <ArrowLeft className='w-4 h-4' />
              {t('buttons.back')}
            </Button>
            <Button onClick={nextStep} disabled={!canProceed} className='gap-2'>
              {t('buttons.continue')}
              <ArrowRight className='w-4 h-4' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
