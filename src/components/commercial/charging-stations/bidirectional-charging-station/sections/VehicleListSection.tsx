import { getTranslations } from 'next-intl/server'

const CheckmarkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={20}
    height={20}
    viewBox="0 0 22 22"
    fill="none"
    className="shrink-0"
  >
    <path
      d="M21.2326 11C21.2326 5.34871 16.6513 0.767442 11 0.767442C5.34871 0.767442 0.767442 5.34871 0.767442 11C0.767442 16.6513 5.34871 21.2326 11 21.2326C16.6513 21.2326 21.2326 16.6513 21.2326 11Z"
      stroke="#295823"
      strokeWidth={1.5}
    />
    <path
      d="M6.90698 11.5116L9.46512 14.0698L15.093 7.93023"
      stroke="#295823"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const vehicles = ['vwId', 'vwBuzz', 'skoda', 'cupra', 'ford'] as const

const VehicleListSection = async () => {
  const t = await getTranslations('bidirectionalChargingStation')

  return (
    <section
      className="relative py-12 md:py-16"
      style={{
        background:
          'linear-gradient(180deg, rgba(243, 245, 233, 1) 0%, rgba(220, 233, 230, 1) 100%)',
      }}
    >
      <div className="max-w-[1440px] w-full mx-auto">
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-1/2 px-4 sm:px-6 lg:px-16">
            <div className="max-w-[643px] mx-auto flex flex-col gap-[20px]">
              <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium text-center whitespace-pre-line">
                {t('vehicleList.title')}
              </h2>
              <p className="text-[#062E25]/80 text-lg md:text-[22px] font-light tracking-[-0.02em] text-justify">
                {t('vehicleList.description')}
              </p>
            </div>
          </div>

          <div className="lg:w-1/2 px-4 sm:px-6 lg:px-8 mt-8 lg:mt-0">
            <div className="w-full overflow-x-auto">
              <div className="min-w-[500px]">
                <div className="grid grid-cols-3 bg-[#3D3858] border border-[#062E25]/40 rounded-t-2xl backdrop-blur-[20px]">
                  <span className="px-[17px] py-3 text-white/80 text-lg font-semibold tracking-[-0.02em]">
                    {t('vehicleList.headers.makeModel')}
                  </span>
                  <span className="px-5 py-3 text-white/80 text-lg font-semibold tracking-[-0.02em] border-dashed border-l border-[#8BA192]">
                    {t('vehicleList.headers.bidiReady')}
                  </span>
                  <span className="px-5 py-3 text-white/80 text-lg font-semibold tracking-[-0.02em] border-dashed border-l border-[#8BA192]">
                    {t('vehicleList.headers.software')}
                  </span>
                </div>

                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle}
                    className="grid grid-cols-3 bg-white/10 border border-[#062E25]/40"
                  >
                    <div className="px-[17px] py-3">
                      <span className="text-[#062E25]/80 text-lg font-semibold tracking-[-0.02em] block">
                        {t(`vehicleList.vehicles.${vehicle}.name`)}
                      </span>
                      <span className="text-[#062E25]/80 text-lg font-normal tracking-[-0.02em] block">
                        {t(`vehicleList.vehicles.${vehicle}.battery`)}
                      </span>
                    </div>
                    <div className="px-5 py-3 flex items-center border-dashed border-l border-[#8BA192]">
                      {t(`vehicleList.vehicles.${vehicle}.bidiReady`) === 'true' ? (
                        <CheckmarkIcon />
                      ) : (
                        <span className="text-[#062E25]/80 text-lg font-normal tracking-[-0.02em]">
                          {t(`vehicleList.vehicles.${vehicle}.bidiReady`)}
                        </span>
                      )}
                    </div>
                    <div className="px-5 py-3 flex items-center border-dashed border-l border-[#8BA192]">
                      {t(`vehicleList.vehicles.${vehicle}.software`) === 'true' ? (
                        <CheckmarkIcon />
                      ) : t(`vehicleList.vehicles.${vehicle}.software`) === '' ? null : (
                        <span className="text-[#062E25]/80 text-lg font-normal tracking-[-0.02em]">
                          {t(`vehicleList.vehicles.${vehicle}.software`)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
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

export default VehicleListSection
