import HeroNav from '@/components/HeroNav'
import { Mail, MapPin, Phone } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import { generateSEOMetadata } from '@/lib/seo/metadata'
import type { SiteLocale } from '@/lib/seo/site-config'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo' })
  return generateSEOMetadata({
    locale: locale as SiteLocale,
    pathname: '/media',
    title: t('media.title') || '',
    description: t('media.description') || '',
  })
}

const topicKeys = ['solar', 'energy', 'innovation', 'market'] as const

const MediaPage = async () => {
  const t = await getTranslations('mediaPage')

  return (
    <div className="relative bg-background">
      <section className="relative min-h-[400px] w-full overflow-hidden bg-[#062E25]">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(146deg, rgba(6, 46, 37, 1) 0%, rgba(9, 63, 53, 1) 49%, rgba(21, 139, 126, 1) 100%)',
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            width: '374px',
            height: '374px',
            right: '0px',
            top: '-224px',
            background: '#B7FE1A',
            filter: 'blur(490px)',
            borderRadius: '50%',
          }}
        />

        <div className="relative z-10 max-w-[1310px] mx-auto px-6 h-full">
          <HeroNav />
          <div className="flex flex-col gap-5 pt-[400px] pb-12">
            <h1 className="text-white text-4xl sm:text-5xl lg:text-[55px] font-medium leading-[1.1em]">
              {t('title')}
            </h1>
            <p className="text-white/60 text-lg sm:text-xl font-normal max-w-[600px]">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-[1310px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-20">
            <div className="flex flex-col gap-5">
              <p className="text-[#15897C] text-base font-medium tracking-tight">
                {t('about.eyebrow')}
              </p>
              <h2 className="text-foreground text-3xl md:text-[40px] font-medium leading-[1.1em]">
                {t('about.title')}
              </h2>
              <p className="text-foreground/70 text-lg md:text-[22px] font-light leading-[1.55] max-w-[680px]">
                {t('about.description')}
              </p>
            </div>

            <div className="flex flex-row lg:flex-col gap-6 lg:gap-8">
              {(['location', 'focus'] as const).map(key => (
                <div key={key} className="flex flex-col gap-1">
                  <span className="text-foreground text-2xl md:text-3xl font-medium leading-none">
                    {t(`about.stats.${key}.value`)}
                  </span>
                  <span className="text-foreground/50 text-base font-light">
                    {t(`about.stats.${key}.label`)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        className="py-16 md:py-24"
        style={{
          backgroundImage: 'linear-gradient(180deg, #F2F4E8 0%, #FDFFF5 100%)',
        }}
      >
        <div className="max-w-[1310px] mx-auto px-6">
          <div className="flex flex-col gap-5 mb-12 max-w-[600px]">
            <h2 className="text-foreground text-3xl md:text-[40px] font-medium leading-[1.1em]">
              {t('topics.title')}
            </h2>
            <p className="text-foreground/70 text-lg font-light leading-[1.55]">
              {t('topics.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {topicKeys.map(key => (
              <div
                key={key}
                className="rounded-[20px] border border-[#062E25]/10 bg-white p-8 flex flex-col gap-3"
              >
                <h3 className="text-foreground text-xl font-medium">
                  {t(`topics.items.${key}.title`)}
                </h3>
                <p className="text-foreground/60 text-base font-light leading-[1.55]">
                  {t(`topics.items.${key}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-[1310px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="rounded-[20px] border border-[#062E25]/10 bg-[#062E25] p-8 md:p-12 flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <h2 className="text-white text-2xl md:text-3xl font-medium leading-[1.1em]">
                  {t('pressContact.title')}
                </h2>
                <p className="text-white/60 text-base md:text-lg font-light leading-[1.55]">
                  {t('pressContact.description')}
                </p>
              </div>

              <div className="flex flex-col gap-5">
                <a
                  href={`mailto:${t('pressContact.email')}`}
                  className="flex items-center gap-3 text-white/80 hover:text-white transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-base font-light">
                    {t('pressContact.email')}
                  </span>
                </a>
                <a
                  href={`tel:${t('pressContact.phone').replace(/\s/g, '')}`}
                  className="flex items-center gap-3 text-white/80 hover:text-white transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="text-base font-light">
                    {t('pressContact.phone')}
                  </span>
                </a>
                <div className="flex items-start gap-3 text-white/80">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-base font-light whitespace-pre-line pt-2.5">
                    {t('pressContact.address')}
                  </span>
                </div>
              </div>

              <p className="text-white/40 text-sm font-light">
                {t('pressContact.responseTime')}
              </p>
            </div>

            <div
              className="rounded-[20px] border border-[#062E25]/10 p-8 md:p-12 flex flex-col justify-center gap-5"
              style={{
                backgroundImage:
                  'linear-gradient(135deg, #F2F4E8 0%, #E5E6DE 100%)',
              }}
            >
              <h2 className="text-foreground text-2xl md:text-3xl font-medium leading-[1.1em]">
                {t('brandAssets.title')}
              </h2>
              <p className="text-foreground/70 text-base md:text-lg font-light leading-[1.55] max-w-[480px]">
                {t('brandAssets.description')}
              </p>
              <div className="pt-2">
                <a
                  href={`mailto:${t('pressContact.email')}?subject=Media%20Kit%20Request`}
                  className="inline-flex items-center gap-2 rounded-full bg-[#062E25] text-white px-6 py-3 text-base font-medium hover:bg-[#062E25]/90 transition-colors"
                >
                  {t('brandAssets.cta')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default MediaPage
