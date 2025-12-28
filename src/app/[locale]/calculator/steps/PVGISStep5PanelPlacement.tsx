'use client'

import { Compass, Ruler } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Slider } from '@/components/ui/slider'
import { usePVGISCalculatorStore } from '@/stores/pvgis-calculator.store'

export default function PVGISStep5PanelPlacement() {
  const { panelPlacement, updatePanelPlacement, buildingDetails } = usePVGISCalculatorStore()

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Compass className='w-5 h-5 text-solar' />
            Panel Placement Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Orientation (Azimuth) */}
          <div className='space-y-3'>
            <Label className='text-base font-semibold'>Orientation (Azimuth)</Label>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>
                  0° = North, 90° = East, 180° = South, 270° = West
                </span>
                <span className='font-semibold'>{panelPlacement.orientation}°</span>
              </div>
              <Slider
                value={[panelPlacement.orientation]}
                onValueChange={(value) => updatePanelPlacement({ orientation: value[0] })}
                min={0}
                max={360}
                step={5}
                className='w-full'
              />
              <div className='text-xs text-muted-foreground text-center'>
                {panelPlacement.orientation === 0 && 'North'}
                {panelPlacement.orientation === 90 && 'East'}
                {panelPlacement.orientation === 180 && 'South (Optimal for Northern Hemisphere)'}
                {panelPlacement.orientation === 270 && 'West'}
              </div>
            </div>
          </div>

          {/* Tilt Angle */}
          <div className='space-y-3'>
            <Label className='text-base font-semibold'>Tilt Angle</Label>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>
                  Angle from horizontal
                </span>
                <span className='font-semibold'>{panelPlacement.tilt}°</span>
              </div>
              <Slider
                value={[panelPlacement.tilt]}
                onValueChange={(value) => updatePanelPlacement({ tilt: value[0] })}
                min={0}
                max={60}
                step={5}
                className='w-full'
              />
              <div className='text-xs text-muted-foreground'>
                {buildingDetails?.roofType === 'flat'
                  ? 'Recommended: 30° for optimal yield in Switzerland'
                  : `Current roof pitch: ${buildingDetails?.roofPitch || 30}°`}
              </div>
            </div>
          </div>

          {/* Distances */}
          <div className='space-y-4'>
            <Label className='text-base font-semibold flex items-center gap-2'>
              <Ruler className='w-4 h-4' />
              Safety Distances
            </Label>
            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label className='text-sm'>Ridge Distance (m)</Label>
                <Input
                  type='number'
                  value={panelPlacement.ridgeDistance}
                  onChange={(e) => updatePanelPlacement({ ridgeDistance: parseFloat(e.target.value) || 0 })}
                  min={0}
                  step={0.1}
                />
              </div>
              <div className='space-y-2'>
                <Label className='text-sm'>Gable End Distance (m)</Label>
                <Input
                  type='number'
                  value={panelPlacement.gableEndDistance}
                  onChange={(e) => updatePanelPlacement({ gableEndDistance: parseFloat(e.target.value) || 0 })}
                  min={0}
                  step={0.1}
                />
              </div>
              <div className='space-y-2'>
                <Label className='text-sm'>Eaves Distance (m)</Label>
                <Input
                  type='number'
                  value={panelPlacement.eavesDistance}
                  onChange={(e) => updatePanelPlacement({ eavesDistance: parseFloat(e.target.value) || 0 })}
                  min={0}
                  step={0.1}
                />
              </div>
              <div className='space-y-2'>
                <Label className='text-sm'>Obstacle Clearance (m)</Label>
                <Input
                  type='number'
                  value={panelPlacement.obstacleClearance}
                  onChange={(e) => updatePanelPlacement({ obstacleClearance: parseFloat(e.target.value) || 0 })}
                  min={0}
                  step={0.1}
                />
              </div>
            </div>
          </div>

          {/* Module Orientation */}
          <div className='space-y-3'>
            <Label className='text-base font-semibold'>Module Orientation</Label>
            <RadioGroup
              value={panelPlacement.moduleOrientation}
              onValueChange={(value) => updatePanelPlacement({ moduleOrientation: value as 'horizontal' | 'vertical' })}
            >
              <div className='flex gap-4'>
                <label className='flex items-center space-x-2 cursor-pointer'>
                  <RadioGroupItem value='horizontal' />
                  <span>Horizontal (Landscape)</span>
                </label>
                <label className='flex items-center space-x-2 cursor-pointer'>
                  <RadioGroupItem value='vertical' />
                  <span>Vertical (Portrait)</span>
                </label>
              </div>
            </RadioGroup>
          </div>

          {/* Module Rotation */}
          <div className='space-y-3'>
            <Label className='text-base font-semibold'>Module Rotation</Label>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>Fine-tune panel rotation</span>
                <span className='font-semibold'>{panelPlacement.moduleRotation.toFixed(1)}°</span>
              </div>
              <Slider
                value={[panelPlacement.moduleRotation]}
                onValueChange={(value) => updatePanelPlacement({ moduleRotation: value[0] })}
                min={-45}
                max={45}
                step={1}
                className='w-full'
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
