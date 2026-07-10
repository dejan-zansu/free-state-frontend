import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { Reveal } from '@/components/motion/Reveal'
import RevealText from '@/components/motion/RevealText'
import RevealImage from '@/components/motion/RevealImage'
import { Badge } from './ui/badge'
import { LinkButton } from './ui/link-button'

const PathToEnergy = async ({
  isCommercial = false,
}: {
  isCommercial?: boolean
}) => {
  const t = await getTranslations('home.pathToEnergy')

  const backgroundImage = isCommercial
    ? 'linear-gradient(131deg, #191D1C 0%, #3D3858 100%)'
    : 'linear-gradient(7deg, #07332A 0%, #093F35 21%, #158B7E 100%)'
  const glowColor = isCommercial
    ? 'rgba(61, 56, 88, 0.5)'
    : 'rgba(183, 254, 26, 0.5)'
  const imageGlowColor = isCommercial
    ? 'rgba(61, 56, 88, 0.35)'
    : 'rgba(183, 254, 26, 0.15)'
  const image = isCommercial
    ? '/images/path-to-energy-commercial-6a5540.webp'
    : '/images/your-path-to-energy-6a5540.webp'
  const buttonVariant = isCommercial ? 'white-shadow' : 'primary'
  const contactHref = '/contact'

  return (
    <section
      className="relative w-full overflow-hidden py-16 md:py-24 px-4 sm:px-6"
      style={{ backgroundImage }}
    >
      <div
        className="pointer-events-none absolute -top-40 right-[-80px] w-[500px] h-[500px] rounded-full opacity-50"
        style={{
          background: glowColor,
          filter: 'blur(170px)',
        }}
      />
      <div
        className="pointer-events-none absolute top-20 left-40 w-[374px] h-[374px] rounded-full"
        style={{
          background: glowColor,
          filter: 'blur(490px)',
        }}
      />

      <div className="relative max-w-[1120px] mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
        <Reveal className="relative w-full max-w-[300px] sm:max-w-[348px] lg:w-[348px] shrink-0 p-2.5">
          <div
            className="pointer-events-none absolute inset-0 -m-8 rounded-full"
            style={{
              background: imageGlowColor,
              filter: 'blur(80px)',
            }}
          />
          <RevealImage className="relative w-[82%] sm:w-full aspect-[328/225] rounded-lg overflow-hidden mx-auto">
            <Image src={image} alt={t('title')} fill className="object-cover" />
          </RevealImage>
        </Reveal>

        <div className="w-full flex flex-col gap-10">
          <div className="flex flex-col gap-5">
            <Badge
              variant="outline"
              className="border-white/20 bg-white/20 text-white font-light text-base backdrop-blur-[65px] self-start"
            >
              {t('eyebrow')}
            </Badge>
            <RevealText
              as="h2"
              className="text-[#FDFFF5] text-3xl md:text-[45px] font-medium whitespace-pre-line"
            >
              {t('title')}
            </RevealText>
            <Reveal
              as="p"
              delay={0.2}
              className="text-[#CCD8CE]/80 text-lg md:text-[22px] font-light tracking-tight"
            >
              {t('description')}
            </Reveal>
          </div>
          <Reveal as="div" delay={0.3} className="self-start">
            <LinkButton
              href={contactHref}
              variant={buttonVariant}
              className="shadow-[0_8px_24px_0_rgba(0,0,0,0.24)]"
            >
              {t('cta')}
            </LinkButton>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

export default PathToEnergy
