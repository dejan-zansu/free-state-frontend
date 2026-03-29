import { getTranslations } from 'next-intl/server'
import { Badge } from './ui/badge'
import Image from 'next/image'

const CheckIconGreen = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="6" cy="6" r="5.55" stroke="#B7FE1A" strokeWidth="0.9" />
    <path d="M3.6 6.2L5.2 7.8L8.4 4.2" stroke="#B7FE1A" strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const FusionSolarApp = async () => {
  const t = await getTranslations('home.fusionSolarApp')

  const features = t.raw('features') as string[]

  return (
    <section className="w-full" style={{ background: 'linear-gradient(180deg, #F2F4E8 78%, #DCE9E6 100%)' }}>
      <div className="max-w-[1440px] mx-auto flex flex-col lg:flex-row">
        <div
          className="relative flex-1 overflow-hidden"
          style={{ background: 'linear-gradient(7deg, rgba(7, 51, 42, 1) 0%, rgba(9, 63, 53, 1) 21%, rgba(21, 139, 126, 1) 100%)' }}
        >
          <div className="absolute top-[-224px] right-[-50px] w-[374px] h-[374px] bg-[#b7fe1a]/50 rounded-full blur-[490px]" />
          <div className="absolute top-[-256px] right-[-10px] w-[291px] h-[291px] bg-[#b7fe1a]/50 rounded-full blur-[170px]" />

          <div className="relative z-10 flex flex-col gap-[50px] px-8 sm:px-16 lg:px-[105px] py-20 lg:py-[142px]">
            <div className="flex flex-col gap-10">
              <div className="flex flex-col gap-5">
                <Badge variant="outline" className="border-white/20 bg-white/20 text-white font-light text-base backdrop-blur-[65px] w-fit">
                  {t('eyebrow')}
                </Badge>
                <h2 className="text-[#FDFFF5] text-3xl sm:text-4xl md:text-5xl lg:text-[70px] font-medium capitalize">
                  {t('title')}
                </h2>
              </div>

              <div className="flex flex-col gap-1.5">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center gap-1">
                    <CheckIconGreen />
                    <span className="text-[#FDFFF5]/80 text-lg md:text-[22px] font-light tracking-tight">
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

        <div className="relative flex-1 min-h-[400px] lg:min-h-[818px]">
          <Image
            src="/images/fusion-solar-phone-4cbe62.png"
            alt={t('title')}
            fill
            className="object-cover"
          />
        </div>
      </div>
    </section>
  )
}

export default FusionSolarApp
