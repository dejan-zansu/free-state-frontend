import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { Badge } from './ui/badge'
import { LinkButton } from './ui/link-button'

const PathToEnergy = async () => {
  const t = await getTranslations('home.pathToEnergy')

  return (
    <section
      className="relative w-full overflow-hidden py-16 md:py-24 px-4 sm:px-6"
      style={{
        backgroundImage:
          'linear-gradient(7deg, #07332A 0%, #093F35 21%, #158B7E 100%)',
      }}
    >
      <div
        className="pointer-events-none absolute -top-40 right-[-80px] w-[500px] h-[500px] rounded-full opacity-50"
        style={{
          background: 'rgba(183, 254, 26, 0.5)',
          filter: 'blur(170px)',
        }}
      />
      <div
        className="pointer-events-none absolute top-20 left-40 w-[374px] h-[374px] rounded-full"
        style={{
          background: 'rgba(183, 254, 26, 0.5)',
          filter: 'blur(490px)',
        }}
      />

      <div className="relative max-w-[1120px] mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
        <div className="relative w-full max-w-[348px] lg:w-[348px] shrink-0 p-2.5">
          <div
            className="pointer-events-none absolute inset-0 -m-8 rounded-full"
            style={{
              background: 'rgba(183, 254, 26, 0.15)',
              filter: 'blur(80px)',
            }}
          />
          <div className="relative w-full aspect-[328/225] rounded-lg overflow-hidden">
            <Image
              src={t('image')}
              alt={t('title')}
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="w-full flex flex-col gap-10">
          <div className="flex flex-col gap-5">
            <Badge
              variant="outline"
              className="border-white/20 bg-white/20 text-white font-light text-base backdrop-blur-[65px] self-start"
            >
              {t('eyebrow')}
            </Badge>
            <h2 className="text-[#FDFFF5] text-3xl md:text-[45px] font-medium whitespace-pre-line">
              {t('title')}
            </h2>
            <p className="text-[#CCD8CE]/80 text-lg md:text-[22px] font-light tracking-tight">
              {t('description')}
            </p>
          </div>
          <LinkButton
            href="/contact"
            variant="primary"
            className="self-start shadow-[0_8px_24px_0_rgba(0,0,0,0.24)]"
          >
            {t('cta')}
          </LinkButton>
        </div>
      </div>
    </section>
  )
}

export default PathToEnergy
