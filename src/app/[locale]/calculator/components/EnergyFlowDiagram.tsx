'use client'

import { useTranslations } from 'next-intl'

interface EnergyFlowDiagramProps {
  annualProduction: number
  estimatedConsumption: number
  selfConsumptionRate: number
}

export default function EnergyFlowDiagram({
  annualProduction,
  estimatedConsumption,
  selfConsumptionRate,
}: EnergyFlowDiagramProps) {
  const t = useTranslations('solarAboCalculator.results.energyFlow')

  const selfConsumed = Math.round(annualProduction * selfConsumptionRate)
  const feedIn = Math.round(annualProduction - selfConsumed)
  const gridSupply = Math.round(Math.max(0, estimatedConsumption - selfConsumed))
  const independence = estimatedConsumption > 0
    ? Math.round((selfConsumed / estimatedConsumption) * 100)
    : 0

  const fmt = (n: number) => n.toLocaleString('de-CH')

  return (
    <div className="rounded-xl bg-white/60 border border-[#062E25]/8 p-6">
      <h3 className="text-base font-semibold text-[#062E25] mb-4">{t('title')}</h3>

      <svg viewBox="0 0 700 400" className="w-full h-auto" style={{ maxHeight: 400 }}>
        <polygon
          points="350,30 120,130 120,310 580,310 580,130"
          fill="none"
          stroke="#062E25"
          strokeWidth="2"
        />
        <polygon
          points="350,30 120,130 580,130"
          fill="#F97316"
          fillOpacity="0.08"
          stroke="#F97316"
          strokeWidth="2.5"
        />

        <circle cx="630" cy="50" r="20" fill="none" stroke="#F97316" strokeWidth="2" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map(angle => {
          const rad = (angle * Math.PI) / 180
          return (
            <line
              key={angle}
              x1={630 + Math.cos(rad) * 24}
              y1={50 + Math.sin(rad) * 24}
              x2={630 + Math.cos(rad) * 30}
              y2={50 + Math.sin(rad) * 30}
              stroke="#F97316"
              strokeWidth="2"
            />
          )
        })}

        <text x="350" y="100" textAnchor="middle" fill="#062E25" opacity="0.5" fontSize="14">{t('production')}</text>
        <text x="350" y="122" textAnchor="middle" fill="#062E25" fontWeight="700" fontSize="18">{fmt(annualProduction)} kWh</text>

        <line x1="540" y1="130" x2="540" y2="370" stroke="#F97316" strokeWidth="3" />
        <polygon points="534,370 540,382 546,370" fill="#F97316" />
        <text x="540" y="395" textAnchor="middle" fill="#F97316" fontSize="14">{t('feedIn')}</text>

        <path
          d="M350,220 L350,180 Q350,160 370,160 L510,160 L510,135"
          fill="none"
          stroke="#c1272d"
          strokeWidth="3"
        />
        <text x="350" y="200" textAnchor="middle" fill="#c1272d" opacity="0.7" fontSize="14">{t('ownConsumption')}</text>
        <text x="350" y="222" textAnchor="middle" fill="#c1272d" fontWeight="700" fontSize="16">{fmt(selfConsumed)} kWh</text>

        <text x="160" y="240" fill="#062E25" opacity="0.5" fontSize="14">{t('consumption')}</text>
        <text x="160" y="262" fill="#062E25" fontWeight="700" fontSize="16">{fmt(estimatedConsumption)} kWh</text>

        <line x1="200" y1="310" x2="200" y2="370" stroke="#63b7e8" strokeWidth="3" />
        <polygon points="194,310 200,298 206,310" fill="#63b7e8" />
        <text x="200" y="395" textAnchor="middle" fill="#63b7e8" fontSize="14">{t('gridSupply')}</text>

        <path
          d="M350,260 L200,260 Q180,260 180,280 L180,370"
          fill="none"
          stroke="#a1a0a0"
          strokeWidth="3"
        />
        <polygon points="174,370 180,382 186,370" fill="#a1a0a0" />
      </svg>

      <div className="mt-2 grid grid-cols-3 gap-4 text-center border-t border-[#062E25]/[0.06] pt-4">
        <div>
          <p className="text-sm text-[#062E25]/50">{t('independence')}</p>
          <p className="text-xl font-bold text-[#062E25]">{independence}%</p>
        </div>
        <div>
          <p className="text-sm text-[#63b7e8]">{t('gridSupply')}</p>
          <p className="text-xl font-bold text-[#062E25]">{fmt(gridSupply)} kWh</p>
        </div>
        <div>
          <p className="text-sm text-[#F97316]">{t('feedIn')}</p>
          <p className="text-xl font-bold text-[#062E25]">{fmt(feedIn)} kWh</p>
        </div>
      </div>
    </div>
  )
}
