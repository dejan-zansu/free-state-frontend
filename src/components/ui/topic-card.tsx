import { LearnMoreLink } from '@/components/ui/learn-more-link'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'

type TopicCardProps = {
  icon: string
  title: string
  description: string
  linkText: string
  href: React.ComponentProps<typeof Link>['href']
}

const TopicCard = ({
  icon,
  title,
  description,
  linkText,
  href,
}: TopicCardProps) => {
  return (
    <div
      className="relative w-full sm:w-[calc(50%-5px)] lg:w-[calc(33.333%-7px)] h-[370px] rounded-[20px] overflow-hidden"
      style={{ border: '1px solid #809792' }}
    >
      <div className="relative z-10 flex items-center justify-center pt-[30px]">
        <Image src={icon} alt="" width={142} height={142} />
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-[177px] backdrop-blur-[26px]"
        style={{
          background: '#E5E6DE',
          borderTop: '1px solid #809792',
        }}
      >
        <div className="flex flex-col gap-5 px-8 py-5">
          <div className="flex flex-col gap-2.5">
            <h3 className="text-[#062E25] text-lg md:text-[22px] font-bold capitalize">
              {title}
            </h3>
            <p className="text-[#062E25]/80 text-sm md:text-base font-light tracking-[-0.02em]">
              {description}
            </p>
          </div>
          <div className="flex justify-start">
            <LearnMoreLink href={href}>{linkText}</LearnMoreLink>
          </div>
        </div>
      </div>
    </div>
  )
}

export { TopicCard }
export type { TopicCardProps }
