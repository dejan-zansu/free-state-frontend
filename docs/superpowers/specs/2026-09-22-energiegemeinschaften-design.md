# Energiegemeinschaften guide hub (ZEV, vZEV, LEG), design

Date: 2026-09-22
Status: approved in chat by Dejan on 2026-09-22, spec pending review
Repo: `frontend` only, no backend change

## 1. Goal

Explain ZEV, vZEV and LEG on freestate.ch so that owners of multi-family
buildings, Verwaltungen, STWEG, Genossenschaften and companies understand
which model fits their situation, and position Free State AG as the party
that plans the energy concept and runs the project from analysis to
registration, contracts and billing. The reference for depth and structure
is lokalerstrom.ch (Swisspower's neutral portal), the reference for the
visual is Ivan's isometric sketch of four islands (ZEV, vZEV, LEG,
Praxismodell) joined by glowing energy lines.

Search demand (DataForSEO, Switzerland, German, September 2026):

| Keyword | Searches per month | Difficulty |
|---|---|---|
| zev | 1'000 | low (doc 66: 0) |
| vzev | 720 | n/a |
| leg strom | 170 | 3 |
| zev abrechnung | 140 | n/a |
| lokale elektrizitätsgemeinschaft | 110 | n/a |
| zusammenschluss zum eigenverbrauch | 90 | 15 |
| virtueller zev | 70 | n/a |
| eigenverbrauchsgemeinschaft | 50 | n/a |
| zev gründen, praxismodell vnb, leg solar, zev solar | 20 to 30 each | n/a |

No umbrella term carries volume ("energiegemeinschaft schweiz",
"mieterstrom schweiz", "stromgemeinschaft" are absent or at 10). The three
model pages rank, the hub exists for navigation and internal linking.

## 2. Decisions taken

| Decision | Choice | By |
|---|---|---|
| Scope | Hub plus three model pages. Praxismodell is a section on the vZEV page and a column in the comparison table, not a page. | Dejan, 2026-09-22 |
| Locales | German content only, served under all four locale prefixes like `/foerderung/[kanton]` does today. Translations later. | Dejan, 2026-09-22 |
| Countries | Switzerland in this build. Dejan confirmed on 2026-09-22 that FSA is expanding to DE and AT, so DE (Mieterstrom, gemeinschaftliche Gebäudeversorgung) and AT (GEA, Energiegemeinschaften) pages are a planned follow-up, not parked. | Dejan, 2026-09-22 |
| Visual | Real 3D. One scripted Blender scene exports an interactive GLB for the hub and static renders for the model pages. Fallback if the look fails after one iteration: static image plus SVG hotspots, same layout, one day. | Dejan, 2026-09-22 |
| FSA role | Project lead and coordinator, per Ivan's mail of 2026-09-22: analysis of the building, proposal of the model, coordination of EW, meters, registration, contracts, billing, battery where useful. No prices on the page. | Ivan, 2026-09-22 |
| Existing claim | The "ZEV-Abrechnungsplattform" bullet on the SolarFree MFH page becomes "ZEV-Abrechnung und Koordination". Ivan confirmed FSA coordinates billing, he did not confirm a platform. | Dejan, 2026-09-22 |
| References | None on the page. The bowling center, Jota AG and Winterhalter in Ivan's mail were examples to explain the models, not material for the site. | Dejan, 2026-09-22 |
| Ivan's JPEG | Not used on the site. Photoreal AI style would clash with the low-poly scene and the rights are unclear. | Dejan, 2026-09-22 |

## 3. Out of scope

- DE and AT pages.
- A Praxismodell page.
- French, Italian and English content.
- A tariff calculator like lokalerstrom's LEG-Tarifrechner. The worked
  example on each page is static.
- Anwendungsbeispiele as separate pages. Two or three scenarios live as a
  section on each model page.
- Glossary page.
- Any backend or database work. Content is a typed data file.

## 4. Information architecture and URLs

```
/ratgeber                                  index, cards to the four pages below
/ratgeber/energiegemeinschaften            hub, interactive scene, decision helper, comparison
/ratgeber/zev                              Zusammenschluss zum Eigenverbrauch
/ratgeber/vzev                             virtueller ZEV, with Praxismodell section
/ratgeber/leg                              lokale Elektrizitätsgemeinschaft
```

