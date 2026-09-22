import type { FlowSpec } from '@/lib/ratgeber/flow-layout'
import type { SceneStepId, SceneZoneId } from '@/lib/ratgeber/scene-zones'

export type CommunityModelSlug = 'zev' | 'vzev' | 'leg'

export const COMMUNITY_MODEL_SLUGS: readonly CommunityModelSlug[] = [
  'zev',
  'vzev',
  'leg',
]

export const RATGEBER_CHECKED = '2026-09-22'

export interface LegalRef {
  law: string
  article: string
  url: string
  checked: string
}

export interface TitledText {
  title: string
  text: string
}

export interface CommunityActor {
  name: string
  bullets: string[]
  isFsa?: boolean
}

export interface WorkedExample {
  title: string
  assumptions: string[]
  rows: { label: string; value: string }[]
  source: string
  sourceDate: string
}

export interface FaqItem {
  q: string
  a: string
}

export interface CommunityModel {
  slug: CommunityModelSlug
  name: string
  longName: string
  since: string
  seo: { title: string; description: string }
  hero: { title: string; lead: string; image: string; imageAlt: string }
  audience: { label: string; text: string }[]
  steps: TitledText[]
  flow: FlowSpec
  flowTitle: string
  legal: { summary: string; refs: LegalRef[] }
  requirements: TitledText[]
  actors: CommunityActor[]
  example: WorkedExample
  rightsTitle: string
  rights: TitledText[]
  scenarios: TitledText[]
  praxismodell?: TitledText[]
  fsaSteps: TitledText[]
  faq: FaqItem[]
}

const FEDLEX = {
  eng: 'https://www.fedlex.admin.ch/eli/cc/2017/762/de',
  env: 'https://www.fedlex.admin.ch/eli/cc/2017/763/de',
  stromvg: 'https://www.fedlex.admin.ch/eli/cc/2007/418/de',
  stromvv: 'https://www.fedlex.admin.ch/eli/cc/2008/224/de',
  leitfaden: 'https://pubdb.bfe.admin.ch/de/publication/download/9329',
  erlaeuterungen:
    'https://www.newsd.admin.ch/newsd/message/attachments/91799.pdf',
}

export const FSA_STEPS: TitledText[] = [
  {
    title: 'Objektanalyse',
    text: 'Wir prüfen Dach, Netzanschluss und Verbrauchsprofil und klären mit dem Netzbetreiber, welches Modell an Ihrem Standort möglich ist.',
  },
  {
    title: 'Modellwahl',
    text: 'Wir zeigen mit Zahlen, ob ZEV, vZEV oder LEG für Ihr Objekt die passende Lösung ist.',
  },
  {
    title: 'Koordination mit dem Elektrizitätswerk',
    text: 'Anschlussgesuch, Netztopologie und Anmeldung laufen über uns.',
  },
  {
    title: 'Messkonzept und Zähler',
    text: 'Wir planen die Messung und koordinieren Zähler und, wo nötig, den Umbau der Elektroverteilung.',
  },
  {
    title: 'Verträge und Information',
    text: 'Wir bereiten Vertragszusatz und Vereinbarungen vor und begleiten die Information der Beteiligten.',
  },
  {
    title: 'Abrechnung und Betrieb',
    text: 'Wir koordinieren die laufende Abrechnung, das Monitoring und, wo es sich rechnet, einen Batteriespeicher.',
  },
]

