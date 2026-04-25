# SEO & GEO Strategy — Free State AG

**Status:** Draft pending user approval
**Date:** 2026-04-24
**Scope:** freestate.ch, 12-month strategic horizon
**Author:** Claude (acting as SEO/GEO strategist)

---

## 1. Context

freestate.ch launched a few days ago. The site is a Next.js 15 App Router application with `next-intl`, ~40-50 public-facing marketing pages plus an admin-managed blog. Currently there is effectively **no SEO implemented**:

- Only the root layout has metadata; no public page defines its own title, description, canonical, OG tags, or structured data.
- No `sitemap.ts`, no `robots.ts`, no `hreflang`, no JSON-LD.
- Root `<html lang>` is hardcoded `"en"` with a German `<title>` — a contradictory language signal.
- Locale configuration is inconsistent (`next-intl.config.js` lists 6 locales, `routing.ts` 3, `messages/` has 4) — duplicate-content risk.
- Blog images render with `unoptimized` — bad for image ranking and Core Web Vitals.
- Admin and dashboard routes are not disallowed from crawling.
- GTM container exists (`GTM-MF4MHZRP`) but analytics is gated off in non-production.

The site's launch timing is actually an SEO advantage: **we have no backlink equity to protect**, so we can freely restructure URLs and locale defaults without 301-redirect penalties.

## 2. Business Constraints (confirmed with stakeholder)

| Decision | Value |
|---|---|
| Target market | Switzerland only |
| Geographic footprint | DE-Switzerland (19 cantons) |
| Primary language | DE |
| Secondary languages | FR, IT (second-class) |
| EN | Minimal — retained for international investor page only |
| ES, SR | **Drop from codebase** (broken config, no content) |
| Revenue focus | Residential (>70% of revenue) |
| Primary product differentiator | Solar Free / Solar Direct (subscription / PPA) |
| Primary competitor | Helion (AMAG Group) |
| Content capacity | Native DE writer, 4+ long-form posts/month |
| GBP | Verified, physical office exists |
| GSC / GA4 | Verified but <1 month data; analytics flag currently off in prod (needs confirmation) |
| SEO tooling | None — free stack until month 3 bottleneck |

## 3. Goals & Success Criteria (12 months)

### Ranking goals
- **Top 3** for all "Free State AG" brand queries and variants.
- **Top 3** for the full subscription-category cluster: "Solar Abo Schweiz", "Solaranlage mieten Schweiz", "Photovoltaik Contracting Schweiz", "Solaranlage ohne Eigeninvestition", etc.
- **Top 5** for 8+ cantonal queries: "Solaranlage Zürich", "Photovoltaik Aargau", etc.
- **Top 10** for 15+ residential long-tail queries: "Solaranlage Kosten Einfamilienhaus", "Wärmepumpe Förderung [Kanton]", "Batteriespeicher 10 kWh Preis", etc.
- **Not a 12-month goal:** outranking Helion on "Solaranlage Schweiz" head-term. Deliberately out of scope.

### Local goals
- 40+ verified GBP reviews in 90 days
- Top-3 Google Local Pack in home canton for core services
- Listed in 15+ Swiss industry directories (Swissolar, EIT.swiss, EnergieSchweiz, cantonal Energiefachstellen, MyClimate, etc.)

### Traffic / conversion goals
- Organic sessions: 4-6× baseline
- 40+ referring domains
- Measurable organic → calculator → lead funnel in GA4
- Organic lead volume as the primary KPI, not raw traffic

### GEO (AI engines) goals
- Consistent brand entity resolution in ChatGPT, Perplexity, Claude, Google AI Overviews, Gemini
- Citation frequency in AI answers for subscription-category queries

## 4. Strategic Approach

**Option C — Phased 12-month full-stack program**, with the Solar-Free subscription moat folded in as one of six content clusters rather than the whole bet.

Rationale: content capacity, local geography, and the subscription differentiation are all genuine assets. A one-lever strategy (either pure local, or pure category moat, or pure content) wastes two of the three. The phased full-stack approach compounds across all three axes.

## 5. Phase 0 — Measurement Baseline (Week 0, ~2 days)

