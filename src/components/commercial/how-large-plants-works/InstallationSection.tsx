import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const InstallationSection = async () => {
  const t = await getTranslations('howLargePlantsWorks')

  return (
    <section className="relative min-h-[495px] flex flex-col items-center justify-center overflow-hidden">
      <Image
        src="/images/commercial/how-large-plants-works/installation-large-plants-bg-77f8d6.png"
        alt=""
        fill
        className="object-cover"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(0deg, rgba(234, 237, 223, 0) 9%, rgba(234, 237, 223, 1) 100%)',
        }}
      />

      <div className="absolute inset-0 bg-black/20" />
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(173, 66, 197, 0.2)' }}
      />

      <div className="relative z-10 w-full max-w-[571px] mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="flex flex-col gap-[50px]">
          <h2 className="text-[#062E25] text-3xl sm:text-4xl md:text-[45px] font-medium text-center">
            {t('installation.title')}
          </h2>

          <div
            className="rounded-2xl p-10"
            style={{
              background: 'rgba(185, 205, 191, 0.3)',
              border: '1px solid rgba(246, 246, 246, 0.6)',
              backdropFilter: 'blur(40px)',
            }}
          >
            <p className="text-white/80 text-lg md:text-[22px] font-medium tracking-[-0.02em]">
              {t('installation.description')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default InstallationSection
