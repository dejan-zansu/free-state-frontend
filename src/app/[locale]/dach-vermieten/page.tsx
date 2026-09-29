import type { Metadata } from 'next'
import { Building2, Hammer, SunMedium } from 'lucide-react'

import { JsonLd } from '@/components/seo/JsonLd'
import { generateSEOMetadata } from '@/lib/seo/metadata'
import type { SiteLocale } from '@/lib/seo/site-config'
import { buildBreadcrumbsFromPath } from '@/lib/seo/structured-data'

import RoofRentTool from './_components/RoofRentTool'

// "Dach vermieten" (doc 69 M-5, build contract M15). Public and indexable,
// German only, German strings in the component like the /dach one-pager.
// Mails, tenant answers and partner sheets link here ({dachvermieten}).
// Claims stay within the whitelist: no investment, Free State AG plans,
// finances, builds and operates. The rent and the tenant saving appear only
// once the API returns them (owner decisions 4 and 6).

const DE_ONLY = ['de'] as const

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return generateSEOMetadata({
    locale: locale as SiteLocale,
    pathname: '/dach-vermieten',
    title: 'Dach vermieten für Solarstrom | Free State AG',
    description:
      'Gewerbedach ohne Investition vermieten. Free State AG plant, finanziert, baut und betreibt die Solaranlage und zahlt eine jährliche Dachmiete. Dach online prüfen.',
    availableLocales: DE_ONLY,
  })
}

const STEPS = [
  {
    icon: SunMedium,
    title: 'Dach prüfen',
    text: 'Wir lesen Dachfläche und Solarertrag aus sonnendach.ch und prüfen das Anlagenregister des Bundes.',
  },
  {
    icon: Building2,
    title: 'Richtofferte',
    text: 'Sie erhalten eine Richtofferte für Ihre Liegenschaft, auf Wunsch mit einem Termin vor Ort.',
  },
  {
    icon: Hammer,
    title: 'Bau und Betrieb',
    text: 'Free State AG plant, finanziert, baut und betreibt die Anlage. Sie investieren nichts.',
  },
] as const

export default async function DachVermietenPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const prefix = locale === 'de' ? '' : `/${locale}`

  return (
    <div className="bg-[#EAEDDF] text-[#062E25]">
      <JsonLd
        data={buildBreadcrumbsFromPath([
          { name: 'Home', href: prefix || '/' },
          { name: 'Dach vermieten', href: `${prefix}/dach-vermieten` },
        ])}
      />
      <div className="mx-auto max-w-[1200px] space-y-16 px-4 pb-16 pt-28 sm:px-6 md:pt-36">
        <header className="max-w-3xl space-y-4">
          <p className="text-base font-medium uppercase tracking-wide text-[#062E25]/60">
            Dach vermieten
          </p>
          <h1 className="text-3xl font-bold md:text-5xl">
            Gewerbedach vermieten, ohne Investition
          </h1>
          <p className="text-base md:text-lg">
            Sie stellen die Dachfläche Ihrer Liegenschaft zur Verfügung. Free
            State AG plant, finanziert, baut und betreibt die Solaranlage und
            zahlt Ihnen eine jährliche Dachmiete.
          </p>
          <a
            href="#dach-pruefen"
            className="inline-flex items-center justify-center rounded-full bg-[#062E25] px-8 py-3 text-base font-semibold text-white hover:bg-[#062E25]/90"
          >
            Dach jetzt prüfen
          </a>
        </header>

        <RoofRentTool />

        <section className="space-y-6">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            So funktioniert es
          </h2>
          <ol className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, text }, index) => (
              <li key={title} className="space-y-2 rounded-2xl bg-white p-6">
                <div className="flex items-center gap-3">
                  <Icon className="h-6 w-6 text-amber-500" />
                  <span className="text-base font-semibold text-[#062E25]/60">
                    Schritt {index + 1}
                  </span>
                </div>
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="text-base text-[#062E25]/80">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="max-w-3xl space-y-3">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
            Woher die Zahlen stammen
          </h2>
          <p className="text-base text-[#062E25]/80">
            Dachfläche und Solarertrag stammen aus sonnendach.ch des Bundesamts
            für Energie, gezählt werden nur gut geeignete Dachflächen. Das
            Gebäude bestimmen wir über das eidgenössische Gebäude- und
            Wohnungsregister. Die Werte sind eine erste Einschätzung, die
            verbindlichen Zahlen stehen in der Richtofferte.
          </p>
        </section>
      </div>
    </div>
  )
}
