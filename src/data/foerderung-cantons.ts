export type CantonCode =
  | 'AG'
  | 'AI'
  | 'AR'
  | 'BE'
  | 'BL'
  | 'BS'
  | 'FR'
  | 'GE'
  | 'GL'
  | 'GR'
  | 'JU'
  | 'LU'
  | 'NE'
  | 'NW'
  | 'OW'
  | 'SG'
  | 'SH'
  | 'SO'
  | 'SZ'
  | 'TG'
  | 'TI'
  | 'UR'
  | 'VD'
  | 'VS'
  | 'ZG'
  | 'ZH'

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

export function isPlaceholderCanton(canton: CantonalFoerderung): boolean {
  return JSON.stringify(canton).includes('[PLACEHOLDER')
}

/**
 * Every figure below was read from the named source on 2026-09-07. Federal
 * rates come from EnFV Anhang 2.1 (Stand 1. Juli 2026), the cantonal and
 * municipal programmes from the canton's or municipality's own 2026 documents,
 * feed-in tariffs from the utilities' 2026 tariff sheets. Utilities that only
 * publish "Referenzmarktpreis" are listed with the legal minimum of 6.0 Rp/kWh
 * for systems below 30 kW (Art. 15 EnG, EnV Art. 12), which every grid
 * operator must pay when the quarterly reference price is lower.
 */

const STEUER_HINWEIS =
  'Die Anschaffungskosten einer Solaranlage sind in den meisten Kantonen als Liegenschaftsunterhalt steuerlich abzugsfähig. Details prüfen mit Ihrem Steuerberater oder kantonalem Steueramt.'

const PRONOVO_EIV_2026 =
  'Der Bund zahlt über Pronovo eine Einmalvergütung (KLEIV) für Anlagen unter 100 kW: CHF 360 pro kW bis 30 kW und CHF 300 pro kW für den Anteil von 30 bis 100 kW (angebaute Anlagen, Inbetriebnahme ab 1. April 2025). Einen Grundbeitrag gibt es seit April 2024 nicht mehr. Anlagenteile mit mindestens 75 Grad Neigung erhalten zusätzlich CHF 200 pro kW. Das Gesuch wird nach der Inbetriebnahme eingereicht, die Auszahlung erfolgt ohne Mehrwertsteuer.'

const PRONOVO_SOURCE = {
  label: 'Pronovo, Einmalvergütung Photovoltaik',
  url: 'https://pronovo.ch/de/foerderung/photovoltaik/',
}

const ENFV_SOURCE = {
  label: 'Energieförderungsverordnung EnFV, Anhang 2.1 (Fedlex)',
  url: 'https://www.fedlex.admin.ch/eli/cc/2017/766/de',
}

