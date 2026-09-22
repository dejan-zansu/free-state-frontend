import { ArrowUpRight, ExternalLink } from 'lucide-react'
import Image from 'next/image'

import FAQAccordionSection from '@/components/faq/FAQAccordionSection'
import FlowDiagram from '@/components/ratgeber/FlowDiagram'
import Section from '@/components/ratgeber/Section'
import { JsonLd } from '@/components/seo/JsonLd'
import { LinkButton } from '@/components/ui/link-button'
import {
  COMMUNITY_MODELS,
  type CommunityActor,
  type CommunityModel,
  type FaqItem,
  type TitledText,
  type WorkedExample,
} from '@/data/energiegemeinschaften'
import { Link } from '@/i18n/navigation'
import { buildFAQPageJsonLd } from '@/lib/seo/structured-data'

export function ModelHero({ model }: { model: CommunityModel }) {
  return (
    <div className="bg-[#EAEDDF] text-[#062E25]">
      <div className="mx-auto grid max-w-[1200px] items-center gap-10 px-4 pb-14 pt-28 sm:px-6 md:grid-cols-2 md:pb-20 md:pt-36">
        <div>
          <p className="mb-3 text-base font-semibold uppercase tracking-wide text-[#062E25]/60">
            {model.longName}, seit {model.since.slice(0, 4)}
          </p>
          <h1 className="text-3xl font-bold md:text-5xl">{model.hero.title}</h1>
          <p className="mt-5 text-base text-[#062E25]/85 md:text-lg">
            {model.hero.lead}
          </p>
          <div className="mt-8">
            <LinkButton href="/commercial/calculator" variant="primary">
              Objekt prüfen lassen
            </LinkButton>
          </div>
        </div>
        <Image
          src={model.hero.image}
          alt={model.hero.imageAlt}
          width={1600}
          height={1200}
          priority
          className="h-auto w-full rounded-[24px]"
        />
      </div>
    </div>
  )
}

export function AudienceSection({
  items,
}: {
  items: { label: string; text: string }[]
}) {
  return (
    <Section title="Für wen sich das Modell eignet">
      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map(item => (
          <li
            key={item.label}
            className="rounded-[20px] border border-[#062E25]/10 bg-white p-5"
          >
            <h3 className="text-lg font-semibold">{item.label}</h3>
            <p className="mt-2 text-base text-[#062E25]/80">{item.text}</p>
          </li>
        ))}
      </ul>
    </Section>
  )
}

export function StepsSection({
  title,
  steps,
  tone = 'light',
}: {
  title: string
  steps: TitledText[]
  tone?: 'white' | 'sand' | 'light'
}) {
  return (
    <Section title={title} tone={tone}>
      <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {steps.map((step, i) => (
          <li
            key={step.title}
            className="rounded-[20px] bg-white p-5 shadow-sm"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#b7fe1a] text-base font-bold">
              {i + 1}
            </span>
            <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
            <p className="mt-2 text-base text-[#062E25]/80">{step.text}</p>
          </li>
        ))}
      </ol>
    </Section>
  )
}

export function FlowSection({ model }: { model: CommunityModel }) {
  return (
    <Section title="So fliesst der Strom" lead={model.flowTitle}>
      <div className="rounded-[24px] border border-[#062E25]/10 bg-white p-4 md:p-8">
        <FlowDiagram spec={model.flow} title={model.flowTitle} />
      </div>
    </Section>
  )
}

