import { getTranslations } from 'next-intl/server'

import { formatChf } from './roof-renovation-api'

const ROWS = [
  { key: 'house', low: 45800, median: 69400, high: 102000, cases: 2444 },
  { key: 'multi', low: 71000, median: 111400, high: 185300, cases: 1690 },
  { key: 'industry', low: 102300, median: 219000, high: 420000, cases: 204 },
] as const

const SCALE_MAX = 450000
const TICKS = [0, 100000, 200000, 300000, 400000] as const

const percent = (value: number) => `${(value / SCALE_MAX) * 100}%`

const RoofCostChart = async () => {
  const t = await getTranslations('roofRenovation.cost.table')
  return (
    <figure className="flex h-full flex-col rounded-[24px] bg-[#EAEDDF] p-6 text-[#062E25] md:p-8">
      <figcaption>
        <h3 className="text-2xl font-medium tracking-tight">{t('heading')}</h3>
        <p className="mt-2 text-base text-[#062E25]/80">{t('period')}</p>
      </figcaption>

      <div
        className="mt-8 flex flex-1 flex-col justify-center gap-8"
        aria-hidden
      >
        {ROWS.map(row => (
          <div key={row.key}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <span className="text-lg font-medium tracking-tight">
                {t(`rows.${row.key}`)}
              </span>
              <span className="text-base tabular-nums">
                CHF {formatChf(row.low)} - {formatChf(row.high)}
              </span>
            </div>
            <div className="relative mt-3 h-5">
              <div className="absolute inset-x-0 top-1/2 h-px bg-[#062E25]/20" />
              <div
                title={`${t('median')}: CHF ${formatChf(row.median)}`}
                className="absolute top-1/2 h-3.5 -translate-y-1/2 rounded-full bg-[#062E25]"
                style={{
                  left: percent(row.low),
                  width: percent(row.high - row.low),
                }}
              />
              <div
                className="absolute top-0 h-5 w-2 -translate-x-1/2 rounded-[3px] bg-solar ring-2 ring-[#EAEDDF]"
                style={{ left: percent(row.median) }}
              />
            </div>
            <div className="mt-2 flex flex-wrap justify-between gap-x-4 text-base text-[#062E25]/70 tabular-nums">
              <span>
                {t('median')} CHF {formatChf(row.median)}
              </span>
              <span>{t('casesCount', { count: formatChf(row.cases) })}</span>
            </div>
          </div>
        ))}
      </div>

      <div
        className="relative mt-6 h-6 border-t border-[#062E25]/20"
        aria-hidden
      >
        {TICKS.map(tick => (
          <span
            key={tick}
            className={`absolute top-1.5 -translate-x-1/2 text-base text-[#062E25]/60 tabular-nums first:translate-x-0 ${
              tick % 200000 === 0 ? '' : 'hidden sm:block'
            }`}
            style={{ left: percent(tick) }}
          >
            {tick === 0 ? 'CHF 0' : formatChf(tick)}
          </span>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-base text-[#062E25]/80">
        <span className="flex items-center gap-2">
          <span className="h-3.5 w-8 rounded-full bg-[#062E25]" />
          {t('legendRange')}
        </span>
        <span className="flex items-center gap-2">
          <span className="h-5 w-2 rounded-[3px] bg-solar ring-1 ring-[#062E25]/30" />
          {t('median')}
        </span>
      </div>

      <p className="mt-4 text-base text-[#062E25]/70">{t('footnote')}</p>

      <div className="sr-only">
        <table>
          <caption>{t('heading')}</caption>
          <thead>
            <tr>
              <th scope="col">{t('building')}</th>
              <th scope="col">{t('low')}</th>
              <th scope="col">{t('median')}</th>
              <th scope="col">{t('high')}</th>
              <th scope="col">{t('cases')}</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(row => (
              <tr key={row.key}>
                <th scope="row">{t(`rows.${row.key}`)}</th>
                <td>CHF {formatChf(row.low)}</td>
                <td>CHF {formatChf(row.median)}</td>
                <td>CHF {formatChf(row.high)}</td>
                <td>{formatChf(row.cases)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  )
}

export default RoofCostChart
