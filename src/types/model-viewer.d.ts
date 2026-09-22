import type * as React from 'react'

// <model-viewer> is a web component from @google/model-viewer. It is registered at
// runtime by the ModelViewer component, this only teaches JSX the attributes we use.
type ModelViewerAttributes = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLElement>,
  HTMLElement
> & {
  src?: string
  alt?: string
  poster?: string
  loading?: 'auto' | 'lazy' | 'eager'
  reveal?: 'auto' | 'manual'
  'camera-controls'?: boolean | ''
  'disable-zoom'?: boolean | ''
  'disable-pan'?: boolean | ''
  'disable-tap'?: boolean | ''
  'touch-action'?: string
  'auto-rotate'?: boolean | ''
  'auto-rotate-delay'?: number | string
  'rotation-per-second'?: string
  'interaction-prompt'?: 'auto' | 'none'
  'camera-orbit'?: string
  'camera-target'?: string
  'field-of-view'?: string
  'min-camera-orbit'?: string
  'max-camera-orbit'?: string
  'min-field-of-view'?: string
  'max-field-of-view'?: string
  'interpolation-decay'?: number | string
  'shadow-intensity'?: number | string
  'shadow-softness'?: number | string
  exposure?: number | string
  'tone-mapping'?: string
  'environment-image'?: string
  'skybox-image'?: string
  ar?: boolean | ''
  'ar-modes'?: string
  'animation-name'?: string
  autoplay?: boolean | ''
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerAttributes
    }
  }
}

declare global {
  interface ModelViewerPbr {
    baseColorFactor: [number, number, number, number]
    setBaseColorFactor(rgba: [number, number, number, number] | string): void
  }
  interface ModelViewerMaterial {
    name: string
    pbrMetallicRoughness: ModelViewerPbr
    setAlphaMode(alphaMode: 'OPAQUE' | 'MASK' | 'BLEND'): void
  }
  interface ModelViewerModel {
    materials: ReadonlyArray<ModelViewerMaterial>
    getMaterialByName(name: string): ModelViewerMaterial | null
  }
  interface ModelViewerElement extends HTMLElement {
    src: string | null
    poster: string | null
    cameraOrbit: string
    cameraTarget: string
    fieldOfView: string
    minCameraOrbit: string
    maxCameraOrbit: string
    interpolationDecay: number
    animationName: string | undefined
    availableAnimations: string[]
    autoplay: boolean
    loaded: boolean
    model: ModelViewerModel | null
    play(options?: { repetitions?: number; pingpong?: boolean }): void
    pause(): void
    dismissPoster(): void
    resetTurntableRotation(theta?: number): void
    jumpCameraToGoal(): void
    getCameraOrbit(): { theta: number; phi: number; radius: number }
    toBlob(options?: {
      idealAspect?: boolean
      mimeType?: string
      qualityArgument?: number
    }): Promise<Blob>
  }
}

export {}
