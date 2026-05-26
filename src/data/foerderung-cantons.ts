export type CantonCode =
  | 'AG' | 'AI' | 'AR' | 'BE' | 'BL' | 'BS' | 'FR' | 'GE' | 'GL'
  | 'GR' | 'JU' | 'LU' | 'NE' | 'NW' | 'OW' | 'SG' | 'SH' | 'SO'
  | 'SZ' | 'TG' | 'TI' | 'UR' | 'VD' | 'VS' | 'ZG' | 'ZH'

export type CantonalFoerderung = {
  code: CantonCode
  name: string
  nameSlug: string
  pronovoEIVSummary: string
  cantonalProgramSummary: string | null
  cantonalProgramAmountChfPerKwp: number | null
  solarpflicht: {
    inForce: boolean
    sinceYear?: number
    summary: string
  }
  einspeiseTariffsByEvu: { evu: string; tariffRpKwh: number }[]
  topGemeindeSubsidies: { gemeinde: string; summary: string }[]
  steuerHinweis: string
  lastUpdated: string
  sources: { label: string; url: string }[]
}

const STEUER_HINWEIS =
  'Die Anschaffungskosten einer Solaranlage sind in den meisten Kantonen als Liegenschaftsunterhalt steuerlich abzugsfähig. Details prüfen mit Ihrem Steuerberater oder kantonalem Steueramt.'

const PRONOVO_SOURCE = {
  label: 'Pronovo EIV',
  url: 'https://pronovo.ch/de/foerderung/einmalverguetung/',
}

