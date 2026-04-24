import { useTranslations } from 'next-intl'

type Member = {
  key: string
  image: string | null
  email?: string
  phone?: string
}

const members: Member[] = [
  {
    key: 'ivan',
    image: '/images/team-ivan-55cecd.png',
    email: 'ivan.m@freestate.ch',
    phone: '+41 (0)76 364 7775',
  },
  {
    key: 'peter',
    image: '/images/team-peter-404b05.png',
    email: 'peter.aragai@freestate.ch',
    phone: '+41 (0)78 6088 850',
  },
  {
    key: 'dragica',
    image: '/images/team-dragica-64a235.png',
    email: 'dragica.miric@freestate.ch',
    phone: '+41 (0)76 815 7775',
  },
  {
    key: 'dejan',
    image: '/images/team-dejan-52ea40.webp',
    email: 'dejan.djokic@freestate.ch',
    phone: '+41 (0)79 323 16 14',
  },
  {
    key: 'andreas',
    image: '/images/team-andreas-6dbcdb.png',
    email: 'andreas.holz@freestate.ch',
    phone: '+41 (0)78 8005 284',
  },
  {
    key: 'milos',
    image: '/images/team-milos-32752e.png',
    email: 'milos.z@freestate.ch',
    phone: '+381 66 9512541',
  },
]

const EmailIcon = () => (
  <svg
    width="14"
    height="12"
    viewBox="0 0 14 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect x="0.5" y="0.9" width="13" height="10.2" rx="1.2" stroke="currentColor" />
    <path d="M1 1.5L7 6.5L13 1.5" stroke="currentColor" strokeLinecap="round" />
  </svg>
)

const PhoneIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M13.75 10.58v2.08a1.39 1.39 0 0 1-1.51 1.39 13.73 13.73 0 0 1-5.99-2.13 13.52 13.52 0 0 1-4.16-4.16A13.73 13.73 0 0 1 0 1.76 1.39 1.39 0 0 1 1.38.25h2.08a1.39 1.39 0 0 1 1.39 1.2c.09.67.25 1.32.48 1.94a1.39 1.39 0 0 1-.31 1.47l-.88.88a11.11 11.11 0 0 0 4.16 4.16l.88-.88a1.39 1.39 0 0 1 1.47-.31c.62.23 1.27.39 1.94.48a1.39 1.39 0 0 1 1.2 1.4Z"
      stroke="currentColor"
      strokeWidth="0.79"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const TeamGrid = () => {
  const t = useTranslations('team.grid')

  return (
    <section className="relative w-full overflow-hidden pt-12 lg:pt-[50px]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[160px]">
        <div className="flex flex-col items-center text-center mb-10 lg:mb-24">
          <span className="inline-flex items-center justify-center px-4 py-2.5 rounded-[20px] border border-foreground bg-white/20 backdrop-blur-[65px] text-foreground text-base font-light tracking-tight">
            {t('eyebrow')}
          </span>

          <h2 className="mt-5 text-foreground text-3xl sm:text-4xl lg:text-[45px] font-medium text-center">
            {t('title')}
          </h2>

          <p className="mt-5 text-foreground/80 text-lg lg:text-[22px] font-light tracking-[-0.02em] max-w-[562px]">
            {t('subtitle')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 w-full">
        {members.map(member => (
          <div
            key={member.key}
            className="group relative h-[400px] sm:h-[550px] lg:h-[631px] border-[0.5px] border-[#F2F4E8]/50 overflow-hidden"
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(90deg, rgba(242, 244, 232, 1) 44%, rgba(214, 226, 223, 1) 100%)',
              }}
            />
            {member.image && (
              <>
                <div
                  className="absolute inset-x-0 top-[18%] bottom-0 bg-cover bg-top"
                  style={{ backgroundImage: `url(${member.image})` }}
                />
                <div className="absolute inset-0 bg-[#062E25]/40 transition-opacity duration-500 group-hover:opacity-0" />
              </>
            )}
            <div className="relative h-full">
              <div className="absolute top-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 w-full px-4">
                <span className="inline-flex items-center justify-center px-4 py-2.5 rounded-[20px] border border-foreground bg-white/20 backdrop-blur-[65px] text-foreground text-base font-semibold tracking-tight whitespace-nowrap">
                  {t(`${member.key}.name`)}
                </span>
                <span className="text-foreground text-base font-light tracking-[-0.02em] text-center">
                  {t(`${member.key}.role`)}
                </span>
              </div>
              {member.email && member.phone && (
                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5">
                  <a
                    href={`mailto:${member.email}`}
                    className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-[20px] border border-white/30 bg-white/30 backdrop-blur-[65px] text-white text-xs font-light tracking-[-0.02em] whitespace-nowrap hover:bg-white/50 transition-colors"
                  >
                    <EmailIcon />
                    {member.email}
                  </a>
                  <a
                    href={`tel:${member.phone.replace(/\s/g, '')}`}
                    className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-[20px] border border-white/30 bg-white/30 backdrop-blur-[65px] text-white text-xs font-light tracking-[-0.02em] whitespace-nowrap hover:bg-white/50 transition-colors"
                  >
                    <PhoneIcon />
                    {member.phone}
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default TeamGrid