export const FOERDERUNG_CANTONS: CantonalFoerderung[] = [
  {
    code: 'AG',
    name: 'Aargau',
    nameSlug: 'aargau',
    pronovoEIVSummary: `${PRONOVO_EIV_2026} Im Kanton Aargau ist die Einmalvergütung für private Anlagen die einzige direkte Förderung, dazu kommen kommunale Beiträge in einzelnen Gemeinden.`,
    cantonalProgramSummary: null,
    cantonalProgramAmountChfPerKwp: null,
    solarpflicht: {
      inForce: true,
      sinceYear: 2023,
      summary:
        'Der Aargau setzt die Solarpflicht des Bundes (Art. 45a EnG) über § 26a der kantonalen Energieverordnung um, in Kraft seit 1. Januar 2023: Neubauten mit einer anrechenbaren Gebäudefläche von mehr als 300 m² brauchen eine Photovoltaik- oder Solarthermieanlage mit einer Modulfläche von mindestens 20 Prozent der anrechenbaren Gebäudefläche. Einfamilienhäuser sind ausdrücklich ausgenommen, Sanierungen sind nicht betroffen. Der Grosse Rat hat eine weitergehende Photovoltaikpflicht am 24. März 2026 abgelehnt.',
    },
    einspeiseTariffsByEvu: [
      {
        evu: 'AEW Energie AG (Fixpreis 2026 inkl. Herkunftsnachweis, Anlagen 2 bis 30 kW)',
        tariffRpKwh: 8.2,
      },
      {
        evu: 'Regionalwerke AG Baden (Mindestvergütung bis 30 kW, Referenzmarktpreis falls höher, HKN plus 2.0)',
        tariffRpKwh: 6.0,
      },
      {
        evu: 'Eniwa AG (Mindestvergütung bis 30 kW, Referenzmarktpreis falls höher)',
        tariffRpKwh: 6.0,
      },
    ],
    topGemeindeSubsidies: [
      {
        gemeinde: 'Stadt Aarau',
        summary:
          "Grundbeitrag CHF 500 plus CHF 100 pro kWp für Aufdachanlagen (integrierte Anlagen CHF 600 plus CHF 110 pro kWp, Fassaden CHF 600 plus CHF 120 pro kWp), maximal CHF 15'000 pro Anlage. Gesuch vor Baubeginn über das Meldewesen der Eniwa.",
      },
      {
        gemeinde: 'Stadt Baden',
        summary:
          "Die Stadt erhöht die Einmalvergütung des Bundes um 50 Prozent, maximal CHF 15'000 pro Anlage. Beantragt wird der Beitrag nach der definitiven Bestätigung der Einmalvergütung durch Pronovo.",
      },
    ],
    steuerHinweis:
      "Im Aargau sind Investitionen in eine Solaranlage auf einem bestehenden Gebäude als energiesparende Massnahme vom steuerbaren Einkommen abziehbar, sofern die Arbeiten frühestens fünf Jahre nach Fertigstellung des Gebäudes erfolgen. Bei Neubauten gelten sie als nicht abzugsfähige Anlagekosten. Ab Steuerjahr 2026 wird der Einspeiseerlös nach dem Nettoprinzip besteuert, also nur der Überschuss über die Strombezugskosten und nur ab 10'000 kWh eingespeister Menge.",
    lastUpdated: '2026-09-07',
    sources: [
      {
        label: 'Kanton Aargau, Förderprogramm Energie 2026 (PDF)',
        url: 'https://www.ag.ch/media/kanton-aargau/bvu/energie/foerderungen/foerderprogramm-2026.pdf',
      },
      {
        label: 'Kanton Aargau, Merkblatt Solarpflicht § 26a EnergieV (PDF)',
        url: 'https://www.ag.ch/media/kanton-aargau/bvu/energie/bauen-energie/vollzugshilfen-und-formulare/merkblatt-solarpflicht-26a.pdf',
      },
      {
        label: 'AEW Energie AG, Rücklieferung Fixpreis 2026 (PDF)',
        url: 'https://www.aew.ch/sites/default/files/2025-11/AEW_Ruecklieferung_Fixpreis_2026.pdf',
      },
      {
        label: 'Regionalwerke AG Baden, Rücklieferung Solarstrom 2026',
        url: 'https://www.regionalwerke.ch/privat-geschaeftskunden/angebot/strom/ruecklieferung-solarstrom',
      },
      {
        label: 'Stadt Aarau, Förderprogramm Photovoltaik',
        url: 'https://www.aarau.ch/leben/natur-und-umwelt/foerderprogramm.html/456',
      },
      {
        label: 'Stadt Baden, Förderung Photovoltaik',
        url: 'https://www.baden.ch/de/leben-wohnen/energie-mobilitaet/energie/foerderung/photovoltaik.html/2198',
      },
      {
        label:
          'Kantonales Steueramt Aargau, Merkblatt Liegenschaftsunterhalt (PDF)',
        url: 'https://www.ag.ch/media/kanton-aargau/dfr/dokumente/steuern/natuerliche-personen/merkblaetter-zu-steuern-natuerliche-personen/liegenschaftsunterhalt-luk-stand-22-08-2024.pdf',
      },
      PRONOVO_SOURCE,
      ENFV_SOURCE,
    ],
  },
  {
    code: 'LU',
    name: 'Luzern',
    nameSlug: 'luzern',
    pronovoEIVSummary: `${PRONOVO_EIV_2026} Der Kanton Luzern zahlt keine eigenen Fördergelder für Photovoltaikanlagen oder Batteriespeicher, das kantonale Förderprogramm 2026 deckt Gebäudehülle, Heizungsersatz und thermische Solaranlagen ab.`,
    cantonalProgramSummary: null,
    cantonalProgramAmountChfPerKwp: null,
    solarpflicht: {
      inForce: true,
      sinceYear: 2025,
      summary:
        "Das revidierte Kantonale Energiegesetz (§ 15 KEnG) gilt seit 1. März 2025 und kennt keine Flächengrenze: Alle beheizten Neubauten müssen ihr Stromerzeugungspotenzial angemessen nutzen, bei bestehenden Bauten gilt das bei jeder Dachsanierung (neue Eindeckung oder Abdichtung). Als belegbare Fläche gelten bei Neubauten 50 Prozent der nutzbaren Dachfläche, bei Sanierungen die Hälfte davon. Wer die Anlage nicht baut, zahlt der Gemeinde eine Ersatzabgabe von CHF 1'000 pro nicht realisiertem kW. Ausgenommen sind Teildächer mit einem erwarteten Ertrag unter 800 kWh pro kWp.",
    },
    einspeiseTariffsByEvu: [
      {
        evu: 'ewl energie wasser luzern (Energie ohne HKN, Anlagen bis 500 kWp, HKN plus 2.0)',
        tariffRpKwh: 9.0,
      },
      {
        evu: 'CKW (Mindestvergütung bis 30 kW, Referenzmarktpreis falls höher)',
        tariffRpKwh: 6.0,
      },
    ],
    topGemeindeSubsidies: [
      {
        gemeinde: 'Stadt Luzern',
        summary:
          'Städtischer Beitrag von 20 Prozent der Einmalvergütung und Zuschläge des Bundes, zusätzlich ausbezahlt. Boni: CHF 200 pro kWp bei Kombination mit Dachbegrünung, CHF 100 pro m² für Fassadenanlagen ab 75 Grad Neigung, CHF 300 pro kWp für blendarme Module. Das Gesuch muss vor Baubeginn eingereicht werden (Förderhandbuch 2026).',
      },
      {
        gemeinde: 'Horw',
        summary:
          "Investitionsbeitrag von 20 Prozent der Einmalvergütung, maximal CHF 5'000, nur für bestehende Bauten (vor 2019 erstellt oder bewilligt), Gesuch vor Baubeginn.",
      },
    ],
    steuerHinweis:
      "Im Kanton Luzern sind Investitionen in Photovoltaikanlagen und zugehörige Batteriespeicher auf bestehenden Bauten seit der Steuerperiode 2023 auch bei den Staats- und Gemeindesteuern als Unterhaltskosten abziehbar (nur bei effektivem Abzug und nur der selbst getragene Anteil). Innert drei Jahren nach Erstellung eines Neubaus gilt der Einbau nicht als abzugsfähige Investition. Einspeisevergütungen werden erst ab 10'000 kWh besteuert.",
    lastUpdated: '2026-09-07',
    sources: [
      {
        label: 'Kanton Luzern uwe, Förderprogramme Energie',
        url: 'https://uwe.lu.ch/themen/energie/foerderprogramme',
      },
      {
        label:
          'Kanton Luzern, Förderprogramm Energie 2026, Bedingungen und Beiträge (PDF)',
        url: 'https://uwe.lu.ch/-/media/UWE/Dokumente/Themen/Energie/Foerderprogramm/Foerderbedingungen_Foerderbeitraege.pdf',
      },
      {
        label: 'Kantonales Energiegesetz KEnG (SRL 773), § 15',
        url: 'https://srl.lu.ch/app/de/texts_of_law/773',
      },
      {
        label: 'Kantonale Energieverordnung KEnV (SRL 774), § 13 bis 15',
        url: 'https://srl.lu.ch/app/de/texts_of_law/774',
      },
      {
        label: 'ewl, Einspeisevergütung Stromrücklieferung 2026',
        url: 'https://www.ewl-luzern.ch/energie/strom-produzieren/einspeiseverguetung-stromruecklieferung',
      },
      {
        label: 'CKW, Rücklieferungsvergütung',
        url: 'https://www.ckw.ch/energie/strom/ruecklieferverguetung',
      },
      {
        label: 'Stadt Luzern, Förderprogramm Energie',
        url: 'https://www.stadtluzern.ch/dienstleistungeninformation/6253',
      },
      {
        label: 'Gemeinde Horw, Förderung Solarstromanlagen',
        url: 'https://www.horw.ch/dienstleistungen/7311',
      },
      {
        label: 'Steuern Luzern, Steuerbuch § 39 Nr. 4 Liegenschaftsunterhalt',
        url: 'https://steuerbuch.lu.ch/band1/einkommenssteuer/tatsaechliche_liegenschaftsunterhalts_und_verwaltungskosten',
      },
      PRONOVO_SOURCE,
      ENFV_SOURCE,
    ],
  },
  {
    code: 'SG',
    name: 'St. Gallen',
    nameSlug: 'st-gallen',
    pronovoEIVSummary: `${PRONOVO_EIV_2026} Der Kanton St. Gallen fördert Photovoltaik und Batteriespeicher nicht direkt: Das Förderungsprogramm Energie 2025 bis 2030 enthält keine PV-Massnahme, verlangt aber bei geförderten Dachdämmungen den Nachweis einer Photovoltaikanlage.`,
    cantonalProgramSummary: null,
    cantonalProgramAmountChfPerKwp: null,
    solarpflicht: {
      inForce: true,
      sinceYear: 2021,
      summary:
        "Seit 1. Juli 2021 müssen alle Neubauten im Kanton St. Gallen einen Teil ihres Strombedarfs selbst erzeugen (Art. 5b und 5c Energiegesetz): mindestens 10 Watt pro m² Energiebezugsfläche, höchstens 30 kW pro Gebäude, ohne Flächengrenze. Alternativ kann der Energiebedarf um 5 kWh pro m² beheizter Fläche und Jahr gesenkt oder eine Ersatzabgabe von CHF 2'700 pro kWp der geforderten Anlage bezahlt werden. Anbauten, Aufbauten und neubauartige Umbauten gelten als Neubauten, Sanierungen bestehender Gebäude sind nicht betroffen.",
    },
    einspeiseTariffsByEvu: [
      {
        evu: 'St.Galler Stadtwerke (Energie, Mindestvergütung bis 30 kW, Referenzmarktpreis falls höher)',
        tariffRpKwh: 6.0,
      },
      {
        evu: 'St.Galler Stadtwerke (Total mit ökologischem Mehrwert 4.6 und Flexibilität 2.0)',
        tariffRpKwh: 12.6,
      },
      {
        evu: 'SAK St.Gallisch-Appenzellische Kraftwerke (Mindestvergütung bis 30 kW, HKN plus 1.5)',
        tariffRpKwh: 6.0,
      },
    ],
    topGemeindeSubsidies: [
      {
        gemeinde: 'Stadt St. Gallen',
        summary:
          'Energiefonds: 50 Prozent des KLEIV-Leistungsbeitrags des Bundes für Anlagen bis 100 kWp, seit 1. Januar 2025 nur noch für Anlagen, die die belegbare Dachfläche vollständig nutzen (eigenverbrauchsoptimierte Anlagen erhalten nichts). Bonus von 20 Prozent des KLEIV-Leistungsbeitrags bei Kombination mit einer Biodiversitäts-Dachbegrünung.',
      },
      {
        gemeinde: 'Stadt Wil',
        summary:
          "CHF 300 pro kWp, maximal CHF 30'000 pro Anlage und höchstens 30 Prozent der Investitionskosten. Gesetzlich vorgeschriebene Mindestgrössen (Solarpflicht) werden nicht gefördert. Gesuche seit August 2025 über das eFörderportal der Energieagentur St. Gallen.",
      },
      {
        gemeinde: 'Stadt Gossau',
        summary:
          "Energiefonds der Stadtwerke Gossau: CHF 300 pro kWp ab 3 kWp, maximal CHF 3'000. Batteriespeicher ab 4 kWh (kobaltfrei) CHF 600, maximal 25 Prozent der Speicherkosten.",
      },
    ],
    steuerHinweis:
      'Gemäss St. Galler Steuerbuch (StB 44 Nr. 3, Stand 1. Januar 2026) sind die Installation einer Photovoltaikanlage und eines Batteriespeichers auf dem eigenen Haus zu 100 Prozent als Unterhaltskosten abziehbar, gekürzt um erhaltene Förderbeiträge. Innert zwei Jahren nach einem Neubau gelten sie als nicht abzugsfähige Anlagekosten. Übersteigende Kosten können in die zwei folgenden Steuerperioden übertragen werden.',
    lastUpdated: '2026-09-07',
    sources: [
      {
        label:
          'Kanton St. Gallen, Förderungsprogramm Energie 2025 bis 2030 (RRB 2025/158, PDF)',
        url: 'https://publikationen.sg.ch/fileadmin/ekab/files/2025/03/00.197.405/attachments/RRB_2025_158_Beilage_Foerderungsprogramm_Energie_2025-2030.pdf',
      },
      {
        label: 'Kanton St. Gallen, Energiegesetz (sGS 741.1), Art. 5b und 5c',
        url: 'https://www.gesetzessammlung.sg.ch/app/de/texts_of_law/741.1',
      },
      {
        label:
          'Kanton St. Gallen, Energieverordnung (sGS 741.11), Art. 4c bis 4e',
        url: 'https://www.gesetzessammlung.sg.ch/app/de/texts_of_law/741.11',
      },
      {
        label: 'St.Galler Stadtwerke, Einspeisetarife ab 1. Januar 2026',
        url: 'https://www.sgsw.ch/news/sgsw_news/2025/11/neue-einspeisetarife-fuer-strom-aus-erneuerbaren-produktionsquel.html',
      },
      {
        label: 'SAK, Energieprodukte 2026 für Rücklieferungen (PDF)',
        url: 'https://www.sak.ch/downloads/strom/produktsammlung_2026_energie_rl.pdf',
      },
      {
        label: 'Stadt St. Gallen, Energiefonds',
        url: 'https://www.stadt.sg.ch/home/raum-umwelt/energie/energiefonds.html',
      },
      {
        label: 'Stadt Wil, Vollzugsreglement Energiefonds',
        url: 'https://wil-sg.tlex.ch/app/de/texts_of_law/7.3-2.1',
      },
      {
        label: 'Stadtwerke Gossau, Energiefonds',
        url: 'https://sw-gossau.ch/dienstleistungen/energiefachstelle/energiefonds/',
      },
      {
        label: 'St. Galler Steuerbuch, StB 44 Nr. 3 (PDF)',
        url: 'https://www.sg.ch/content/dam/sgch/steuern-finanzen/steuern/steuerbuch/art-29-52-stg/044_3.pdf.ocFile/044_3.pdf',
      },
      PRONOVO_SOURCE,
      ENFV_SOURCE,
    ],
  },
  {
    code: 'SH',
    name: 'Schaffhausen',
    nameSlug: 'schaffhausen',
    pronovoEIVSummary: `${PRONOVO_EIV_2026} Im Kanton Schaffhausen ist die Einmalvergütung die einzige Förderung für die Photovoltaikanlage selbst, das Energieförderprogramm 2026 des Kantons verweist dafür auf Pronovo.`,
    cantonalProgramSummary:
      "Der Kanton fördert keine Photovoltaikanlage pro kWp, aber stationäre Batteriespeicher für netzgekoppelte Solarstromanlagen: einmaliger Investitionsbeitrag von CHF 1'000 pro Anlage, höchstens 25 Prozent der Gesamtinvestition. Bedingungen: nutzbare Kapazität mindestens 10 kWh, Neuanlage, Installation durch eine Fachperson, Gesuch vor Installationsbeginn, und auf Verlangen des EVU sind 10 Prozent der Kapazität gegen Entgelt bereitzustellen (Energieförderprogramm 2026, Kapitel 7.1).",
    cantonalProgramAmountChfPerKwp: null,
    solarpflicht: {
      inForce: true,
      sinceYear: 2026,
      summary:
        'Mit dem neuen Energiegesetz und der Energieverordnung, in Kraft seit 1. Januar 2026, müssen Neubauten und neubauartige Umbauten das solare Potenzial ihrer geeigneten Dachflächen (ab 85 Prozent Globalstrahlung) mit Solarstromanlagen nutzen, bei Neubauten zusätzlich die Hälfte der südlich orientierten Fassadenflächen ab 75 Prozent Globalstrahlung. Neubauten ohne Energiebezugsfläche ab 150 m² anrechenbarer Gebäudefläche müssen mindestens 60 Prozent der Dachfläche belegen. Bei umfassenden Dachsanierungen ab 300 m² anrechenbarer Gebäudefläche gilt die Pflicht ebenfalls (mindestens 30 W pro m² Energiebezugsfläche oder 60 Prozent der Dachfläche). Für laufende Vorhaben gilt eine Übergangsfrist bis 31. Dezember 2026.',
    },
    einspeiseTariffsByEvu: [
      {
        evu: 'EKS AG (Referenzmarktpreis des BFE pro Quartal, gesetzliche Mindestvergütung bis 30 kW)',
        tariffRpKwh: 6.0,
      },
      {
        evu: 'SH POWER (gesetzliche Mindestvergütung bis 30 kW, Referenzmarktpreis falls höher)',
        tariffRpKwh: 6.0,
      },
    ],
    topGemeindeSubsidies: [
      {
        gemeinde: 'Stadt Schaffhausen, Neuhausen am Rheinfall, Thayngen',
        summary:
          'Die drei Gemeinden stocken kantonale Beiträge automatisch mit dem Kantonsgesuch auf (Stadt Schaffhausen 50 Prozent des Kantonsbeitrags, Neuhausen 25 Prozent), allerdings nur für Massnahmen des kantonalen Programms wie Gebäudehülle und Heizungsersatz. Einen eigenen Beitrag pro kWp Photovoltaik zahlt keine der drei Gemeinden.',
      },
    ],
    steuerHinweis: STEUER_HINWEIS,
    lastUpdated: '2026-09-07',
    sources: [
      {
        label:
          'Kanton Schaffhausen, Energieförderprogramm 2026, Fördersätze und Bedingungen (PDF)',
        url: 'https://sh.ch/CMS/get/file/7dcdc4d7-1c24-40d7-a236-57a1367787e6',
      },
      {
        label:
          'Kanton Schaffhausen, Das neue Energiegesetz, Neuerungen ab 01.01.2026 (PDF)',
        url: 'https://sh.ch/CMS/get/file/ecfbb114-abf7-4f24-96a8-c4e62d173f1d',
      },
      {
        label:
          'Kanton Schaffhausen, Energieverordnung EnerV (SHR 730.101), § 26f bis 26h',
        url: 'https://rechtsbuch.sh.ch/app/de/texts_of_law/730.101',
      },
      {
        label: 'EKS AG, Rückliefertarife 2026',
        url: 'https://www.eks.ch/news/eks-rueckliefertarife-2026',
      },
      {
        label: 'SH POWER, Rückliefervergütung und Herkunftsnachweise',
        url: 'https://www.shpower.ch/ruecklieferung.html',
      },
      PRONOVO_SOURCE,
      ENFV_SOURCE,
    ],
  },
]