**Goal.** Before shipping anything, freeze a provable starting line so we can demonstrate lift to stakeholders at 3/6/12 months.

**Actions.**
- Confirm `NEXT_PUBLIC_ANALYTICS_ENABLED=true` in production and that GTM is firing.
- Verify Google Search Console for `https://freestate.ch` (domain property, not URL-prefix).
- Verify Bing Webmaster Tools (shared copy of GSC sitemap).
- Baseline Core Web Vitals via Lighthouse CI on 5 top pages; screenshot CrUX report.
- Export current GSC queries/pages/impressions CSV; archive.
- Export current GA4 landing-page report; archive.
- Baseline GBP metrics: review count, photo count, category completeness.
- Inventory current backlinks (Google "link:" is unreliable; use free Ahrefs Webmaster Tools — available after GSC verification).

**Exit criteria.** A `baseline-2026-04.md` snapshot committed to repo under `docs/seo/` containing all the above numbers.

## 6. Phase 1 — Technical Foundation (Weeks 1-3, dev-heavy)

### 6.1 Locale + URL structure
- **Change `defaultLocale` from `'en'` to `'de'`** in `src/i18n/routing.ts` and `next-intl.config.js`.
- Use `localePrefix: 'as-needed'` — DE at root (`/`, `/ueber-uns`), others prefixed (`/en/about-us`, `/fr/a-propos`, `/it/chi-siamo`).
- **Remove** `'es'` and `'sr'` locales entirely from `routing.ts`, `next-intl.config.js`, and all `pathnames` entries — config-only mentions with no `messages/` file are duplicate-content landmines.
- `x-default` hreflang → DE root.
- Confirm EN stays for investor page only; do not generate EN variants of cantonal pages.

### 6.2 Root layout fixes (`src/app/[locale]/layout.tsx`, `src/app/layout.tsx`)
- `<html lang={locale}>` — dynamic, not hardcoded.
- Delete the static root `metadata` export; it's the default fallback and the German phrase is misleading.
- Move all metadata generation to `[locale]/layout.tsx` via `generateMetadata` reading from `messages/*.json`.

### 6.3 Per-page metadata (every public page)
- `generateMetadata()` on: `/`, `/solar-systems`, `/battery-storage`, `/heat-pumps` (+ 5 children), `/charging-stations` (+ 3 children), `/solar-free`, `/solar-direct`, `/commercial` (+ children), `/cost`, `/amortization`, `/solar-calculator`, `/calculator`, `/about-us`, `/team`, `/history`, `/careers`, `/faq`, `/blog`, `/blog/[slug]`, `/contact`, `/service`, `/energy-storage`, `/repowering`, `/portfolio`, `/media`, `/investors`, `/impressum`, `/agb`, `/privacy-policy`.
- Title template: `%s | Free State AG` with per-page `%s` sourced from `messages/*.json`.
- Description: unique per page, 140-160 chars, keyword-aligned.
- `alternates.canonical` set to absolute URL for the current locale.
- `alternates.languages` for all active locales (de, fr, it, en) + `x-default`.
- `openGraph` + `twitter` card defaults at layout level, overridable per page.

### 6.4 Sitemap & robots
- `src/app/sitemap.ts` — dynamic, enumerating all public routes × all active locales (skip admin/protected/auth groups), with `<xhtml:link rel="alternate" hreflang>` entries per URL.
- Blog posts: pulled from `blogService.listPublished` (all pages, not first page).
- `src/app/robots.ts` — allow all public routes, disallow `/admin/*`, `/dashboard/*`, `/(auth)/*`, `/api/*`, and any `?preview=true`-style query params. Reference sitemap.

### 6.5 Structured data (JSON-LD)
Injected in `[locale]/layout.tsx`:
- **Organization** — name, url, logo, contactPoint, sameAs (LinkedIn, Swissolar profile, etc.).
- **LocalBusiness** — address, geo coordinates, openingHoursSpecification, telephone, priceRange, areaServed (19 DE cantons).
- **WebSite** — with `SearchAction` for sitelinks search box.

