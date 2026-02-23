import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

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

const bullets = ['1', '2', '3'] as const

const InstallationSection = async () => {
  const t = await getTranslations('heatPumpsHowItWorks')

  return (
    <section className="relative bg-[#FDFFF5]">
      <div className="flex flex-col lg:flex-row">
        <div className="relative w-full lg:w-1/2 aspect-[720/695]">
          <Image
            src="/images/heat-pumps/how-it-works/installation-indoor-outdoor-7c5b31.png"
            alt={t('installation.title')}
            fill
            className="object-cover"
          />
        </div>

        <div className="w-full lg:w-1/2 flex items-center px-4 sm:px-6 lg:px-0 py-12 lg:py-0">
          <div className="max-w-[494px] mx-auto flex flex-col gap-10">
            <div className="flex flex-col gap-5">
              <div
                className="flex items-center justify-center px-4 py-[10px] rounded-full border border-[#062E25] w-fit"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(65px)',
                }}
              >
                <span className="text-[#062E25] text-base font-light tracking-[-0.02em]">
                  {t('installation.eyebrow')}
                </span>
              </div>

              <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium">
                {t('installation.title')}
              </h2>

              <p className="text-[#062E25]/80 text-lg md:text-[22px] font-light tracking-[-0.02em]">
                {t('installation.subtitle')}
              </p>
            </div>

            <div className="flex flex-col gap-5">
              {bullets.map((key) => (
                <div key={key} className="flex items-start gap-[10px]">
                  <div className="mt-[5px]">
                    <CheckmarkIcon />
                  </div>
                  <p className="text-[#062E25]/80 text-lg md:text-[22px] font-medium tracking-[-0.02em]">
                    {t(`installation.bullets.${key}`)}
                  </p>
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

export default InstallationSection
