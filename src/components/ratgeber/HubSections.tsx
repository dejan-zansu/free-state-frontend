import { ArrowUpRight } from 'lucide-react'
import Image from 'next/image'

import Section from '@/components/ratgeber/Section'
import {
  COMMUNITY_MODELS,
  type ComparisonRow,
  type DecisionStep,
} from '@/data/energiegemeinschaften'
import { Link } from '@/i18n/navigation'

const ZONE_HREF = {
  zev: { pathname: '/ratgeber/[model]', params: { model: 'zev' } },
  vzev: { pathname: '/ratgeber/[model]', params: { model: 'vzev' } },
  leg: { pathname: '/ratgeber/[model]', params: { model: 'leg' } },
} as const

export function HubHero({ title, lead }: { title: string; lead: string }) {
  return (
    <div className="bg-[#EAEDDF] text-[#062E25]">
      <div className="mx-auto max-w-[1200px] px-4 pb-10 pt-28 sm:px-6 md:pt-36">
        <h1 className="max-w-4xl text-3xl font-bold md:text-5xl">{title}</h1>
        <p className="mt-5 max-w-3xl text-base text-[#062E25]/85 md:text-lg">
          {lead}
        </p>
      </div>
    </div>
  )
}

export function DecisionSection({
  title,
  steps,
}: {
  title: string
  steps: DecisionStep[]
}) {
  return (
    <Section title={title} tone="light">
      <ol className="space-y-6">
        {steps.map((step, i) => (
          <li
            key={step.question}
            className="rounded-[24px] border border-[#062E25]/10 bg-white p-6"
          >
            <p className="text-lg font-semibold">
              {i + 1}. {step.question}
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {step.answers.map(answer => (
                <div
                  key={answer.label}
                  className="rounded-[20px] bg-[#EAEDDF] p-5"
                >
                  <p className="text-base font-semibold">{answer.label}</p>
                  <p className="mt-2 text-base text-[#062E25]/80">
                    {answer.text}
                  </p>
                  {answer.zone === 'praxismodell' ? (
                    <Link
                      href={{
                        pathname: '/ratgeber/[model]',
                        params: { model: 'vzev' },
                        hash: 'praxismodell',
                      }}
                      className="mt-3 inline-flex items-center gap-1 text-base font-medium underline hover:no-underline"
                    >
                      Zum Praxismodell auf der vZEV-Seite
                      <ArrowUpRight className="h-4 w-4" aria-hidden />
                    </Link>
                  ) : (
                    <Link
                      href={ZONE_HREF[answer.zone]}
                      className="mt-3 inline-flex items-center gap-1 text-base font-medium underline hover:no-underline"
                    >
                      Mehr zum{' '}
                      {answer.zone === 'leg'
                        ? 'LEG'
                        : answer.zone === 'vzev'
                          ? 'vZEV'
                          : 'ZEV'}
                      <ArrowUpRight className="h-4 w-4" aria-hidden />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </li>
        ))}
      </ol>
    </Section>
  )
}

export function ComparisonSection({
  title,
  rows,
}: {
  title: string
  rows: ComparisonRow[]
}) {
  return (
    <Section title={title}>
      <div className="overflow-x-auto rounded-[24px] border border-[#062E25]/10 bg-white">
        <table className="w-full min-w-[820px] text-base">
          <thead>
            <tr className="bg-[#EAEDDF] text-left">
              <th scope="col" className="px-4 py-3 font-semibold">
                Kriterium
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                ZEV
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                vZEV
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                Praxismodell VNB
              </th>
              <th scope="col" className="px-4 py-3 font-semibold">
                LEG
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr
                key={row.label}
                className="border-t border-[#062E25]/10 align-top"
              >
                <th scope="row" className="px-4 py-3 text-left font-medium">
                  {row.label}
                </th>
                <td className="px-4 py-3 text-[#062E25]/85">{row.zev}</td>
                <td className="px-4 py-3 text-[#062E25]/85">{row.vzev}</td>
                <td className="px-4 py-3 text-[#062E25]/85">
                  {row.praxismodell}
                </td>
                <td className="px-4 py-3 text-[#062E25]/85">{row.leg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  )
}

export function ModelCardsSection() {
  return (
    <Section title="Die drei Modelle" tone="sand">
      <div className="grid gap-4 md:grid-cols-3">
        {COMMUNITY_MODELS.map(m => (
          <Link
            key={m.slug}
            href={{ pathname: '/ratgeber/[model]', params: { model: m.slug } }}
            className="group overflow-hidden rounded-[24px] border border-[#062E25]/10 bg-white hover:border-[#062E25]/30"
          >
            <Image
              src={m.hero.image}
              alt={m.hero.imageAlt}
              width={1600}
              height={1200}
              sizes="(min-width: 768px) 33vw, 100vw"
              className="h-auto w-full"
            />
            <div className="p-5">
              <h3 className="flex items-center gap-2 text-xl font-semibold">
                {m.name}
                <ArrowUpRight
                  className="h-5 w-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden
                />
              </h3>
              <p className="mt-1 text-base font-medium text-[#062E25]/70">
                {m.longName}
              </p>
              <p className="mt-3 text-base text-[#062E25]/85">{m.hero.title}</p>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  )
}

