import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const ProIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={15}
    height={15}
    viewBox="0 0 15 15"
    fill="none"
    className="shrink-0"
  >
    <circle cx={7.5} cy={7.5} r={6.75} stroke="#036B53" strokeWidth={1.5} />
    <path
      d="M4.5 7.75L6.25 9.5L10.5 5"
      stroke="#036B53"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const ConIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={15}
    height={15}
    viewBox="0 0 15 15"
    fill="none"
    className="shrink-0"
  >
    <circle cx={7.5} cy={7.5} r={6.75} stroke="#9F3E4F" strokeWidth={1.5} />
    <path
      d="M5.36 5.36L9.64 9.64M9.64 5.36L5.36 9.64"
      stroke="#9F3E4F"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </svg>
)

const OutdoorInstallationSection = async () => {
  const t = await getTranslations('heatPumpsHowItWorks')

  const pros = ['1', '2', '3'] as const
  const cons = ['1', '2', '3'] as const

  return (
    <section className="relative">
      <div className="flex flex-col lg:flex-row">
        <div className="relative w-full lg:w-1/2 aspect-[720/487]">
          <Image
            src="/images/heat-pumps/how-it-works/heat-pump-indoor-749664.png"
            alt={t('outdoor.title')}
            fill
            className="object-cover"
          />
        </div>

        <div
          className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-0 py-12 lg:py-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(242, 244, 232, 1) 78%, rgba(220, 233, 230, 1) 100%)',
          }}
        >
          <div className="max-w-[426px] flex flex-col gap-[22px]">
            <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium">
              {t('outdoor.title')}
            </h2>

            <div className="flex flex-row gap-[36px]">
              <div className="flex flex-col gap-[10px]">
                {pros.map((key) => (
                  <div key={key} className="flex items-center gap-2">
                    <ProIcon />
                    <span className="text-[#062E25]/80 text-sm font-medium tracking-[-0.02em]">
                      {t(`outdoor.pros.${key}`)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-[10px]">
                {cons.map((key) => (
                  <div key={key} className="flex items-center gap-2">
                    <ConIcon />
                    <span className="text-[#062E25]/80 text-sm font-medium tracking-[-0.02em]">
                      {t(`outdoor.cons.${key}`)}
                    </span>
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

export default OutdoorInstallationSection
