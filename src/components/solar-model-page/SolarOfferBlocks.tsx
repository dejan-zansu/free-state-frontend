import PageHero from '@/components/PageHero'
import {
  RoofDarkPanel,
  RoofSection,
} from '@/components/roof-renovation/RoofSection'
import { LinkButton } from '@/components/ui/link-button'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { ArrowRight, CircleCheck, Minus } from 'lucide-react'
import Image from 'next/image'
import type { ComponentProps } from 'react'

type Href = ComponentProps<typeof Link>['href']

export interface OfferLink {
  href: Href
  label: string
}

const TONE_CLASS = {
  light: 'bg-[#FDFFF5]',
  sand: 'bg-[#EAEDDF]',
} as const

type Tone = keyof typeof TONE_CLASS

const isAnchor = (href: Href | `#${string}`): href is `#${string}` =>
  typeof href === 'string' && href.startsWith('#')

const TextLink = ({ href, label }: OfferLink) => (
  <Link
    href={href}
    className="inline-flex items-center gap-1.5 self-start text-base font-medium underline underline-offset-4 hover:opacity-80"
  >
    {label}
    <ArrowRight aria-hidden className="size-4" />
  </Link>
)

export const OfferHero = ({
  image,
  title,
  subtitle,
  primary,
  secondary,
  points,
}: {
  image: string
  title: string
  subtitle: string
  primary: { href: string; label: string }
  secondary: { href: Href | `#${string}`; label: string }
  points: string[]
}) => {
  const secondaryClassName =
    'text-base font-medium text-white underline underline-offset-4 hover:opacity-80 md:text-lg'
  return (
    <div className="bg-[#EAEDDF]">
      <PageHero
        backgroundImage={image}
        overlayClassName="bg-[linear-gradient(180deg,rgba(6,46,37,0.82)_0%,rgba(6,46,37,0.62)_60%,rgba(6,46,37,0.5)_100%)]"
        title={title}
        titleClassName="normal-case max-w-[1040px]"
        description={subtitle}
        descriptionClassName="max-w-[860px] text-lg text-white/90 md:text-[22px]"
        className="min-h-[560px] pb-16 md:min-h-[640px] md:pb-24"
      >
        <div className="mt-8 flex flex-col items-center gap-5 sm:flex-row">
          <LinkButton variant="primary" href={primary.href}>
            {primary.label}
          </LinkButton>
          {isAnchor(secondary.href) ? (
            <a href={secondary.href} className={secondaryClassName}>
              {secondary.label}
            </a>
          ) : (
            <Link href={secondary.href} className={secondaryClassName}>
              {secondary.label}
            </Link>
          )}
        </div>
      </PageHero>
      <ul className="mx-auto flex max-w-[1214px] flex-col gap-x-10 gap-y-3 px-4 py-8 text-[#062E25] sm:flex-row sm:flex-wrap sm:justify-center sm:px-6 md:py-10">
        {points.map(point => (
          <li key={point} className="flex items-center gap-2 text-base md:text-lg">
            <CircleCheck aria-hidden className="size-5 shrink-0 text-[#036B53]" />
            {point}
          </li>
        ))}
      </ul>
    </div>
  )
}