`/ratgeber` is the hub that doc 66 (2026-09-21) asks for. This cluster is
its first content. Later clusters (Kosten, Stromspeicher, Wärmepumpe,
bidirektionales Laden) are not part of this work.

Routing: all five paths are added to `src/i18n/routing.ts` with the same
German slug in all four locales, like `/foerderung`. Canonical for every
locale points to the German URL, because the content is German. The sitemap
lists the German URL only. No `hreflang` alternates for these pages.

Breadcrumbs: Home > Ratgeber > Energiegemeinschaften > ZEV.

## 5. Hub page, `/ratgeber/energiegemeinschaften`

Sections, top to bottom:

1. Hero. H1 "ZEV, vZEV und LEG: Solarstrom im Gebäude, in der Nachbarschaft
   und im Quartier teilen". One paragraph. No image, the scene follows.
2. Interactive scene (section 8). Full width, 4:3 on mobile, 16:10 on
   desktop, poster until loaded.
3. Decision helper. Three questions as a short flow: same
   Netzanschlusspunkt, adjacent buildings on the same Verteilkabine or
   Trafo, or spread across the Gemeinde. Each answer names the model and
   links its page.
4. Comparison table. Columns ZEV, vZEV, Praxismodell VNB, LEG. Rows: seit
   wann, wer misst, wer rechnet ab, Netznutzungsentgelt auf internem Strom,
   Mindestanteil Produktion, räumliche Grenze, Mieter können ablehnen,
   Gesetzesgrundlage.
5. Three model cards with the per-island render and a two-sentence summary.
6. "So begleitet Free State AG Ihr Projekt", six steps from Ivan's mail:
   Objektanalyse, Modellwahl, Koordination mit dem EW, Messkonzept und
   Zähler, Anmeldung und Verträge, Abrechnung und Betrieb, plus Batterie
   where useful.
7. (removed, no project notes)
8. FAQ, six to eight questions across models, with FAQPage JSON-LD.
9. Latest blog posts, `LatestPostsSection topic="communities"`.
10. CTA. Primary "Objekt prüfen lassen" to `/gewerbe/rechner`, secondary
    consultation dock.

## 6. Model pages, `/ratgeber/zev`, `/ratgeber/vzev`, `/ratgeber/leg`

Same skeleton for all three, content from the data file:

1. Hero. H1 with the long name, one-paragraph definition, "seit" date,
   per-island render as image, CTA.
2. "Für wen". Owner of an MFH, Verwaltung, STWEG, Genossenschaft, Gewerbe
   or Industrie, Gemeinde. Two lines each on why this model fits.
3. "So funktioniert es". Animated SVG flow diagram (section 9) and four to
   six steps.
4. "Gesetzliche Grundlage". Law, article, in-force date, link to Fedlex or
   the BFE Leitfaden.
5. "Voraussetzungen". Three to four cards.
6. "Wer macht was". Actor cards: VNB, Produzent or Betreiber, Teilnehmer,
   Dienstleister, and a highlighted card for Free State AG's role.
7. "Rechenbeispiel". One worked example in Rp./kWh with a named source
   tariff and date. ZEV and vZEV show the pauschal 80% method and the
   effective-cost method side by side. LEG shows the Netznutzungsentgelt
   reduction of 40% on the internal share.
8. "Rechte der Mieterinnen und Mieter" (ZEV and vZEV) or "Rechte der
   Teilnehmenden" (LEG).
9. "Typische Situationen". Two or three scenarios, one paragraph each.
10. vZEV page only: "Alternative: Praxismodell VNB", what it is, when the
    VNB offers it, how it differs from a vZEV.
11. "So läuft es mit Free State AG". The six steps from the hub, phrased
    for this model.
12. FAQ, eight to ten questions, FAQPage JSON-LD.
13. Links to the other two models and the hub.
14. Latest blog posts, topic `communities`.
15. CTA as on the hub.

## 7. Blender scene pipeline

One script produces every visual asset. No manual Blender work, no
external models, no textures.