const ZEV: CommunityModel = {
  slug: 'zev',
  name: 'ZEV',
  longName: 'Zusammenschluss zum Eigenverbrauch',
  since: '2018-01-01',
  seo: {
    title: 'ZEV: Zusammenschluss zum Eigenverbrauch erklärt | Free State AG',
    description:
      'Was ein ZEV ist, wer mitmachen darf, wie Mieter abgerechnet werden (80-Prozent-Regel) und wie Free State AG Ihr Mehrfamilienhaus vom Messkonzept bis zur Abrechnung begleitet.',
  },
  hero: {
    title:
      'ZEV: Solarstrom im eigenen Gebäude an Mieter und Eigentümer verkaufen',
    lead: 'Der Zusammenschluss zum Eigenverbrauch (ZEV) erlaubt es, den Solarstrom vom Dach direkt an die Wohnungen und Gewerbeflächen im selben Gebäude zu liefern und intern abzurechnen. Der Netzbetreiber sieht den ZEV als einen einzigen Kunden. Das erhöht den Eigenverbrauch der Anlage und macht sie wirtschaftlicher, weil auf dem intern verbrauchten Strom keine Netzkosten anfallen.',
    image: '/ratgeber/zev.webp',
    imageAlt:
      'Drei Mehrfamilienhäuser mit Solaranlagen hinter einem gemeinsamen Netzanschluss',
  },
  audience: [
    {
      label: 'Eigentümer von Mehrfamilienhäusern',
      text: 'Sie verkaufen den Solarstrom an die Mieterschaft und amortisieren die Anlage über den internen Stromtarif, ohne den Mietzins anzuheben.',
    },
    {
      label: 'Verwaltungen',
      text: 'Die Abrechnung läuft wie Nebenkosten mit, mit privaten Zählern pro Wohnung und einer Jahresabrechnung pro Partei.',
    },
    {
      label: 'Stockwerkeigentümergemeinschaften',
      text: 'Alle Eigentümer bilden gemeinsam den ZEV. Der Erlös fliesst in den Erneuerungsfonds oder senkt die Nebenkosten.',
    },
    {
      label: 'Wohnbaugenossenschaften',
      text: 'Günstiger Strom vom eigenen Dach für alle Mitglieder passt zum Genossenschaftsgedanken.',
    },
    {
      label: 'Gewerbe- und Mischbauten',
      text: 'Läden, Büros und Wohnungen hinter einem Netzanschluss teilen sich die Produktion. Das Gewerbe verbraucht tagsüber, wenn die Anlage am meisten liefert.',
    },
  ],
  steps: [
    {
      title: 'Netzanschluss prüfen',
      text: 'Alle Teilnehmenden müssen hinter demselben Netzanschlusspunkt liegen. Der Netzbetreiber gibt Auskunft über die Topologie.',
    },
    {
      title: 'Messkonzept festlegen',
      text: 'Die Zähler des Netzbetreibers werden durch private Zähler ersetzt. Ein Hauptzähler misst den Bezug aus dem Netz, private Zähler messen jede Partei.',
    },
    {
      title: 'Teilnahme regeln',
      text: 'Bestehende Mieter stimmen der Teilnahme zu, bei Neuvermietungen wird der ZEV im Mietvertrag festgehalten.',
    },
    {
      title: 'ZEV anmelden',
      text: 'Die Gründung wird dem Netzbetreiber mit dessen Formular gemeldet, meist zusammen mit dem Anschlussgesuch für die Anlage.',
    },
    {
      title: 'Intern abrechnen',
      text: 'Der Solarstrom wird pro Partei nach gemessenem Verbrauch verrechnet, der Netzstrom wird ohne Aufschlag weitergegeben.',
    },
    {
      title: 'Überschuss einspeisen',
      text: 'Was nicht im Gebäude verbraucht wird, geht ins Netz und wird vom Netzbetreiber vergütet.',
    },
  ],
  flowTitle:
    'Stromfluss im ZEV: Solarstrom über die private Hausverteilung, Netzstrom über den Hauptzähler',
  flow: {
    nodes: [
      { id: 'pv', label: 'PV-Anlage', x: 28, y: 8, kind: 'pv' },
      { id: 'grid', label: 'Netz', x: 78, y: 8, kind: 'grid' },
      { id: 'meter', label: 'Hauptzähler', x: 78, y: 28, kind: 'meter' },
      { id: 'cabinet', label: 'Hausverteilung', x: 28, y: 28, kind: 'cabinet' },
      { id: 'u1', label: 'Wohnung 1', x: 14, y: 50, kind: 'unit' },
      { id: 'u2', label: 'Wohnung 2', x: 44, y: 50, kind: 'unit' },
      { id: 'u3', label: 'Gewerbe', x: 74, y: 50, kind: 'unit' },
    ],
    edges: [
      { from: 'pv', to: 'cabinet', internal: true },
      { from: 'cabinet', to: 'u1', internal: true },
      { from: 'cabinet', to: 'u2', internal: true },
      { from: 'cabinet', to: 'u3', internal: true },
      { from: 'grid', to: 'meter', internal: false },
      { from: 'meter', to: 'cabinet', internal: false },
    ],
  },
  legal: {
    summary:
      'Der ZEV ist seit 1. Januar 2018 im Energiegesetz verankert. Das Gesetz gibt den Anspruch auf Eigenverbrauch und den Zusammenschluss, die Energieverordnung regelt Voraussetzungen, Messung und die Kostenweitergabe an Mieter und Pächter.',
    refs: [
      {
        law: 'EnG',
        article: 'Art. 16 bis 18',
        url: FEDLEX.eng,
        checked: RATGEBER_CHECKED,
      },
      {
        law: 'EnV',
        article: 'Art. 14 bis 17',
        url: FEDLEX.env,
        checked: RATGEBER_CHECKED,
      },
      {
        law: 'EnergieSchweiz',
        article: 'Leitfaden Eigenverbrauch',
        url: FEDLEX.leitfaden,
        checked: RATGEBER_CHECKED,
      },
    ],
  },
  requirements: [
    {
      title: 'Gleicher Netzanschlusspunkt',
      text: 'Alle Gebäude und Parteien hängen am selben Hausanschluss. Das öffentliche Verteilnetz darf für den internen Strom nicht genutzt werden.',
    },
    {
      title: 'Mindestens 10 Prozent Produktionsleistung',
      text: 'Die Leistung der Anlage muss mindestens 10 Prozent der Anschlussleistung aller teilnehmenden Verbraucher betragen (Art. 15 EnV).',
    },
    {
      title: 'Private Messung',
      text: 'Der ZEV misst intern mit eigenen Zählern. In Bestandesbauten wird dafür die Elektroverteilung angepasst, im Neubau plant der Elektroplaner die Zähler von Anfang an ein.',
    },
    {
      title: 'Ein Stromprodukt für alle',
      text: 'Der ZEV tritt gegenüber dem Netzbetreiber als ein Endverbraucher auf und wählt ein Stromprodukt für den Reststrom.',
    },
  ],
  actors: [
    {
      name: 'Verteilnetzbetreiber',
      bullets: [
        'Gibt Auskunft über die Netztopologie.',
        'Prüft bei der Anmeldung die Voraussetzungen.',
        'Stellt dem ZEV den Netzstrom in Rechnung.',
        'Vergütet den eingespeisten Überschuss.',
      ],
    },
    {
      name: 'Grundeigentümerschaft',
      bullets: [
        'Legt die Konditionen im Rahmen des Gesetzes fest und hält sie im Vertragszusatz fest.',
        'Holt die Zustimmung der Mieterschaft ein.',
        'Meldet Mutationen an den Netzbetreiber.',
        'Erhält den Erlös aus dem intern verkauften Strom.',
      ],
    },
    {
      name: 'ZEV-Teilnehmende',
      bullets: [
        'Stimmen der Teilnahme und der Datenweitergabe zu.',
        'Bezahlen Solarstrom und Netzstrom an den ZEV statt an den Netzbetreiber.',
        'Können bei fehlerhafter Abrechnung die Schlichtungsbehörde anrufen.',
      ],
    },
    {
      name: 'Free State AG',
      isFsa: true,
      bullets: [
        'Analysiert das Objekt und prüft mit dem Netzbetreiber, ob ein ZEV möglich ist.',
        'Erstellt das Messkonzept und koordiniert Zähler und Elektroverteilung.',
        'Begleitet Anmeldung, Vertragszusatz und Mieterinformation.',
        'Koordiniert die laufende Abrechnung und, wo sinnvoll, einen Batteriespeicher.',
      ],
    },
  ],
  example: {
    title: 'Rechenbeispiel für eine Wohnung im ZEV',
    assumptions: [
      "Verbrauch der Wohnung 4'000 kWh pro Jahr",
      "Davon 2'400 kWh Solarstrom aus dem ZEV und 1'600 kWh Netzstrom",
      'Standardstromprodukt des Netzbetreibers 30 Rp./kWh inklusive Netz und Abgaben. Beispielwert, Ihr Tarif steht auf der Strompreiskarte der ElCom.',
    ],
    rows: [
      { label: "Kosten ohne ZEV (4'000 kWh x 30 Rp.)", value: "CHF 1'200" },
      {
        label: "Solarstrom pauschal mit 80 Prozent (2'400 kWh x 24 Rp.)",
        value: 'CHF 576',
      },
      {
        label: "Netzstrom, 1:1 weitergegeben (1'600 kWh x 30 Rp.)",
        value: 'CHF 480',
      },
      { label: 'Kosten im ZEV', value: "CHF 1'056" },
      { label: 'Ersparnis der Mieterschaft pro Jahr', value: 'CHF 144' },
      {
        label: 'Erlös der Eigentümerschaft aus dieser Wohnung pro Jahr',
        value: 'CHF 576',
      },
    ],
    source:
      'Pauschalmethode nach Art. 16 Abs. 1 Bst. b EnV, Leitfaden Eigenverbrauch von EnergieSchweiz. Der Tarif ist ein Beispielwert, aktuelle Tarife unter strompreis.elcom.admin.ch.',
    sourceDate: RATGEBER_CHECKED,
  },
  rightsTitle: 'Rechte der Mieterinnen und Mieter',
  rights: [
    {
      title: 'Teilnahme ist freiwillig',
      text: 'Bestehende Mieterinnen und Mieter können die Teilnahme ablehnen und weiter Strom vom Netzbetreiber beziehen. Die Kosten dafür dürfen ihnen nicht belastet werden.',
    },
    {
      title: 'Preisobergrenze',
      text: 'Pauschal dürfen höchstens 80 Prozent der Kosten des externen Standardstromprodukts verrechnet werden, inklusive aller Nebenkosten und der Kosten eines Dienstleisters. Bei effektiver Abrechnung gilt die Obergrenze von 100 Prozent, wobei höchstens die Hälfte der Einsparung zusätzlich verrechnet werden darf.',
    },
    {
      title: 'Kein Mietzinsaufschlag',
      text: 'Die Solaranlage wird über den internen Stromtarif amortisiert. Ein Aufschlag auf den Nettomietzins ist nicht zulässig.',
    },
    {
      title: 'Austritt und Schlichtung',
      text: 'Wird nicht oder falsch abgerechnet, kann die Mieterschaft mit drei Monaten Frist auf ein Monatsende austreten und die Schlichtungsbehörde in Mietsachen anrufen.',
    },
  ],
  scenarios: [
    {
      title: 'Mehrfamilienhaus mit acht Wohnungen',
      text: 'Die Eigentümerschaft baut eine Anlage auf das Dach und bildet mit allen Mietparteien einen ZEV. Die Verwaltung rechnet den Solarstrom über die Nebenkosten ab, den Reststrom liefert der Netzbetreiber an den ZEV.',
    },
    {
      title: 'Areal mit Tiefgarage',
      text: 'Drei Gebäude teilen sich einen Netzanschluss und eine Tiefgarage. Alle Dächer produzieren, die Ladestationen in der Garage laden tagsüber mit Solarstrom, ein Abrechnungsdienstleister verrechnet Strom, Wasser und Heizung in einer Rechnung.',
    },
    {
      title: 'Stockwerkeigentum',
      text: 'Die Eigentümer einigen sich auf einen tiefen Solartarif. Die Verwaltung rechnet über die privaten Zähler ab, der Erlös geht in den Erneuerungsfonds.',
    },
  ],
  fsaSteps: FSA_STEPS,
  faq: [
    {
      q: 'Was ist ein ZEV?',
      a: 'Ein Zusammenschluss zum Eigenverbrauch ist eine Gruppe von Verbrauchern hinter demselben Netzanschluss, die den lokal produzierten Solarstrom gemeinsam nutzt und intern abrechnet. Gegenüber dem Netzbetreiber tritt der ZEV als ein einziger Kunde auf.',
    },
    {
      q: 'Seit wann gibt es den ZEV?',
      a: 'Seit 1. Januar 2018 mit dem revidierten Energiegesetz. Seit 1. Januar 2025 gibt es zusätzlich den virtuellen ZEV, seit 1. Januar 2026 die lokale Elektrizitätsgemeinschaft.',
    },
    {
      q: 'Können Mieter zur Teilnahme verpflichtet werden?',
      a: 'Bestehende Mieter nicht, sie haben ein Wahlrecht. Bei Neuvermietungen kann die Teilnahme im Mietvertrag vorgesehen werden.',
    },
    {
      q: 'Wie wird der Solarstrom im ZEV verrechnet?',
      a: 'Entweder pauschal mit höchstens 80 Prozent des externen Standardstromprodukts oder nach effektiven Kosten mit einer Obergrenze von 100 Prozent. Der Netzstrom wird in beiden Fällen ohne Aufschlag weitergegeben.',
    },
    {
      q: 'Braucht es neue Zähler?',
      a: 'Ja. Der ZEV misst intern mit privaten Zählern. Im Bestandesbau wird die Elektroverteilung angepasst und die Zähler des Netzbetreibers werden ausgebaut.',
    },
    {
      q: 'Wer rechnet ab?',
      a: 'Verantwortlich ist die Grundeigentümerschaft. In der Praxis übernimmt die Verwaltung oder ein Dienstleister Messung, Abrechnung und Inkasso. Free State AG koordiniert diesen Ablauf.',
    },
    {
      q: 'Was passiert mit dem Überschuss?',
      a: 'Strom, der nicht im Gebäude verbraucht wird, geht ins Netz. Der Netzbetreiber vergütet ihn nach seinem Rückliefertarif. Ein Batteriespeicher kann den Abendverbrauch mit Solarstrom decken und den Eigenverbrauch weiter erhöhen.',
    },
    {
      q: 'Wann lohnt sich ein ZEV nicht?',
      a: 'Wenn die Anlage im Verhältnis zur Anschlussleistung klein ist, wenn viele Parteien nicht mitmachen wollen und elektrisch separiert werden müssten, oder wenn die Nachbargebäude besser über einen vZEV oder eine LEG einbezogen werden.',
    },
  ],
}

