import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const items = ['engineering', 'procurement', 'construction'] as const

const EPCSection = async () => {
  const t = await getTranslations('projectDevelopment')

  return (
    <section className="relative">
      <div className="flex flex-col lg:flex-row">
        <div
          className="w-full lg:w-1/2 flex items-center px-4 sm:px-6 lg:px-0 py-12 lg:py-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(242, 244, 232, 1) 78%, rgba(220, 233, 230, 1) 100%)',
          }}
        >
          <div className="flex flex-col gap-5 lg:pl-[69px] max-w-[561px]">
            <div
              className="flex items-center justify-center px-4 py-[10px] rounded-full border border-[#062E25] w-fit"
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(65px)',
              }}
            >
              <span className="text-[#062E25] text-base font-light tracking-[-0.02em]">
                {t('epc.eyebrow')}
              </span>
            </div>

            <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium">
              {t('epc.title')}
            </h2>

            <div className="flex flex-col gap-4 mt-2">
              {items.map((item) => (
                <div key={item} className="flex items-center gap-[10px]">
                  <Image
                    src="/images/commercial/project-development/checkmark-green.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="shrink-0"
                  />
                  <span className="text-[#062E25]/80 text-lg md:text-[22px] font-medium tracking-[-0.02em]">
                    {t(`epc.items.${item}`)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative w-full lg:w-1/2 aspect-[720/586]">
          <Image
            src="/images/commercial/project-development/epc-illustration.png"
            alt={t('epc.title')}
            fill
            className="object-cover"
          />
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

export default EPCSection
