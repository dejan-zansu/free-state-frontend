'use client'

import { Building2, Home } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { BuildingDetails, usePVGISCalculatorStore } from '@/stores/pvgis-calculator.store'

export default function PVGISStep3BuildingDetails() {
  const { buildingDetails, setBuildingDetails } = usePVGISCalculatorStore()

  const roofTypes: Array<{ value: BuildingDetails['roofType']; label: string; description: string }> = [
    { value: 'flat', label: 'Flat Roof', description: '0-10° pitch' },
    { value: 'gable', label: 'Gable Roof', description: 'Two sloped sides' },
    { value: 'hip', label: 'Hip Roof', description: 'Four sloped sides' },
    { value: 'shed', label: 'Shed Roof', description: 'Single sloped side' },
  ]

  const handleSubmit = () => {
    if (!buildingDetails) {
      // Set defaults
      setBuildingDetails({
        roofType: 'gable',
        buildingHeight: 10,
        floors: 2,
        roofPitch: 30,
      })
    }
  }

  const updateDetail = (updates: Partial<BuildingDetails>) => {
    setBuildingDetails({
      roofType: buildingDetails?.roofType || 'gable',
      buildingHeight: buildingDetails?.buildingHeight || 10,
      floors: buildingDetails?.floors,
      roofPitch: buildingDetails?.roofPitch,
      ...updates,
    })
  }

  return (
    <div className='flex items-center justify-center min-h-[60vh]'>
      <Card className='w-full max-w-2xl'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-2xl'>
            <Home className='w-6 h-6 text-solar' />
            Building Details
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Roof Type */}
          <div className='space-y-3'>
            <Label className='text-base font-semibold'>Roof Type</Label>
            <RadioGroup
              value={buildingDetails?.roofType || 'gable'}
              onValueChange={(value) => updateDetail({ roofType: value as BuildingDetails['roofType'] })}
            >
              <div className='grid grid-cols-2 gap-3'>
                {roofTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`flex items-start space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      buildingDetails?.roofType === type.value
                        ? 'border-solar bg-solar/5'
                        : 'border-border hover:border-solar/50'
                    }`}
                  >
                    <RadioGroupItem value={type.value} />
                    <div className='flex-1'>
                      <div className='font-medium'>{type.label}</div>
                      <div className='text-sm text-muted-foreground'>{type.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Building Height */}
          <div className='space-y-3'>
            <Label className='text-base font-semibold flex items-center gap-2'>
              <Building2 className='w-4 h-4' />
              Building Height
            </Label>
            <div className='space-y-4'>
              <div className='flex items-center gap-4'>
                <Input
                  type='number'
                  value={buildingDetails?.buildingHeight || 10}
                  onChange={(e) => updateDetail({ buildingHeight: parseFloat(e.target.value) || 0 })}
                  min={3}
                  max={50}
                  step={0.5}
                  className='w-32'
                />
                <span className='text-sm text-muted-foreground'>meters</span>
              </div>

              <div className='space-y-2'>
                <div className='flex items-center justify-between text-sm'>
                  <span>Or select number of floors:</span>
                  <span className='font-semibold'>{buildingDetails?.floors || 2} floors</span>
                </div>
                <Slider
                  value={[buildingDetails?.floors || 2]}
                  onValueChange={(value) => {
                    const floors = value[0]
                    updateDetail({
                      floors,
                      buildingHeight: floors * 3, // Approx 3m per floor
                    })
                  }}
                  min={1}
                  max={10}
                  step={1}
                  className='w-full'
                />
              </div>
            </div>
          </div>

          {/* Roof Pitch (for sloped roofs) */}
          {buildingDetails?.roofType !== 'flat' && (
            <div className='space-y-3'>
              <Label className='text-base font-semibold'>Roof Pitch (Tilt Angle)</Label>
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Angle from horizontal
                  </span>
                  <span className='font-semibold'>{buildingDetails?.roofPitch || 30}°</span>
                </div>
                <Slider
                  value={[buildingDetails?.roofPitch || 30]}
                  onValueChange={(value) => updateDetail({ roofPitch: value[0] })}
                  min={0}
                  max={60}
                  step={5}
                  className='w-full'
                />
                <div className='flex justify-between text-xs text-muted-foreground'>
                  <span>Flat (0°)</span>
                  <span>Steep (60°)</span>
                </div>
              </div>
            </div>
          )}

          {!buildingDetails && (
            <Button onClick={handleSubmit} className='w-full bg-solar'>
              Continue with Default Values
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