export const FOERDERUNG_CANTONS: CantonalFoerderung[] = [
  {
    code: 'AG',
    name: 'Aargau',
    nameSlug: 'aargau',
    pronovoEIVSummary:
      '[PLACEHOLDER] Pronovo Einmalvergütung für PV-Anlagen im Kanton Aargau. Werte werden vor Veröffentlichung verifiziert.',
    cantonalProgramSummary: null,
    cantonalProgramAmountChfPerKwp: null,
    solarpflicht: {
      inForce: true,
      summary:
        '[PLACEHOLDER] Solarpflicht im Kanton Aargau gemäss kantonalem Energiegesetz. Geltungsbereich und Schwellenwerte werden vor Veröffentlichung verifiziert.',
    },
    einspeiseTariffsByEvu: [
      { evu: '[PLACEHOLDER EVU 1]', tariffRpKwh: 0 },
      { evu: '[PLACEHOLDER EVU 2]', tariffRpKwh: 0 },
    ],
    topGemeindeSubsidies: [
      {
        gemeinde: '[PLACEHOLDER]',
        summary:
          '[PLACEHOLDER] Kommunaler Förderbeitrag zusätzlich zu Pronovo EIV und allfälligem Kantonsprogramm.',
      },
    ],
    steuerHinweis: STEUER_HINWEIS,
    lastUpdated: '2026-05-16',
    sources: [
      {
        label: 'Kanton Aargau Energie',
        url: 'https://www.ag.ch/de/themen-services/themen/bauen-wohnen/energie',
      },
      PRONOVO_SOURCE,
    ],
  },
  {
    code: 'LU',
    name: 'Luzern',
    nameSlug: 'luzern',
    pronovoEIVSummary:
      '[PLACEHOLDER] Pronovo Einmalvergütung für PV-Anlagen im Kanton Luzern. Werte werden vor Veröffentlichung verifiziert.',
    cantonalProgramSummary:
      '[PLACEHOLDER] Kantonales Förderprogramm Luzern mit zusätzlichem Beitrag pro kWp. Werte werden vor Veröffentlichung verifiziert.',
    cantonalProgramAmountChfPerKwp: 150,
    solarpflicht: {
      inForce: true,
      summary:
        '[PLACEHOLDER] Solarpflicht im Kanton Luzern gemäss kantonalem Energiegesetz. Geltungsbereich und Schwellenwerte werden vor Veröffentlichung verifiziert.',
    },
    einspeiseTariffsByEvu: [
      { evu: '[PLACEHOLDER EVU 1]', tariffRpKwh: 0 },
      { evu: '[PLACEHOLDER EVU 2]', tariffRpKwh: 0 },
    ],
    topGemeindeSubsidies: [
      {
        gemeinde: '[PLACEHOLDER]',
        summary:
          '[PLACEHOLDER] Kommunaler Förderbeitrag zusätzlich zu Pronovo EIV und kantonalem Programm.',
      },
    ],
    steuerHinweis: STEUER_HINWEIS,
    lastUpdated: '2026-05-16',
    sources: [
      { label: 'Kanton Luzern Energie', url: 'https://uwe.lu.ch/energie' },
      PRONOVO_SOURCE,
    ],
  },
  {
    code: 'SG',
    name: 'St. Gallen',
    nameSlug: 'st-gallen',
    pronovoEIVSummary:
      '[PLACEHOLDER] Pronovo Einmalvergütung für PV-Anlagen im Kanton St. Gallen. Werte werden vor Veröffentlichung verifiziert.',
    cantonalProgramSummary: null,
    cantonalProgramAmountChfPerKwp: null,
    solarpflicht: {
      inForce: false,
      summary:
        '[PLACEHOLDER] Status zur Solarpflicht im Kanton St. Gallen. Aktueller Stand wird vor Veröffentlichung verifiziert.',
    },
    einspeiseTariffsByEvu: [
      { evu: '[PLACEHOLDER EVU 1]', tariffRpKwh: 0 },
      { evu: '[PLACEHOLDER EVU 2]', tariffRpKwh: 0 },
    ],
    topGemeindeSubsidies: [
      {
        gemeinde: '[PLACEHOLDER]',
        summary:
          '[PLACEHOLDER] Kommunaler Förderbeitrag zusätzlich zu Pronovo EIV.',
      },
    ],
    steuerHinweis: STEUER_HINWEIS,
    lastUpdated: '2026-05-16',
    sources: [
      {
        label: 'Kanton St. Gallen Energieagentur',
        url: 'https://www.energieagentur-sg.ch/foerderung',
      },
      PRONOVO_SOURCE,
    ],
  },
  {
    code: 'SH',
    name: 'Schaffhausen',
    nameSlug: 'schaffhausen',
    pronovoEIVSummary:
      '[PLACEHOLDER] Pronovo Einmalvergütung für PV-Anlagen im Kanton Schaffhausen. Werte werden vor Veröffentlichung verifiziert.',
    cantonalProgramSummary:
      '[PLACEHOLDER] Kantonales Förderprogramm Schaffhausen mit zusätzlichem Beitrag pro kWp. Werte werden vor Veröffentlichung verifiziert.',
    cantonalProgramAmountChfPerKwp: 100,
    solarpflicht: {
      inForce: false,
      summary:
        '[PLACEHOLDER] Status zur Solarpflicht im Kanton Schaffhausen. Aktueller Stand wird vor Veröffentlichung verifiziert.',
    },
    einspeiseTariffsByEvu: [
      { evu: '[PLACEHOLDER EVU 1]', tariffRpKwh: 0 },
      { evu: '[PLACEHOLDER EVU 2]', tariffRpKwh: 0 },
    ],
    topGemeindeSubsidies: [
      {
        gemeinde: '[PLACEHOLDER]',
        summary:
          '[PLACEHOLDER] Kommunaler Förderbeitrag zusätzlich zu Pronovo EIV und kantonalem Programm.',
      },
    ],
    steuerHinweis: STEUER_HINWEIS,
    lastUpdated: '2026-05-16',
    sources: [
      {
        label: 'Kanton Schaffhausen Energiefachstelle',
        url: 'https://sh.ch/CMS/get_file.php?id=1180&category_id=37',
      },
      PRONOVO_SOURCE,
    ],
  },
]
