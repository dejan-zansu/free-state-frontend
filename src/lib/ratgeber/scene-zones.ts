export type SceneZoneId = 'zev' | 'vzev' | 'leg' | 'praxismodell'

export type SceneStepId = 'production' | 'distribution' | 'grid'

export const SCENE_STEP_IDS: readonly SceneStepId[] = [
  'production',
  'distribution',
  'grid',
]

export const PULSE_MATERIALS: Record<SceneStepId, string> = {
  production: 'pulse_production',
  distribution: 'pulse_distribution',
  grid: 'pulse_grid',
}

export const CAMERA_ORBIT_MIN = 'auto 20deg 80m'
export const CAMERA_ORBIT_MAX = 'auto 70deg 320m'

export const SCENE_ZONE_IDS: readonly SceneZoneId[] = [
  'zev',
  'vzev',
  'leg',
  'praxismodell',
]

export interface SceneLabelConfig {
  id: string
  anchor: [number, number, number]
}

export interface SceneZoneConfig {
  anchor: [number, number, number]
  target: string
  orbit: string
  labels: SceneLabelConfig[]
}

export interface SceneConfig {
  overview: { target: string; orbit: string }
  zones: Record<SceneZoneId, SceneZoneConfig>
}

export function isSceneZoneId(value: string): value is SceneZoneId {
  return (SCENE_ZONE_IDS as readonly string[]).includes(value)
}

export function parseZoneHash(hash: string): SceneZoneId | null {
  const value = hash.replace(/^#/, '').toLowerCase()
  return isSceneZoneId(value) ? value : null
}
