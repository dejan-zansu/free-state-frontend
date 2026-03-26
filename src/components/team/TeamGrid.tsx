import { useTranslations } from 'next-intl'

const members = [
  { key: 'ivan', image: '/images/team-ivan-55cecd.png' },
  { key: 'peter', image: '/images/team-peter-404b05.png' },
  { key: 'dragica', image: '/images/team-dragica-64a235.png' },
  { key: 'dejan', image: null },
  { key: 'member5', image: null },
  { key: 'member6', image: null },
]

const TeamGrid = () => {
  const t = useTranslations('team.grid')

  return (
    <section
      className="relative w-full overflow-hidden pt-12 lg:pt-[50px]"
      style={{
        background:
          'linear-gradient(180deg, rgba(242, 244, 232, 1) 14%, rgba(220, 233, 230, 1) 42%)',
      }}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20">
        <div className="flex flex-col items-center text-center mb-10 lg:mb-16">
          <span className="inline-flex items-center justify-center px-4 py-2.5 rounded-[20px] border border-foreground bg-white/20 backdrop-blur-[65px] text-foreground text-base font-light tracking-tight">
            {t('eyebrow')}
          </span>

          <h2 className="mt-5 text-foreground text-3xl sm:text-4xl lg:text-[45px] font-medium text-center">
            {t('title')}
          </h2>

          <p className="mt-5 text-foreground/80 text-lg lg:text-[22px] font-light max-w-[562px]">
            {t('subtitle')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 w-full">
        {members.map((member) => (
          <div
            key={member.key}
            className="relative h-[400px] sm:h-[550px] lg:h-[734px] border-[0.5px] border-[#F2F4E8]/50 bg-cover bg-center"
            style={{
              backgroundImage: member.image
                ? `url(${member.image})`
                : 'linear-gradient(90deg, rgba(242, 244, 232, 1) 44%, rgba(214, 226, 223, 1) 100%)',
            }}
          >
            <div className="absolute top-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 w-[113px]">
              <span className="inline-flex items-center justify-center px-4 py-2.5 rounded-[20px] border border-foreground bg-white/20 backdrop-blur-[65px] text-foreground text-base font-semibold tracking-tight whitespace-nowrap">
                {t(`${member.key}.name`)}
              </span>
              <span className="text-foreground text-base font-light text-center">
                {t(`${member.key}.role`)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default TeamGrid