Per-page schema (added by page):
- **BreadcrumbList** on every non-root page.
- **FAQPage** on every page with ≥2 Q&A pairs.
- **Article** + `author` + `datePublished` + `image` on blog post pages.
- **Service** schema on `/solar-systems`, `/battery-storage`, `/heat-pumps`, `/charging-stations`, `/solar-free`, `/solar-direct`.
- **Product** schema on `/heat-pumps/products` items.

### 6.6 Image optimization
- Remove `unoptimized` from all `<Image>` usage in blog pages; rely on `next/image` with AVIF + WebP.
- Add AVIF to `next.config.ts` formats.
- Every `<Image>` has a descriptive, keyword-aware `alt`.
- Largest images in hero sections: `priority` + `fetchPriority="high"`.
- Convert any remaining placeholder images (`placehold.co`) to real assets.

### 6.7 Core Web Vitals pass
- LCP < 2.5s, INP < 200ms, CLS < 0.1 on the 10 top pages.
- Defer GTM loading until after cookie consent (already partially done via `CookieConsentBanner`).
- Audit `@googlemaps/js-api-loader` + OpenLayers (`ol`) + GSAP bundles — lazy-load where possible; these are probably only needed on calculator/map routes.
- Font-loading strategy: `display: 'swap'` (already set via `next/font/google`).
- Preconnect to R2 image bucket.

### 6.8 Analytics instrumentation
- GSC verified + sitemap submitted.
- GA4 events: `lead_form_submit`, `calculator_complete`, `contact_click`, `phone_click`, `scroll_75`, `blog_read_complete`.
- GA4 goals: lead form submit, calculator completion, contact form submit.
- Cross-domain tracking to backend subdomain if applicable.
- UTM convention document in `docs/seo/utm-conventions.md`.

### 6.9 Phase 1 exit criteria
- All sitemap URLs return 200 and are indexable.
- 0 errors in GSC URL Inspector on 10 sampled pages.
- Rich Results Test passes on Organization, LocalBusiness, Article, FAQPage, BreadcrumbList.
- Lighthouse Performance ≥ 90 on top 10 pages.
- Zero `es`/`sr` locale code remaining.
- Robots.txt blocks admin/dashboard/auth; sitemap.xml lists every public page × active locale.

## 7. Phase 2 — On-Page + Local SEO (Weeks 4-7)

### 7.1 Top 15 money pages — content rewrite
Prioritized rewrite with keyword-intent alignment, Swiss German conventions ("ss" not "ß", "Photovoltaik" + "Solaranlage" used interchangeably, canton names in Swiss spelling):

1. `/` (homepage) — hero H1 targeting "Solaranlage Schweiz" with "Solar Abo" differentiation
2. `/solar-systems` (`/solaranlagen`) — pillar page for PV category
3. `/solar-free` — pillar for subscription category ← highest moat value
4. `/solar-direct` — supporting subscription category
5. `/battery-storage` (`/batteriespeicher`)
6. `/heat-pumps` (`/waermepumpen`)
7. `/charging-stations` (`/ladestationen`)
8. `/cost` (`/kosten`) — money page for "Solaranlage Kosten"
9. `/amortization` (`/amortisation`) — money page for ROI queries
10. `/solar-calculator` (`/solarrechner`)
11. `/commercial` (`/gewerbe`) — B2B pillar
12. `/service` — retention/support SEO
13. `/about-us` (`/ueber-uns`) — E-E-A-T signal page
14. `/portfolio` — proof + cantonal local signal
15. `/faq` — answer-engine optimization

Each rewrite must include: H1 with primary keyword, H2 structure mapping to search intent, a ≥80-word intro paragraph (direct-answer style for AI engines), an internal FAQ section (feeds FAQPage schema), internal links to 3-5 related pages, a single clear CTA.

### 7.2 Internal linking hub-and-spoke
- Each pillar page links to its 5-8 supporting pages.
- Every supporting page links back to its pillar with descriptive anchor text.
- Calculator + cost + amortization pages cross-link.
- Blog posts link up to the relevant pillar.
- Add a "Related Articles" block on blog detail pages (3 posts from same cluster).

