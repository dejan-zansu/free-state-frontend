'use client'

import { ArrowUpRight, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import sceneJson from '@/data/energiegemeinschaften-scene.json'
import { registerModelViewer } from '@/lib/model-viewer'
import {
  CAMERA_ORBIT_MAX,
  CAMERA_ORBIT_MIN,
  parseZoneHash,
  PULSE_MATERIALS,
  SCENE_STEP_IDS,
  SCENE_ZONE_IDS,
  type SceneConfig,
  type SceneStepId,
  type SceneZoneId,
} from '@/lib/ratgeber/scene-zones'
import { cn } from '@/lib/utils'

const scene = sceneJson as SceneConfig
const SRC = '/3d/energiegemeinschaften.glb'
const HIGHLIGHT: [number, number, number, number] = [0.72, 1.0, 0.1, 1]
const DIMMED: [number, number, number, number] = [0.86, 0.87, 0.85, 1]

export interface SceneZoneContent {
  id: SceneZoneId
  label: string
  summary: string
  href: string
  ctaLabel: string
  labels: Record<string, string>
  steps: { id: SceneStepId; label: string; text: string }[]
}

interface Props {
  zones: SceneZoneContent[]
  alt: string
  overviewLabel: string
  loadingLabel: string
  stepsTitle: string
  allStepsLabel: string
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

export default function CommunityScene({
  zones,
  alt,
  overviewLabel,
  loadingLabel,
  stepsTitle,
  allStepsLabel,
}: Props) {
  const ref = useRef<ModelViewerElement | null>(null)
  const originals = useRef<Map<SceneZoneId, [number, number, number, number]>>(
    new Map()
  )
  const pulseOriginals = useRef<
    Map<SceneStepId, [number, number, number, number]>
  >(new Map())
  const alphaModeSet = useRef<Set<SceneStepId>>(new Set())
  const [ready, setReady] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)
  const [active, setActive] = useState<SceneZoneId | null>(null)
  const [step, setStep] = useState<SceneStepId | null>(null)
  const [zoomArmed, setZoomArmed] = useState(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    setReduced(prefersReducedMotion())
    let alive = true
    registerModelViewer()
      .then(() => alive && setReady(true))
      .catch(() => alive && setFailed(true))
    return () => {
      alive = false
    }
  }, [])

  const moveCamera = useCallback(
    (target: string, orbit: string) => {
      const el = ref.current
      if (!el) return
      el.cameraTarget = target
      el.cameraOrbit = orbit
      if (reduced) el.jumpCameraToGoal()
    },
    [reduced]
  )

  const focusZone = useCallback(
    (id: SceneZoneId | null, pushHash = true) => {
      setActive(id)
      if (id) moveCamera(scene.zones[id].target, scene.zones[id].orbit)
      else moveCamera(scene.overview.target, scene.overview.orbit)
      if (pushHash && typeof window !== 'undefined') {
        const url = `${window.location.pathname}${window.location.search}${id ? `#${id}` : ''}`
        window.history.replaceState(null, '', url)
      }
    },
    [moveCamera]
  )

  useEffect(() => {
    const el = ref.current
    if (!el || !ready) return
    const onLoad = () => {
      setLoaded(true)
      if (!reduced) {
        el.animationName = el.availableAnimations.includes('flow')
          ? 'flow'
          : el.availableAnimations[0]
        el.play()
      }
      const fromHash = parseZoneHash(window.location.hash)
      if (fromHash) focusZone(fromHash, false)
    }
    const onError = () => setFailed(true)
    el.addEventListener('load', onLoad)
    el.addEventListener('error', onError)
    if (el.loaded) onLoad()
    return () => {
      el.removeEventListener('load', onLoad)
      el.removeEventListener('error', onError)
    }
  }, [ready, reduced, focusZone])

  useEffect(() => {
    const onHash = () => focusZone(parseZoneHash(window.location.hash), false)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [focusZone])

  const tint = useCallback(
    (id: SceneZoneId, on: boolean) => {
      const material = ref.current?.model?.getMaterialByName(`island_${id}`)
      if (!material) return
      const pbr = material.pbrMetallicRoughness
      if (on) {
        if (!originals.current.has(id))
          originals.current.set(id, [...pbr.baseColorFactor] as [
            number,
            number,
            number,
            number,
          ])
        pbr.setBaseColorFactor(HIGHLIGHT)
      } else {
        const original = originals.current.get(id)
        if (!original) return
        pbr.setBaseColorFactor(active && id !== active ? DIMMED : original)
      }
    },
    [active]
  )

  useEffect(() => {
    const el = ref.current
    if (!el || !loaded) return
    const model = el.model
    if (!model) return
    for (const id of SCENE_ZONE_IDS) {
      const material = model.getMaterialByName(`island_${id}`)
      if (!material) continue
      const pbr = material.pbrMetallicRoughness
      if (!originals.current.has(id))
        originals.current.set(id, [...pbr.baseColorFactor] as [
          number,
          number,
          number,
          number,
        ])
      const original = originals.current.get(id)
      if (!original) continue
      pbr.setBaseColorFactor(active && id !== active ? DIMMED : original)
    }
  }, [active, loaded])

  useEffect(() => {
    setStep(null)
  }, [active])

  useEffect(() => {
    const el = ref.current
    if (!el || !loaded) return
    const model = el.model
    if (!model) return
    for (const id of SCENE_STEP_IDS) {
      const material = model.getMaterialByName(PULSE_MATERIALS[id])
      if (!material) continue
      const pbr = material.pbrMetallicRoughness
      if (!pulseOriginals.current.has(id))
        pulseOriginals.current.set(id, [...pbr.baseColorFactor] as [
          number,
          number,
          number,
          number,
        ])
      if (!alphaModeSet.current.has(id)) {
        material.setAlphaMode('BLEND')
        alphaModeSet.current.add(id)
      }
      const original = pulseOriginals.current.get(id)
      if (!original) continue
      const [r, g, b] = original
      const alpha = step === null || step === id ? 1 : 0
      pbr.setBaseColorFactor([r, g, b, alpha])
    }
  }, [step, loaded])

  const activeZone = zones.find(z => z.id === active) ?? null
  const activeStep = activeZone?.steps.find(s => s.id === step) ?? null
  const showViewer = ready && !failed

  return (
    <div className="relative">
      <div
        className={cn(
          'relative isolate overflow-hidden rounded-[24px] border border-[#062E25]/10 bg-white',
          'aspect-[4/3] md:aspect-[16/10]'
        )}
        style={{ touchAction: 'pan-y' }}
        onPointerDown={() => setZoomArmed(true)}
        onMouseLeave={() => setZoomArmed(false)}
      >
        {showViewer ? (
          <model-viewer
            ref={ref as React.RefObject<HTMLElement>}
            src={SRC}
            alt={alt}
            loading="lazy"
            reveal="auto"
            camera-controls=""
            {...(zoomArmed ? {} : { 'disable-zoom': '' })}
            touch-action="pan-y"
            camera-target={scene.overview.target}
            camera-orbit={scene.overview.orbit}
            min-camera-orbit={CAMERA_ORBIT_MIN}
            max-camera-orbit={CAMERA_ORBIT_MAX}
            field-of-view="26deg"
            min-field-of-view="18deg"
            max-field-of-view="34deg"
            interpolation-decay="200"
            interaction-prompt="none"
            shadow-intensity="0.7"
            shadow-softness="0.9"
            exposure="1.0"
            tone-mapping="neutral"
            environment-image="neutral"
            className="block h-full w-full"
            style={
              {
                '--poster-color': 'transparent',
                '--progress-bar-color': 'transparent',
                width: '100%',
                height: '100%',
                backgroundColor: 'transparent',
              } as React.CSSProperties
            }
          >
            {zones.map(zone => {
              const config = scene.zones[zone.id]
              if (!config) return null
              const [x, y, z] = config.anchor
              return (
                <button
                  key={zone.id}
                  type="button"
                  slot={`hotspot-${zone.id}`}
                  data-position={`${x}m ${y}m ${z}m`}
                  data-normal="0 1 0"
                  onClick={() => focusZone(zone.id)}
                  onMouseEnter={() => tint(zone.id, true)}
                  onMouseLeave={() => tint(zone.id, false)}
                  onFocus={() => tint(zone.id, true)}
                  onBlur={() => tint(zone.id, false)}
                  aria-pressed={active === zone.id}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-base font-semibold shadow-md transition-transform',
                    'hover:scale-105 focus-visible:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#062E25]',
                    zone.id === 'leg'
                      ? 'bg-[#062E25] text-white'
                      : 'bg-[#b7fe1a] text-[#062E25]'
                  )}
                >
                  {zone.label}
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </button>
              )
            })}
            {active &&
              scene.zones[active].labels.map(labelConfig => {
                const text = activeZone?.labels[labelConfig.id]
                if (!text) return null
                const [x, y, z] = labelConfig.anchor
                return (
                  <div
                    key={labelConfig.id}
                    slot={`hotspot-label-${active}-${labelConfig.id}`}
                    data-position={`${x}m ${y}m ${z}m`}
                    data-normal="0 1 0"
                    aria-hidden="true"
                  >
                    <span className="inline-flex items-center rounded-full bg-[#062E25] px-3 py-1 text-base text-white shadow">
                      {text}
                    </span>
                  </div>
                )
              })}
            <div slot="progress-bar" />
          </model-viewer>
        ) : (
          <p className="absolute inset-0 flex items-center justify-center px-6 text-center text-base text-[#062E25]/70">
            {alt}
          </p>
        )}

        {showViewer && !loaded && (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
            <span className="rounded-full bg-white/90 px-4 py-1.5 text-base text-[#062E25] shadow">
              {loadingLabel}
            </span>
          </div>
        )}

        {active && (
          <button
            type="button"
            onClick={() => focusZone(null)}
            className="absolute left-4 top-4 z-10 rounded-full border border-[#062E25]/15 bg-white/90 px-4 py-1.5 text-base font-medium text-[#062E25] shadow-sm backdrop-blur"
          >
            {overviewLabel}
          </button>
        )}

      </div>
        {activeZone && (
          <aside
            className={cn(
              'z-10 rounded-[20px] border border-[#062E25]/10 bg-white/95 p-5 text-[#062E25] shadow-xl backdrop-blur',
              'mt-3 md:mt-0 md:absolute md:right-4 md:top-4 md:w-[340px] md:max-h-[calc(100%-1.5rem)] md:overflow-y-auto'
            )}
            aria-live="polite"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xl font-semibold">{activeZone.label}</h3>
              <button
                type="button"
                onClick={() => focusZone(null)}
                aria-label={overviewLabel}
                className="rounded-full p-1 hover:bg-[#062E25]/5"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <p className="mt-2 text-base text-[#062E25]/85">
              {activeZone.summary}
            </p>
            <p className="mt-4 text-base font-semibold text-[#062E25]">
              {stepsTitle}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setStep(null)}
                aria-pressed={step === null}
                className={cn(
                  'rounded-full border px-3 py-1 text-base font-medium',
                  step === null
                    ? 'border-[#062E25] bg-[#062E25] text-white'
                    : 'border-[#062E25]/20 bg-white text-[#062E25]'
                )}
              >
                {allStepsLabel}
              </button>
              {activeZone.steps.map(zoneStep => (
                <button
                  key={zoneStep.id}
                  type="button"
                  onClick={() => setStep(zoneStep.id)}
                  aria-pressed={step === zoneStep.id}
                  className={cn(
                    'rounded-full border px-3 py-1 text-base font-medium',
                    step === zoneStep.id
                      ? 'border-[#062E25] bg-[#062E25] text-white'
                      : 'border-[#062E25]/20 bg-white text-[#062E25]'
                  )}
                >
                  {zoneStep.label}
                </button>
              ))}
            </div>
            {activeStep && (
              <p className="mt-3 text-base text-[#062E25]/85">
                {activeStep.text}
              </p>
            )}
            <a
              href={activeZone.href}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#062E25] px-4 py-2 text-base font-medium text-white hover:bg-[#062E25]/90"
            >
              {activeZone.ctaLabel}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
          </aside>
        )}

      <div
        className={cn(
          'mt-3 flex flex-wrap gap-2',
          showViewer ? 'sm:hidden' : ''
        )}
      >
        {SCENE_ZONE_IDS.map(id => {
          const zone = zones.find(z => z.id === id)
          if (!zone) return null
          return showViewer ? (
            <button
              key={id}
              type="button"
              onClick={() => focusZone(id)}
              aria-pressed={active === id}
              className={cn(
                'rounded-full border px-4 py-1.5 text-base font-medium',
                active === id
                  ? 'border-[#062E25] bg-[#062E25] text-white'
                  : 'border-[#062E25]/20 bg-white text-[#062E25]'
              )}
            >
              {zone.label}
            </button>
          ) : (
            <a
              key={id}
              href={zone.href}
              className="rounded-full border border-[#062E25]/20 bg-white px-4 py-1.5 text-base font-medium text-[#062E25]"
            >
              {zone.label}
            </a>
          )
        })}
      </div>
    </div>
  )
}