Location: `frontend/scripts/3d/energiegemeinschaften/build_scene.py`.
Run: `blender -b -P build_scene.py -- --out ../../../public`. Blender
5.2.2 LTS is installed at `/opt/homebrew/bin/blender`.

Layout, matching Ivan's sketch:

- White ground plane. Four rounded island slabs with a small drop below
  ground level so model-viewer's contact shadow reads as a soft shadow.
- ZEV, top left. Three MFH (four to five storeys, balconies as thin slabs)
  on one plot. One Netzanschluss cabinet at the plot edge. Pulses run from
  the roofs to the cabinet and into the buildings, never off the plot.
- vZEV, bottom left. Three EFH with pitched roofs on adjacent parcels,
  hedges between parcels, one Verteilkabine on the street. Pulses run from
  each roof over the parcel border to the Verteilkabine and on to the
  neighbours.
- LEG, right. One industrial hall with a saw-tooth roof and two trucks,
  one office block. Pulses run over the street line to the ZEV and vZEV
  islands, which is the only cross-island flow.
- Praxismodell, bottom right. One MFH with the VNB meter cabinet at the
  facade, highlighted in lime. Deviates from the sketch on purpose, the
  Praxismodell is a VNB-run alternative for an MFH, not a commercial
  building.
- Roads in light grey between islands, trees as icospheres on cylinders,
  a few cars as bevelled boxes.

Style tokens, taken from `globals.css`:

| Token | Value | Use |
|---|---|---|
| primary | #062e25 | label pills, meter cabinets |
| lime | #b7fe1a | pulses, highlighted island tint, LEG label |
| lime-soft | #cdea67 | flow lines at rest |
| panel blue | #1f3a5f | PV panels, with a 1 px lighter frame grid |
| facade | #f4f2ec | building walls |
| ground | #ffffff | ground plane |
| road | #d9dbd4 | roads |
| foliage | #5f8f3e and #7fae4f | trees |

Materials are flat PBR, roughness 0.85, no textures. Each island's ground
slab has its own material named `island_<zone>` so the viewer can tint it.

Animation: one glTF animation clip named `flow`, containing the position
tracks of every pulse sphere. model-viewer plays one clip at a time, so all
pulses must sit in one clip. Blender's glTF exporter setting for this is
verified at implementation time (animation mode "Scene" in the 4.x and 5.x
exporter). Loop length 6 s. Twenty to thirty pulses in total.

Zone anchors: empties named `anchor_zev`, `anchor_vzev`, `anchor_leg`,
`anchor_praxismodell` placed above each island. The script writes their
world coordinates and a camera preset per zone into a JSON sidecar.

Exports:

```
public/3d/energiegemeinschaften.glb        target under 1.5 MB, checked by the script
public/3d/energiegemeinschaften.json       { zones: { zev: { anchor:[x,y,z], orbit:"..", target:".." }, ... }, overview: {...} }
public/ratgeber/energiegemeinschaften.webp full scene, 2400 x 1500, poster and OG image
public/ratgeber/zev.webp                   per-island render, 1600 x 1200
public/ratgeber/vzev.webp
public/ratgeber/leg.webp
```

Renders come from EEVEE inside the same script run, same camera angle as
the sketch (about 35 degrees elevation, 45 degrees azimuth), white
background, PNG. A small Node script using `sharp` (already a Next.js
dependency) converts PNG to WebP, because Blender's Python has no WebP
encoder.

Look review: the first full-scene render is shown to Dejan before any
viewer or page work starts. One iteration is budgeted. If the look is not
accepted after that, the fallback in section 2 applies.

## 8. Viewer component

`src/components/ratgeber/CommunityScene.tsx`, client component. Reuses the
one-time `registerModelViewer` loader from
`src/components/products/ModelViewer.tsx` by moving that function into
`src/lib/model-viewer.ts` and importing it from both places.

Behaviour:

- Poster shown until the GLB has loaded. `loading="lazy"`, `reveal="auto"`.
  Fixed aspect ratio box, so no layout shift.
- `animation-name="flow"` and `autoplay`, unless
  `prefers-reduced-motion` matches, in which case no animation attribute
  is set and the scene is static.