### 7.3 Google Business Profile
- Complete profile: primary category "Solar energy company", secondary categories for heat pump / EV charging if available.
- 20+ photos: office, team, install sites (with permission), products, vehicles.
- Services list with descriptions + starting prices.
- Q&A seeded with 10 common questions answered by the business.
- **Review-generation workflow**: post-install email + SMS ask, QR code on business cards, review-link in email signatures. Target +40 reviews / 90 days.
- Weekly GBP Posts — news, offers, new installs.
- NAP (Name, Address, Phone) consistency audit — same exact format on site footer, Impressum, GBP, directory listings.

### 7.4 Swiss directory listings (citations)
Submit consistent NAP to:
- Swissolar member directory
- EIT.swiss (electrical installers association)
- EnergieSchweiz partner list
- MyClimate partner network
- Local chamber of commerce
- Cantonal Energiefachstellen listings
- Pronovo (for PV)
- local.ch
- search.ch
- moneyhouse.ch (company profile)
- zefix.ch (handelsregister — already listed, verify correct)
- yelp.ch
- kununu (employer signal → E-E-A-T)

### 7.5 Phase 2 exit criteria
- 15 money pages rewritten + published.
- Internal linking graph built (spot-check: every money page is reachable in ≤2 clicks from homepage).
- GBP fully populated, weekly post cadence established.
- 15+ directory citations live with consistent NAP.
- First review acquisition batch shipped (target: +15 reviews by end of Phase 2).

## 8. Phase 3 — Content Engine (Months 2-6)

### 8.1 Six topical clusters
Each cluster = 1 pillar page (Phase 2) + 6-8 supporting blog posts.

1. **Photovoltaik für Einfamilienhaus** — pillar: `/solar-systems`. Posts: sizing, cost breakdown, ROI, roof types, self-consumption optimization, Einspeisevergütung, brands comparison, FAQ.
2. **Batteriespeicher** — pillar: `/battery-storage`. Posts: sizing guide, BYD vs Huawei vs Tesla, payback calculation, integration with existing PV, winter performance, FAQ.
3. **Wärmepumpen** — pillar: `/heat-pumps`. Posts: Luft/Wasser vs Sole/Wasser, Förderung per canton, cost/ROI, combo with PV, GEAK impact, FAQ.
4. **Solar Abo / PPA** (moat cluster) — pillar: `/solar-free`. Posts: Kaufen vs Mieten comparison, contract terms explained, zero-investment myth-busting, target audience (tenants, EFH owners without capital), cancellation & exit, tax implications, FAQ.
5. **E-Auto Laden zuhause** — pillar: `/charging-stations`. Posts: Wallbox selection, bidirektional charging, solar-surplus charging, apartment-building shared chargers, FAQ.
6. **Förderungen & Einspeisevergütung Schweiz** — pillar: `/faq` or new `/foerderungen` hub. Posts: Pronovo EIV explained, GEAK grading, cantonal subsidies (Zürich, Bern, Aargau, Luzern, St. Gallen individually), Steuerabzug, FAQ.

### 8.2 Post-level content standards
- 1500-2500 words.
- First paragraph answers the title as a direct, extractable answer (AI engines + featured snippets).
- H2 structure covers related "People also ask" queries from Google.
- One primary keyword + 3-5 semantic variants.
- Internal links: 3+ to related supporting posts, 1+ to the cluster pillar, 1+ to calculator/cost page.
- External links: 2+ to authoritative sources (BFE, Pronovo, EnergieSchweiz, Swissolar, cantonal sites).
- FAQPage schema on every post.
- Article schema with author + datePublished + dateModified + image.
- Featured image: real (not placeholder), AVIF-optimized, descriptive alt, ≥1200px wide.
- Original author byline — assign to real humans, not "admin" (E-E-A-T).

### 8.3 Blog CMS improvements (developer work inside Phase 3)
- Blog admin UI adds: meta title override, meta description override, slug validation, OG image upload, FAQ block (array of Q&A pairs feeding schema), `dateModified` auto-update.
- Blog detail page: BreadcrumbList + Article + FAQPage JSON-LD, author page link, estimated reading time, related-posts component (same cluster).
- Replace blog `dangerouslySetInnerHTML` rendering with sanitized renderer that enforces heading hierarchy (h1 reserved for post title; all body headings start at h2).

