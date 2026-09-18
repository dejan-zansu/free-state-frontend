/**
 * Package URLs are built from the package NAME the visitor sees ("SolarDirect S Huawei" ->
 * solardirect-s-huawei). The internal codes still carry legacy prefixes (SOLARABO_S_HUAWEI is
 * sold as SolarDirect), so a code in the URL reads wrong. Code slugs keep resolving, the first
 * version of the page linked them.
 */
export function packageNameToSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function packageCodeToSlug(code: string): string {
  return code.toLowerCase().replace(/_/g, '-')
}

export function matchesPackageSlug(pkg: { code: string; name: string }, slug: string): boolean {
  const wanted = slug.toLowerCase()
  return packageNameToSlug(pkg.name) === wanted || packageCodeToSlug(pkg.code) === wanted
}
