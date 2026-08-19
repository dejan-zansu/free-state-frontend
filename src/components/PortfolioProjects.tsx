import { ArrowRight } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { referenceService } from '@/services/reference.service'
import type { AdminReference, AdminReferenceTranslation } from '@/types/admin'

const getTranslation = (
  reference: AdminReference,
  locale: string
): AdminReferenceTranslation | undefined =>
  reference.translations.find(t => t.language === locale) ||
  reference.translations.find(t => t.language === 'de') ||
  reference.translations[0]

const PortfolioProjects = async () => {
  const locale = await getLocale()
  const t = await getTranslations('portfolioPage.projects')
  const tCategories = await getTranslations('referencePage.categories')

  let references: AdminReference[] = []
  try {
    const result = await referenceService.listPublished()
    references = result.data || []
  } catch {
    return null
  }

  const projects = references
    .map(reference => {
      const translation = getTranslation(reference, locale)
      const image = reference.coverImageUrl || reference.images[0]?.url
      if (!translation || !image) return null
      return {
        slug: reference.slug,
        title: translation.title,
        image,
        category: reference.category,
      }
    })
    .filter(
      (project): project is NonNullable<typeof project> => project !== null
    )

  if (projects.length === 0) return null

  return (
    <section className="relative py-12 bg-background">
      <div className="max-w-[1380px] mx-auto px-6">
        <div className="text-center mb-8 flex flex-col items-center">
          <h2 className="text-foreground text-4xl font-semibold mb-2 text-center">
            {t('title')}
          </h2>
          <p className="text-foreground/80 text-xl leading-relaxed max-w-xl text-center">
            {t('description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center">
          {projects.map(project => (
            <Link
              key={project.slug}
              href={
                `/portfolio/${project.slug}` as Parameters<
                  typeof Link
                >[0]['href']
              }
              className="flex flex-col items-start gap-5 w-full max-w-[678px] group"
            >
              <div className="relative w-full h-[390px] overflow-hidden">
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 w-full h-full pointer-events-none" />

                <div className="absolute bottom-4 right-4 flex flex-row gap-3">
                  <div
                    className="flex flex-row justify-center items-center px-4 py-[10px] gap-2.5 rounded-[20px]"
                    style={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: '1px solid #B7FE1A',
                      backdropFilter: 'blur(32.5px)',
                    }}
                  >
                    <span className="text-white text-base font-medium leading-[14px] text-center tracking-[-0.02em]">
                      {tCategories(project.category)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="text-[#062E25] text-[22px] font-bold leading-[30px]">
                  {project.title}
                </h3>

                <span className="inline-flex items-center gap-2 text-[#062E25] text-base font-medium leading-[14px] tracking-[-0.02em] transition-opacity duration-300 group-hover:opacity-80">
                  {t('viewProject')}
                  <ArrowRight className="w-4 h-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
                <span className="h-px w-[105px] bg-[#062E25]" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PortfolioProjects