const VZEV: CommunityModel = {
  slug: 'vzev',
  name: 'vZEV',
  longName: 'Virtueller Zusammenschluss zum Eigenverbrauch',
  since: '2025-01-01',
  seo: {
    title:
      'vZEV: Virtueller Zusammenschluss zum Eigenverbrauch | Free State AG',
    description:
      'Seit 2025 dürfen Nachbargebäude Solarstrom über die Anschlussleitung teilen, gemessen vom Netzbetreiber. Voraussetzungen, Abrechnung, Unterschied zum Praxismodell und zur LEG.',
  },
  hero: {
    title:
      'vZEV: Solarstrom mit den Nachbargebäuden teilen, ohne eigene Zähler',
    lead: 'Der virtuelle Zusammenschluss zum Eigenverbrauch (vZEV) erweitert den Zusammenschluss zum Eigenverbrauch auf benachbarte Gebäude an derselben Verteilkabine oder Trafostation. Gemessen wird mit den Smart Metern des Netzbetreibers, die Elektroverteilung bleibt unangetastet. Auf dem intern verbrauchten Solarstrom fallen keine Netzkosten an.',
    image: '/ratgeber/vzev.webp',
    imageAlt:
      'Drei Einfamilienhäuser auf benachbarten Parzellen, verbunden über eine gemeinsame Verteilkabine',
  },
  audience: [
    {
      label: 'Eigentümer mehrerer Gebäude',
      text: 'Eine grosse Anlage auf einem Dach versorgt auch die Nachbarliegenschaft, ohne dass Leitungen über die Parzellengrenze gezogen werden.',
    },
    {
      label: 'Verwaltungen und Siedlungen',
      text: 'Mehrere Mehrfamilienhäuser an derselben Verteilkabine bilden einen vZEV. Der Netzbetreiber liefert die Messdaten, die Verwaltung rechnet ab.',
    },
    {
      label: 'Nachbarn mit Einfamilienhäusern',
      text: 'Wer einen Überschuss hat, verkauft ihn an das Nachbarhaus statt zum Rückliefertarif ins Netz.',
    },
    {
      label: 'Gewerbe mit Nachbarbetrieben',
      text: 'Ein Betrieb mit grossem Dach beliefert den Nachbarbetrieb, der tagsüber Strom braucht.',
    },
    {
      label: 'Bestandesbauten',
      text: 'Weil die Zähler des Netzbetreibers bleiben, entfällt der Umbau der Elektroverteilung, der beim klassischen ZEV oft der grösste Kostenpunkt ist.',
    },
  ],
  steps: [
    {
      title: 'Netztopologie abfragen',
      text: 'Der Netzbetreiber gibt innert 15 Tagen Auskunft, ob die Gebäude an derselben Verteilkabine, Sammelschiene oder am selben Punkt des Stammkabels hängen.',
    },
    {
      title: 'Teilnehmende festlegen',
      text: 'Wer mitmacht, wird mit Zählernummer erfasst. Bestehende Mieter stimmen zu, neue Mieter werden über den Mietvertrag eingebunden.',
    },
    {
      title: 'vZEV anmelden',
      text: 'Die Anmeldung geht an den Netzbetreiber. Er prüft die Voraussetzungen und schaltet die Messung um.',
    },
    {
      title: 'Messdaten beziehen',
      text: 'Die Smart Meter des Netzbetreibers messen jede Partei im Viertelstundentakt. Die Daten gehen elektronisch an den Betreiber des vZEV.',
    },
    {
      title: 'Abrechnen',
      text: 'Der Betreiber verrechnet den Solarstrom nach den ZEV-Regeln, der Netzstrom kommt als Sammelrechnung vom Netzbetreiber und wird 1:1 weitergegeben.',
    },
  ],
  flowTitle:
    'Stromfluss im vZEV: Solarstrom über die Anschlussleitungen zur Verteilkabine, Messung durch den Netzbetreiber',
  flow: {
    nodes: [
      { id: 'pv', label: 'PV Haus A', x: 20, y: 8, kind: 'pv' },
      { id: 'grid', label: 'Netz', x: 80, y: 8, kind: 'grid' },
      { id: 'vk', label: 'Verteilkabine', x: 50, y: 28, kind: 'cabinet' },
      { id: 'ma', label: 'Smart Meter A', x: 20, y: 28, kind: 'meter' },
      { id: 'mb', label: 'Smart Meter B', x: 50, y: 44, kind: 'meter' },
      { id: 'mc', label: 'Smart Meter C', x: 80, y: 28, kind: 'meter' },
      { id: 'a', label: 'Haus A', x: 20, y: 50, kind: 'unit' },
      { id: 'b', label: 'Haus B', x: 50, y: 56, kind: 'unit' },
      { id: 'c', label: 'Haus C', x: 80, y: 50, kind: 'unit' },
    ],
    edges: [
      { from: 'pv', to: 'ma', internal: true },
      { from: 'ma', to: 'vk', internal: true },
      { from: 'vk', to: 'mb', internal: true },
      { from: 'vk', to: 'mc', internal: true },
      { from: 'ma', to: 'a', internal: true },
      { from: 'mb', to: 'b', internal: true },
      { from: 'mc', to: 'c', internal: true },
      { from: 'grid', to: 'vk', internal: false },
    ],
  },
  legal: {
    summary:
      'Der vZEV ist seit 1. Januar 2025 möglich, eingeführt mit dem ersten Umsetzungspaket des Stromgesetzes. Er stützt sich auf dieselben Artikel im Energiegesetz und in der Energieverordnung wie der ZEV. Neu dürfen die Anschlussleitungen zwischen Gebäude und Verteilkabine für den Eigenverbrauch genutzt werden.',
    refs: [
      {
        law: 'EnG',
        article: 'Art. 17 und 18',
        url: FEDLEX.eng,
        checked: RATGEBER_CHECKED,
      },
      {
        law: 'EnV',
        article: 'Art. 14 bis 17',
        url: FEDLEX.env,
        checked: RATGEBER_CHECKED,
      },
      {
        law: 'EnergieSchweiz',
        article: 'Leitfaden Eigenverbrauch',
        url: FEDLEX.leitfaden,
        checked: RATGEBER_CHECKED,
      },
      {
        law: 'Swisspower',
        article: 'lokalerstrom.ch, Betriebsmodell vZEV',
        url: 'https://www.lokalerstrom.ch/betriebsmodelle/vzev',
        checked: RATGEBER_CHECKED,
      },
    ],
  },
  requirements: [
    {
      title: 'Gemeinsame Verteilkabine oder Trafostation',
      text: 'Alle Gebäude hängen an derselben Verteilkabine, an derselben Sammelschiene einer Trafostation oder am selben Punkt des Stammkabels in einem Muffennetz.',
    },
    {
      title: 'Mindestens 10 Prozent Produktionsleistung',
      text: 'Wie beim ZEV muss die Anlagenleistung mindestens 10 Prozent der Anschlussleistung der Teilnehmenden betragen. Für Mehrfamilienhäuser gibt es Pauschalwerte im Handbuch Eigenverbrauchsregelung des VSE.',
    },
    {
      title: 'Smart Meter des Netzbetreibers',
      text: 'Gemessen wird mit den intelligenten Messsystemen des Netzbetreibers. Fehlen sie, baut er sie ein.',
    },
    {
      title: 'Ein Betreiber gegenüber dem Netzbetreiber',
      text: 'Der vZEV bestimmt, wer ihn vertritt. Meist ist das die Grundeigentümerschaft, die Aufgaben können an eine Verwaltung oder einen Dienstleister gehen.',
    },
  ],
  actors: [
    {
      name: 'Verteilnetzbetreiber',
      bullets: [
        'Gibt innert 15 Tagen Auskunft über die Netztopologie.',
        'Installiert fehlende Smart Meter und misst die internen Stromflüsse.',
        'Stellt die Sammelrechnung für den Netzstrom.',
        'Vergütet den eingespeisten Überschuss.',
      ],
    },
    {
      name: 'Betreiber des vZEV',
      bullets: [
        'Vertritt den vZEV gegenüber Netzbetreiber und Teilnehmenden.',
        'Wird zum Stromlieferanten der Teilnehmenden für Solar- und Netzstrom.',
        'Legt die Konditionen im Rahmen der ZEV-Regeln fest.',
        'Meldet Mutationen an den Netzbetreiber.',
      ],
    },
    {
      name: 'Teilnehmende',
      bullets: [
        'Stimmen der Teilnahme und der Datenweitergabe zu.',
        'Beziehen Solar- und Netzstrom vom Betreiber des vZEV.',
        'Haben dieselben Rechte wie im klassischen ZEV.',
      ],
    },
    {
      name: 'Free State AG',
      isFsa: true,
      bullets: [
        'Fragt die Netztopologie beim Netzbetreiber ab und prüft, welche Gebäude zusammen einen vZEV bilden können.',
        'Dimensioniert die Anlage auf den Verbrauch aller Teilnehmenden.',
        'Begleitet Anmeldung, Vereinbarungen und Datenbezug.',
        'Koordiniert Abrechnung, Monitoring und einen Batteriespeicher, wo er die Bilanz verbessert.',
      ],
    },
  ],
  example: {
    title: 'Rechenbeispiel für zwei Nachbarhäuser im vZEV',
    assumptions: [
      "Haus A hat eine Anlage und speist im Jahr 3'000 kWh Überschuss aus, Haus B verbraucht diese Menge tagsüber",
      'Standardstromprodukt des Netzbetreibers 30 Rp./kWh inklusive Netz und Abgaben. Beispielwert, Ihr Tarif steht auf der Strompreiskarte der ElCom.',
      'Interner Tarif pauschal 80 Prozent, also 24 Rp./kWh',
    ],
    rows: [
      { label: "Haus B ohne vZEV (3'000 kWh x 30 Rp.)", value: 'CHF 900' },
      { label: "Haus B im vZEV (3'000 kWh x 24 Rp.)", value: 'CHF 720' },
      { label: 'Ersparnis Haus B pro Jahr', value: 'CHF 180' },
      { label: 'Erlös Haus A aus dem vZEV pro Jahr', value: 'CHF 720' },
      {
        label: 'Umbau der Elektroverteilung',
        value: 'Keiner, die Zähler des Netzbetreibers bleiben',
      },
    ],
    source:
      'Pauschalmethode nach Art. 16 Abs. 1 Bst. b EnV. Der Erlös von Haus A ersetzt die Rückliefervergütung des Netzbetreibers für dieselbe Menge. Aktuelle Tarife unter strompreis.elcom.admin.ch.',
    sourceDate: RATGEBER_CHECKED,
  },
  rightsTitle: 'Rechte der Mieterinnen und Mieter',
  rights: [
    {
      title: 'Wahlrecht bei Bestandesmiete',
      text: 'Bestehende Mieter können die Teilnahme ablehnen. Sie bleiben dann Kunden des Netzbetreibers in der Grundversorgung.',
    },
    {
      title: 'Gleiche Preisobergrenzen wie im ZEV',
      text: 'Pauschal höchstens 80 Prozent des externen Standardstromprodukts, bei effektiver Abrechnung höchstens 100 Prozent.',
    },
    {
      title: 'Datenweitergabe nur mit Zustimmung',
      text: 'Der Netzbetreiber gibt die Messdaten einer Partei nur an den Betreiber des vZEV weiter, wenn die Partei der Teilnahme zugestimmt hat.',
    },
    {
      title: 'Echtzeitdaten am Zähler',
      text: 'Die Kundenschnittstelle am Smart Meter muss der Netzbetreiber auf Anfrage innert 10 Arbeitstagen freischalten. Damit lässt sich der Eigenverbrauch steuern.',
    },
  ],
  scenarios: [
    {
      title: 'Zwei Mehrfamilienhäuser an einer Verteilkabine',
      text: 'Nur eines der beiden Dächer eignet sich für eine Anlage. Der vZEV versorgt beide Häuser, gemessen vom Netzbetreiber, abgerechnet von der Verwaltung.',
    },
    {
      title: 'Mehrere ZEV zu einem vZEV',
      text: 'Drei Gebäude mit je einem ZEV hängen an derselben Trafostation. Sie schliessen sich zu einem vZEV zusammen und gleichen Überschüsse untereinander aus.',
    },
    {
      title: 'Gewerbe und Wohnhaus',
      text: 'Die Halle produziert am Tag mehr als sie braucht, das Wohnhaus nebenan verbraucht abends. Mit einem Batteriespeicher im vZEV bleibt der Solarstrom in der Nachbarschaft.',
    },
  ],
  praxismodell: [
    {
      title: 'Was das Praxismodell VNB ist',
      text: 'Einige Netzbetreiber bieten für Mehrfamilienhäuser ein eigenes Modell an. Die Mieter bleiben Kunden des Netzbetreibers, er misst mit seinen Zählern und stellt Solarstrom und Netzstrom auf einer Rechnung dar. Das Praxismodell ist kein Zusammenschluss zum Eigenverbrauch nach Art. 17 EnG.',
    },
    {
      title: 'Was gleich bleibt',
      text: 'Die Mieter müssen zustimmen. Das Netznutzungsentgelt darf nur auf dem Strom aus dem Netz erhoben werden, und der Solaranteil muss auf der Rechnung transparent ausgewiesen sein.',
    },
    {
      title: 'Was anders ist',
      text: 'Es gibt keine Anmeldung als ZEV und keine private Messung. Die Konditionen legt der Netzbetreiber fest, nicht die Eigentümerschaft. Ob und zu welchen Bedingungen das Modell angeboten wird, entscheidet jeder Netzbetreiber selbst.',
    },
    {
      title: 'Wann es die einfachere Wahl ist',
      text: 'Bei einem einzelnen Mehrfamilienhaus, dessen Netzbetreiber das Modell anbietet und dessen Eigentümerschaft keinen eigenen Abrechnungsprozess will. Sobald Nachbargebäude dazukommen, führt der Weg über den vZEV oder die LEG.',
    },
  ],
  fsaSteps: FSA_STEPS,
  faq: [
    {
      q: 'Was ist ein vZEV?',
      a: 'Ein virtueller Zusammenschluss zum Eigenverbrauch. Mehrere Gebäude an derselben Verteilkabine oder Trafostation teilen sich den Solarstrom. Der Netzbetreiber misst mit seinen Smart Metern, der Betreiber des vZEV rechnet ab.',
    },
    {
      q: 'Seit wann ist der vZEV möglich?',
      a: 'Seit 1. Januar 2025. Netzbetreiber sind verpflichtet, einen vZEV zuzulassen, wenn die Voraussetzungen erfüllt sind.',
    },
    {
      q: 'Was ist der Unterschied zum klassischen ZEV?',
      a: 'Beim ZEV liegen alle Teilnehmenden hinter einem Netzanschluss und messen mit privaten Zählern. Beim vZEV dürfen es mehrere Gebäude an derselben Verteilkabine sein, gemessen wird mit den Zählern des Netzbetreibers.',
    },
    {
      q: 'Was ist der Unterschied zur LEG?',
      a: 'Der vZEV nutzt die Anschlussleitungen bis zur Verteilkabine, darauf fallen keine Netzkosten an. Die lokale Elektrizitätsgemeinschaft nutzt das öffentliche Verteilnetz bis auf Gemeindeebene und zahlt dafür ein reduziertes Netznutzungsentgelt.',
    },
    {
      q: 'Fallen Netzkosten auf dem geteilten Solarstrom an?',
      a: 'Nein. Der intern verbrauchte Solarstrom im vZEV gilt als Eigenverbrauch. Netzkosten fallen nur auf dem Strom an, der aus dem Netz bezogen wird.',
    },
    {
      q: 'Wie schnell antwortet der Netzbetreiber?',
      a: 'Auskünfte zur Netztopologie muss er innert 15 Tagen geben. Die Kundenschnittstelle am Smart Meter schaltet er innert 10 Arbeitstagen frei.',
    },
    {
      q: 'Kann ein vZEV Teil einer LEG werden?',
      a: 'Ja. Ein ZEV oder vZEV kann als ein Teilnehmer in eine lokale Elektrizitätsgemeinschaft eingebracht werden. Für die LEG zählt dann nur der Hauptzähler des Zusammenschlusses.',
    },
    {
      q: 'Wer eignet sich als Betreiber?',
      a: 'Meist die Grundeigentümerschaft. Sie kann Messung, Abrechnung und Inkasso an eine Verwaltung oder einen Dienstleister geben. Free State AG koordiniert diesen Ablauf von der Anmeldung bis zur Abrechnung.',
    },
  ],
}

