'use client'

import { Box, Map as MapIcon } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'
import type { SonnendachBuilding } from '@/types/sonnendach'

import RoofMap from './RoofMap'
import RoofMap3D from './RoofMap3D'
import type { RoofPagePanels } from './roof-panels'

type View = 'map' | '3d'

export default function RoofView({
  building,
  panels,
  ariaLabel,
}: {
  building: SonnendachBuilding
  panels: RoofPagePanels | null
  ariaLabel: string
}) {
  const [view, setView] = useState<View>('map')
  const canShow3d =
    panels !== null &&
    panels.groundAltitudeM !== null &&
    Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
  const goTo3d = view === 'map'

  return (
    <>
      {view === '3d' && panels ? (
        <RoofMap3D
          panels={panels}
          ariaLabel={ariaLabel}
          onFail={() => setView('map')}
        />
      ) : (
        <RoofMap
          building={building}
          panelModules={panels?.modules ?? null}
          ariaLabel={ariaLabel}
        />
      )}
      {canShow3d && (
        <button
          type="button"
          onClick={() => setView(goTo3d ? '3d' : 'map')}
          className={cn(
            'absolute right-3 top-3 z-20 inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-base font-semibold shadow-lg transition-colors',
            goTo3d
              ? 'bg-[#062E25] text-white hover:bg-[#062E25]/90'
              : 'bg-white text-[#062E25] ring-1 ring-[#062E25]/20 hover:bg-[#EEF1E6]'
          )}
        >
          {goTo3d ? (
            <Box className="h-5 w-5" aria-hidden />
          ) : (
            <MapIcon className="h-5 w-5" aria-hidden />
          )}
          {goTo3d ? 'In 3D ansehen' : 'Zur Karte'}
        </button>
      )}
    </>
  )
}
