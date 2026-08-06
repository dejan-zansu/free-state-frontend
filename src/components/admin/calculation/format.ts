export function fmtNumber(n: number | null | undefined, digits = 0) {
  if (n == null || Number.isNaN(n)) return '-'
  return n.toLocaleString('de-CH', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

export function fmtChf(n: number | string | null | undefined) {
  if (n == null) return '-'
  const value = typeof n === 'string' ? parseFloat(n) : n
  if (Number.isNaN(value)) return '-'
  return `CHF ${value.toLocaleString('de-CH', { maximumFractionDigits: 0 })}`
}

export function fmtDateTime(value: string | Date) {
  const date = typeof value === 'string' ? new Date(value) : value
  return date.toLocaleString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
