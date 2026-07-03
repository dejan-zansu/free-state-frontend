export const MODEL_LABEL_KEYS: Record<string, string> = {
  'solar-free': 'solarFree',
  'solar-direct': 'solarDirect',
  'solar-abo': 'solarAbo',
}

export function modelLabelKey(solarModel: string | null): string {
  return MODEL_LABEL_KEYS[solarModel ?? ''] ?? 'unknown'
}
