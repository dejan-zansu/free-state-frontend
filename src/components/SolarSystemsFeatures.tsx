import Image from 'next/image'

const SolarSystemsFeatures = () => {
  const features = [
    {
      icon: 'https://placehold.co/71x71/B7FE1A/062E25?text=⏳',
      title: 'Long lifespan\n& warranty',
    },
    {
      icon: 'https://placehold.co/71x71/B7FE1A/062E25?text=🏠',
      title: 'Suitable for\nprivate &\ncommercial roofs',
    },
    {
      icon: 'https://placehold.co/71x71/B7FE1A/062E25?text=⚡',
      title: 'High efficiency\nmodules',
    },
    {
      icon: 'https://placehold.co/71x71/B7FE1A/062E25?text=🔌',
      title: 'Seamless integration\nwith SolarAbo',
    },
  ]

  return (
    <section className="relative py-16 sm:py-20 lg:py-24 bg-[#EAEDDF]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[30px]">
        {/* Header */}
        <div className="mb-12 sm:mb-16 lg:mb-20 max-w-[614px]">
          <h2 className="text-[#062E25] text-3xl sm:text-4xl lg:text-[45px] font-medium leading-[1em] mb-5">
            Built for performance.
          </h2>
          <p className="text-[#062E25]/80 text-lg sm:text-xl lg:text-[22px] font-normal leading-[1.36em] tracking-[-0.02em]">
            Designed for SolarAbo.
          </p>
        </div>

        {/* Features Grid */}
        <div className="flex flex-col gap-10 mb-16 max-w-[249px]">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-5">
              <div className="relative w-[71px] h-[71px] shrink-0">
                <Image
                  src={feature.icon}
                  alt={feature.title}
                  width={71}
                  height={71}
                  className="object-contain"
                />
              </div>
              <p className="text-[#062E25]/80 text-base font-normal leading-[1.375em] tracking-[-0.02em] whitespace-pre-line">
                {feature.title}
              </p>
            </div>
          ))}
        </div>

        {/* Product Image Section */}
        <div className="relative w-full rounded-[30px] overflow-hidden bg-gradient-to-b from-[#062E25] to-[#1B332D] min-h-[400px] flex items-center justify-center">
          <div className="absolute inset-0 opacity-20">
            <Image
              src="https://placehold.co/1380x625/062E25/FFFFFF?text=Solar+Panel+Product"
              alt="Solar Panel Product"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative z-10 text-center py-20">
            <p className="text-white/60 text-2xl sm:text-3xl font-light">
              SolarAbo H 2
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SolarSystemsFeatures