- Four hotspots from the JSON anchors, rendered as `<button
  slot="hotspot-<zone>" data-position data-normal>` with the label pill
  design from the sketch (rounded pill, primary or lime background, short
  arrow glyph). They are real buttons, focusable and keyboard operable.
- Hover or focus on a hotspot tints that island's `island_<zone>` material
  towards lime through model-viewer's scene graph API
  (`model.materials`, `pbrMetallicRoughness.setBaseColorFactor`). Blur or
  mouse-out restores it.
- Click or tap sets `cameraTarget` and `cameraOrbit` to the zone preset
  with `interpolation-decay="200"` for the fly-to, opens a side panel (right
  on desktop, bottom sheet on mobile) with the model's four-sentence
  summary and a "Mehr zu <Modell>" link, and shows an "Übersicht" button
  that resets to the overview preset. The Praxismodell panel links to
  `/ratgeber/vzev#praxismodell`, since it has no page of its own. With
  reduced motion the camera jumps instead of flying.
- URL hash sync. `#zev`, `#vzev`, `#leg`, `#praxismodell` open that zone on
  load and update on click, so the model pages can deep-link back into the
  scene.
- Below 640 px the four labels are also rendered as a chip row under the
  canvas, driving the same state, because floating hotspots overlap on a
  narrow viewport.
- Wheel zoom is armed only after the visitor clicks into the scene, copied
  from `ModelViewer.tsx`, so Lenis page scroll is not swallowed.
- Load failure shows the poster with the chip row, which still navigates.
- Camera limits: `min-camera-orbit` and `max-camera-orbit` keep the
  elevation between 20 and 70 degrees and the radius inside a sane range,
  so the visitor cannot look under the ground plane.

## 9. Flow diagram on model pages

`src/components/ratgeber/FlowDiagram.tsx`, a small data-driven SVG. Nodes
(PV, Zähler, Wohnung, Netzanschluss, Verteilkabine, Trafo, VNB, Netz) and
edges are declared per model in the data file. Edges carry a dashed lime
stroke animated with `stroke-dashoffset`, disabled under
`prefers-reduced-motion`. Node labels are plain text in the SVG so they
are readable by screen readers and search engines.

## 10. Content data model

`src/data/energiegemeinschaften.ts`, typed, German strings, following
`src/data/foerderung-cantons.ts`. A test in `src/data/__tests__/` checks
that every model has a `since` date, at least six FAQ items, at least one
legal reference with a `checked` date, and that no string contains an em
dash.

```ts
export type CommunityModelSlug = 'zev' | 'vzev' | 'leg'

export interface LegalRef {
  law: string        // 'EnG', 'EnV', 'StromVG', 'StromVV'
  article: string    // 'Art. 17 und 18'
  url: string        // Fedlex or BFE publication
  checked: string    // '2026-09-22'
}

export interface FlowSpec {
  nodes: { id: string; label: string; x: number; y: number; kind: 'pv' | 'meter' | 'unit' | 'grid' | 'cabinet' | 'vnb' }[]
  edges: { from: string; to: string; internal: boolean }[]
}

export interface CommunityModel {
  slug: CommunityModelSlug
  name: string            // 'ZEV'
  longName: string        // 'Zusammenschluss zum Eigenverbrauch'
  since: string           // '2018-01-01'
  seo: { title: string; description: string }
  hero: { title: string; lead: string; image: string; imageAlt: string }
  audience: { label: string; text: string }[]
  steps: { title: string; text: string }[]
  flow: FlowSpec
  legal: { summary: string; refs: LegalRef[] }
  requirements: { title: string; text: string }[]
  actors: { name: string; bullets: string[]; isFsa?: boolean }[]
  example: { title: string; assumptions: string[]; rows: { label: string; value: string }[]; source: string; sourceDate: string }
  rights: { title: string; text: string }[]
  scenarios: { title: string; text: string }[]
  praxismodell?: { title: string; text: string }[]   // vZEV only
  fsaSteps: { title: string; text: string }[]
  faq: { q: string; a: string }[]
}
```

The hub's comparison table and decision helper are separate exports in
the same file, so no string lives in a component.

## 11. Verified legal facts

