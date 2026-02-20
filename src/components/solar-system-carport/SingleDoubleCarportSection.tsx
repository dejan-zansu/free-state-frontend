import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const SingleDoubleCarportSection = async () => {
  const t = await getTranslations('solarSystemCarport')

  const carports = [
    {
      title: t('technicalDetails.singleCarport.title'),
      specs: [
        t('technicalDetails.singleCarport.panels'),
        t('technicalDetails.singleCarport.output'),
        t('technicalDetails.singleCarport.annualProduction'),
        t('technicalDetails.singleCarport.drivingRange'),
      ],
      price: t('technicalDetails.singleCarport.price'),
    },
    {
      title: t('technicalDetails.doubleCarport.title'),
      specs: [
        t('technicalDetails.doubleCarport.panels'),
        t('technicalDetails.doubleCarport.output'),
        t('technicalDetails.doubleCarport.annualProduction'),
        t('technicalDetails.doubleCarport.drivingRange'),
      ],
      price: t('technicalDetails.doubleCarport.price'),
    },
  ]

  return (
    <section className="relative overflow-hidden py-12 md:py-20">
      <div className="absolute inset-0">
        <Image
          src="/images/solar-system-single-double-carport-bg.png"
          alt=""
          fill
          className="object-cover"
        />
      </div>

      <div className="relative z-10 max-w-[900px] mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center gap-[50px]">
          <div className="flex flex-col items-center gap-5">
            <span className="inline-flex items-center justify-center px-4 py-[10px] rounded-[20px] border border-[#062E25] bg-white/20 backdrop-blur-[65px] text-[#062E25] text-base font-light">
              {t('technicalDetails.eyebrow')}
            </span>
            <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[65px] font-medium text-center">
              {t('technicalDetails.title')}
            </h2>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-5">
            {carports.map((carport, index) => (
              <div
                key={index}
                className="relative flex flex-col w-full max-w-[383px] rounded-2xl border border-[#062E25]/20 overflow-hidden"
              >
                <div className="absolute inset-0 bg-[rgba(123,162,153,0.1)] backdrop-blur-[20px]" />

                <div className="relative z-10">
                  <div className="px-5 pt-[30px] pb-[30px]">
                    <p className="text-[#062E25]/80 text-lg font-semibold">
                      {carport.title}
                    </p>
                  </div>

                  <div className="bg-[rgba(7,51,42,0.8)] backdrop-blur-[20px] px-7 py-7">
                    <div className="flex flex-col gap-5">
                      {carport.specs.map((spec, specIndex) => (
                        <div
                          key={specIndex}
                          className="flex items-start gap-2"
                        >
                          <div className="w-[13px] h-[13px] shrink-0 mt-1 border-[1.5px] border-[#036B53] rounded-tl-[5px] rounded-bl-[5px]" />
                          <p className="text-white/80 text-lg">{spec}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#B7FE1A] border-t border-[rgba(246,246,246,0.2)] rounded-b-2xl px-10 py-7 flex flex-col items-center gap-[10px]">
                    <div className="flex items-center gap-[10px]">
                      <span className="text-[#062E25]/80 text-lg">
                        {t('technicalDetails.from')}
                      </span>
                      <span className="text-[#062E25] text-[40px] font-semibold">
                        {carport.price}
                      </span>
                    </div>
                    <p className="text-[#062E25]/80 text-base font-light text-center">
                      {t('technicalDetails.footnote')}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default SingleDoubleCarportSection