const LEG: CommunityModel = {
  slug: 'leg',
  name: 'LEG',
  longName: 'Lokale Elektrizitätsgemeinschaft',
  since: '2026-01-01',
  seo: {
    title:
      'LEG: Lokale Elektrizitätsgemeinschaft ab 2026 erklärt | Free State AG',
    description:
      'Seit 2026 dürfen Betriebe und Liegenschaften Solarstrom über das öffentliche Netz im Quartier teilen, mit 40 Prozent Rabatt auf dem Netznutzungstarif. Voraussetzungen, Abrechnung, Beispiele.',
  },
  hero: {
    title: 'LEG: Solarstrom über das öffentliche Netz im Quartier verkaufen',
    lead: 'Die lokale Elektrizitätsgemeinschaft (LEG) ist seit 1. Januar 2026 möglich. Produzenten, Verbraucher und Speicher in derselben Gemeinde und beim selben Netzbetreiber handeln Solarstrom untereinander über das Verteilnetz. Für den intern gehandelten Strom sinkt der Netznutzungstarif um 40 Prozent. Wer bereits einen Zusammenschluss zum Eigenverbrauch betreibt, kann ihn als Ganzes einbringen.',
    image: '/ratgeber/leg.webp',
    imageAlt:
      'Industriehalle und Bürogebäude mit Solaranlagen, verbunden über das Quartiernetz mit den Nachbargebäuden',
  },
  audience: [
    {
      label: 'Industrie und Gewerbe mit grossen Dächern',
      text: 'Die Halle produziert mehr, als der Betrieb braucht. Statt zum Rückliefertarif einzuspeisen, verkauft er den Strom an Nachbarbetriebe und Wohnhäuser im Quartier.',
    },
    {
      label: 'Benachbarte Betriebe',
      text: 'Zwei Firmen an derselben Strasse teilen sich Produktion, Speicher und Lastspitzen, ohne eigene Leitung zwischen den Grundstücken.',
    },
    {
      label: 'Eigentümer ohne geeignetes Dach',
      text: 'Wer keine eigene Anlage bauen kann, bezieht Solarstrom aus dem Quartier zu einem vereinbarten Preis.',
    },
    {
      label: 'Gemeinden und Genossenschaften',
      text: 'Schulhaus, Werkhof und Wohnsiedlung bilden eine Gemeinschaft, die den lokal produzierten Strom lokal verbraucht.',
    },
    {
      label: 'Betreiber von ZEV und vZEV',
      text: 'Ein bestehender Zusammenschluss kann als ein Teilnehmer in die LEG eintreten und seinen Überschuss im Quartier absetzen.',
    },
  ],
  steps: [
    {
      title: 'Teilnehmende und Netzgebiet klären',
      text: 'Alle Beteiligten liegen in derselben Gemeinde, beim selben Netzbetreiber und auf derselben Netzebene. Der Netzbetreiber gibt innert 15 Arbeitstagen Auskunft über die Netzsituation.',
    },
    {
      title: 'Gemeinschaft vereinbaren',
      text: 'Die Teilnehmenden halten schriftlich fest, wer die Gemeinschaft vertritt, wie der interne Strompreis zustande kommt und wer welche Kosten trägt.',
    },
    {
      title: 'LEG anmelden',
      text: 'Die Bildung wird dem Netzbetreiber drei Monate im Voraus auf ein Monatsende gemeldet. Er rüstet alle Messpunkte mit Smart Metern aus.',
    },
    {
      title: 'Interne Stromflüsse zuordnen',
      text: 'Der Netzbetreiber ermittelt viertelstündlich, wie viel Strom innerhalb der Gemeinschaft erzeugt und zeitgleich verbraucht wurde, und ordnet ihn den Teilnehmenden proportional zu.',
    },
    {
      title: 'Abrechnen',
      text: 'Der Netzbetreiber stellt Netznutzung, Messung und Reststrom in Rechnung, mit dem reduzierten Tarif auf dem internen Anteil. Die Gemeinschaft rechnet den Solarstrom selbst ab.',
    },
  ],
  flowTitle:
    'Stromfluss in der LEG: Solarstrom über das öffentliche Verteilnetz, zugeordnet vom Netzbetreiber',
  flow: {
    nodes: [
      { id: 'pv', label: 'PV Halle', x: 15, y: 8, kind: 'pv' },
      { id: 'bat', label: 'Speicher', x: 40, y: 8, kind: 'battery' },
      { id: 'vnb', label: 'Verteilnetz', x: 50, y: 30, kind: 'vnb' },
      { id: 'grid', label: 'Reststrom', x: 85, y: 8, kind: 'grid' },
      { id: 'm1', label: 'Smart Meter', x: 15, y: 30, kind: 'meter' },
      { id: 'a', label: 'Betrieb', x: 15, y: 52, kind: 'unit' },
      { id: 'b', label: 'Nachbarbetrieb', x: 50, y: 52, kind: 'unit' },
      { id: 'c', label: 'Wohnhaus', x: 85, y: 52, kind: 'unit' },
    ],
    edges: [
      { from: 'pv', to: 'm1', internal: true },
      { from: 'm1', to: 'vnb', internal: true },
      { from: 'bat', to: 'vnb', internal: true },
      { from: 'vnb', to: 'b', internal: true },
      { from: 'vnb', to: 'c', internal: true },
      { from: 'm1', to: 'a', internal: true },
      { from: 'grid', to: 'vnb', internal: false },
    ],
  },
  legal: {
    summary:
      'Die LEG steht seit 1. Januar 2026 im Stromversorgungsgesetz. Die Stromversorgungsverordnung regelt Mindestgrösse, räumliche Grenze, das Verhältnis zum Netzbetreiber und die Reduktion des Netznutzungstarifs.',
    refs: [
      {
        law: 'StromVG',
        article: 'Art. 17d und 17e',
        url: FEDLEX.stromvg,
        checked: RATGEBER_CHECKED,
      },
      {
        law: 'StromVV',
        article: 'Art. 19e bis 19h',
        url: FEDLEX.stromvv,
        checked: RATGEBER_CHECKED,
      },
      {
        law: 'Bundesrat',
        article: 'Erläuterungen zur StromVV-Revision',
        url: FEDLEX.erlaeuterungen,
        checked: RATGEBER_CHECKED,
      },
    ],
  },
  requirements: [
    {
      title: 'Gleiche Gemeinde, gleicher Netzbetreiber',
      text: 'Die Gemeinschaft darf sich höchstens über das Gebiet einer Gemeinde und eines Netzbetreibers erstrecken.',
    },
    {
      title: 'Gleiche Netzebene',
      text: 'Alle Teilnehmenden sind auf Netzebene 5 oder 7 angeschlossen, also bis 36 kV. Jede Anlage muss jeden Verbraucher erreichen können, ohne eine höhere Netzebene zu nutzen.',
    },
    {
      title: 'Mindestens 5 Prozent Produktionsleistung',
      text: 'Die Leistung aller Anlagen beträgt mindestens 5 Prozent der Anschlussleistung der Teilnehmenden (Art. 19e StromVV). Speicher zählen nicht zur Anschlussleistung.',
    },
    {
      title: 'Smart Meter überall',
      text: 'Jeder Messpunkt braucht ein intelligentes Messsystem des Netzbetreibers. Private Zähler sind in der LEG nicht zulässig.',
    },
  ],
  actors: [
    {
      name: 'Verteilnetzbetreiber',
      bullets: [
        'Gibt innert 15 Arbeitstagen Auskunft über die Netzsituation.',
        'Rüstet alle Teilnehmenden mit Smart Metern aus.',
        'Berechnet die internen und externen Stromflüsse und liefert die Daten an die Gemeinschaft.',
        'Stellt Netznutzung, Messung und Reststrom in Rechnung, mit dem reduzierten Tarif auf dem internen Anteil.',
      ],
    },
    {
      name: 'Vertretung der LEG',
      bullets: [
        'Vertritt die Gemeinschaft gegenüber dem Netzbetreiber.',
        'Meldet Bildung, Mutationen und Auflösung.',
        'Rechnet den intern gehandelten Solarstrom ab, selbst oder über einen Dienstleister.',
      ],
    },
    {
      name: 'Teilnehmende',
      bullets: [
        'Produzenten vereinbaren den Preis für die Einspeisung in die Gemeinschaft.',
        'Verbraucher vereinbaren den Preis für den Bezug und kaufen zuerst aus der LEG, dann Reststrom beim Netzbetreiber.',
        'Jede Verbrauchsstätte, Anlage oder Speicher gehört nur einer LEG an.',
      ],
    },
    {
      name: 'Free State AG',
      isFsa: true,
      bullets: [
        'Klärt mit dem Elektrizitätswerk, welche Gebäude im Quartier eine LEG bilden können.',
        'Dimensioniert Anlage und Speicher auf den Verbrauch der Gemeinschaft.',
        'Bereitet die schriftliche Vereinbarung vor und begleitet die Anmeldung.',
        'Koordiniert Abrechnung und Betrieb und übernimmt die Projektleitung von der Analyse bis zum laufenden System.',
      ],
    },
  ],
  example: {
    title:
      'Rechenbeispiel für einen Betrieb, der Solarstrom aus der LEG bezieht',
    assumptions: [
      "Bezug aus der Gemeinschaft 20'000 kWh pro Jahr",
      'Netznutzungstarif des Netzbetreibers 10 Rp./kWh. Beispielwert, der Netzanteil steht auf der Strompreiskarte der ElCom.',
      'Interner Solarstrompreis 15 Rp./kWh, frei vereinbart in der Gemeinschaft. Energieanteil des Standardprodukts 12 Rp./kWh als Vergleich, Beispielwert.',
      'Alle Teilnehmenden am selben Leitungsstrang, Abschlag 40 Prozent',
    ],
    rows: [
      {
        label: "Netznutzung ohne LEG (20'000 kWh x 10 Rp.)",
        value: "CHF 2'000",
      },
      {
        label:
          "Netznutzung in der LEG mit 40 Prozent Abschlag (20'000 kWh x 6 Rp.)",
        value: "CHF 1'200",
      },
      { label: 'Ersparnis auf der Netznutzung pro Jahr', value: 'CHF 800' },
      {
        label: "Solarstrom aus der LEG (20'000 kWh x 15 Rp.)",
        value: "CHF 3'000",
      },
      {
        label: 'Abgaben, Netzzuschlag und Messung',
        value: 'Unverändert, der Abschlag gilt nur für den Netznutzungstarif',
      },
      {
        label: 'Erlös des Produzenten aus der LEG pro Jahr',
        value: "CHF 3'000",
      },
    ],
    source:
      'Abschlag nach Art. 19h StromVV, 40 Prozent am selben Leitungsstrang, 20 Prozent mit Transformation. Der interne Preis ist frei vereinbar. Tarife sind Beispielwerte, aktuelle Werte unter strompreis.elcom.admin.ch.',
    sourceDate: RATGEBER_CHECKED,
  },
  rightsTitle: 'Rechte der Teilnehmenden',
  rights: [
    {
      title: 'Freier interner Preis',
      text: 'Die Gemeinschaft legt den Preis für den intern gehandelten Strom selbst fest. Die Vereinbarung untersteht dem Privatrecht, Streitigkeiten entscheiden die Zivilgerichte.',
    },
    {
      title: 'Grundversorgung bleibt',
      text: 'Wer nicht marktberechtigt ist, bezieht den Reststrom weiter vom Netzbetreiber in der Grundversorgung. Die LEG darf nicht zur Umgehung der Grundversorgung dienen.',
    },
    {
      title: 'Kundenbeziehung zum Netzbetreiber',
      text: 'Anders als im ZEV bleibt jeder Teilnehmende Kunde des Netzbetreibers für Netz, Messung und Reststrom.',
    },
    {
      title: 'Austritt mit Frist',
      text: 'Bildung und Auflösung werden dem Netzbetreiber drei Monate im Voraus auf ein Monatsende gemeldet. Fällt eine Voraussetzung weg, behandelt der Netzbetreiber alle wieder als Einzelkunden.',
    },
  ],
  scenarios: [
    {
      title: 'Zwei Betriebe an derselben Strasse',
      text: 'Die Halle des einen Betriebs produziert am Tag mehr als er braucht, der Nachbarbetrieb hat kein geeignetes Dach. Beide bilden mit dem Elektrizitätswerk eine LEG. Ein Speicher glättet die Mittagsspitze.',
    },
    {
      title: 'Landwirt mit fünf Einfamilienhäusern',
      text: 'Eine grosse Anlage auf dem Scheunendach versorgt fünf Häuser ohne eigene Anlage. Ein Dienstleister rechnet Solar- und Netzstrom für alle ab.',
    },
    {
      title: 'Mehrere ZEV im Quartier',
      text: 'Drei Mehrfamilienhäuser mit je einem ZEV liegen hinter derselben Trafostation. Als LEG gleichen sie ihre Überschüsse untereinander aus, statt sie einzuspeisen.',
    },
  ],
  fsaSteps: FSA_STEPS,
  faq: [
    {
      q: 'Was ist eine LEG?',
      a: 'Eine lokale Elektrizitätsgemeinschaft. Produzenten, Verbraucher und Speicher in derselben Gemeinde handeln lokal erzeugten Strom über das öffentliche Verteilnetz und zahlen dafür ein reduziertes Netznutzungsentgelt.',
    },
    {
      q: 'Seit wann gibt es die LEG?',
      a: 'Seit 1. Januar 2026. Die Netzbetreiber haben ab der Anmeldung drei Monate Zeit für die Umsetzung.',
    },
    {
      q: 'Wie hoch ist der Rabatt auf dem Netz?',
      a: 'Der Netznutzungstarif sinkt auf dem internen Anteil um 40 Prozent, wenn alle am selben Leitungsstrang hängen, und um 20 Prozent, wenn eine Transformation nötig ist. Das Gesetz erlaubt bis zu 60 Prozent. Abgaben, Netzzuschlag, Stromreserve und Messung bleiben unverändert.',
    },
    {
      q: 'Wer darf mitmachen?',
      a: 'Alle in derselben Gemeinde, beim selben Netzbetreiber und auf derselben Netzebene, bis 36 kV. Auch ein ZEV oder vZEV kann als ein Teilnehmer beitreten, ebenso Anlagen und Speicher von Energieversorgern.',
    },
    {
      q: 'Wie gross muss die Produktion sein?',
      a: 'Mindestens 5 Prozent der Anschlussleistung aller Teilnehmenden. Speicher zählen bei der Anschlussleistung nicht mit.',
    },
    {
      q: 'Wer misst und wer rechnet ab?',
      a: 'Der Netzbetreiber misst mit seinen Smart Metern, ordnet die internen Stromflüsse zu und stellt Netz, Messung und Reststrom in Rechnung. Den Solarstrom rechnet die Gemeinschaft selbst ab, oder sie lässt es einen Dienstleister tun.',
    },
    {
      q: 'Kann ich in mehreren LEG sein?',
      a: 'Eine Verbrauchsstätte, Anlage oder Speicher gehört nur einer LEG an. Wer mehrere Standorte hat, kann jeden in eine andere Gemeinschaft einbringen.',
    },
    {
      q: 'Lohnt sich eine LEG?',
      a: 'Sie lohnt sich, wenn ein Produzent grossen Überschuss hat und Verbraucher in der Nähe tagsüber Strom brauchen. Der Vorteil liegt im internen Preis zwischen Rückliefertarif und Bezugstarif plus dem Rabatt auf der Netznutzung. Ob es aufgeht, zeigt eine Rechnung mit den Lastprofilen der Beteiligten.',
    },
  ],
}

