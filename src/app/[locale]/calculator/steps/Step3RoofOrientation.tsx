'use client'

import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Sun,
  Compass,
  RotateCcw,
  Layers,
  Building2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePVGISCalculatorStore } from '@/stores/pvgis-calculator.store'

// Common roof types with default pitch angles
const ROOF_TYPES = [
  { id: 'flat', name: 'Flat Roof', defaultPitch: 0, description: '0-5° pitch' },
  {
    id: 'low-slope',
    name: 'Low Slope',
    defaultPitch: 15,
    description: '5-15° pitch',
  },
  {
    id: 'medium',
    name: 'Medium Pitch',
    defaultPitch: 30,
    description: '15-35° pitch',
  },
  {
    id: 'steep',
    name: 'Steep Pitch',
    defaultPitch: 45,
    description: '35-60° pitch',
  },
]

// Roof materials with installation cost multipliers
const ROOF_MATERIALS = [
  {
    id: 'tiles',
    name: 'Clay/Concrete Tiles',
    icon: '🏠',
    costMultiplier: 1.0,
    description: 'Standard mounting',
  },
  {
    id: 'slate',
    name: 'Slate',
    icon: '🪨',
    costMultiplier: 1.3,
    description: 'Requires special hooks',
  },
  {
    id: 'metal',
    name: 'Metal/Standing Seam',
    icon: '🔩',
    costMultiplier: 0.9,
    description: 'Easy clamp mounting',
  },
  {
    id: 'flat-membrane',
    name: 'Flat (Bitumen/EPDM)',
    icon: '⬛',
    costMultiplier: 0.85,
    description: 'Ballasted system',
  },
  {
    id: 'flat-gravel',
    name: 'Flat (Gravel)',
    icon: '⬜',
    costMultiplier: 0.85,
    description: 'Ballasted system',
  },
  {
    id: 'shingle',
    name: 'Asphalt Shingles',
    icon: '📐',
    costMultiplier: 1.1,
    description: 'Flashing required',
  },
]

// Orientation presets
const ORIENTATIONS = [
  { value: 180, label: 'South', icon: '↓', description: 'Optimal' },
  {
    value: 135,
    label: 'South-East',
    icon: '↘',
    description: 'Good morning sun',
  },
  {
    value: 225,
    label: 'South-West',
    icon: '↙',
    description: 'Good evening sun',
  },
  { value: 90, label: 'East', icon: '→', description: 'Morning production' },
  { value: 270, label: 'West', icon: '←', description: 'Evening production' },
  { value: 0, label: 'North', icon: '↑', description: 'Not recommended' },
]