export function LegalSection({ model }: { model: CommunityModel }) {
  return (
    <Section
      title="Gesetzliche Grundlage"
      tone="sand"
      lead={model.legal.summary}
    >
      <ul className="flex flex-wrap gap-3">
        {model.legal.refs.map(ref => (
          <li key={ref.url + ref.article}>
            <a
              href={ref.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[#062E25]/20 bg-white px-4 py-2 text-base font-medium hover:bg-[#062E25]/5"
            >
              {ref.law} {ref.article}
              <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-base text-[#062E25]/70">
        Geprüft am {formatDate(model.legal.refs[0].checked)}.
      </p>
    </Section>
  )
}

export function RequirementsSection({ items }: { items: TitledText[] }) {
  return (
    <Section title="Voraussetzungen">
      <TitledGrid items={items} />
    </Section>
  )
}

export function ActorsSection({ actors }: { actors: CommunityActor[] }) {
  return (
    <Section title="Wer macht was" tone="light">
      <div className="grid gap-4 md:grid-cols-2">
        {actors.map(actor => (
          <div
            key={actor.name}
            className={
              actor.isFsa
                ? 'rounded-[20px] bg-[#062E25] p-6 text-white'
                : 'rounded-[20px] border border-[#062E25]/10 bg-white p-6'
            }
          >
            <h3 className="text-lg font-semibold">{actor.name}</h3>
            <ul className="mt-3 space-y-2 text-base">
              {actor.bullets.map(b => (
                <li key={b} className="flex gap-2">
                  <span
                    aria-hidden
                    className={
                      actor.isFsa ? 'text-[#b7fe1a]' : 'text-[#062E25]/50'
                    }
                  >
                    -
                  </span>
                  <span
                    className={
                      actor.isFsa ? 'text-white/90' : 'text-[#062E25]/80'
                    }
                  >
                    {b}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  )
}

export function ExampleSection({ example }: { example: WorkedExample }) {
  return (
    <Section title={example.title} tone="sand">
      <div className="grid gap-8 md:grid-cols-[1fr_1.4fr]">
        <div>
          <h3 className="text-lg font-semibold">Annahmen</h3>
          <ul className="mt-3 space-y-2 text-base text-[#062E25]/80">
            {example.assumptions.map(a => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </div>
        <div className="overflow-hidden rounded-[20px] border border-[#062E25]/10 bg-white">
          <table className="w-full text-base">
            <tbody>
              {example.rows.map(row => (
                <tr
                  key={row.label}
                  className="border-b border-[#062E25]/10 last:border-0"
                >
                  <th scope="row" className="px-4 py-3 text-left font-medium">
                    {row.label}
                  </th>
                  <td className="px-4 py-3 text-right font-semibold">
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="mt-5 text-base text-[#062E25]/70">
        Quelle: {example.source} Stand {formatDate(example.sourceDate)}.
      </p>
    </Section>
  )
}

export function RightsSection({
  title,
  items,
}: {
  title: string
  items: TitledText[]
}) {
  return (
    <Section title={title}>
      <TitledGrid items={items} />
    </Section>
  )
}

export function ScenariosSection({ items }: { items: TitledText[] }) {
  return (
    <Section title="Typische Situationen" tone="light">
      <TitledGrid items={items} />
    </Section>
  )
}

export function PraxismodellSection({ items }: { items: TitledText[] }) {
  return (
    <Section
      id="praxismodell"
      title="Alternative: Praxismodell VNB"
      tone="sand"
      className="scroll-mt-28"
    >
      <TitledGrid items={items} />
    </Section>
  )
}

export function FsaStepsSection({
  title,
  steps,
}: {
  title: string
  steps: TitledText[]
}) {
  return (
    <Section title={title} tone="white">
      <ol className="grid gap-4 md:grid-cols-3">
        {steps.map((step, i) => (
          <li
            key={step.title}
            className="rounded-[20px] bg-[#062E25] p-5 text-white"
          >
            <span className="text-base font-bold text-[#b7fe1a]">0{i + 1}</span>
            <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
            <p className="mt-2 text-base text-white/85">{step.text}</p>
          </li>
        ))}
      </ol>
    </Section>
  )
}

export function FaqSection({
  eyebrow,
  title,
  description,
  items,
}: {
  eyebrow: string
  title: string
  description: string
  items: FaqItem[]
}) {
  const mapped = items.map(i => ({ question: i.q, answer: i.a }))
  return (
    <div className="bg-[#FDFFF5]">
      <JsonLd data={buildFAQPageJsonLd(mapped)} />
      <FAQAccordionSection
        eyebrow={eyebrow}
        title={title}
        description={description}
        items={mapped}
      />
    </div>
  )
}

export function RelatedModelsSection({
  current,
}: {
  current: CommunityModel['slug']
}) {
  const others = COMMUNITY_MODELS.filter(m => m.slug !== current)
  return (
    <Section title="Die anderen Modelle" tone="sand">
      <div className="grid gap-4 md:grid-cols-3">
        {others.map(m => (
          <Link
            key={m.slug}
            href={{ pathname: '/ratgeber/[model]', params: { model: m.slug } }}
            className="group rounded-[20px] border border-[#062E25]/10 bg-white p-5 hover:border-[#062E25]/30"
          >
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              {m.name}
              <ArrowUpRight
                className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden
              />
            </h3>
            <p className="mt-2 text-base text-[#062E25]/80">{m.longName}</p>
          </Link>
        ))}
        <Link
          href="/ratgeber/energiegemeinschaften"
          className="group rounded-[20px] border border-[#062E25]/10 bg-white p-5 hover:border-[#062E25]/30"
        >
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            Übersicht
            <ArrowUpRight className="h-5 w-5" aria-hidden />
          </h3>
          <p className="mt-2 text-base text-[#062E25]/80">
            Alle Modelle im Vergleich, mit interaktiver Quartieransicht.
          </p>
        </Link>
      </div>
    </Section>
  )
}

function TitledGrid({ items }: { items: TitledText[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map(item => (
        <div
          key={item.title}
          className="rounded-[20px] border border-[#062E25]/10 bg-white p-5"
        >
          <h3 className="text-lg font-semibold">{item.title}</h3>
          <p className="mt-2 text-base text-[#062E25]/80">{item.text}</p>
        </div>
      ))}
    </div>
  )
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}.${m}.${y}`
}