export const COMMUNITY_MODELS: CommunityModel[] = [ZEV, VZEV, LEG]

export function getCommunityModel(slug: string): CommunityModel | null {
  return COMMUNITY_MODELS.find(m => m.slug === slug) ?? null
}

export interface DecisionStep {
  question: string
  answers: { label: string; zone: SceneZoneId; text: string }[]
}

export interface ComparisonRow {
  label: string
  zev: string
  vzev: string
  praxismodell: string
  leg: string
}

export interface HubContent {
  seo: { title: string; description: string }
  hero: { title: string; lead: string }
  sceneTitle: string
  decisionTitle: string
  decision: DecisionStep[]
  comparisonTitle: string
  comparison: ComparisonRow[]
  fsaTitle: string
  fsaSteps: TitledText[]
  faq: FaqItem[]
}

export const HUB: HubContent = {
  seo: {
    title:
      'ZEV, vZEV und LEG: Solarstrom teilen in der Schweiz | Free State AG',
    description:
      'Welches Modell passt zu Ihrem Gebäude, Ihrer Siedlung oder Ihrem Betrieb? ZEV, virtueller ZEV und lokale Elektrizitätsgemeinschaft im Vergleich, mit interaktiver Übersicht und Projektbegleitung durch Free State AG.',
  },
  hero: {
    title:
      'ZEV, vZEV und LEG: Solarstrom im Gebäude, in der Nachbarschaft und im Quartier teilen',
    lead: 'Drei gesetzliche Modelle erlauben es, Solarstrom vom eigenen Dach an andere zu verkaufen. Der Zusammenschluss zum Eigenverbrauch (ZEV) bleibt hinter einem Netzanschluss, der virtuelle ZEV reicht bis zur Verteilkabine, die lokale Elektrizitätsgemeinschaft (LEG) nutzt das öffentliche Netz bis auf Gemeindeebene. Klicken Sie in der Übersicht auf ein Modell.',
  },
  sceneTitle: 'Vier Modelle, ein Quartier',
  decisionTitle: 'Welches Modell passt?',
  decision: [
    {
      question:
        'Liegen alle Beteiligten hinter demselben Netzanschluss, zum Beispiel in einem Mehrfamilienhaus oder auf einem Areal mit einem Hausanschluss?',
      answers: [
        {
          label: 'Ja, ein Netzanschluss',
          zone: 'zev',
          text: 'Dann ist der ZEV das passende Modell. Private Zähler, keine Netzkosten auf dem Solarstrom, Abrechnung durch die Eigentümerschaft oder Verwaltung.',
        },
        {
          label: 'Ja, aber ohne eigene Zähler',
          zone: 'praxismodell',
          text: 'Wenn Ihr Netzbetreiber das Praxismodell anbietet, bleiben die Mieter seine Kunden und er rechnet den Solaranteil ab. Kein Umbau, dafür seine Konditionen.',
        },
      ],
    },
    {
      question:
        'Sind es mehrere Gebäude auf benachbarten Parzellen, die an derselben Verteilkabine oder Trafostation hängen?',
      answers: [
        {
          label: 'Ja, direkte Nachbarn',
          zone: 'vzev',
          text: 'Dann bildet der virtuelle ZEV die Lösung. Der Netzbetreiber misst, die Anschlussleitungen bis zur Verteilkabine dürfen genutzt werden, ohne Netzkosten auf dem geteilten Strom.',
        },
      ],
    },
    {
      question:
        'Liegen die Beteiligten weiter auseinander, im selben Quartier oder in derselben Gemeinde?',
      answers: [
        {
          label: 'Ja, im Quartier oder in der Gemeinde',
          zone: 'leg',
          text: 'Dann kommt die lokale Elektrizitätsgemeinschaft in Frage. Der Strom fliesst über das öffentliche Netz, mit 40 Prozent Rabatt auf dem Netznutzungstarif für den internen Anteil.',
        },
      ],
    },
  ],
  comparisonTitle: 'Die Modelle im Vergleich',
  comparison: [
    {
      label: 'Möglich seit',
      zev: '1. Januar 2018',
      vzev: '1. Januar 2025',
      praxismodell: 'Je nach Netzbetreiber',
      leg: '1. Januar 2026',
    },
    {
      label: 'Räumliche Grenze',
      zev: 'Ein Netzanschlusspunkt',
      vzev: 'Gleiche Verteilkabine oder Trafostation',
      praxismodell: 'Ein Gebäude',
      leg: 'Gleiche Gemeinde, gleicher Netzbetreiber, Netzebene 5 oder 7',
    },
    {
      label: 'Wer misst',
      zev: 'Private Zähler des ZEV',
      vzev: 'Smart Meter des Netzbetreibers',
      praxismodell: 'Zähler des Netzbetreibers',
      leg: 'Smart Meter des Netzbetreibers',
    },
    {
      label: 'Wer rechnet den Solarstrom ab',
      zev: 'Eigentümerschaft, Verwaltung oder Dienstleister',
      vzev: 'Betreiber des vZEV oder Dienstleister',
      praxismodell: 'Netzbetreiber',
      leg: 'Vertretung der LEG oder Dienstleister',
    },
    {
      label: 'Netznutzung auf dem Solarstrom',
      zev: 'Keine',
      vzev: 'Keine',
      praxismodell: 'Keine',
      leg: 'Reduziert um 40 Prozent, 20 Prozent mit Transformation',
    },
    {
      label: 'Mindestanteil Produktion',
      zev: '10 Prozent der Anschlussleistung',
      vzev: '10 Prozent der Anschlussleistung',
      praxismodell: 'Vorgabe des Netzbetreibers',
      leg: '5 Prozent der Anschlussleistung',
    },
    {
      label: 'Kundenbeziehung zum Netzbetreiber',
      zev: 'Nur der ZEV als Ganzes',
      vzev: 'Nur der vZEV als Ganzes',
      praxismodell: 'Jeder Mieter einzeln',
      leg: 'Jeder Teilnehmende einzeln',
    },
    {
      label: 'Mieter können ablehnen',
      zev: 'Ja, bei bestehender Miete',
      vzev: 'Ja, bei bestehender Miete',
      praxismodell: 'Ja',
      leg: 'Teilnahme ist freiwillig',
    },
    {
      label: 'Preisregel für Mieter',
      zev: 'Höchstens 80 Prozent pauschal oder effektive Kosten',
      vzev: 'Höchstens 80 Prozent pauschal oder effektive Kosten',
      praxismodell: 'Tarif des Netzbetreibers',
      leg: 'Frei vereinbart',
    },
    {
      label: 'Gesetz',
      zev: 'EnG Art. 17 und 18, EnV Art. 14 bis 17',
      vzev: 'EnG Art. 17 und 18, EnV Art. 14 bis 17',
      praxismodell: 'Kein ZEV nach EnG, Bedingungen der ElCom',
      leg: 'StromVG Art. 17d und 17e, StromVV Art. 19e bis 19h',
    },
  ],
  fsaTitle: 'So begleitet Free State AG Ihr Projekt',
  fsaSteps: FSA_STEPS,
  faq: [
    {
      q: 'Was ist der Unterschied zwischen ZEV, vZEV und LEG?',
      a: 'Der ZEV bleibt hinter einem Netzanschluss und misst privat. Der vZEV reicht bis zur gemeinsamen Verteilkabine und misst mit den Zählern des Netzbetreibers. Die LEG nutzt das öffentliche Netz in der ganzen Gemeinde und zahlt dafür ein reduziertes Netznutzungsentgelt.',
    },
    {
      q: 'Fallen auf dem geteilten Solarstrom Netzkosten an?',
      a: 'Im ZEV und im vZEV nicht. In der LEG ja, aber reduziert um 40 Prozent, oder um 20 Prozent, wenn der Strom über eine Transformation fliesst.',
    },
    {
      q: 'Kann ich mit einem ZEV später in eine LEG?',
      a: 'Ja. Ein ZEV oder vZEV tritt als ein Teilnehmer in die LEG ein. Für die LEG zählt der Hauptzähler des Zusammenschlusses.',
    },
    {
      q: 'Was ist das Praxismodell VNB?',
      a: 'Ein Angebot einzelner Netzbetreiber für Mehrfamilienhäuser. Die Mieter bleiben Kunden des Netzbetreibers, er misst und rechnet den Solaranteil ab. Es ist kein ZEV nach Energiegesetz, und ob es angeboten wird, entscheidet der Netzbetreiber.',
    },
    {
      q: 'Was macht Free State AG in einem solchen Projekt?',
      a: 'Wir analysieren das Objekt, schlagen das passende Modell vor und koordinieren Elektrizitätswerk, Zähler, Anmeldung, Verträge und Abrechnung. Wo es sich rechnet, planen wir den Batteriespeicher gleich mit.',
    },
    {
      q: 'Wie lange dauert die Umsetzung?',
      a: 'Das hängt vom Netzbetreiber ab. Er beantwortet Anfragen zur Netzsituation innert 15 Arbeitstagen, eine LEG wird drei Monate im Voraus angemeldet. Die Anlage selbst planen und bauen wir parallel dazu.',
    },
  ],
}

