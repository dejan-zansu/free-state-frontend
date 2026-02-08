import UnderlineLink from '@/components/ui/underline-link'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

const PortfolioProjects = async () => {
  const t = await getTranslations('portfolioPage.projects')

  const projects = [
    {
      title: t('items.industrialZurich.title'),
      image: '/images/projects/industrial-building-zurich.png',
      tags: ['500 kWp', t('tags.industrialRooftop')],
    },
    {
      title: t('items.industrialBern.title'),
      image: '/images/projects/industrial-building-bern.png',
      tags: ['400 kWp', t('tags.industrialRooftop')],
    },
    {
      title: t('items.industrialAargau1.title'),
      image: '/images/projects/industrial-building-aargau.png',
      tags: ['350 kWp', t('tags.industrialRooftop')],
    },
    {
      title: t('items.industrialLuzern1.title'),
      image: '/images/projects/industrial-building-luzern.png',
      tags: ['450 kWp', t('tags.industrialRooftop')],
    },
    {
      title: t('items.industrialChur.title'),
      image: '/images/projects/industrial-building-chur.png',
      tags: ['250 kWp', t('tags.industrialRooftop')],
    },
    {
      title: t('items.industrialAargau3.title'),
      image: '/images/projects/industrial-building-aargau-2.png',
      tags: ['280 kWp', t('tags.industrialRooftop')],
    },
    {
      title: t('items.farmThun.title'),
      image: '/images/projects/farm-thun.png',
      tags: ['200 kWp', t('tags.agricultural')],
    },
    {
      title: t('items.industrialLuzern2.title'),
      image: '/images/projects/industrial-building-luzern-2.png',
      tags: ['380 kWp', t('tags.industrialRooftop')],
    },

    // {
    //   title: t('items.industrialGeneva.title'),
    //   image: '/images/projects/industrial-building-genf.jpeg',
    //   tags: ['420 kWp', t('tags.industrialRooftop')],
    // },
  ]

  return (
    <section className='relative py-12 bg-background'>
      <div className='max-w-[1380px] mx-auto px-6'>
        <div className='text-left mb-8'>
          <h2 className='text-foreground text-4xl font-semibold mb-2'>
            {t('title')}
          </h2>
          <p className='text-foreground/80 text-xl leading-relaxed max-w-xl'>
            {t('description')}
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center'>
          {projects.map((project, index) => (
            <div
              key={index}
              className='flex flex-col items-start gap-5 w-full max-w-[678px] group'
            >
              <div className='relative w-full h-[390px] overflow-hidden'>
                <Image
                  src={project.image}
                  alt={project.title}
                  fill
                  className='object-cover transition-transform duration-500 group-hover:scale-105'
                />
                <div className='absolute inset-0 w-full h-full pointer-events-none' />

                <div className='absolute bottom-4 right-4 flex flex-row gap-3'>
                  {project.tags.map((tag, tagIndex) => (
                    <div
                      key={tagIndex}
                      className='flex flex-row justify-center items-center px-4 py-[10px] gap-2.5 rounded-[20px]'
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: '1px solid #B7FE1A',
                        backdropFilter: 'blur(32.5px)',
                      }}
                    >
                      <span className='text-white text-base font-medium leading-[14px] text-center tracking-[-0.02em]'>
                        {tag}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className='flex flex-col gap-2'>
                <h3 className='text-[#062E25] text-[22px] font-bold leading-[30px] capitalize'>
                  {project.title}
                </h3>

                <UnderlineLink
                  href='/portfolio'
                  variant='separate'
                  underlineColor='#062E25'
                  className='text-[#062E25] text-base leading-[14px] tracking-[-0.02em]'
                >
                  {t('viewProject')}
                </UnderlineLink>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PortfolioProjects