export const OfferFacts = ({
  title,
  intro,
  rows,
  media,
  tone = 'light',
}: {
  title: string
  intro: string
  rows: { label: string; value: string }[]
  media: { video: string; label: string } | { image: string; alt: string }
  tone?: Tone
}) => (
  <section className={cn('text-[#062E25]', TONE_CLASS[tone])}>
    <div className="mx-auto grid max-w-[1214px] items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2 lg:gap-16">
      <div>
        <h2 className="text-3xl font-medium sm:text-4xl md:text-[45px]">
          {title}
        </h2>
        <p className="mt-5 text-lg tracking-[-0.02em] text-[#062E25]/80 md:text-[22px]">
          {intro}
        </p>
        <dl className="mt-8">
          {rows.map(row => (
            <div
              key={row.label}
              className="grid gap-1 border-t border-[#062E25]/12 py-4 sm:grid-cols-[200px_minmax(0,1fr)] sm:gap-6"
            >
              <dt className="text-base text-[#062E25]/65">{row.label}</dt>
              <dd className="text-base font-medium md:text-lg">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[24px] bg-[#062E25]">
        {'video' in media ? (
          <video
            src={media.video}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-label={media.label}
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <Image
            src={media.image}
            alt={media.alt}
            fill
            sizes="(min-width: 1024px) 580px, 100vw"
            className="object-cover"
          />
        )}
      </div>
    </div>
  </section>
)

export const OfferSteps = ({
  title,
  intro,
  image,
  imageAlt,
  steps,
  cta,
  tone = 'sand',
}: {
  title: string
  intro: string
  image: string
  imageAlt: string
  steps: { title: string; body: string }[]
  cta: { href: string; label: string }
  tone?: Tone
}) => (
  <section className={cn('pb-10 text-[#062E25]', TONE_CLASS[tone])}>
    <div className="mx-auto grid max-w-[1214px] items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-16">
      <div>
        <h2 className="text-3xl font-medium sm:text-4xl md:text-[45px]">
          {title}
        </h2>
        <p className="mt-5 text-lg tracking-[-0.02em] text-[#062E25]/80">
          {intro}
        </p>
        <div className="relative mt-8 aspect-[4/3] w-full overflow-hidden rounded-[24px]">
          <Image
            src={image}
            alt={imageAlt}
            fill
            sizes="(min-width: 1024px) 520px, 100vw"
            className="object-cover"
          />
        </div>
      </div>
      <div>
        <ol>
          {steps.map((step, index) => (
            <li key={step.title} className="relative flex gap-5 pb-8 last:pb-0">
              {index < steps.length - 1 && (
                <span
                  aria-hidden
                  className="absolute bottom-0 left-[21px] top-11 w-0.5 bg-[#062E25]/20"
                />
              )}
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#062E25] text-lg font-medium text-solar tabular-nums">
                {index + 1}
              </span>
              <div className="pt-1.5">
                <h3 className="text-xl font-medium tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-1 text-base text-[#062E25]/80">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
        <LinkButton variant="tertiary" href={cta.href} className="mt-10">
          {cta.label}
        </LinkButton>
      </div>
    </div>
  </section>
)

export const OfferCosts = ({
  title,
  intro,
  items,
  note,
  below = 'light',
}: {
  title: string
  intro: string
  items: { value: string; label: string; body: string }[]
  note: string
  below?: Tone
}) => (
  <RoofDarkPanel below={below}>
    <div className="max-w-[820px]">
      <h2 className="text-3xl font-medium sm:text-4xl md:text-[45px]">
        {title}
      </h2>
      <p className="mt-5 text-lg tracking-[-0.02em] text-white/80 md:text-[22px]">
        {intro}
      </p>
    </div>
    <div className="mt-10 grid gap-6 md:mt-12 lg:grid-cols-3">
      {items.map(item => (
        <article
          key={item.label}
          className="flex flex-col rounded-[24px] border border-white/15 bg-white/[0.06] p-6 md:p-8"
        >
          <p className="text-[32px] font-medium tracking-[-0.03em] text-solar tabular-nums xl:text-[38px]">
            {item.value}
          </p>
          <h3 className="mt-1 text-lg font-medium">{item.label}</h3>
          <p className="mt-4 border-t border-white/15 pt-4 text-base text-white/75">
            {item.body}
          </p>
        </article>
      ))}
    </div>
    <p className="mt-8 max-w-[820px] text-base text-white/75">{note}</p>
  </RoofDarkPanel>
)

export const OfferIncluded = ({
  includedTitle,
  included,
  notIncludedTitle,
  notIncluded,
  link,
}: {
  includedTitle: string
  included: string[]
  notIncludedTitle: string
  notIncluded: string[]
  link?: OfferLink | null
}) => (
  <section className="bg-[#FDFFF5] text-[#062E25]">
    <div className="mx-auto grid max-w-[1214px] gap-6 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-2">
      <div className="rounded-[24px] border border-[#062E25]/12 bg-white p-6 md:p-10">
        <h2 className="text-2xl font-medium tracking-tight md:text-[32px]">
          {includedTitle}
        </h2>
        <ul className="mt-6 flex flex-col gap-4">
          {included.map(item => (
            <li key={item} className="flex gap-3 text-base md:text-lg">
              <CircleCheck
                aria-hidden
                className="mt-0.5 size-5 shrink-0 text-[#036B53] md:mt-1"
              />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-[24px] bg-[#EAEDDF] p-6 md:p-10">
        <h2 className="text-2xl font-medium tracking-tight md:text-[32px]">
          {notIncludedTitle}
        </h2>
        <ul className="mt-6 flex flex-col gap-4">
          {notIncluded.map(item => (
            <li
              key={item}
              className="flex gap-3 text-base text-[#062E25]/80 md:text-lg"
            >
              <Minus
                aria-hidden
                className="mt-0.5 size-5 shrink-0 text-[#062E25]/50 md:mt-1"
              />
              {item}
            </li>
          ))}
        </ul>
        {link && (
          <div className="mt-6 flex">
            <TextLink {...link} />
          </div>
        )}
      </div>
    </div>
  </section>
)

export const OfferFit = ({
  title,
  yes,
  noTitle,
  no,
}: {
  title: string
  yes: string[]
  noTitle: string
  no: { text: string; link?: OfferLink | null }[]
}) => (
  <RoofSection tone="sand" title={title} className="[&_h2]:max-w-none">
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <ul className="flex flex-col gap-4">
        {yes.map(item => (
          <li key={item} className="flex gap-3 text-lg md:text-xl">
            <CircleCheck
              aria-hidden
              className="mt-1 size-6 shrink-0 text-[#036B53]"
            />
            {item}
          </li>
        ))}
      </ul>
      <div className="rounded-[24px] bg-[#FDFFF5] p-6 md:p-8">
        <h3 className="text-xl font-medium tracking-tight md:text-2xl">
          {noTitle}
        </h3>
        <ul className="mt-5 flex flex-col gap-5">
          {no.map(item => (
            <li key={item.text} className="flex flex-col gap-1.5">
              <span className="text-base text-[#062E25]/85 md:text-lg">
                {item.text}
              </span>
              {item.link && <TextLink {...item.link} />}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </RoofSection>
)
