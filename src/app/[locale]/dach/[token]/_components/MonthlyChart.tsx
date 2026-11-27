import { formatSwissNumber } from '@/components/references/reference-utils'

const MONTHS = [
  'Jan',
  'Feb',
  'Mär',
  'Apr',
  'Mai',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Okt',
  'Nov',
  'Dez',
]

export default function MonthlyChart({ months }: { months: number[] }) {
  if (months.length !== 12 || months.some(v => !Number.isFinite(v) || v < 0))
    return null
  const max = Math.max(...months)
  if (max <= 0) return null
  const maxIndex = months.indexOf(max)
  const minIndex = months.indexOf(Math.min(...months))
  const share = (value: number) => `${Math.max(2, (value / max) * 100)}%`

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">
        Ihr Dach im Jahresverlauf
      </h2>
      <figure className="space-y-3">
        <div aria-hidden className="hidden sm:block">
          <div className="flex h-64 items-end gap-2 border-b border-[#062E25]/20 pt-8">
            {months.map((value, index) => (
              <div
                key={MONTHS[index]}
                title={`${MONTHS[index]}: ${formatSwissNumber(value)} kWh`}
                className="flex h-full flex-1 items-end justify-center"
              >
                <div
                  className="relative w-3/5 rounded-t bg-amber-500"
                  style={{ height: share(value) }}
                >
                  {(index === maxIndex || index === minIndex) && (
                    <span className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 text-base font-semibold tabular-nums whitespace-nowrap">
                      {formatSwissNumber(value)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            {MONTHS.map(month => (
              <span
                key={month}
                className="flex-1 text-center text-base text-[#062E25]/60"
              >
                {month}
              </span>
            ))}
          </div>
        </div>

        <ul aria-hidden className="space-y-1.5 sm:hidden">
          {months.map((value, index) => (
            <li key={MONTHS[index]} className="flex items-center gap-3">
              <span className="w-9 shrink-0 text-base text-[#062E25]/60">
                {MONTHS[index]}
              </span>
              <span className="flex-1">
                <span
                  className="block h-4 rounded-r bg-amber-500"
                  style={{ width: share(value) }}
                />
              </span>
              <span className="w-16 shrink-0 text-right text-base tabular-nums">
                {formatSwissNumber(value)}
              </span>
            </li>
          ))}
        </ul>

        <table className="sr-only">
          <caption>Solarstrom pro Monat in kWh</caption>
          <tbody>
            {months.map((value, index) => (
              <tr key={MONTHS[index]}>
                <th scope="row">{MONTHS[index]}</th>
                <td>{formatSwissNumber(value)} kWh</td>
              </tr>
            ))}
          </tbody>
        </table>

        <figcaption className="text-base text-[#062E25]/60">
          Solarstrom pro Monat in kWh, geschätzt mit PVGIS der EU-Kommission
        </figcaption>
      </figure>
    </section>
  )
}
