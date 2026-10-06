export function normalizePhone(input: string): string | null {
  const compact = input
    .trim()
    .replace(/\(0\)/g, '')
    .replace(/[\s\-./()]/g, '')
  if (/^0[1-9]\d{8}$/.test(compact)) return `+41${compact.slice(1)}`
  const international = (
    compact.startsWith('00') ? `+${compact.slice(2)}` : compact
  ).replace(/^\+410/, '+41')
  if (/^\+41[1-9]\d{8}$/.test(international)) return international
  if (/^\+(?:423|49|43|33|39)\d{6,12}$/.test(international))
    return international
  return null
}