export interface SceneZoneCopy {
  id: SceneZoneId
  label: string
  summary: string
  ctaLabel: string
  labels: Record<string, string>
  steps: { id: SceneStepId; label: string; text: string }[]
}

export const SCENE_ZONE_COPY: SceneZoneCopy[] = [
  {
    id: 'zev',
    label: 'ZEV',
    summary:
      'Zusammenschluss zum Eigenverbrauch. Alle Parteien hinter einem Netzanschluss, private Zähler, keine Netzkosten auf dem Solarstrom. Seit 2018.',
    ctaLabel: 'Mehr zum ZEV',
    labels: { hak: 'Hausanschluss', pv: 'PV-Anlage' },
    steps: [
      {
        id: 'production',
        label: 'Produktion',
        text: 'Die Anlage auf dem Dach liefert Solarstrom in die private Hausverteilung. Der Netzbetreiber sieht davon nichts.',
      },
      {
        id: 'distribution',
        label: 'Verteilung',
        text: 'Private Zähler messen jede Wohnung. Der ZEV rechnet den Solarstrom intern ab, ohne Netzkosten.',
      },
      {
        id: 'grid',
        label: 'Netzbezug',
        text: 'Was fehlt, kommt über den einen Hausanschluss aus dem Netz und wird 1:1 weitergegeben.',
      },
    ],
  },
  {
    id: 'vzev',
    label: 'vZEV',
    summary:
      'Virtueller ZEV. Nachbargebäude an derselben Verteilkabine teilen Solarstrom, gemessen vom Netzbetreiber, ohne Umbau der Elektroverteilung. Seit 2025.',
    ctaLabel: 'Mehr zum vZEV',
    labels: {
      verteilkabine: 'Verteilkabine',
      meter: 'Smart Meter VNB',
      pv: 'PV-Anlage',
    },
    steps: [
      {
        id: 'production',
        label: 'Produktion',
        text: 'Ein Dach produziert, die Nachbargebäude hängen an derselben Verteilkabine.',
      },
      {
        id: 'distribution',
        label: 'Verteilung',
        text: 'Der Solarstrom fliesst über die Anschlussleitungen zu den Nachbarn. Die Smart Meter des Netzbetreibers messen, ohne Netzkosten auf dem geteilten Strom.',
      },
      {
        id: 'grid',
        label: 'Netzbezug',
        text: 'Den Rest liefert der Netzbetreiber als Sammelrechnung an den vZEV.',
      },
    ],
  },
  {
    id: 'leg',
    label: 'LEG',
    summary:
      'Lokale Elektrizitätsgemeinschaft. Betriebe und Liegenschaften in derselben Gemeinde handeln Strom über das öffentliche Netz, mit 40 Prozent Rabatt auf dem Netznutzungstarif. Seit 2026.',
    ctaLabel: 'Mehr zur LEG',
    labels: {
      trafo: 'Trafostation',
      meter: 'Smart Meter VNB',
      pv: 'PV-Anlage',
      netz: 'Netz',
    },
    steps: [
      {
        id: 'production',
        label: 'Produktion',
        text: 'Halle und Bürogebäude produzieren mehr, als sie brauchen.',
      },
      {
        id: 'distribution',
        label: 'Verteilung',
        text: 'Der Überschuss geht über das öffentliche Netz an die anderen Gebäude der Gemeinde. Auf diesem Anteil sinkt der Netznutzungstarif um 40 Prozent.',
      },
      {
        id: 'grid',
        label: 'Netzbezug',
        text: 'Reststrom kommt vom Netzbetreiber. Er misst alles, ordnet die internen Flüsse zu und stellt Netz und Reststrom in Rechnung.',
      },
    ],
  },
  {
    id: 'praxismodell',
    label: 'Praxismodell',
    summary:
      'Praxismodell VNB. Der Netzbetreiber misst und rechnet den Solaranteil im Mehrfamilienhaus ab, die Mieter bleiben seine Kunden. Kein ZEV nach Gesetz, Angebot je nach Netzbetreiber.',
    ctaLabel: 'Mehr zum Praxismodell',
    labels: { vnbmeter: 'Zähler VNB', pv: 'PV-Anlage' },
    steps: [
      {
        id: 'production',
        label: 'Produktion',
        text: 'Die Anlage auf dem Mehrfamilienhaus produziert für die Mieterschaft.',
      },
      {
        id: 'distribution',
        label: 'Verteilung',
        text: 'Die Zähler des Netzbetreibers bleiben. Er rechnet den Solaranteil auf seiner Rechnung ab, die Mieter bleiben seine Kunden.',
      },
      {
        id: 'grid',
        label: 'Netzbezug',
        text: 'Netzstrom und Solarstrom stehen auf derselben Rechnung, Netzkosten nur auf dem Netzanteil.',
      },
    ],
  },
]