Checked on 2026-09-22 against the Bundesrat's Erläuterungen to the StromVV
revision (newsd.admin.ch, attachment 91799), the VSE note "Stromgesetz:
Neue Regelungen und viele Umsetzungsfragen", the BFE Leitfaden
Eigenverbrauch (pubdb.bfe.admin.ch publication 9329), the VSE Handbuch
Eigenverbrauchsregelung HER-CH 2025, HEV Schweiz and lokalerstrom.ch.
Every number below goes into the data file with its reference and date.
Nothing else goes on the pages without the same treatment.

ZEV

- Basis: EnG Art. 17 and 18, EnV Art. 14 to 17. Possible since 2018.
- All participants behind the same Netzanschlusspunkt. The ZEV is one
  Endverbraucher towards the VNB.
- Production of at least 10 percent of the Anschlussleistung of the
  participants (EnV Art. 15).
- Private meters, the ZEV operator reads and bills. Rebuilding the
  Elektroverteilung is usually needed in existing buildings.
- Tenant billing: pauschal at most 80 percent of what the tenant would
  pay for the external Standardstromprodukt including Nebenkosten (EnV
  Art. 16 Abs. 1 Bst. b), or effective costs (EnV Art. 16 Abs. 2) capped
  at 100 percent of the external product, with at most half of the saving
  added on top of costs. Grid electricity is passed through 1:1.
- Existing tenants may refuse to join. New tenants can be bound in the
  Mietvertrag. A tenant can leave with three months notice to the month
  end if billing is wrong or missing. Disputes go to the
  Schlichtungsbehörde. No rent increase for the PV, the plant is
  amortised through the internal tariff.

vZEV

- Possible since 2025-01-01 (first Umsetzungspaket of the Stromgesetz).
- Participants on the same Verteilkabine, the same Sammelschiene of a
  Trafostation, or the same spot on the Stammkabel in a Muffennetz.
- The VNB's smart meters measure, the VNB delivers 15-minute data (SDAT)
  to the vZEV operator and issues one Sammelrechnung for grid electricity.
  No private meters, no rebuild of the Elektroverteilung.
- Same 10 percent rule as ZEV, with Pauschalwerte for MFH per VSE HER-CH
  2025.
- The VNB answers a Netztopologie request within 15 days and unlocks the
  Kundenschnittstelle on the smart meter within 10 Arbeitstage (source:
  Swisspower lokalerstrom.ch, Betriebsmodell vZEV, checked 2026-09-22).
- Anschlussleitungen between building and Verteilkabine may be used,
  no Netznutzungsentgelt on the internal share.
- Same tenant rules as ZEV.

Praxismodell VNB

- Not a ZEV under EnG Art. 17. Each tenant stays an Endverbraucher of the
  VNB with the VNB's meters and the VNB's bill. The VNB bills the solar
  share at the owner's tariff and grid electricity at its own.
- Offered by some VNB only, on their terms. Tenant consent required.
  Netznutzungsentgelt only on the grid-drawn share, shown transparently on
  the bill (ElCom conditions, BFE Leitfaden section 2.1).

LEG

- Basis: StromVG Art. 17d and 17e, StromVV Art. 19e to 19h. Possible
  since 2026-01-01. VNB have three months to implement a registration.
- Same VNB, same Gemeinde, Netzebene 5 or 7, at most 36 kV. Every
  production plant must be able to reach every consumer without a higher
  Netzebene.
- Production of at least 5 percent of the Anschlussleistung of the
  members (StromVV Art. 19e Abs. 1). Storage does not count towards
  Anschlussleistung.
- Every Verbrauchsstätte, plant or storage belongs to one LEG only. A ZEV
  or vZEV can join a LEG as one member.
- VNB smart meters are mandatory. The VNB keeps the customer relationship
  with every member, bills Netznutzung, Messung and Grundversorgung, and
  delivers the internal-flow data to the LEG.
- Netznutzungstarif reduced by 40 percent on the internal share when all
  members sit on one Leitungsstrang, 20 percent when a transformation is
  needed (StromVV Art. 19h). The law allows up to 60 percent (StromVG Art.
  17e Abs. 3). The reduction touches the Netznutzungstarif only, not SDL,
  Stromreserve, Netzzuschlag or Abgaben an das Gemeinwesen.
