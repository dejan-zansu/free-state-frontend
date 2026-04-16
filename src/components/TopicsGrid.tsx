import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { ArrowRight } from 'lucide-react'

type Topic = {
  title: string
  description: string
  linkLabel: string
  image: string
  href: string
}

type TopicsGridProps = {
  namespace: string
  columns?: 3 | 4 | 5
  maxWidth?: string
}

const TopicsGrid = async ({
  namespace,
  columns = 4,
  maxWidth = '1150px',
}: TopicsGridProps) => {
  const t = await getTranslations(namespace)
  const items = t.raw('items') as Topic[]

  const gridCols =
    columns === 5
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
      : columns === 3
        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'

  return (
    <section
      className="relative w-full px-4 sm:px-6 py-16 md:py-24 -mt-[40px]"
      style={{
        backgroundImage: 'linear-gradient(180deg, #F2F4E8 78%, #DCE9E6 100%)',
      }}
    >
      <div
        className="mx-auto flex flex-col items-center gap-14 md:gap-20"
        style={{ maxWidth }}
      >
        <h2 className="text-foreground text-3xl md:text-[45px] font-medium text-center max-w-[520px]">
          {t('title')}
        </h2>

        <div className={`w-full grid ${gridCols} gap-[15px]`}>
          {items.map(item => (
            <Link
              key={item.title}
              href={item.href as Parameters<typeof Link>[0]['href']}
              className="group flex flex-col items-center gap-5 rounded-xl bg-[#FDFFF5] border border-foreground/15 pt-10 pb-6 px-6 transition-colors hover:border-foreground/40 hover:bg-[#F5F7EE]"
            >
              <div className="relative w-[135px] h-[113px] shrink-0">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-contain"
                />
              </div>

              <div className="flex flex-col items-center gap-2.5">
                <h3 className="text-foreground text-[22px] font-medium text-center">
                  {item.title}
                </h3>
                <p className="text-foreground/80 text-sm md:text-base font-medium tracking-tight text-center max-w-[165px]">
                  {item.description}
                </p>
              </div>

              <div className="mt-auto pt-4 flex items-center gap-2 text-foreground">
                <span className="inline-flex items-center gap-2 text-sm font-medium tracking-tight border-b border-foreground/30 group-hover:border-foreground pb-0.5 transition-colors">
                  {item.linkLabel}
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TopicsGrid
