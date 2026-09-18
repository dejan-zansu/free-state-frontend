'use client'

import { Loader2, Maximize2, RotateCcw } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'
import { toSameOriginAssetUrl } from '@/lib/products/asset-url'

let registration: Promise<unknown> | null = null

/** Loads @google/model-viewer once, client side only. */
function registerModelViewer(): Promise<unknown> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.customElements?.get('model-viewer')) return Promise.resolve()
  if (!registration) registration = import('@google/model-viewer')
  return registration
}

export interface ModelViewerProps {
  src: string
  poster?: string | null
  alt: string
  /** model-viewer camera-orbit, e.g. "-30deg 78deg 1.576m". Tall products need an explicit radius. */
  orbit?: string
  fieldOfView?: string
  /** "auto" loads immediately, "manual" shows the poster until the user asks for the model. */
  reveal?: 'auto' | 'manual'
  autoRotate?: boolean
  className?: string
  /** Shows the reset and fullscreen controls. */
  controls?: boolean
  /** Fires once the GLB has been parsed and the first frame is rendered. */
  onLoad?: () => void
}

export default function ModelViewer({
  src,
  poster,
  alt,
  orbit = '-30deg 78deg auto',
  fieldOfView = '24deg',
  reveal = 'auto',
  autoRotate = true,
  className,
  controls = true,
  onLoad,
}: ModelViewerProps) {
  const t = useTranslations('products.viewer')
  const ref = useRef<ModelViewerElement | null>(null)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const [ready, setReady] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [progress, setProgress] = useState(0)
  const [failed, setFailed] = useState(false)
  const [revealed, setRevealed] = useState(reveal === 'auto')
  // Wheel zoom only after the visitor has taken hold of the model, otherwise the viewer
  // swallows the page scroll while it sits in the middle of the viewport.
  const [zoomArmed, setZoomArmed] = useState(false)

  useEffect(() => {
    let alive = true
    registerModelViewer()
      .then(() => alive && setReady(true))
      .catch(() => alive && setFailed(true))
    return () => {
      alive = false
    }
  }, [])

  // A new model resets the load state so the poster shows again until the GLB has arrived
  useEffect(() => {
    setLoaded(false)
    setProgress(0)
    setFailed(false)
    setRevealed(reveal === 'auto')
  }, [src, reveal])

  useEffect(() => {
    const el = ref.current
    if (!el || !ready) return
    const handleLoad = () => {
      setLoaded(true)
      onLoad?.()
    }
    const handleProgress = (e: Event) => {
      const detail = (e as CustomEvent<{ totalProgress: number }>).detail
      if (detail) setProgress(detail.totalProgress)
    }
    const handleError = () => setFailed(true)
    el.addEventListener('load', handleLoad)
    el.addEventListener('progress', handleProgress)
    el.addEventListener('error', handleError)
    // A cached model can finish before the listeners are attached
    if (el.loaded) handleLoad()
    return () => {
      el.removeEventListener('load', handleLoad)
      el.removeEventListener('progress', handleProgress)
      el.removeEventListener('error', handleError)
    }
  }, [ready, revealed, src, onLoad])

  const resetView = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.cameraOrbit = orbit
    el.fieldOfView = fieldOfView
    el.jumpCameraToGoal()
  }, [orbit, fieldOfView])

  const toggleFullscreen = useCallback(() => {
    const wrap = wrapRef.current
    if (!wrap) return
    if (document.fullscreenElement) {
      void document.exitFullscreen()
    } else if (wrap.requestFullscreen) {
      void wrap.requestFullscreen()
    }
  }, [])

  const modelSrc = toSameOriginAssetUrl(src)
  const posterSrc = poster ? toSameOriginAssetUrl(poster) : undefined

  return (
    <div
      ref={wrapRef}
      className={cn(
        'relative isolate overflow-hidden rounded-[24px] border border-pine/10 bg-[#F5F6F0]',
        'fullscreen:rounded-none',
        className
      )}
      style={{ touchAction: 'pan-y' }}
      onPointerDown={() => setZoomArmed(true)}
      onMouseLeave={() => setZoomArmed(false)}
    >
      {ready && revealed && !failed ? (
        <model-viewer
          ref={ref as React.RefObject<HTMLElement>}
          src={modelSrc}
          poster={posterSrc}
          alt={alt}
          camera-controls=""
          {...(zoomArmed ? {} : { 'disable-zoom': '' })}
          touch-action="pan-y"
          camera-orbit={orbit}
          field-of-view={fieldOfView}
          min-field-of-view="10deg"
          max-field-of-view="45deg"
          min-camera-orbit="auto auto 40%"
          max-camera-orbit="auto auto 250%"
          interaction-prompt="none"
          shadow-intensity="0.9"
          shadow-softness="0.8"
          exposure="1.0"
          tone-mapping="neutral"
          environment-image="neutral"
          loading="eager"
          {...(autoRotate ? { 'auto-rotate': '', 'auto-rotate-delay': 2500, 'rotation-per-second': '9deg' } : {})}
          className="block h-full w-full"
          style={
            {
              '--poster-color': 'transparent',
              '--progress-bar-color': 'transparent',
              '--progress-mask': 'transparent',
              width: '100%',
              height: '100%',
              backgroundColor: 'transparent',
            } as React.CSSProperties
          }
        >
          <div slot="progress-bar" />
        </model-viewer>
      ) : (
        // Poster until the library has loaded, or the user has not asked for the model yet
        <div className="absolute inset-0 flex items-center justify-center p-6">
          {posterSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={posterSrc} alt={alt} className="max-h-full max-w-full object-contain" draggable={false} />
          ) : null}
        </div>
      )}

      {!revealed && !failed && (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="absolute inset-0 z-10 flex items-end justify-center pb-5 text-base font-medium text-pine"
          aria-label={t('load3d')}
        >
          <span className="rounded-full border border-pine/15 bg-white/90 px-4 py-2 shadow-sm backdrop-blur">
            {t('load3d')}
          </span>
        </button>
      )}

      {revealed && ready && !loaded && !failed && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-2 p-4">
          <div className={cn('h-1 overflow-hidden rounded-full bg-pine/10', controls ? 'w-40' : 'w-24')}>
            <div
              className="h-full rounded-full bg-teal-deep transition-[width] duration-200"
              style={{ width: `${Math.max(8, Math.round(progress * 100))}%` }}
            />
          </div>
          {controls && (
            <span className="flex items-center gap-2 text-base text-pine/70">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              {t('loading')}
            </span>
          )}
        </div>
      )}

      {failed && (
        <div className="absolute inset-x-0 bottom-0 z-10 p-4 text-center text-base text-pine/70">
          {t('failed')}
        </div>
      )}

      {controls && revealed && loaded && (
        <div className="absolute right-3 top-3 z-10 flex gap-2">
          <button
            type="button"
            onClick={resetView}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-pine/10 bg-white/90 text-pine shadow-sm backdrop-blur transition hover:bg-white"
            aria-label={t('reset')}
            title={t('reset')}
          >
            <RotateCcw className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-pine/10 bg-white/90 text-pine shadow-sm backdrop-blur transition hover:bg-white sm:flex"
            aria-label={t('fullscreen')}
            title={t('fullscreen')}
          >
            <Maximize2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}

      {controls && revealed && loaded && (
        <p className="pointer-events-none absolute inset-x-0 bottom-3 z-10 text-center text-sm text-pine/55 sm:text-base">
          {t('hint')}
        </p>
      )}
    </div>
  )
}