export const RATGEBER_INDEX = {
  seo: {
    title:
      'Ratgeber: Solarstrom, Energiegemeinschaften und Recht | Free State AG',
    description:
      'Leitfäden von Free State AG zu Solarstrom in der Schweiz. Start mit ZEV, vZEV und LEG: Solarstrom im Gebäude, in der Nachbarschaft und im Quartier teilen.',
  },
  title: 'Ratgeber',
  lead: 'Verständlich erklärt, mit Gesetzesgrundlage und Rechenbeispiel. Wir beginnen mit den drei Modellen, um Solarstrom zu teilen.',
  cards: [
    {
      title: 'ZEV, vZEV und LEG im Überblick',
      description:
        'Welches Modell passt zu Ihrem Objekt? Interaktive Übersicht und Vergleichstabelle.',
      href: 'hub' as const,
    },
    {
      title: 'ZEV',
      description:
        'Solarstrom im eigenen Gebäude an Mieter und Eigentümer verkaufen.',
      href: 'zev' as const,
    },
    {
      title: 'vZEV',
      description:
        'Solarstrom mit den Nachbargebäuden teilen, ohne eigene Zähler.',
      href: 'vzev' as const,
    },
    {
      title: 'LEG',
      description:
        'Solarstrom über das öffentliche Netz im Quartier verkaufen.',
      href: 'leg' as const,
    },
  ],
}
