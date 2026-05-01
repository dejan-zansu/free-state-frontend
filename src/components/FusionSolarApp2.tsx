import { getTranslations } from 'next-intl/server'
import { Badge } from './ui/badge'
import Image from 'next/image'

const CheckIconCircle = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="6" cy="6" r="5.55" stroke="#036B53" strokeWidth="0.9" />
    <path d="M3.6 6.2L5.2 7.8L8.4 4.2" stroke="#036B53" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const FusionSolarApp2 = async () => {
  const t = await getTranslations('home.fusionSolarApp')

  const features = t.raw('features') as string[]

  return (
    <section className="w-full" style={{ background: 'linear-gradient(180deg, #F2F4E8 78%, #DCE9E6 100%)' }}>
      <div className="flex w-full flex-col lg:flex-row min-[1920px]:mx-auto min-[1920px]:max-w-[1920px]">
        <div className="relative flex-1 min-h-[400px] lg:min-h-[707px] order-2 lg:order-1">
          <Image
            src="/images/fusion-solar-phone-portfolio-657afd.webp"
            alt={t('title')}
            fill
            className="object-cover"
          />
        </div>

        <div className="relative flex-1 overflow-hidden order-1 lg:order-2">
          <div className="relative z-10 flex flex-col gap-[50px] px-8 sm:px-16 lg:px-[116px] py-20 lg:py-[87px]">
            <div className="flex flex-col gap-10">
              <div className="flex flex-col gap-5">
                <Badge variant="outline" className="border-[#062E25]/20 bg-white/20 text-[#062E25] font-light text-base backdrop-blur-[65px] w-fit">
                  {t('eyebrow')}
                </Badge>
                <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-5xl lg:text-[70px] font-medium capitalize whitespace-pre-line">
                  {t('title')}
                </h2>
              </div>

              <div className="flex flex-col gap-1.5">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center gap-1">
                    <CheckIconCircle />
                    <span className="text-[#062E25]/80 text-lg md:text-[22px] font-light italic tracking-tight">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <a href="https://solar.huawei.com/en/FusionSolar-App" target="_blank" rel="noopener noreferrer">
                <Image
                  src="/images/fusion-solar-qr.svg"
                  alt="Download FusionSolar App"
                  width={89}
                  height={89}
                />
              </a>
              <div className="flex flex-col gap-1.5">
                <a href="https://play.google.com/store/apps/details?id=com.huawei.solarsafe" target="_blank" rel="noopener noreferrer">
                  <Image
                    src="/images/google-play-badge.svg"
                    alt="Get it on Google Play"
                    width={98}
                    height={33}
                  />
                </a>
                <a href="https://apps.apple.com/app/fusionsolar/id1529080383" target="_blank" rel="noopener noreferrer">
                  <Image
                    src="/images/app-store-badge.svg"
                    alt="Download on the App Store"
                    width={98}
                    height={33}
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FusionSolarApp2
