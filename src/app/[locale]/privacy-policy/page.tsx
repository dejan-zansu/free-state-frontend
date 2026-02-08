import HeroNav from '@/components/HeroNav'
import { getTranslations } from 'next-intl/server'

const PrivacyPolicyPage = async () => {
  const t = await getTranslations('privacyPolicy')

  const sections = [
    {
      title: t('dataCollection.title'),
      content: t('dataCollection.content'),
    },
    {
      title: t('automaticData.title'),
      content: t('automaticData.content'),
    },
    {
      title: t('cookies.title'),
      content: t('cookies.content'),
    },
    {
      title: t('analytics.title'),
      content: t('analytics.content'),
    },
    {
      title: t('socialMedia.title'),
      content: t('socialMedia.content'),
    },
    {
      title: t('googleMaps.title'),
      content: t('googleMaps.content'),
    },
    {
      title: t('newsletter.title'),
      content: t('newsletter.content'),
    },
    {
      title: t('userRights.title'),
      content: t('userRights.content'),
    },
    {
      title: t('dataRetention.title'),
      content: t('dataRetention.content'),
    },
    {
      title: t('contact.title'),
      content: t('contact.content'),
    },
  ]

  return (
    <main className="relative bg-background">
      <section className="relative min-h-[320px] w-full overflow-hidden bg-[#062E25]">
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
          <div className="flex flex-col gap-5 pt-[340px] pb-12">
            <h1 className="text-white text-4xl sm:text-5xl lg:text-[55px] font-medium leading-[1.1em]">
              {t('title')}
            </h1>
            <p className="text-white/60 text-lg sm:text-xl font-normal max-w-[600px]">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-[900px] mx-auto px-6">
          <div className="prose prose-lg max-w-none">
            <p className="text-foreground/70 text-base leading-relaxed mb-10">
              {t('intro')}
            </p>

            {sections.map((section, index) => (
              <div key={index} className="mb-10">
                <h2 className="text-foreground text-xl sm:text-2xl font-semibold mb-4">
                  {section.title}
                </h2>
                <p className="text-foreground/70 text-base leading-relaxed whitespace-pre-line">
                  {section.content}
                </p>
              </div>
            ))}

            <div className="mt-12 pt-8 border-t border-border">
              <p className="text-foreground/50 text-sm">{t('lastUpdated')}</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default PrivacyPolicyPage