export default function Step3RoofOrientation() {
  const {
    roofPolygon,
    panelPlacement,
    buildingDetails,
    updatePanelPlacement,
    setBuildingDetails,
    prevStep,
    nextStep,
  } = usePVGISCalculatorStore()

  const [selectedRoofType, setSelectedRoofType] = useState<string>('medium')
  const [selectedMaterial, setSelectedMaterial] = useState<string>(
    buildingDetails?.roofMaterial || 'tiles'
  )
  const [floors, setFloors] = useState<number>(buildingDetails?.floors || 2)

  // Initialize from store or set defaults
  useEffect(() => {
    // Determine roof type from current tilt
    const currentTilt = panelPlacement.tilt
    if (currentTilt <= 5) setSelectedRoofType('flat')
    else if (currentTilt <= 15) setSelectedRoofType('low-slope')
    else if (currentTilt <= 35) setSelectedRoofType('medium')
    else setSelectedRoofType('steep')
  }, [panelPlacement.tilt])

  // Update store when material or floors change
  useEffect(() => {
    const material = ROOF_MATERIALS.find((m) => m.id === selectedMaterial)
    setBuildingDetails({
      roofMaterial: selectedMaterial,
      roofMaterialCostMultiplier: material?.costMultiplier || 1.0,
      floors: floors,
      buildingHeight: floors * 3, // Approximate 3m per floor
    })
  }, [selectedMaterial, floors, setBuildingDetails])

  const handleRoofTypeChange = (typeId: string) => {
    setSelectedRoofType(typeId)
    const roofType = ROOF_TYPES.find((t) => t.id === typeId)
    if (roofType) {
      updatePanelPlacement({ tilt: roofType.defaultPitch })
    }
  }

  const handleOrientationChange = (value: string) => {
    updatePanelPlacement({ orientation: parseInt(value) })
  }

  const handleTiltChange = (value: number[]) => {
    updatePanelPlacement({ tilt: value[0] })
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
              <h1 className='text-2xl font-bold'>Roof Orientation</h1>
              <p className='text-muted-foreground'>
                Configure your roof&apos;s angle and direction for accurate
                solar calculations
              </p>
            </div>

            {/* Roof Area Summary */}
            {roofPolygon && (
              <Card className='bg-primary/5 border-primary/20'>
                <CardContent className='py-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-sm text-muted-foreground'>
                        Your roof area
                      </p>
                      <p className='text-2xl font-bold text-primary'>
                        {roofPolygon.area.toFixed(1)} m²
                      </p>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm text-muted-foreground'>
                        Estimated efficiency
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
                    Roof Type
                  </CardTitle>
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

                  {/* Fine-tune tilt */}
                  <div className='pt-4 border-t'>
                    <Label className='text-sm'>
                      Fine-tune panel tilt: {panelPlacement.tilt}°
                    </Label>
                    <Slider
                      value={[panelPlacement.tilt]}
                      onValueChange={handleTiltChange}
                      min={0}
                      max={90}
                      step={1}
                      className='mt-2'
                    />
                    <div className='flex justify-between text-xs text-muted-foreground mt-1'>
                      <span>0° (Flat)</span>
                      <span className='text-primary'>30-35° (Optimal)</span>
                      <span>90° (Vertical)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Orientation Selection */}
              <Card>
                <CardHeader className='pb-4'>
                  <CardTitle className='flex items-center gap-2 text-lg'>
                    <Compass className='w-5 h-5' />
                    Roof Direction
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <Select
                    value={panelPlacement.orientation.toString()}
                    onValueChange={handleOrientationChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select direction' />
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
                    Direction:{' '}
                    <span className='font-medium'>
                      {getOrientationLabel(panelPlacement.orientation)}
                    </span>{' '}
                    ({panelPlacement.orientation}°)
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Roof Material & Building Info */}
            <div className='grid md:grid-cols-2 gap-6'>
              {/* Roof Material */}
              <Card>
                <CardHeader className='pb-4'>
                  <CardTitle className='flex items-center gap-2 text-lg'>
                    <Layers className='w-5 h-5' />
                    Roof Material
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className='grid grid-cols-2 gap-2'>
                    {ROOF_MATERIALS.map((material) => (
                      <button
                        key={material.id}
                        onClick={() => setSelectedMaterial(material.id)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          selectedMaterial === material.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className='flex items-center gap-2'>
                          <span className='text-lg'>{material.icon}</span>
                          <div>
                            <p className='font-medium text-sm'>
                              {material.name}
                            </p>
                            <p className='text-xs text-muted-foreground'>
                              {material.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Building Floors */}
              <Card>
                <CardHeader className='pb-4'>
                  <CardTitle className='flex items-center gap-2 text-lg'>
                    <Building2 className='w-5 h-5' />
                    Building Height
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div>
                    <Label className='text-sm'>Number of floors</Label>
                    <div className='flex items-center gap-4 mt-2'>
                      <Slider
                        value={[floors]}
                        onValueChange={(v) => setFloors(v[0])}
                        min={1}
                        max={10}
                        step={1}
                        className='flex-1'
                      />
                      <span className='text-2xl font-bold text-primary w-12 text-center'>
                        {floors}
                      </span>
                    </div>
                    <div className='flex justify-between text-xs text-muted-foreground mt-1'>
                      <span>1 floor</span>
                      <span>10 floors</span>
                    </div>
                  </div>
                  <div className='p-3 rounded-lg bg-muted/50'>
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>
                        Estimated height:
                      </span>
                      <span className='font-medium'>{floors * 3}m</span>
                    </div>
                    <p className='text-xs text-muted-foreground mt-1'>
                      Used for shading analysis and installation planning
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tips */}
            <Card className='bg-muted/50'>
              <CardContent className='py-4'>
                <div className='flex gap-3'>
                  <Sun className='w-5 h-5 text-primary shrink-0 mt-0.5' />
                  <div className='text-sm space-y-1'>
                    <p className='font-medium'>Tips for best results</p>
                    <ul className='text-muted-foreground space-y-1'>
                      <li>
                        • South-facing roofs (180°) receive the most sunlight in
                        Switzerland
                      </li>
                      <li>
                        • A tilt of 30-35° is optimal for maximizing yearly
                        production
                      </li>
                      <li>
                        • East/West orientations can be beneficial if you
                        consume more electricity in morning/evening
                      </li>
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
              Back
            </Button>
            <Button
              onClick={nextStep}
              disabled={!canProceed}
              className='gap-2'
            >
              Continue
              <ArrowRight className='w-4 h-4' />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
