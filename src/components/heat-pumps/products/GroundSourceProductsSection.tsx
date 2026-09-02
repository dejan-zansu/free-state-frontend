import { getTranslations } from 'next-intl/server'

const columns = ['manufacturer', 'types', 'maxHeatingOutput', 'maxFlowTemp', 'maxSCOP', 'refrigerant'] as const

const products = [
  { manufacturer: 'NIBE', types: 'S1256-8 (mit Speicher)', maxHeatingOutput: '8.0 kW', maxFlowTemp: '65 °C', maxSCOP: '5.7', refrigerant: 'R454B' },
  { manufacturer: 'NIBE', types: 'S1256-13 (mit Speicher)', maxHeatingOutput: '13.0 kW', maxFlowTemp: '65 °C', maxSCOP: '5.9', refrigerant: 'R454B' },
  { manufacturer: 'NIBE', types: 'S1256-18 (mit Speicher)', maxHeatingOutput: '18.0 kW', maxFlowTemp: '65 °C', maxSCOP: '5.9', refrigerant: 'R454B' },
  { manufacturer: 'NIBE', types: 'S1156-8', maxHeatingOutput: '8.0 kW', maxFlowTemp: '65 °C', maxSCOP: '5.7', refrigerant: 'R454B' },
  { manufacturer: 'NIBE', types: 'S1156-13', maxHeatingOutput: '13.0 kW', maxFlowTemp: '65 °C', maxSCOP: '5.9', refrigerant: 'R454B' },
  { manufacturer: 'NIBE', types: 'S1156-18', maxHeatingOutput: '18.0 kW', maxFlowTemp: '65 °C', maxSCOP: '5.9', refrigerant: 'R454B' },
  { manufacturer: 'NIBE', types: 'S1157 (R290, ab 2026)', maxHeatingOutput: '5–18 kW', maxFlowTemp: '70 °C', maxSCOP: '-', refrigerant: 'R290' },
  { manufacturer: 'NIBE', types: 'S1257 (R290, ab 2026, mit Speicher)', maxHeatingOutput: '5–18 kW', maxFlowTemp: '70 °C', maxSCOP: '-', refrigerant: 'R290' },
  { manufacturer: 'Viessmann', types: 'Vitocal 300-G BW 301.B06', maxHeatingOutput: '5.7 kW', maxFlowTemp: '60 °C', maxSCOP: '5.3', refrigerant: 'R410A' },
  { manufacturer: 'Viessmann', types: 'Vitocal 300-G BW 301.B08', maxHeatingOutput: '7.6 kW', maxFlowTemp: '60 °C', maxSCOP: '5.6', refrigerant: 'R410A' },
  { manufacturer: 'Viessmann', types: 'Vitocal 300-G BW 301.B10', maxHeatingOutput: '10.4 kW', maxFlowTemp: '60 °C', maxSCOP: '5.3', refrigerant: 'R410A' },
  { manufacturer: 'Viessmann', types: 'Vitocal 300-G BW 301.B13', maxHeatingOutput: '13.0 kW', maxFlowTemp: '60 °C', maxSCOP: '5.3', refrigerant: 'R410A' },
  { manufacturer: 'Viessmann', types: 'Vitocal 300-G BW 301.B17', maxHeatingOutput: '17.2 kW', maxFlowTemp: '60 °C', maxSCOP: '5.1', refrigerant: 'R410A' },
]

const gridCols = 'grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr]'

const GroundSourceProductsSection = async () => {
  const t = await getTranslations('heatPumpsProducts.groundSourceTable')

  return (
    <section
      className="relative py-12 md:py-16"
      style={{
        background:
          'linear-gradient(180deg, rgba(243, 245, 233, 1) 0%, rgba(220, 233, 230, 1) 100%)',
      }}
    >
      <div className="max-w-[1266px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-[50px]">
          <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium text-center">
            {t('title')}
          </h2>

          <div className="w-full overflow-x-auto">
            <div className="min-w-[900px] flex flex-col border border-[#062E25]/40 rounded-2xl overflow-hidden">
              <div className={`${gridCols} bg-[#E4E9D3]`}>
                {columns.map((col) => (
                  <span
                    key={col}
                    className="px-5 py-4 text-[#062E25] text-sm md:text-lg font-semibold tracking-[-0.02em]"
                  >
                    {t(`columns.${col}`)}
                  </span>
                ))}
              </div>

              {products.map((product, index) => (
                <div
                  key={index}
                  className={`${gridCols} border-b border-[#062E25]/40 last:border-b-0`}
                  style={{ background: 'rgba(255, 255, 255, 0.1)' }}
                >
                  <span className="px-5 py-3 text-[#062E25] text-sm md:text-lg tracking-[-0.02em]">
                    {product.manufacturer}
                  </span>
                  <span className="px-5 py-3 text-[#062E25] text-sm md:text-lg tracking-[-0.02em]">
                    {product.types}
                  </span>
                  <span className="px-5 py-3 text-[#062E25] text-sm md:text-lg tracking-[-0.02em]">
                    {product.maxHeatingOutput}
                  </span>
                  <span className="px-5 py-3 text-[#062E25] text-sm md:text-lg tracking-[-0.02em]">
                    {product.maxFlowTemp}
                  </span>
                  <span className="px-5 py-3 text-[#062E25] text-sm md:text-lg tracking-[-0.02em]">
                    {product.maxSCOP}
                  </span>
                  <span className="px-5 py-3 text-[#062E25] text-sm md:text-lg tracking-[-0.02em]">
                    {product.refrigerant}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-px opacity-20"
        style={{
          background:
            'linear-gradient(54deg, rgba(6, 46, 37, 1) 74%, rgba(3, 107, 83, 1) 100%)',
        }}
      />
    </section>
  )
}

export default GroundSourceProductsSection
