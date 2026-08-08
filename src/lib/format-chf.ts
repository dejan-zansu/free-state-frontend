const THOUSANDS_SEPARATOR = "'"

export function groupNumber(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, THOUSANDS_SEPARATOR)
}

export function chf(value: number): string {
  return `CHF ${groupNumber(value)}`
}

export function kwh(annualKwh: number): string {
  return groupNumber(annualKwh)
}

export function kwp(sizeKwp: number): string {
  return sizeKwp.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
}

export function rpPerKwh(chfPerKwh: number): string {
  return (chfPerKwh * 100).toFixed(1)
}