- Internal price is free. Written agreement required (StromVV Art. 19f).
  HKN for internal electricity are cancelled. Formation and dissolution
  three months in advance to the month end. The VNB answers a
  Netztopologie request within 15 Arbeitstagen.

## 12. Free State AG role, copy rules

- Every sentence about what FSA does comes from Ivan's mail of
  2026-09-22 and is phrased as planning and coordination: "Wir analysieren
  das Objekt, schlagen das passende Modell vor und koordinieren EW,
  Zähler, Anmeldung, Verträge und Abrechnung." No "Plattform", no
  prices, no promise about who signs tenant contracts.
- The SolarFree MFH page string
  `solarAboMulti.includes.items.zevBillingPlatform.title` changes to
  "ZEV-Abrechnung und Koordination" in all four message files, and the
  page gets a link to `/ratgeber/energiegemeinschaften`.
- References stay anonymised as in section 2. A sentence about the LEG in
  preparation says it is in preparation.
- Brand voice: "ZEV" spelled out as "Zusammenschluss zum Eigenverbrauch"
  on first use per page (BRAND_VOICE.md). No em dashes anywhere, no
  semicolons in prose. Minimum 16 px body text.

## 13. Technical integration

- Routes: five entries in `src/i18n/routing.ts` with the German slug in
  all four locales. Pages under `src/app/[locale]/ratgeber/...`, each a
  server component that reads the data file and composes sections from
  `src/components/ratgeber/`.
- Metadata through the existing SEO metadata helper, canonical forced to
  the German URL for every locale, OG image
  `/ratgeber/energiegemeinschaften.webp`.
- JSON-LD: `buildBreadcrumbsFromPath` on all pages, `buildFAQPageJsonLd`
  on the hub and model pages.
- Sitemap: German URLs for the five pages, `lastModified` set to the
  ship date, in `src/app/sitemap.ts`. The sitemap test is extended.
- Entry points: "Energiegemeinschaften" in the Gewerbe menu and in the
  footer, a link block on the SolarFree MFH page, and the `communities`
  blog topic linking to the hub if the blog topic-to-page map is extended
  (`TOPIC_PATHS` in `src/lib/blog/topics.ts` currently covers page topics
  only, decided at implementation).
- Assets under `public/3d/` and `public/ratgeber/`, versioned with the
  code. No R2.
- i18n parity: the `i18n-parity-checker` will report German strings in
  the data file and the ratgeber components. That is the accepted
  exception, same as `foerderung-cantons.ts`. Only the two message-file
  changes (MFH bullet, nav labels) need all four locales.

## 14. Verification

- `npx tsc --noEmit` clean, `npm run lint` clean, `npm test` green
  including the new data test and the extended sitemap test.
- GLB size printed by the build script and under 1.5 MB.
- Browser check in Chrome on the hub: poster, load, pulses, hover tint,
  fly-to, panel, hash deep link, reduced-motion state, mobile chip row,
  wheel zoom not stealing scroll. This is a 3D interaction, the
  no-browser-for-plain-text rule does not apply.
- Lighthouse on the hub, desktop and mobile, no CLS from the scene and LCP
  on the poster image.
- Grep for the em dash in `src/data/energiegemeinschaften.ts`,
  `src/components/ratgeber/` and the four message files.
- `prod-safety-reviewer` before push, as for every push to main.

## 15. Order of work

1. Blender script, GLB, JSON and renders. Look review with Dejan.
2. Viewer component and flow diagram, wired to the JSON and a stub data
   file. Browser check.
3. Data file with the verified facts, worked examples and German copy.
4. Pages, routing, metadata, JSON-LD, sitemap, nav and MFH page edit.
5. Verification list in section 14.

The writing-plans skill turns this into the task plan.

## 16. Open items

- Ivan: should FSA present the Praxismodell VNB as something it arranges
  with the EW, or only explain it? Until answered the vZEV section
  explains it only.
- Ivan: written consent from the Bowling customer, Jota AG and
  Winterhalter before any name goes on the page.
- Dejan and Ivan: the DE and AT decision, parked.