### 8.4 Cadence
- 4 posts/month for 12 months = 48 posts.
- Months 2-3: cover Cluster 4 (Solar Abo / PPA) first — moat value, least competition.
- Months 3-5: Clusters 1, 2, 6 (residential core + subsidies).
- Months 5-7: Clusters 3, 5 (heat pumps, charging).
- Refresh existing posts quarterly — update stats, re-publish with `dateModified`.

### 8.5 Phase 3 exit criteria (month 6)
- 24 posts published across 6 clusters.
- Every cluster has at least 3 posts + its pillar page.
- All posts pass Rich Results Test (Article + FAQPage).
- At least 3 posts ranked top 10 for their primary keyword.

## 9. Phase 4 — Cantonal Pages + Link Building (Months 4-12, parallel with Phase 3)

### 9.1 Cantonal landing pages — first 19
URL pattern: `/solaranlagen/[canton-slug]` (DE default, lives at `/solaranlagen/zuerich`, `/solaranlagen/bern`, etc.).

**The 19 majority-German-speaking cantons** (slugs in Swiss spelling, lowercase, no umlauts in URL):
zuerich, bern, luzern, uri, schwyz, obwalden, nidwalden, glarus, zug, solothurn, basel-stadt, basel-landschaft, schaffhausen, appenzell-ausserrhoden, appenzell-innerrhoden, st-gallen, graubuenden, aargau, thurgau.

*(Freiburg, Wallis, and the Ticino/Romandie cantons are majority-FR/IT and deferred to Phase 4b if FR/IT expansion ever activates. Bern is officially bilingual but majority DE; treated as DE. Graubünden is trilingual but majority DE; treated as DE.)*

**Each page structure** (non-negotiable, anti-doorway):
- H1: "Solaranlage in [Kanton]" + unique intro (≥150 words) covering canton-specific context.
- Canton-specific subsidies table (pulled from `AdminSubsidyRate` data — already in admin).
- Local feed-in tariffs from `AdminFeedInTariff` (already in admin).
- 2-3 canton-specific project references from `/portfolio`.
- Canton-specific climate/roof notes (sun hours, snow load, heritage-protected areas).
- Local FAQ block with 5-8 canton-specific questions (e.g. "Welche Förderungen gibt es in Zürich?").
- `LocalBusiness` schema with `areaServed` = the canton.
- Internal links to `/cost`, `/solar-calculator`, and 2-3 relevant blog posts.
- CTA: "Kostenlose Offerte für [Kanton]".

**Editorial time**: ~2-3 hours per page (data is templated; canton context + FAQ is hand-written). Do not ship pure-template variants — Google penalizes doorway pages.

**Release cadence**: 4 cantons/month starting month 4. All 19 live by month 8.

### 9.2 Optional Phase 4b — Cantonal × Product expansion (months 9-12, only if Phase 4a shows traction)
- 19 cantons × `/waermepumpen/[canton]` and `/batteriespeicher/[canton]` — up to 38 additional pages.
- Only create pages for products with material canton-specific differentiation (heat pump has subsidy variance; battery less so).
- **Gate**: only start if 5+ of the 19 PV cantonal pages reach top-10 by month 8.

### 9.3 Link building
Target: **40 referring domains in 12 months**. Swiss-specific, natural, non-PBN.

Tactics:
- **Industry association memberships**: Swissolar (paid member listing), EIT.swiss, GEAK-Expert network (if any in-house).
- **Partner directories**: Huawei FusionSolar installer directory, Viessmann partner network, BYD / Huawei battery partner listings, Pronovo installer list.
- **Digital PR**: pitch Solar-Free customer stories to Handelszeitung, Cash, 20min, Blick, Tagesanzeiger, Bilanz — angle: "Solaranlage ohne Eigeninvestition, Schweizer Modell". One pitch per quarter.
- **Local press**: pitch large install project stories to regional outlets (Aargauer Zeitung, Tagblatt, Berner Zeitung).
- **Guest posts**: pitch sustainability-focused Swiss blogs (Pusch, SES, WWF Schweiz, Green.ch, Energie-Umwelt.ch).
- **HARO-equivalent**: Swiss journalists via Swiss PR agencies; answer media queries on solar/energy topics.
- **University / trade school partnerships**: ZHAW, FHNW, HSLU renewable-energy programs.
- **Sponsorships with link value**: local sports clubs, school solar-education projects.

