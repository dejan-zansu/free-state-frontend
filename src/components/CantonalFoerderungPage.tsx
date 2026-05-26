import Link from 'next/link'
import { useTranslations } from 'next-intl'
import type { CantonalFoerderung } from '@/data/foerderung-cantons'
import { JsonLdFaqPage } from '@/components/seo/JsonLdFaqPage'

function buildFaqs(canton: CantonalFoerderung) {
  const evuList =
    canton.einspeiseTariffsByEvu
      .map(t => `${t.evu} (${t.tariffRpKwh} Rp/kWh)`)
      .join(', ') || 'Keine Daten verfügbar'

  const cantonalText = canton.cantonalProgramSummary
    ? `Pronovo zahlt die Einmalvergütung. ${
        canton.cantonalProgramAmountChfPerKwp
          ? `Zusätzlich gibt es ein kantonales Programm mit ca. CHF ${canton.cantonalProgramAmountChfPerKwp}/kWp.`
          : 'Zusätzlich gibt es ein kantonales Programm.'
      }`
    : `Pronovo zahlt die Einmalvergütung. Ein eigenes kantonales Programm gibt es im Kanton ${canton.name} aktuell nicht.`

  const solarText = canton.solarpflicht.inForce
    ? `Ja, im Kanton ${canton.name} gilt eine Solarpflicht${
        canton.solarpflicht.sinceYear
          ? ` seit ${canton.solarpflicht.sinceYear}`
          : ''
      }. Details siehe Abschnitt Solarpflicht.`
    : `Nein, im Kanton ${canton.name} besteht aktuell keine generelle Solarpflicht. Details siehe Abschnitt Solarpflicht.`

  return [
    {
      question: `Wie hoch ist die Photovoltaik-Förderung im Kanton ${canton.name} 2026?`,
      answer: cantonalText,
    },
    {
      question: `Gibt es eine Solarpflicht im Kanton ${canton.name}?`,
      answer: solarText,
    },
    {
      question: `Welche EVU-Einspeisetarife gelten im Kanton ${canton.name}?`,
      answer: `Die Einspeisetarife unterscheiden sich je nach Energieversorger. Beispiele: ${evuList}.`,
    },
  ]
}

type Props = {
  canton: CantonalFoerderung
}

export function CantonalFoerderungPage({ canton }: Props) {
  const t = useTranslations('foerderung')
  const faqs = buildFaqs(canton)

  return (
    <>
      <JsonLdFaqPage faqs={faqs} />
      <article className="max-w-[1200px] mx-auto px-6 py-16 md:py-24 text-[#062E25]">
        <section className="mb-12">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            Photovoltaik Förderung {canton.name} 2026
          </h1>
          <p className="text-base md:text-lg text-[#062E25]/80 max-w-3xl">
            Aktuelle Förderbeträge, Solarpflicht-Status und EVU-Tarife für den
            Kanton {canton.name}.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            {t('sections.pronovo')}
          </h2>
          <p className="text-base text-[#062E25]/80 max-w-3xl mb-4">
            {canton.pronovoEIVSummary}
          </p>
          <a
            href="https://pronovo.ch"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-base font-medium text-[#062E25] underline hover:no-underline"
          >
            Pronovo Einmalvergütung
          </a>
        </section>

        {canton.cantonalProgramSummary && (
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">
              {t('sections.cantonal')}
            </h2>
            <div className="flex flex-col gap-4 max-w-3xl">
              <p className="text-base text-[#062E25]/80">
                {canton.cantonalProgramSummary}
              </p>
              {canton.cantonalProgramAmountChfPerKwp !== null && (
                <span className="inline-flex w-fit items-center rounded-full bg-[#062E25] text-white px-3 py-1 text-sm font-medium">
                  Beitrag: ca. CHF {canton.cantonalProgramAmountChfPerKwp}/kWp
                </span>
              )}
            </div>
          </section>
        )}

        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            {t('sections.solarpflicht')} im Kanton {canton.name}
          </h2>
          <p className="text-base text-[#062E25]/80 max-w-3xl mb-2">
            {canton.solarpflicht.summary}
          </p>
          {canton.solarpflicht.inForce && canton.solarpflicht.sinceYear && (
            <p className="text-sm text-[#062E25]/60">
              In Kraft seit {canton.solarpflicht.sinceYear}
            </p>
          )}
        </section>

        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            {t('sections.tariffs')}
          </h2>
          <div className="overflow-x-auto max-w-3xl">
            <table className="w-full border-collapse text-base">
              <thead>
                <tr className="border-b border-[#062E25]/20 text-left">
                  <th className="py-3 pr-4 font-semibold">EVU</th>
                  <th className="py-3 font-semibold">Rp/kWh</th>
                </tr>
              </thead>
              <tbody>
                {canton.einspeiseTariffsByEvu.map((row, i) => (
                  <tr key={i} className="border-b border-[#062E25]/10">
                    <td className="py-3 pr-4 text-[#062E25]/80">{row.evu}</td>
                    <td className="py-3 text-[#062E25]/80">{row.tariffRpKwh}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {canton.topGemeindeSubsidies.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">
              {t('sections.gemeinden')}
            </h2>
            <ul className="flex flex-col gap-4 max-w-3xl">
              {canton.topGemeindeSubsidies.map((g, i) => (
                <li key={i} className="border-l-2 border-[#062E25]/30 pl-4">
                  <div className="font-semibold text-base">{g.gemeinde}</div>
                  <p className="text-base text-[#062E25]/80">{g.summary}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            {t('sections.steuer')}
          </h2>
          <p className="text-base text-[#062E25]/80 max-w-3xl">
            {canton.steuerHinweis}
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            {t('sections.sources')}
          </h2>
          <ul className="flex flex-col gap-2 max-w-3xl">
            {canton.sources.map((s, i) => (
              <li key={i}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-[#062E25] underline hover:no-underline"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl md:text-3xl font-semibold mb-6">
            {t('sections.faq')}
          </h2>
          <div className="flex flex-col gap-6 max-w-3xl">
            {faqs.map((f, i) => (
              <div key={i}>
                <h3 className="text-lg font-semibold mb-2">{f.question}</h3>
                <p className="text-base text-[#062E25]/80">{f.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12 rounded-2xl bg-[#062E25] text-white p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            Berechnen Sie Ihre Solaranlage für den Kanton {canton.name}
          </h2>
          <Link
            href={`/solarrechner?kanton=${canton.code}`}
            className="inline-flex items-center rounded-full bg-white text-[#062E25] px-6 py-3 text-base font-semibold hover:bg-white/90 transition-colors"
          >
            {t('ctaCalculate')}
          </Link>
        </section>

        <p className="text-sm text-[#062E25]/60">
          {t('lastUpdated')} {canton.lastUpdated}
        </p>
      </article>
    </>
  )
}
