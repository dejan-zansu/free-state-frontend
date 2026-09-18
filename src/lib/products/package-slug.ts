/** Package codes are upper snake case (SOLARABO_S_HUAWEI); the URL carries them as solarabo-s-huawei. */
export function packageCodeToSlug(code: string): string {
  return code.toLowerCase().replace(/_/g, '-')
}

export function packageSlugToCode(slug: string): string {
  return slug.toUpperCase().replace(/-/g, '_')
}