**What we will NOT do**: paid links, PBNs, link exchanges, directory spam, expired-domain redirects, foreign-language link farms, comment spam. Switzerland is a small link market; one manual penalty ends the program.

### 9.4 Phase 4 exit criteria (month 12)
- All 19 DE cantonal pages published, indexed, passing Rich Results.
- 40+ referring domains from Swiss and authoritative sites.
- 8+ cantonal pages ranked top 5 for "Solaranlage [Kanton]".
- No manual actions or unnatural-link warnings in GSC.

## 10. GEO / AI Search Optimization (cross-phase)

AI engines (ChatGPT Search, Perplexity, Claude, Google AI Overviews, Gemini, Copilot) are becoming a meaningful traffic source for high-consideration B2C purchases like solar. GEO is not a separate phase — it's a set of constraints woven through Phases 1-4.

### 10.1 Entity consistency
Same exact phrasing of "Free State AG" as an entity across: Organization JSON-LD, GBP, Swiss Handelsregister (zefix), Wikipedia-style About Us page, Crunchbase/Moneyhouse, LinkedIn, directory listings. AI engines disambiguate entities by consensus — inconsistent naming fragments the entity.

### 10.2 Direct-answer content structure
Every blog post and FAQ answer leads with a **self-contained 40-80 word direct answer** before any build-up. AI engines extract these verbatim. Pattern:

> **Was kostet eine Solaranlage in der Schweiz?** Eine Solaranlage für ein Einfamilienhaus kostet in der Schweiz 2026 zwischen CHF 18'000 und CHF 35'000 für eine 8-12 kWp Anlage, inklusive Installation. […rest of the article…]

### 10.3 FAQPage schema everywhere
Maximum extractable-answer surface. Every money page and every blog post with Q&A gets it.

### 10.4 `llms.txt` at root
`https://freestate.ch/llms.txt` — a plain-text index of canonical content with short descriptions, following the emerging spec. Low cost, directly consumed by Perplexity and Anthropic's web crawler, signals openness to AI ingestion.

### 10.5 Citation-worthy content
AI engines preferentially cite: original data, unique calculations, Swiss-specific numbers, canton-level detail, year-stamped stats. Every cluster should produce at least one "canonical source" post per year (e.g. "Solaranlage Kosten Schweiz 2026 — Vollständige Übersicht") that competitors and AI engines link back to.

### 10.6 Authorship + E-E-A-T
Real author bylines with bios, credentials, links to LinkedIn. `Person` schema on author pages. `Article` schema with `author` field as a linked Person, not a string. AI engines increasingly weight "who wrote this" as a ranking signal.

### 10.7 GEO-specific metrics
- Mentions in AI answers for tracked queries (manual check monthly via ChatGPT / Perplexity / Gemini for 20 tracked queries — automate later with tools like Profound or Peec AI once they stabilize).
- Referral traffic from `chat.openai.com`, `perplexity.ai`, `gemini.google.com`, `copilot.microsoft.com` in GA4 (explicit filter in GA4 exploration).

## 11. Measurement & Reporting

### 11.1 Monthly SEO report (to stakeholder, first of each month)
- GSC: impressions, clicks, avg position, CTR — overall and per cluster.
- GA4: organic sessions, organic leads, organic revenue attribution.
- Ranking: top 50 tracked keywords (via free Sistrix Smart + manual spot-checks; paid tool by month 3 — recommend Ahrefs Starter at ~$129/mo or Sistrix DACH at €99/mo).
- GBP: review count delta, local pack position for 5 tracked queries.
- Backlinks: new referring domains delta.
- Content: posts published, posts refreshed.
- AI engine mentions (manual spot-check).
- Wins + blockers + next-month plan.

### 11.2 KPI hierarchy
1. **Organic leads** (primary; everything else is a leading indicator).
2. Organic sessions.
3. Tracked keyword rankings.
4. Referring domains.
5. GBP reviews + local pack position.
6. AI engine citations (qualitative).

## 12. Ownership (RACI)

| Area | Responsible | Accountable | Consulted |
|---|---|---|---|
| Technical SEO (Phases 0, 1, 6.x) | Dev team | CTO/founder | SEO strategist |
| On-page content rewrites (Phase 2) | DE content writer | Marketing lead | SEO strategist |
| GBP + directories | Marketing ops | Marketing lead | — |
| Blog content (Phase 3) | DE content writer | Marketing lead | SEO strategist |
| Cantonal pages (Phase 4) | Dev + content writer (shared) | Marketing lead | SEO strategist |
| Link building | Marketing lead | Founder (for PR pitches) | PR agency if hired |
| Measurement | SEO strategist / marketing ops | Marketing lead | — |

## 13. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Default locale flip breaks existing indexed URLs | Low (site only days old) | Medium | Ship 301 redirects for old `/en/*` → new paths; verify in GSC URL inspector before bulk change |
| Cantonal pages flagged as doorway pages | Medium | High | Hand-finish each with unique intro, local FAQ, real project references; monitor GSC manual actions weekly |
| Content team burnout at 4 posts/mo pace | Medium | High | Build 4-week content buffer before Phase 3 start; never ship below standard to hit cadence |
| Analytics flag never flipped on in prod | Low | Catastrophic (no data) | Phase 0 explicit confirmation step |
| Helion files trademark / competitive complaint | Low | Medium | Never mention Helion by name in content; "recent commit removed Helion" — maintain that discipline |
| Over-optimization / exact-match spam | Low | High | Semantic variants in H2s, natural anchor text, no keyword-stuffed footers |
| GBP suspension from policy violation | Low | High | Never use keywords in business name field; keep review-solicitation language neutral |
| Paid-tool dependency by month 3 | High | Low | Budget for Ahrefs Starter or Sistrix DACH (~CHF 120-150/mo) from month 3 onwards |

## 14. Out of Scope (explicit non-goals)

- Outranking Helion on "Solaranlage Schweiz" in year 1.
- FR/IT blog translations (key money pages only).
- EN SEO beyond the investor page.
- Paid media (Google Ads, Meta Ads) — separate program.
- International (DACH, EU) expansion.
- Product-level SEO inside the authenticated dashboard.
- Outranking marketplace aggregators (Solarify, Otovo) on their category terms — too expensive given their platform leverage.
- Video SEO / YouTube channel — parking-lot for month 13+.

## 15. Timeline Summary

| Month | Phase | Primary output |
|---|---|---|
| 0 (week 0) | Phase 0 | Baseline snapshot committed |
| 1 | Phase 1 | Technical foundation live |
| 2 | Phase 2 start | 5 money pages rewritten, GBP optimized |
| 3 | Phase 2 end + Phase 3 start | 15 money pages done, first 4 posts live |
| 4 | Phase 3 + Phase 4 start | 8 posts, 4 cantonal pages |
| 5-6 | Phase 3 + Phase 4 | 20 posts, 12 cantonal pages, first rank wins |
| 7-8 | Phase 3 + Phase 4 end | 28 posts, all 19 cantonal pages |
| 9-10 | Phase 3 + link building | 36 posts, 25+ referring domains |
| 11-12 | Phase 3 + consolidation | 48 posts, 40+ referring domains, 12-month KPI review |

## 16. Immediate Next Steps (after this spec is approved)

1. Invoke `superpowers:writing-plans` to turn Phase 1 (Technical Foundation) into an executable implementation plan.
2. Phase 0 baseline snapshot (~2 days, can run in parallel with Phase 1 plan drafting).
3. Execute Phase 1 via TDD / normal implementation workflow.
4. Stakeholder review at end of Phase 1 before starting Phase 2.

---

**End of spec.**
