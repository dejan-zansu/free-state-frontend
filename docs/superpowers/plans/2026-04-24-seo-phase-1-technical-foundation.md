# SEO Phase 1 — Technical Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a fully instrumented technical-SEO foundation for freestate.ch — dynamic sitemap, robots, proper per-page metadata with hreflang, JSON-LD structured data, optimized images, CWV pass, and verified analytics — so Google can crawl, understand, and rank the site correctly.

**Architecture:** A single shared `src/lib/seo/` module centralizes SEO concerns: site config constants, a `generateSEOMetadata()` helper consumed by every public page, JSON-LD builders for Organization/LocalBusiness/WebSite/BreadcrumbList/FAQPage/Article, and utilities for canonical + hreflang URL generation using `next-intl`'s `getPathname`. SEO strings live in a new `seo.*` namespace in each `messages/*.json` so content writers can iterate without touching TSX. Sitemap and robots are Next.js 15 file-based routes (`src/app/sitemap.ts`, `src/app/robots.ts`). Default locale flips from `en` to `de`; broken `es`/`sr` locales are deleted.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript 5, `next-intl` v3, `next/font`, Vitest (new), Tailwind 4.

---

## File Structure

**New files:**
- `src/lib/seo/site-config.ts` — site-wide constants (domain, brand, social, NAP)
- `src/lib/seo/metadata.ts` — `generateSEOMetadata()` + canonical/hreflang helpers
- `src/lib/seo/structured-data.ts` — JSON-LD builders (Organization, LocalBusiness, WebSite, BreadcrumbList, FAQPage, Article, Service)
- `src/components/seo/JsonLd.tsx` — React component that renders a `<script type="application/ld+json">`
- `src/app/sitemap.ts` — dynamic sitemap with hreflang alternates
- `src/app/robots.ts` — robots.txt generator
- `src/lib/seo/__tests__/site-config.test.ts`
- `src/lib/seo/__tests__/metadata.test.ts`
- `src/lib/seo/__tests__/structured-data.test.ts`
- `src/app/__tests__/sitemap.test.ts`
- `src/app/__tests__/robots.test.ts`
- `vitest.config.ts`
- `vitest.setup.ts`
- `public/llms.txt` — GEO (AI-search) index
- `docs/seo/baseline-2026-04.md` — Phase 0 baseline snapshot
- `docs/seo/utm-conventions.md` — UTM naming standard
- `docs/seo/verification-checklist.md` — manual checks for Rich Results, Lighthouse, GSC

**Modified files:**
- `src/i18n/routing.ts` — `defaultLocale` → `'de'`, drop `es`/`sr`, confirm 4 locales (de/en/fr/it), add `localePrefix: 'as-needed'`
- `next-intl.config.js` — drop `es`/`sr`, default to `'de'`
- `src/middleware.ts` — (verify no changes required; `createMiddleware(routing)` picks up config)
- `src/app/layout.tsx` — delete static `metadata` export, leave analytics + globals only
- `src/app/[locale]/layout.tsx` — dynamic `<html lang>`, `generateMetadata()`, inject Organization + LocalBusiness + WebSite JSON-LD
- `src/app/page.tsx` — update the redirect target (or delete if `localePrefix: 'as-needed'` makes it unnecessary)
- `next.config.ts` — add AVIF to `images.formats`, add `metadataBase`
- `src/app/[locale]/**/page.tsx` (30+ public pages) — add `generateMetadata()` export + injected JSON-LD where relevant
- `src/app/[locale]/blog/page.tsx` — remove `unoptimized`, add metadata + BreadcrumbList
- `src/app/[locale]/blog/[slug]/page.tsx` — remove `unoptimized`, add `generateMetadata()` + Article + BreadcrumbList + optional FAQPage
- `messages/de.json`, `messages/en.json`, `messages/fr.json`, `messages/it.json` — add top-level `"seo"` namespace
- `package.json` — add `vitest`, `@vitest/coverage-v8`, `jsdom`, test scripts

**Deleted files / routes:** None (es/sr never had `messages/` files; code-only references just get removed).

---

## Conventions Used In This Plan

- `$REPO` = `/Users/dejanarsic/zansu/free-state-ag/app/frontend` (the working directory). All relative paths are from this root unless otherwise stated.
- Commit style: Conventional Commits (the repo uses short descriptive messages; we'll use prefixes like `feat(seo):`, `fix(seo):`, `chore(seo):`, `docs(seo):`).
- All new TypeScript files use `export const` / `export function`, not default exports (matches repo convention).
- No code comments (project rule: CLAUDE.md says "Do not add comments to code").
- No Tailwind `leading-*` classes (project rule).

---

# Group 0 — Phase 0 Baseline Snapshot

Before any code changes, establish a provable starting line.

### Task 0.1: Create baseline SEO docs directory & snapshot template

**Files:**
- Create: `docs/seo/baseline-2026-04.md`

- [ ] **Step 1: Create the directory**

```bash
mkdir -p docs/seo
```

- [ ] **Step 2: Write the baseline snapshot template**

```markdown
# SEO Baseline Snapshot — 2026-04

**Captured:** 2026-04-24
**Purpose:** Freeze starting-line metrics for the Phase 1 SEO program so lift can be demonstrated at months 3/6/12.

## Production environment check
- [ ] `NEXT_PUBLIC_ANALYTICS_ENABLED=true` confirmed in production env
- [ ] GTM container `GTM-MF4MHZRP` firing on https://freestate.ch (verified via Tag Assistant)
- [ ] GA4 property receiving events in real-time report

## Google Search Console
- Property type: **domain property** (`freestate.ch`), not URL-prefix
- Verified: [ ] yes / [ ] no — method: [DNS / HTML / file]
- Impressions last 28d: ___
- Clicks last 28d: ___
- Avg position last 28d: ___
- Avg CTR last 28d: ___
- Indexed pages: ___
- Coverage errors: ___
- Core Web Vitals (mobile): LCP ___ / INP ___ / CLS ___

## Bing Webmaster Tools
- Verified: [ ] yes / [ ] no
- Indexed pages: ___

## Google Analytics 4
- Property ID: ___
- Last 28d sessions: ___
- Last 28d organic sessions: ___
- Conversions configured: [ ] yes / [ ] no

## Google Business Profile
- Business URL: https://g.page/r/___
- Reviews: ___
- Review avg: ___
- Photo count: ___
- Categories: ___

## Lighthouse (top 5 pages, mobile, production URL)
| URL | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| https://freestate.ch/ | ___ | ___ | ___ | ___ |
| https://freestate.ch/solar-systems | ___ | ___ | ___ | ___ |
| https://freestate.ch/battery-storage | ___ | ___ | ___ | ___ |
| https://freestate.ch/heat-pumps | ___ | ___ | ___ | ___ |
| https://freestate.ch/solar-free | ___ | ___ | ___ | ___ |

## Backlinks (via free GSC "Links" report, or Ahrefs Webmaster Tools)
- Total referring domains: ___
- Top 5 linking domains: ___

## Attached CSV exports
- `gsc-queries-2026-04.csv`
- `gsc-pages-2026-04.csv`
- `ga4-landing-pages-2026-04.csv`
```

- [ ] **Step 3: Commit**

```bash
git add docs/seo/baseline-2026-04.md
git commit -m "docs(seo): add Phase 0 baseline snapshot template"
```

### Task 0.2: Stakeholder fills baseline numbers

This task is done by the stakeholder, not code. The plan records it as an explicit dependency.

- [ ] **Step 1: Stakeholder captures all numbers into `docs/seo/baseline-2026-04.md` and attaches CSVs under `docs/seo/exports/2026-04/`**
- [ ] **Step 2: Confirm `NEXT_PUBLIC_ANALYTICS_ENABLED=true` in Vercel / hosting prod env**
- [ ] **Step 3: Commit filled-in baseline**

```bash
git add docs/seo/baseline-2026-04.md docs/seo/exports/
git commit -m "docs(seo): capture Phase 0 baseline numbers"
```

---

# Group 1 — Test Framework Setup (Vitest)

We need tests for the SEO helpers and structured-data builders. Current repo has no test framework; we add Vitest.

### Task 1.1: Install Vitest + dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install packages**

```bash
pnpm add -D vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom @vitejs/plugin-react
```

- [ ] **Step 2: Verify package.json added the devDeps**

```bash
grep -E "vitest|jsdom|testing-library" package.json
```

Expected output: all five lines present under `devDependencies`.

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore(test): install vitest and testing-library"
```

### Task 1.2: Create vitest config

**Files:**
- Create: `vitest.config.ts`

- [ ] **Step 1: Write config**

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/lib/seo/**/*.ts', 'src/app/sitemap.ts', 'src/app/robots.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

- [ ] **Step 2: Create setup file**

Create: `vitest.setup.ts`

```typescript
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 3: Add test script to package.json**

Edit `package.json` `scripts` section, adding:

```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

- [ ] **Step 4: Verify vitest runs (no tests yet, should exit 0)**

```bash
pnpm test
```

Expected output: `No test files found` (exit code 0 is acceptable, or use `vitest run --passWithNoTests` if needed).

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts vitest.setup.ts package.json
git commit -m "chore(test): add vitest config and scripts"
```

---

# Group 2 — Site Config Module

Single source of truth for all site-wide SEO constants.

### Task 2.1: Define site config constants

**Files:**
- Create: `src/lib/seo/site-config.ts`

- [ ] **Step 1: Write the failing test**

Create: `src/lib/seo/__tests__/site-config.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { siteConfig, getSiteUrl } from '../site-config'

describe('site-config', () => {
  it('exposes the production origin', () => {
    expect(siteConfig.url).toBe('https://freestate.ch')
  })

  it('exposes brand name', () => {
    expect(siteConfig.name).toBe('Free State AG')
  })

  it('exposes the default locale', () => {
    expect(siteConfig.defaultLocale).toBe('de')
  })

  it('lists all active locales in order', () => {
    expect(siteConfig.locales).toEqual(['de', 'en', 'fr', 'it'])
  })

  it('getSiteUrl returns the origin without trailing slash', () => {
    expect(getSiteUrl()).toBe('https://freestate.ch')
  })
})
```

- [ ] **Step 2: Run — expect failure**

```bash
pnpm test -- src/lib/seo/__tests__/site-config.test.ts
```

Expected: FAIL (`cannot find module '../site-config'`).

- [ ] **Step 3: Write the implementation**

Create: `src/lib/seo/site-config.ts`

```typescript
export const siteConfig = {
  url: 'https://freestate.ch',
  name: 'Free State AG',
  legalName: 'Free State AG',
  description:
    'Solaranlagen, Batteriespeicher, Wärmepumpen und Ladestationen in der Schweiz. Kaufen oder als Solar-Abo ab CHF 0.00 Eigeninvestition.',
  defaultLocale: 'de' as const,
  locales: ['de', 'en', 'fr', 'it'] as const,
  brandColor: '#062E25',
  social: {
    linkedin: 'https://www.linkedin.com/company/free-state-ag/',
  },
  contact: {
    email: 'info@freestate.ch',
    phone: '+41 XX XXX XX XX',
  },
  address: {
    streetAddress: 'TO BE FILLED BY STAKEHOLDER',
    addressLocality: 'TO BE FILLED',
    postalCode: 'TO BE FILLED',
    addressRegion: 'TO BE FILLED',
    addressCountry: 'CH',
  },
  openingHours: [
    {
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '08:00',
      closes: '17:30',
    },
  ],
  areaServed: [
    'Zürich',
    'Bern',
    'Luzern',
    'Uri',
    'Schwyz',
    'Obwalden',
    'Nidwalden',
    'Glarus',
    'Zug',
    'Solothurn',
    'Basel-Stadt',
    'Basel-Landschaft',
    'Schaffhausen',
    'Appenzell Ausserrhoden',
    'Appenzell Innerrhoden',
    'St. Gallen',
    'Graubünden',
    'Aargau',
    'Thurgau',
  ],
  ogImage: {
    url: '/og/default.png',
    width: 1200,
    height: 630,
    alt: 'Free State AG — Solaranlagen und erneuerbare Energien in der Schweiz',
  },
  twitter: {
    handle: '@freestate_ag',
  },
} as const

export type SiteLocale = (typeof siteConfig.locales)[number]

export function getSiteUrl(): string {
  return siteConfig.url
}
```

- [ ] **Step 4: Run tests**

```bash
pnpm test -- src/lib/seo/__tests__/site-config.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/seo/site-config.ts src/lib/seo/__tests__/site-config.test.ts
git commit -m "feat(seo): add site config single source of truth"
```

**Note for stakeholder:** The `TO BE FILLED` placeholders for `address.*` and `contact.phone` must be filled in before LocalBusiness JSON-LD is useful. Capture from GBP. This is tracked as Task 2.2.

### Task 2.2: Stakeholder fills NAP placeholders

Human-input task, not code.

- [ ] **Step 1: Stakeholder provides real street address, postal code, city, canton, phone from GBP**

- [ ] **Step 2: Update `src/lib/seo/site-config.ts` with real values, replacing all `TO BE FILLED` strings**

- [ ] **Step 3: Re-run tests to confirm nothing broke**

```bash
pnpm test -- src/lib/seo/__tests__/site-config.test.ts
```

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/lib/seo/site-config.ts
git commit -m "chore(seo): populate NAP in site config"
```

---

# Group 3 — Locale Migration (Breaking Change)

Flip default locale to DE, serve DE at root, drop broken locales. Safe because the site has no backlink equity yet.

### Task 3.1: Drop broken es/sr locales from next-intl.config.js

**Files:**
- Modify: `next-intl.config.js`

- [ ] **Step 1: Replace the file contents**

Open `next-intl.config.js` and replace:

```javascript
export const locales = ['en', 'de', 'fr', 'it', 'es', 'sr']
export const defaultLocale = 'en'
```

With:

```javascript
export const locales = ['de', 'en', 'fr', 'it']
export const defaultLocale = 'de'
```

- [ ] **Step 2: Verify no references to `'es'` or `'sr'` remain**

```bash
grep -rn "'es'\|'sr'" next-intl.config.js
```

Expected output: (empty).

- [ ] **Step 3: Commit**

```bash
git add next-intl.config.js
git commit -m "chore(i18n): drop broken es/sr locales, default to de"
```

### Task 3.2: Update routing.ts — default locale, active locales, localePrefix

**Files:**
- Modify: `src/i18n/routing.ts`

- [ ] **Step 1: Modify the locale declarations and routing config**

Replace lines 5-12 of `src/i18n/routing.ts`:

From:
```typescript
export const locales = ['en', 'de', 'fr'] as const
export const defaultLocale = 'en' as const

export type Locale = (typeof locales)[number]

export const routing = defineRouting({
  locales,
  defaultLocale,
  pathnames: {
```

To:
```typescript
export const locales = ['de', 'en', 'fr', 'it'] as const
export const defaultLocale = 'de' as const

export type Locale = (typeof locales)[number]

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
  pathnames: {
```

- [ ] **Step 2: Remove every `es:` and `sr:` entry from the `pathnames` block**

Use grep + sed or a text editor to remove every line starting with `      es:` and `      sr:` in `src/i18n/routing.ts`. Also remove trailing comma inconsistencies.

```bash
# Verify all es/sr entries are gone:
grep -n "es:\|sr:" src/i18n/routing.ts
```

Expected output: (empty).

- [ ] **Step 3: Remove `@ts-nocheck` if it was only there to silence typing issues caused by the locale mismatch**

Check if the file now type-checks:

```bash
pnpm exec tsc --noEmit
```

If no errors: delete lines 1-2 (the `eslint-disable` and `@ts-nocheck` comments). If errors remain, leave the comments and file a follow-up.

- [ ] **Step 4: Commit**

```bash
git add src/i18n/routing.ts
git commit -m "feat(i18n): flip default locale to de and enable as-needed prefix"
```

### Task 3.3: Update root redirect page

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Delete the file entirely**

With `localePrefix: 'as-needed'` and `defaultLocale: 'de'`, the `/` path now serves the DE version of `/[locale]/page.tsx` directly — no redirect needed.

```bash
rm src/app/page.tsx
```

- [ ] **Step 2: Run dev server and verify `/` renders the homepage in DE**

```bash
pnpm dev
# In another terminal:
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
```

Expected output: `200`.

Also open http://localhost:3000/ in a browser and confirm the homepage renders in German.

- [ ] **Step 3: Commit**

```bash
git add -u src/app/page.tsx
git commit -m "feat(i18n): serve DE at root via localePrefix as-needed"
```

### Task 3.4: Set `<html lang>` dynamically from locale

**Files:**
- Modify: `src/app/layout.tsx`, `src/app/[locale]/layout.tsx`

- [ ] **Step 1: Remove the static metadata + static lang from root layout**

Replace the full contents of `src/app/layout.tsx` with:

```tsx
import { Geist, Geist_Mono, Figtree } from 'next/font/google'
import './globals.css'
import {
  AnalyticsScripts,
  AnalyticsNoscript,
} from '@/components/analytics/AnalyticsScripts'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const figtree = Figtree({
  variable: '--font-figtree',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html suppressHydrationWarning>
      <head>
        <AnalyticsScripts />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${figtree.variable} antialiased flex flex-col min-h-screen`}
      >
        <AnalyticsNoscript />
        {children}
      </body>
    </html>
  )
}
```

Notes:
- The static `metadata` export is removed; per-locale + per-page metadata replaces it.
- `<html>` no longer hardcodes `lang` or `className='light'` — the locale layout handles lang; theme class is moved to body if still needed.
- `suppressHydrationWarning` preserved in case `next-intl` runtime adjusts attributes.

- [ ] **Step 2: Set `<html lang>` dynamically in the locale layout**

Replace the contents of `src/app/[locale]/layout.tsx` with:

```tsx
import ConditionalFooter from '@/components/ConditionalFooter'
import ConditionalHeader from '@/components/ConditionalHeader'
import CookieConsentBanner from '@/components/CookieConsent'
import { locales } from '@/i18n/routing'
import { QueryProvider } from '@/providers/QueryProvider'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

export async function generateStaticParams() {
  return locales.map(locale => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound()
  }

  const messages = await getMessages({ locale })

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <NuqsAdapter>
        <QueryProvider>
          <div lang={locale} className="flex flex-col min-h-screen">
            <ConditionalHeader />
            <div className="flex-1">{children}</div>
            <ConditionalFooter locale={locale} />
            <CookieConsentBanner />
          </div>
        </QueryProvider>
      </NuqsAdapter>
    </NextIntlClientProvider>
  )
}
```

**Important correction:** Next.js RootLayout owns the `<html>` element; nested layouts cannot replace it. To set `<html lang>` from the `[locale]` segment, we use the `generateMetadata` approach — Next.js 15 supports setting the `lang` via metadata when combined with per-route rendering, but the standard pattern is to use a route-group structure. Instead, the cleanest approach is:

Move the `<html>` + `<body>` into `src/app/[locale]/layout.tsx` and remove `src/app/layout.tsx` entirely. Next.js allows a root layout at any segment as long as there's exactly one per route.

- [ ] **Step 3: Restructure layouts so locale layout owns `<html>`**

Delete `src/app/layout.tsx`:

```bash
rm src/app/layout.tsx
```

Replace the contents of `src/app/[locale]/layout.tsx` with:

```tsx
import { Geist, Geist_Mono, Figtree } from 'next/font/google'
import '../globals.css'
import {
  AnalyticsScripts,
  AnalyticsNoscript,
} from '@/components/analytics/AnalyticsScripts'
import ConditionalFooter from '@/components/ConditionalFooter'
import ConditionalHeader from '@/components/ConditionalHeader'
import CookieConsentBanner from '@/components/CookieConsent'
import { locales } from '@/i18n/routing'
import { QueryProvider } from '@/providers/QueryProvider'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })
const figtree = Figtree({
  variable: '--font-figtree',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
})

export async function generateStaticParams() {
  return locales.map(locale => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound()
  }

  const messages = await getMessages({ locale })

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <AnalyticsScripts />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${figtree.variable} antialiased flex flex-col min-h-screen`}
      >
        <AnalyticsNoscript />
        <NextIntlClientProvider messages={messages} locale={locale}>
          <NuqsAdapter>
            <QueryProvider>
              <div className="flex flex-col min-h-screen">
                <ConditionalHeader />
                <div className="flex-1">{children}</div>
                <ConditionalFooter locale={locale} />
                <CookieConsentBanner />
              </div>
            </QueryProvider>
          </NuqsAdapter>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

Note: also update the import for `globals.css` since it's now one level deeper.

- [ ] **Step 4: Run dev server, verify `<html lang="de">` on DE pages and `<html lang="en">` on EN**

```bash
pnpm dev
curl -s http://localhost:3000/ | grep -o '<html lang="[^"]*"'
curl -s http://localhost:3000/en | grep -o '<html lang="[^"]*"'
```

Expected output:
- Line 1: `<html lang="de"`
- Line 2: `<html lang="en"`

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/layout.tsx
git rm src/app/layout.tsx 2>/dev/null || true
git commit -m "feat(seo): move html root to locale layout for dynamic lang"
```

### Task 3.5: Update middleware (sanity check)

**Files:**
- Modify: (possibly) `src/middleware.ts`

- [ ] **Step 1: Verify middleware picks up routing changes**

```bash
cat src/middleware.ts
```

It should be:

```typescript
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

export default createMiddleware(routing)
```

No changes required — `createMiddleware(routing)` inherits the new default locale and `localePrefix` setting automatically.

- [ ] **Step 2: Manually test all locales in dev**

```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/en
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/fr
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/it
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/es
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/sr
```

Expected:
- `/`, `/en`, `/fr`, `/it` → `200`
- `/es`, `/sr` → `404`

- [ ] **Step 3: No commit needed (no changes)**

---

# Group 4 — Core SEO Metadata Helper

The single helper consumed by every public page.

### Task 4.1: Define canonical + hreflang URL builders

**Files:**
- Modify: `src/lib/seo/metadata.ts` (will be created)

- [ ] **Step 1: Write failing tests**

Create: `src/lib/seo/__tests__/metadata.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import {
  buildCanonicalUrl,
  buildHreflangAlternates,
} from '../metadata'

describe('buildCanonicalUrl', () => {
  it('returns root for home DE (no prefix)', () => {
    expect(buildCanonicalUrl({ pathname: '/', locale: 'de' })).toBe(
      'https://freestate.ch/'
    )
  })

  it('returns /en/ prefix for English home', () => {
    expect(buildCanonicalUrl({ pathname: '/', locale: 'en' })).toBe(
      'https://freestate.ch/en'
    )
  })

  it('returns localized slug for DE', () => {
    expect(
      buildCanonicalUrl({ pathname: '/about-us', locale: 'de' })
    ).toBe('https://freestate.ch/ueber-uns')
  })

  it('returns localized slug under prefix for FR', () => {
    expect(
      buildCanonicalUrl({ pathname: '/about-us', locale: 'fr' })
    ).toBe('https://freestate.ch/fr/a-propos')
  })
})

describe('buildHreflangAlternates', () => {
  it('returns one entry per active locale plus x-default', () => {
    const alts = buildHreflangAlternates('/about-us')
    expect(Object.keys(alts).sort()).toEqual([
      'de',
      'en',
      'fr',
      'it',
      'x-default',
    ])
  })

  it('x-default points to DE version', () => {
    const alts = buildHreflangAlternates('/about-us')
    expect(alts['x-default']).toBe(alts['de'])
  })

  it('each entry is an absolute URL', () => {
    const alts = buildHreflangAlternates('/')
    for (const url of Object.values(alts)) {
      expect(url).toMatch(/^https:\/\/freestate\.ch/)
    }
  })
})
```

- [ ] **Step 2: Run — expect fail**

```bash
pnpm test -- src/lib/seo/__tests__/metadata.test.ts
```

Expected: FAIL (`cannot find module '../metadata'`).

- [ ] **Step 3: Write the implementation**

Create: `src/lib/seo/metadata.ts`

```typescript
import { getPathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { siteConfig, type SiteLocale } from './site-config'

type PathnameKey = keyof typeof routing.pathnames

type BuildCanonicalArgs = {
  pathname: PathnameKey | string
  locale: SiteLocale
}

export function buildCanonicalUrl({ pathname, locale }: BuildCanonicalArgs): string {
  const localizedPath = getPathname({
    locale,
    href: pathname as PathnameKey,
  })
  return `${siteConfig.url}${localizedPath === '/' && locale === siteConfig.defaultLocale ? '/' : localizedPath}`
}

export function buildHreflangAlternates(
  pathname: PathnameKey | string
): Record<string, string> {
  const entries: Record<string, string> = {}
  for (const locale of siteConfig.locales) {
    entries[locale] = buildCanonicalUrl({ pathname, locale })
  }
  entries['x-default'] = entries[siteConfig.defaultLocale]
  return entries
}
```

- [ ] **Step 4: Run tests**

```bash
pnpm test -- src/lib/seo/__tests__/metadata.test.ts
```

Expected: PASS (all tests green).

- [ ] **Step 5: Commit**

```bash
git add src/lib/seo/metadata.ts src/lib/seo/__tests__/metadata.test.ts
git commit -m "feat(seo): add canonical and hreflang URL builders"
```

### Task 4.2: Define `generateSEOMetadata()` helper

**Files:**
- Modify: `src/lib/seo/metadata.ts`
- Modify: `src/lib/seo/__tests__/metadata.test.ts`

- [ ] **Step 1: Extend the failing tests**

Append to `src/lib/seo/__tests__/metadata.test.ts`:

```typescript
import { generateSEOMetadata } from '../metadata'

describe('generateSEOMetadata', () => {
  it('returns a Metadata object with title, description, and canonical', async () => {
    const meta = await generateSEOMetadata({
      locale: 'de',
      pathname: '/',
      title: 'Solaranlagen Schweiz | Free State AG',
      description: 'Solaranlagen für dein Zuhause in der Schweiz.',
    })

    expect(meta.title).toBe('Solaranlagen Schweiz | Free State AG')
    expect(meta.description).toBe('Solaranlagen für dein Zuhause in der Schweiz.')
    expect(meta.alternates?.canonical).toBe('https://freestate.ch/')
  })

  it('sets hreflang alternates for all locales', async () => {
    const meta = await generateSEOMetadata({
      locale: 'de',
      pathname: '/about-us',
      title: 't',
      description: 'd',
    })
    expect(Object.keys(meta.alternates?.languages ?? {}).sort()).toEqual([
      'de',
      'en',
      'fr',
      'it',
      'x-default',
    ])
  })

  it('populates openGraph with locale and siteName', async () => {
    const meta = await generateSEOMetadata({
      locale: 'de',
      pathname: '/',
      title: 't',
      description: 'd',
    })
    expect(meta.openGraph?.locale).toBe('de')
    expect(meta.openGraph?.siteName).toBe('Free State AG')
    expect(meta.openGraph?.url).toBe('https://freestate.ch/')
  })
})
```

- [ ] **Step 2: Run — expect fail on `generateSEOMetadata` import**

```bash
pnpm test -- src/lib/seo/__tests__/metadata.test.ts
```

Expected: FAIL (function not exported).

- [ ] **Step 3: Write the implementation**

Append to `src/lib/seo/metadata.ts`:

```typescript
import type { Metadata } from 'next'

type GenerateSEOMetadataArgs = {
  locale: SiteLocale
  pathname: PathnameKey | string
  title: string
  description: string
  ogImage?: { url: string; width?: number; height?: number; alt?: string }
  noIndex?: boolean
}

export async function generateSEOMetadata({
  locale,
  pathname,
  title,
  description,
  ogImage,
  noIndex,
}: GenerateSEOMetadataArgs): Promise<Metadata> {
  const canonical = buildCanonicalUrl({ pathname, locale })
  const languages = buildHreflangAlternates(pathname)
  const image = ogImage ?? {
    url: `${siteConfig.url}${siteConfig.ogImage.url}`,
    width: siteConfig.ogImage.width,
    height: siteConfig.ogImage.height,
    alt: siteConfig.ogImage.alt,
  }

  return {
    title,
    description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      locale,
      alternateLocale: siteConfig.locales.filter(l => l !== locale) as string[],
      siteName: siteConfig.name,
      type: 'website',
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image.url],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  }
}
```

- [ ] **Step 4: Run tests**

```bash
pnpm test -- src/lib/seo/__tests__/metadata.test.ts
```

Expected: PASS (all tests green).

- [ ] **Step 5: Commit**

```bash
git add src/lib/seo/metadata.ts src/lib/seo/__tests__/metadata.test.ts
git commit -m "feat(seo): add generateSEOMetadata helper"
```

### Task 4.3: Add `metadataBase` to next.config.ts

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Add `metadataBase` constant so Next.js can resolve OG image URLs**

Open `next.config.ts` and add a top-level export:

```typescript
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'pub-4c6192458b6640b4882edb8106c3751f.r2.dev',
        port: '',
      },
    ],
  },
}

const withNextIntl = createNextIntlPlugin()
export default withNextIntl(nextConfig)
```

Note: `metadataBase` is actually set in the `generateMetadata` return value via `alternates.canonical` (absolute URL), so we don't need it at config level. But add `formats: ['image/avif', 'image/webp']` now to enable AVIF for all images going forward.

- [ ] **Step 2: Build succeeds**

```bash
pnpm build 2>&1 | tail -5
```

Expected: build completes without errors.

- [ ] **Step 3: Commit**

```bash
git add next.config.ts
git commit -m "chore(seo): enable avif image format"
```

---

# Group 5 — SEO Messages Namespace

Centralize all per-page title/description strings so content writers don't touch TSX.

### Task 5.1: Add `seo.*` namespace to all four messages files

**Files:**
- Modify: `messages/de.json`, `messages/en.json`, `messages/fr.json`, `messages/it.json`

- [ ] **Step 1: Define the schema — add the `seo` top-level key**

For each of the four files, add (at the top level, alongside `"title"`, `"apiErrors"`, etc.) a new key:

```json
"seo": {
  "defaultTitle": "Free State AG",
  "titleTemplate": "%s | Free State AG",
  "home": {
    "title": "",
    "description": ""
  },
  "solarSystems": {
    "title": "",
    "description": ""
  },
  "solarFree": {
    "title": "",
    "description": ""
  },
  "solarDirect": {
    "title": "",
    "description": ""
  },
  "batteryStorage": {
    "title": "",
    "description": ""
  },
  "heatPumps": {
    "title": "",
    "description": ""
  },
  "chargingStations": {
    "title": "",
    "description": ""
  },
  "commercial": {
    "title": "",
    "description": ""
  },
  "cost": {
    "title": "",
    "description": ""
  },
  "amortization": {
    "title": "",
    "description": ""
  },
  "solarCalculator": {
    "title": "",
    "description": ""
  },
  "calculator": {
    "title": "",
    "description": ""
  },
  "aboutUs": {
    "title": "",
    "description": ""
  },
  "team": {
    "title": "",
    "description": ""
  },
  "history": {
    "title": "",
    "description": ""
  },
  "careers": {
    "title": "",
    "description": ""
  },
  "faq": {
    "title": "",
    "description": ""
  },
  "portfolio": {
    "title": "",
    "description": ""
  },
  "service": {
    "title": "",
    "description": ""
  },
  "blog": {
    "title": "",
    "description": ""
  },
  "contact": {
    "title": "",
    "description": ""
  },
  "energyStorage": {
    "title": "",
    "description": ""
  },
  "repowering": {
    "title": "",
    "description": ""
  },
  "solarSystemCarport": {
    "title": "",
    "description": ""
  },
  "media": {
    "title": "",
    "description": ""
  },
  "investors": {
    "title": "",
    "description": ""
  },
  "impressum": {
    "title": "",
    "description": ""
  },
  "agb": {
    "title": "",
    "description": ""
  },
  "privacyPolicy": {
    "title": "",
    "description": ""
  },
  "heatPumpsProducts": {
    "title": "",
    "description": ""
  },
  "heatPumpsCost": {
    "title": "",
    "description": ""
  },
  "heatPumpsHowItWorks": {
    "title": "",
    "description": ""
  },
  "heatPumpsWithSolarSystem": {
    "title": "",
    "description": ""
  },
  "heatPumpsService": {
    "title": "",
    "description": ""
  },
  "chargingStationsApartment": {
    "title": "",
    "description": ""
  },
  "chargingStationsSingleFamily": {
    "title": "",
    "description": ""
  },
  "chargingStationsBidirectional": {
    "title": "",
    "description": ""
  },
  "commercialCalculator": {
    "title": "",
    "description": ""
  },
  "commercialSolarSystems": {
    "title": "",
    "description": ""
  },
  "commercialChargingStations": {
    "title": "",
    "description": ""
  },
  "howItWorks": {
    "title": "",
    "description": ""
  }
},
```

- [ ] **Step 2: Seed DE values for the top 6 pages**

In `messages/de.json`, fill in these specific entries with real, keyword-aligned strings (Swiss German, no "ß"):

```json
"home": {
  "title": "Solaranlagen Schweiz — kaufen oder als Solar-Abo ab CHF 0.–",
  "description": "Photovoltaikanlagen, Batteriespeicher, Wärmepumpen und Ladestationen von Free State AG. Kauf oder Solar-Abo ohne Eigeninvestition. 19 Kantone in der Deutschschweiz."
},
"solarSystems": {
  "title": "Solaranlagen Schweiz — Photovoltaik für dein Zuhause",
  "description": "Solaranlage für Einfamilienhaus in der Schweiz: Planung, Installation, Inbetriebnahme aus einer Hand. Ab CHF 18'000 oder als Solar-Abo ohne Eigeninvestition."
},
"solarFree": {
  "title": "Solar-Abo — Solaranlage ohne Eigeninvestition | Free State AG",
  "description": "Mit dem Solar-Abo von Free State AG bekommst du deine eigene Solaranlage für CHF 0.– Eigeninvestition. Monatliche Rate statt Kauf. Jederzeit mit Option zum Erwerb."
},
"batteryStorage": {
  "title": "Batteriespeicher Schweiz — Stromspeicher für deine Solaranlage",
  "description": "Speichere deinen Solarstrom für die Nacht. Batteriespeicher ab 5 kWh. Kompatibel mit BYD, Huawei, Viessmann. Planung und Installation in der Deutschschweiz."
},
"heatPumps": {
  "title": "Wärmepumpen Schweiz — Luft/Wasser und Sole/Wasser | Free State AG",
  "description": "Wärmepumpe für dein Haus in der Schweiz. Kombiniere mit Solaranlage für maximale Unabhängigkeit. Beratung, Förderabklärung und Installation aus einer Hand."
},
"chargingStations": {
  "title": "Ladestationen für Elektroautos — Wallbox Schweiz | Free State AG",
  "description": "Wallbox für zuhause oder Mehrfamilienhaus. Kombiniert mit Solaranlage für Überschuss-Laden. Bidirektionale Ladestationen verfügbar. Installation in der Deutschschweiz."
}
```

Leave the remaining entries with empty strings — they'll fall back to the default pattern (see Task 4.4 next) and be filled in during Phase 2.

- [ ] **Step 3: Mirror the structure (empty strings) into `en.json`, `fr.json`, `it.json`**

Same schema, all values as empty strings. DE seed values will be carried over and translated in Phase 2 where relevant; empty values will trigger fallback.

- [ ] **Step 4: Verify JSON is still valid after edits**

```bash
for f in messages/de.json messages/en.json messages/fr.json messages/it.json; do
  node -e "JSON.parse(require('fs').readFileSync('$f'))" && echo "$f OK"
done
```

Expected output: four `OK` lines.

- [ ] **Step 5: Commit**

```bash
git add messages/de.json messages/en.json messages/fr.json messages/it.json
git commit -m "feat(seo): add seo.* message namespace with DE seed values"
```

### Task 5.2: Add fallback logic to `generateSEOMetadata`

If a page's `seo.<key>.title` is empty, fall back to a deterministic default: `"{siteConfig.name}"` for the root title, and `"{pageNameFromExistingTranslation} | {siteConfig.name}"` otherwise.

**Files:**
- Modify: `src/lib/seo/metadata.ts`
- Modify: `src/lib/seo/__tests__/metadata.test.ts`

- [ ] **Step 1: Write failing test**

Append to `src/lib/seo/__tests__/metadata.test.ts`:

```typescript
describe('generateSEOMetadata fallbacks', () => {
  it('falls back to site name when title is empty', async () => {
    const meta = await generateSEOMetadata({
      locale: 'de',
      pathname: '/',
      title: '',
      description: '',
    })
    expect(meta.title).toBe('Free State AG')
    expect(meta.description).toBe(
      'Solaranlagen, Batteriespeicher, Wärmepumpen und Ladestationen in der Schweiz. Kaufen oder als Solar-Abo ab CHF 0.00 Eigeninvestition.'
    )
  })
})
```

- [ ] **Step 2: Run — expect fail**

```bash
pnpm test -- src/lib/seo/__tests__/metadata.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Add fallback logic**

In `src/lib/seo/metadata.ts`, modify `generateSEOMetadata`:

Replace:
```typescript
  const canonical = buildCanonicalUrl({ pathname, locale })
  const languages = buildHreflangAlternates(pathname)
  const image = ogImage ?? {
```

With:
```typescript
  const canonical = buildCanonicalUrl({ pathname, locale })
  const languages = buildHreflangAlternates(pathname)
  const resolvedTitle = title || siteConfig.name
  const resolvedDescription = description || siteConfig.description
  const image = ogImage ?? {
```

And in the returned object, replace `title` and `description` with `resolvedTitle` and `resolvedDescription` everywhere they appear.

- [ ] **Step 4: Run tests**

```bash
pnpm test -- src/lib/seo/__tests__/metadata.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/seo/metadata.ts src/lib/seo/__tests__/metadata.test.ts
git commit -m "feat(seo): fall back to site defaults when page seo strings empty"
```

---

# Group 6 — Locale Layout generateMetadata

Add the root per-locale metadata so every page inherits sensible defaults.

### Task 6.1: Add generateMetadata to `[locale]/layout.tsx`

**Files:**
- Modify: `src/app/[locale]/layout.tsx`

- [ ] **Step 1: Import the helper and add `generateMetadata`**

At the top of `src/app/[locale]/layout.tsx`, add imports:

```typescript
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { generateSEOMetadata } from '@/lib/seo/metadata'
import type { SiteLocale } from '@/lib/seo/site-config'
```

After `generateStaticParams` and before `LocaleLayout`, add:

```typescript
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo' })
  return generateSEOMetadata({
    locale: locale as SiteLocale,
    pathname: '/',
    title: t('home.title') || '',
    description: t('home.description') || '',
  })
}
```

- [ ] **Step 2: Build + verify meta tags on homepage**

```bash
pnpm build && pnpm start &
sleep 3
curl -s http://localhost:3000/ | grep -E '<title|<meta name="description"|rel="canonical"|hreflang' | head -10
kill %1
```

Expected output includes:
- `<title>Solaranlagen Schweiz — kaufen oder als Solar-Abo ab CHF 0.–</title>` (or similar)
- `<meta name="description" content="Photovoltaikanlagen, Batteriespeicher, Wärmepumpen..."/>`
- `<link rel="canonical" href="https://freestate.ch/"/>`
- `<link rel="alternate" hreflang="de" href="https://freestate.ch/"/>`
- `<link rel="alternate" hreflang="en" href="https://freestate.ch/en"/>`
- `<link rel="alternate" hreflang="fr" href="https://freestate.ch/fr"/>`
- `<link rel="alternate" hreflang="it" href="https://freestate.ch/it"/>`
- `<link rel="alternate" hreflang="x-default" href="https://freestate.ch/"/>`

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/layout.tsx
git commit -m "feat(seo): add root locale generateMetadata with hreflang"
```

---

# Group 7 — Per-Page generateMetadata

Every public page gets its own `generateMetadata` reading from the `seo.*` namespace.

### Pattern (applied identically to every page below)

For a page at `src/app/[locale]/<route>/page.tsx` corresponding to `seo.<key>`, add at the top:

```typescript
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { generateSEOMetadata } from '@/lib/seo/metadata'
import type { SiteLocale } from '@/lib/seo/site-config'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo' })
  return generateSEOMetadata({
    locale: locale as SiteLocale,
    pathname: '<PATHNAME_KEY>',
    title: t('<KEY>.title') || '',
    description: t('<KEY>.description') || '',
  })
}
```

Where `<PATHNAME_KEY>` is the **template pathname** declared in `routing.ts` (NOT the localized variant — e.g. `/about-us` not `/ueber-uns`), and `<KEY>` is the SEO namespace key.

**Page → PATHNAME → KEY map:**

| File | PATHNAME_KEY | seo KEY |
|---|---|---|
| `[locale]/page.tsx` (home) | `/` | `home` |
| `[locale]/solar-systems/page.tsx` | `/solar-systems` | `solarSystems` |
| `[locale]/solar-free/page.tsx` | `/solar-free` | `solarFree` |
| `[locale]/solar-direct/page.tsx` | `/solar-direct` | `solarDirect` |
| `[locale]/battery-storage/page.tsx` | `/battery-storage` | `batteryStorage` |
| `[locale]/heat-pumps/page.tsx` | `/heat-pumps` | `heatPumps` |
| `[locale]/charging-stations/page.tsx` | `/charging-stations` | `chargingStations` |
| `[locale]/commercial/page.tsx` | `/commercial` | `commercial` |
| `[locale]/cost/page.tsx` | `/cost` | `cost` |
| `[locale]/amortization/page.tsx` | `/amortization` | `amortization` |
| `[locale]/solar-calculator/page.tsx` | `/solar-calculator` | `solarCalculator` |
| `[locale]/calculator/page.tsx` | `/calculator` | `calculator` |
| `[locale]/about-us/page.tsx` | `/about-us` | `aboutUs` |
| `[locale]/team/page.tsx` | `/team` | `team` |
| `[locale]/history/page.tsx` | `/history` | `history` |
| `[locale]/careers/page.tsx` | `/careers` | `careers` |
| `[locale]/faq/page.tsx` | `/faq` | `faq` |
| `[locale]/portfolio/page.tsx` | `/portfolio` | `portfolio` |
| `[locale]/service/page.tsx` | `/service` | `service` |
| `[locale]/blog/page.tsx` | `/blog` | `blog` |
| `[locale]/contact/page.tsx` | `/contact` | `contact` |
| `[locale]/energy-storage/page.tsx` | `/energy-storage` | `energyStorage` |
| `[locale]/repowering/page.tsx` | `/repowering` | `repowering` |
| `[locale]/solar-system-carport/page.tsx` | `/solar-system-carport` | `solarSystemCarport` |
| `[locale]/media/page.tsx` | `/media` | `media` |
| `[locale]/investors/page.tsx` | `/investors` | `investors` |
| `[locale]/impressum/page.tsx` | `/impressum` | `impressum` |
| `[locale]/agb/page.tsx` | `/agb` | `agb` |
| `[locale]/privacy-policy/page.tsx` | `/privacy-policy` | `privacyPolicy` |
| `[locale]/how-it-works/page.tsx` | `/how-it-works` | `howItWorks` |
| `[locale]/heat-pumps/products/page.tsx` | `/heat-pumps/products` | `heatPumpsProducts` |
| `[locale]/heat-pumps/cost/page.tsx` | `/heat-pumps/cost` | `heatPumpsCost` |
| `[locale]/heat-pumps/how-it-works/page.tsx` | `/heat-pumps/how-it-works` | `heatPumpsHowItWorks` |
| `[locale]/heat-pumps/heat-pumps-with-solar-system/page.tsx` | `/heat-pumps/heat-pumps-with-solar-system` | `heatPumpsWithSolarSystem` |
| `[locale]/heat-pumps/service/page.tsx` | `/heat-pumps/service` | `heatPumpsService` |
| `[locale]/charging-stations/apartment-building/page.tsx` | `/charging-stations/apartment-building` | `chargingStationsApartment` |
| `[locale]/charging-stations/single-family-home/page.tsx` | `/charging-stations/single-family-home` | `chargingStationsSingleFamily` |
| `[locale]/charging-stations/bidirectional-charging-station/page.tsx` | `/charging-stations/bidirectional-charging-station` | `chargingStationsBidirectional` |
| `[locale]/commercial/calculator/page.tsx` | `/commercial/calculator` | `commercialCalculator` |
| `[locale]/commercial/solar-systems/page.tsx` | `/commercial/solar-systems` | `commercialSolarSystems` |
| `[locale]/commercial/charging-stations/page.tsx` | `/commercial/charging-stations` | `commercialChargingStations` |

### Task 7.1: Add generateMetadata to homepage

**Files:**
- Modify: `src/app/[locale]/page.tsx`

- [ ] **Step 1: Add the exports**

Add the imports and `generateMetadata` export from the pattern above, using `PATHNAME_KEY = '/'` and `KEY = 'home'`. Place the export below the existing imports and above the `HomePage` component.

- [ ] **Step 2: Build + curl**

```bash
pnpm build && pnpm start &
sleep 3
curl -s http://localhost:3000/ | grep '<title\|canonical\|hreflang' | head -10
kill %1
```

Expected: the home SEO strings appear.

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/page.tsx
git commit -m "feat(seo): generateMetadata on homepage"
```

### Task 7.2: Add generateMetadata to the 8 product-pillar pages

**Files:**
- Modify: `src/app/[locale]/solar-systems/page.tsx`
- Modify: `src/app/[locale]/solar-free/page.tsx`
- Modify: `src/app/[locale]/solar-direct/page.tsx`
- Modify: `src/app/[locale]/battery-storage/page.tsx`
- Modify: `src/app/[locale]/heat-pumps/page.tsx`
- Modify: `src/app/[locale]/charging-stations/page.tsx`
- Modify: `src/app/[locale]/commercial/page.tsx`
- Modify: `src/app/[locale]/energy-storage/page.tsx`

- [ ] **Step 1: For each of the 8 files, add the generateMetadata export following the pattern**

Use the `PATHNAME_KEY` and `KEY` values from the map above. Each file gets the same 4 imports and the same `generateMetadata` export with the page-specific values.

- [ ] **Step 2: Build + curl two of them to verify**

```bash
pnpm build && pnpm start &
sleep 3
curl -s http://localhost:3000/solaranlagen | grep -oE '<title[^>]*>[^<]*</title>' | head -1
curl -s http://localhost:3000/batteriespeicher | grep -oE '<title[^>]*>[^<]*</title>' | head -1
kill %1
```

Expected: DE-localized page titles.

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/solar-systems/page.tsx src/app/[locale]/solar-free/page.tsx src/app/[locale]/solar-direct/page.tsx src/app/[locale]/battery-storage/page.tsx src/app/[locale]/heat-pumps/page.tsx src/app/[locale]/charging-stations/page.tsx src/app/[locale]/commercial/page.tsx src/app/[locale]/energy-storage/page.tsx
git commit -m "feat(seo): generateMetadata on product pillar pages"
```

### Task 7.3: Add generateMetadata to money pages (cost/calculator/portfolio)

**Files:**
- Modify: `src/app/[locale]/cost/page.tsx`
- Modify: `src/app/[locale]/amortization/page.tsx`
- Modify: `src/app/[locale]/solar-calculator/page.tsx`
- Modify: `src/app/[locale]/calculator/page.tsx`
- Modify: `src/app/[locale]/service/page.tsx`
- Modify: `src/app/[locale]/portfolio/page.tsx`
- Modify: `src/app/[locale]/repowering/page.tsx`
- Modify: `src/app/[locale]/solar-system-carport/page.tsx`

- [ ] **Step 1: For each, add the `generateMetadata` export following the Group 7 pattern block (shown at the top of Group 7 above)**

The code to add to every page (with `<PATHNAME_KEY>` and `<KEY>` replaced using the Group 7 page-to-key map):

```typescript
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { generateSEOMetadata } from '@/lib/seo/metadata'
import type { SiteLocale } from '@/lib/seo/site-config'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo' })
  return generateSEOMetadata({
    locale: locale as SiteLocale,
    pathname: '<PATHNAME_KEY>',
    title: t('<KEY>.title') || '',
    description: t('<KEY>.description') || '',
  })
}
```

- [ ] **Step 2: Build**

```bash
pnpm build 2>&1 | tail -3
```

Expected: build completes without errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/cost/page.tsx src/app/[locale]/amortization/page.tsx src/app/[locale]/solar-calculator/page.tsx src/app/[locale]/calculator/page.tsx src/app/[locale]/service/page.tsx src/app/[locale]/portfolio/page.tsx src/app/[locale]/repowering/page.tsx src/app/[locale]/solar-system-carport/page.tsx
git commit -m "feat(seo): generateMetadata on money pages"
```

### Task 7.4: Add generateMetadata to trust pages (about/team/careers/media)

**Files:**
- Modify: `src/app/[locale]/about-us/page.tsx`
- Modify: `src/app/[locale]/team/page.tsx`
- Modify: `src/app/[locale]/history/page.tsx`
- Modify: `src/app/[locale]/careers/page.tsx`
- Modify: `src/app/[locale]/faq/page.tsx`
- Modify: `src/app/[locale]/media/page.tsx`
- Modify: `src/app/[locale]/investors/page.tsx`
- Modify: `src/app/[locale]/contact/page.tsx`

- [ ] **Step 1: For each, add the `generateMetadata` export following the Group 7 pattern block (shown at the top of Group 7 above)**

The code to add to every page (with `<PATHNAME_KEY>` and `<KEY>` replaced using the Group 7 page-to-key map):

```typescript
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { generateSEOMetadata } from '@/lib/seo/metadata'
import type { SiteLocale } from '@/lib/seo/site-config'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo' })
  return generateSEOMetadata({
    locale: locale as SiteLocale,
    pathname: '<PATHNAME_KEY>',
    title: t('<KEY>.title') || '',
    description: t('<KEY>.description') || '',
  })
}
```

- [ ] **Step 2: Build**

```bash
pnpm build 2>&1 | tail -3
```

Expected: build completes without errors.

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/about-us/page.tsx src/app/[locale]/team/page.tsx src/app/[locale]/history/page.tsx src/app/[locale]/careers/page.tsx src/app/[locale]/faq/page.tsx src/app/[locale]/media/page.tsx src/app/[locale]/investors/page.tsx src/app/[locale]/contact/page.tsx
git commit -m "feat(seo): generateMetadata on trust pages"
```

### Task 7.5: Add generateMetadata to heat-pumps subpages

**Files:**
- Modify: `src/app/[locale]/heat-pumps/products/page.tsx`
- Modify: `src/app/[locale]/heat-pumps/cost/page.tsx`
- Modify: `src/app/[locale]/heat-pumps/how-it-works/page.tsx`
- Modify: `src/app/[locale]/heat-pumps/heat-pumps-with-solar-system/page.tsx`
- Modify: `src/app/[locale]/heat-pumps/service/page.tsx`

- [ ] **Step 1: For each, add the `generateMetadata` export following the Group 7 pattern block (shown at the top of Group 7 above)**

The code to add to every page (with `<PATHNAME_KEY>` and `<KEY>` replaced using the Group 7 page-to-key map):

```typescript
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { generateSEOMetadata } from '@/lib/seo/metadata'
import type { SiteLocale } from '@/lib/seo/site-config'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo' })
  return generateSEOMetadata({
    locale: locale as SiteLocale,
    pathname: '<PATHNAME_KEY>',
    title: t('<KEY>.title') || '',
    description: t('<KEY>.description') || '',
  })
}
```

- [ ] **Step 2: Build**

```bash
pnpm build 2>&1 | tail -3
```

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/heat-pumps/
git commit -m "feat(seo): generateMetadata on heat-pump subpages"
```

### Task 7.6: Add generateMetadata to charging-stations subpages

**Files:**
- Modify: `src/app/[locale]/charging-stations/apartment-building/page.tsx`
- Modify: `src/app/[locale]/charging-stations/single-family-home/page.tsx`
- Modify: `src/app/[locale]/charging-stations/bidirectional-charging-station/page.tsx`

- [ ] **Step 1: For each, add the `generateMetadata` export following the Group 7 pattern block (shown at the top of Group 7 above)**

The code to add to every page (with `<PATHNAME_KEY>` and `<KEY>` replaced using the Group 7 page-to-key map):

```typescript
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { generateSEOMetadata } from '@/lib/seo/metadata'
import type { SiteLocale } from '@/lib/seo/site-config'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo' })
  return generateSEOMetadata({
    locale: locale as SiteLocale,
    pathname: '<PATHNAME_KEY>',
    title: t('<KEY>.title') || '',
    description: t('<KEY>.description') || '',
  })
}
```

- [ ] **Step 2: Build**

```bash
pnpm build 2>&1 | tail -3
```

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/charging-stations/
git commit -m "feat(seo): generateMetadata on charging-station subpages"
```

### Task 7.7: Add generateMetadata to commercial subpages

**Files:**
- Modify: `src/app/[locale]/commercial/calculator/page.tsx`
- Modify: `src/app/[locale]/commercial/solar-systems/page.tsx`
- Modify: `src/app/[locale]/commercial/charging-stations/page.tsx`
- Modify: `src/app/[locale]/commercial/solar-free/*/page.tsx` (4 files)
- Modify: `src/app/[locale]/commercial/solar-systems/*/page.tsx` (4 files)
- Modify: `src/app/[locale]/commercial/charging-stations/*/page.tsx` (4 files — apartment-building, fast-charging-stations, bidirectional-charging-station, company)

For each commercial subpage whose SEO strings weren't yet defined in Task 5.1, first add the matching key to `messages/de.json`'s `seo` namespace (empty strings are fine — fallback handles it), then add the generateMetadata export.

- [ ] **Step 1: Extend the `seo.*` namespace with keys for all commercial subpages**

Add the following keys (empty strings) to each `messages/*.json` file's `seo` block:

```json
"commercialSolarFreeIndustry": {"title": "", "description": ""},
"commercialSolarFreeMultiFamily": {"title": "", "description": ""},
"commercialSolarFreeFarmhouses": {"title": "", "description": ""},
"commercialSolarFreePublicBuildings": {"title": "", "description": ""},
"commercialSolarSystemsHow": {"title": "", "description": ""},
"commercialSolarSystemsProjectDev": {"title": "", "description": ""},
"commercialSolarSystemsCarport": {"title": "", "description": ""},
"commercialSolarSystemsContracting": {"title": "", "description": ""},
"commercialChargingApartment": {"title": "", "description": ""},
"commercialChargingFast": {"title": "", "description": ""},
"commercialChargingBidirectional": {"title": "", "description": ""},
"commercialChargingCompany": {"title": "", "description": ""},
```

- [ ] **Step 2: For each commercial subpage, add the generateMetadata export**

Match each file to its PATHNAME_KEY (see `routing.ts`) and the `seo.*` key above.

- [ ] **Step 3: Build**

```bash
pnpm build 2>&1 | tail -3
```

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/commercial/ messages/
git commit -m "feat(seo): generateMetadata on commercial subpages"
```

### Task 7.8: Add generateMetadata to legal pages (noIndex flag off; these must be indexed)

**Files:**
- Modify: `src/app/[locale]/impressum/page.tsx`
- Modify: `src/app/[locale]/agb/page.tsx`
- Modify: `src/app/[locale]/privacy-policy/page.tsx`

- [ ] **Step 1: For each, add the `generateMetadata` export following the Group 7 pattern block (shown at the top of Group 7 above)**

The code to add to every page (with `<PATHNAME_KEY>` and `<KEY>` replaced using the Group 7 page-to-key map):

```typescript
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { generateSEOMetadata } from '@/lib/seo/metadata'
import type { SiteLocale } from '@/lib/seo/site-config'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo' })
  return generateSEOMetadata({
    locale: locale as SiteLocale,
    pathname: '<PATHNAME_KEY>',
    title: t('<KEY>.title') || '',
    description: t('<KEY>.description') || '',
  })
}
```

Legal pages ARE indexed — they serve as trust/E-E-A-T signals. Keep `noIndex` false.

- [ ] **Step 2: Build**

```bash
pnpm build 2>&1 | tail -3
```

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/impressum/page.tsx src/app/[locale]/agb/page.tsx src/app/[locale]/privacy-policy/page.tsx
git commit -m "feat(seo): generateMetadata on legal pages"
```

### Task 7.9: Blog list page metadata + blog post dynamic metadata

**Files:**
- Modify: `src/app/[locale]/blog/page.tsx`
- Modify: `src/app/[locale]/blog/[slug]/page.tsx`

- [ ] **Step 1: Add generateMetadata to `blog/page.tsx` following the pattern (`/blog`, `blog`)**

- [ ] **Step 2: Add dynamic generateMetadata to `blog/[slug]/page.tsx`**

At the top of `src/app/[locale]/blog/[slug]/page.tsx`, add:

```typescript
import type { Metadata } from 'next'
import { generateSEOMetadata } from '@/lib/seo/metadata'
import type { SiteLocale } from '@/lib/seo/site-config'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const post = await blogService.getBySlug(slug)
  if (!post) {
    return { robots: { index: false, follow: false }, title: 'Blog | Free State AG' }
  }
  const tr =
    post.translations.find(t => t.language === locale) ||
    post.translations.find(t => t.language === 'de') ||
    post.translations[0]
  if (!tr) {
    return { robots: { index: false, follow: false }, title: 'Blog | Free State AG' }
  }
  return generateSEOMetadata({
    locale: locale as SiteLocale,
    pathname: `/blog/${slug}` as string,
    title: `${tr.title} | Free State AG`,
    description: tr.excerpt || tr.title,
    ogImage: post.coverImageUrl
      ? { url: post.coverImageUrl, width: 1200, height: 630, alt: tr.title }
      : undefined,
  })
}
```

- [ ] **Step 3: Build**

```bash
pnpm build 2>&1 | tail -3
```

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/blog/
git commit -m "feat(seo): dynamic generateMetadata for blog list and posts"
```

---

# Group 8 — Structured Data (JSON-LD) Library

Pure TypeScript builders for all schema types; rendered by a shared React component.

### Task 8.1: Organization + LocalBusiness + WebSite builders

**Files:**
- Create: `src/lib/seo/structured-data.ts`
- Create: `src/lib/seo/__tests__/structured-data.test.ts`

- [ ] **Step 1: Write failing tests**

Create `src/lib/seo/__tests__/structured-data.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import {
  buildOrganizationJsonLd,
  buildLocalBusinessJsonLd,
  buildWebSiteJsonLd,
} from '../structured-data'

describe('buildOrganizationJsonLd', () => {
  it('has correct type and url', () => {
    const jsonLd = buildOrganizationJsonLd()
    expect(jsonLd['@type']).toBe('Organization')
    expect(jsonLd['@context']).toBe('https://schema.org')
    expect(jsonLd.url).toBe('https://freestate.ch')
    expect(jsonLd.name).toBe('Free State AG')
  })

  it('includes logo', () => {
    const jsonLd = buildOrganizationJsonLd()
    expect(jsonLd.logo).toBeDefined()
  })

  it('includes sameAs (social)', () => {
    const jsonLd = buildOrganizationJsonLd()
    expect(Array.isArray(jsonLd.sameAs)).toBe(true)
    expect(jsonLd.sameAs.length).toBeGreaterThan(0)
  })
})

describe('buildLocalBusinessJsonLd', () => {
  it('has correct type and nested address', () => {
    const jsonLd = buildLocalBusinessJsonLd()
    expect(jsonLd['@type']).toBe('LocalBusiness')
    expect(jsonLd.address['@type']).toBe('PostalAddress')
    expect(jsonLd.address.addressCountry).toBe('CH')
  })

  it('declares areaServed for all 19 cantons', () => {
    const jsonLd = buildLocalBusinessJsonLd()
    expect(Array.isArray(jsonLd.areaServed)).toBe(true)
    expect(jsonLd.areaServed.length).toBe(19)
  })

  it('includes openingHoursSpecification', () => {
    const jsonLd = buildLocalBusinessJsonLd()
    expect(Array.isArray(jsonLd.openingHoursSpecification)).toBe(true)
    expect(jsonLd.openingHoursSpecification[0]['@type']).toBe(
      'OpeningHoursSpecification'
    )
  })
})

describe('buildWebSiteJsonLd', () => {
  it('includes SearchAction for sitelinks search box', () => {
    const jsonLd = buildWebSiteJsonLd()
    expect(jsonLd['@type']).toBe('WebSite')
    expect(jsonLd.potentialAction).toBeDefined()
    expect(jsonLd.potentialAction['@type']).toBe('SearchAction')
  })
})
```

- [ ] **Step 2: Run — expect fail**

```bash
pnpm test -- src/lib/seo/__tests__/structured-data.test.ts
```

- [ ] **Step 3: Implement the builders**

Create `src/lib/seo/structured-data.ts`:

```typescript
import { siteConfig } from './site-config'

export function buildOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteConfig.url}#organization`,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: siteConfig.url,
    logo: {
      '@type': 'ImageObject',
      url: `${siteConfig.url}/logo-dark.svg`,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: siteConfig.contact.phone,
      email: siteConfig.contact.email,
      contactType: 'customer service',
      areaServed: 'CH',
      availableLanguage: ['de', 'en', 'fr', 'it'],
    },
    sameAs: [siteConfig.social.linkedin],
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.address.streetAddress,
      addressLocality: siteConfig.address.addressLocality,
      postalCode: siteConfig.address.postalCode,
      addressRegion: siteConfig.address.addressRegion,
      addressCountry: siteConfig.address.addressCountry,
    },
  }
}

export function buildLocalBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${siteConfig.url}#localbusiness`,
    name: siteConfig.name,
    url: siteConfig.url,
    telephone: siteConfig.contact.phone,
    email: siteConfig.contact.email,
    priceRange: 'CHF',
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.address.streetAddress,
      addressLocality: siteConfig.address.addressLocality,
      postalCode: siteConfig.address.postalCode,
      addressRegion: siteConfig.address.addressRegion,
      addressCountry: siteConfig.address.addressCountry,
    },
    areaServed: siteConfig.areaServed.map(name => ({
      '@type': 'AdministrativeArea',
      name,
    })),
    openingHoursSpecification: siteConfig.openingHours.map(h => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.dayOfWeek,
      opens: h.opens,
      closes: h.closes,
    })),
  }
}

export function buildWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteConfig.url}#website`,
    url: siteConfig.url,
    name: siteConfig.name,
    inLanguage: siteConfig.locales,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteConfig.url}/blog?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}
```

- [ ] **Step 4: Run tests**

```bash
pnpm test -- src/lib/seo/__tests__/structured-data.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/seo/structured-data.ts src/lib/seo/__tests__/structured-data.test.ts
git commit -m "feat(seo): add Organization, LocalBusiness, WebSite JSON-LD builders"
```

### Task 8.2: BreadcrumbList builder

**Files:**
- Modify: `src/lib/seo/structured-data.ts`
- Modify: `src/lib/seo/__tests__/structured-data.test.ts`

- [ ] **Step 1: Write failing test**

Append to `src/lib/seo/__tests__/structured-data.test.ts`:

```typescript
import { buildBreadcrumbListJsonLd } from '../structured-data'

describe('buildBreadcrumbListJsonLd', () => {
  it('maps items to ListItem with positions', () => {
    const jsonLd = buildBreadcrumbListJsonLd([
      { name: 'Home', url: 'https://freestate.ch/' },
      { name: 'Solaranlagen', url: 'https://freestate.ch/solaranlagen' },
    ])
    expect(jsonLd['@type']).toBe('BreadcrumbList')
    expect(jsonLd.itemListElement).toHaveLength(2)
    expect(jsonLd.itemListElement[0].position).toBe(1)
    expect(jsonLd.itemListElement[1].position).toBe(2)
    expect(jsonLd.itemListElement[0].item).toBe('https://freestate.ch/')
  })
})
```

- [ ] **Step 2: Run — expect fail**

- [ ] **Step 3: Implement**

Append to `src/lib/seo/structured-data.ts`:

```typescript
type Breadcrumb = { name: string; url: string }

export function buildBreadcrumbListJsonLd(crumbs: Breadcrumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  }
}
```

- [ ] **Step 4: Run tests — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/lib/seo/structured-data.ts src/lib/seo/__tests__/structured-data.test.ts
git commit -m "feat(seo): add BreadcrumbList JSON-LD builder"
```

### Task 8.3: FAQPage builder

**Files:**
- Modify: `src/lib/seo/structured-data.ts`
- Modify: `src/lib/seo/__tests__/structured-data.test.ts`

- [ ] **Step 1: Write failing test**

Append to `src/lib/seo/__tests__/structured-data.test.ts`:

```typescript
import { buildFAQPageJsonLd } from '../structured-data'

describe('buildFAQPageJsonLd', () => {
  it('maps Q&A to Question items', () => {
    const jsonLd = buildFAQPageJsonLd([
      { question: 'Was kostet eine Solaranlage?', answer: 'CHF 18\'000 bis 35\'000.' },
    ])
    expect(jsonLd['@type']).toBe('FAQPage')
    expect(jsonLd.mainEntity[0]['@type']).toBe('Question')
    expect(jsonLd.mainEntity[0].acceptedAnswer['@type']).toBe('Answer')
    expect(jsonLd.mainEntity[0].acceptedAnswer.text).toBe("CHF 18'000 bis 35'000.")
  })
})
```

- [ ] **Step 2: Run — expect fail**

- [ ] **Step 3: Implement**

Append:

```typescript
type FaqItem = { question: string; answer: string }

export function buildFAQPageJsonLd(items: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(i => ({
      '@type': 'Question',
      name: i.question,
      acceptedAnswer: { '@type': 'Answer', text: i.answer },
    })),
  }
}
```

- [ ] **Step 4: Run tests — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/lib/seo/structured-data.ts src/lib/seo/__tests__/structured-data.test.ts
git commit -m "feat(seo): add FAQPage JSON-LD builder"
```

### Task 8.4: Article builder

**Files:**
- Modify: `src/lib/seo/structured-data.ts`
- Modify: `src/lib/seo/__tests__/structured-data.test.ts`

- [ ] **Step 1: Write failing test**

Append:

```typescript
import { buildArticleJsonLd } from '../structured-data'

describe('buildArticleJsonLd', () => {
  it('includes headline, author, datePublished, image', () => {
    const jsonLd = buildArticleJsonLd({
      headline: 'Solaranlage Kosten 2026',
      url: 'https://freestate.ch/blog/solaranlage-kosten-2026',
      image: 'https://freestate.ch/images/cover.jpg',
      authorName: 'Max Muster',
      datePublished: '2026-04-20T10:00:00+02:00',
      dateModified: '2026-04-22T14:00:00+02:00',
      description: 'Was kostet eine Solaranlage 2026 in der Schweiz?',
    })
    expect(jsonLd['@type']).toBe('Article')
    expect(jsonLd.headline).toBe('Solaranlage Kosten 2026')
    expect(jsonLd.author['@type']).toBe('Person')
    expect(jsonLd.author.name).toBe('Max Muster')
    expect(jsonLd.publisher['@type']).toBe('Organization')
    expect(jsonLd.mainEntityOfPage).toBe('https://freestate.ch/blog/solaranlage-kosten-2026')
  })
})
```

- [ ] **Step 2: Run — expect fail**

- [ ] **Step 3: Implement**

Append:

```typescript
type ArticleArgs = {
  headline: string
  url: string
  image?: string
  authorName: string
  datePublished: string
  dateModified?: string
  description: string
}

export function buildArticleJsonLd(a: ArticleArgs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.headline,
    description: a.description,
    image: a.image ? [a.image] : undefined,
    author: { '@type': 'Person', name: a.authorName },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: { '@type': 'ImageObject', url: `${siteConfig.url}/logo-dark.svg` },
    },
    datePublished: a.datePublished,
    dateModified: a.dateModified ?? a.datePublished,
    mainEntityOfPage: a.url,
    inLanguage: 'de',
  }
}
```

- [ ] **Step 4: Run tests — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/lib/seo/structured-data.ts src/lib/seo/__tests__/structured-data.test.ts
git commit -m "feat(seo): add Article JSON-LD builder"
```

### Task 8.5: Service builder (for product pillar pages)

**Files:**
- Modify: `src/lib/seo/structured-data.ts`
- Modify: `src/lib/seo/__tests__/structured-data.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
import { buildServiceJsonLd } from '../structured-data'

describe('buildServiceJsonLd', () => {
  it('maps service name + areaServed + provider', () => {
    const jsonLd = buildServiceJsonLd({
      name: 'Solaranlagen Installation',
      description: 'Photovoltaik für Einfamilienhaus in der Deutschschweiz.',
      url: 'https://freestate.ch/solaranlagen',
      serviceType: 'Solar Energy Installation',
    })
    expect(jsonLd['@type']).toBe('Service')
    expect(jsonLd.provider['@type']).toBe('Organization')
    expect(jsonLd.areaServed).toHaveLength(19)
  })
})
```

- [ ] **Step 2: Run — expect fail**

- [ ] **Step 3: Implement**

Append:

```typescript
type ServiceArgs = {
  name: string
  description: string
  url: string
  serviceType: string
}

export function buildServiceJsonLd(s: ServiceArgs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: s.name,
    description: s.description,
    url: s.url,
    serviceType: s.serviceType,
    provider: {
      '@type': 'Organization',
      name: siteConfig.name,
      url: siteConfig.url,
    },
    areaServed: siteConfig.areaServed.map(name => ({
      '@type': 'AdministrativeArea',
      name,
    })),
  }
}
```

- [ ] **Step 4: Run tests — expect PASS**

- [ ] **Step 5: Commit**

```bash
git add src/lib/seo/structured-data.ts src/lib/seo/__tests__/structured-data.test.ts
git commit -m "feat(seo): add Service JSON-LD builder"
```

### Task 8.6: `<JsonLd>` React component

**Files:**
- Create: `src/components/seo/JsonLd.tsx`

- [ ] **Step 1: Write the component**

Create `src/components/seo/JsonLd.tsx`:

```tsx
type Props = { data: unknown }

export function JsonLd({ data }: Props) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/seo/JsonLd.tsx
git commit -m "feat(seo): add JsonLd react component"
```

---

# Group 9 — Inject JSON-LD on Pages

### Task 9.1: Inject Organization + LocalBusiness + WebSite on locale layout

**Files:**
- Modify: `src/app/[locale]/layout.tsx`

- [ ] **Step 1: Import builders and component**

Add near the top of `src/app/[locale]/layout.tsx`:

```typescript
import { JsonLd } from '@/components/seo/JsonLd'
import {
  buildOrganizationJsonLd,
  buildLocalBusinessJsonLd,
  buildWebSiteJsonLd,
} from '@/lib/seo/structured-data'
```

- [ ] **Step 2: Add JSON-LD to the `<head>` before `<AnalyticsScripts />`**

In the returned JSX of `LocaleLayout`, replace:

```tsx
      <head>
        <AnalyticsScripts />
      </head>
```

With:

```tsx
      <head>
        <JsonLd data={buildOrganizationJsonLd()} />
        <JsonLd data={buildLocalBusinessJsonLd()} />
        <JsonLd data={buildWebSiteJsonLd()} />
        <AnalyticsScripts />
      </head>
```

- [ ] **Step 3: Build + verify three JSON-LD scripts render**

```bash
pnpm build && pnpm start &
sleep 3
curl -s http://localhost:3000/ | grep -c 'application/ld+json'
kill %1
```

Expected output: `3`.

- [ ] **Step 4: Paste a rendered page's `<head>` JSON-LD into Google Rich Results Test manually**

URL: https://search.google.com/test/rich-results
Expected: Organization + LocalBusiness + WebSite all parsed without errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/layout.tsx
git commit -m "feat(seo): inject global Organization, LocalBusiness, WebSite JSON-LD"
```

### Task 9.2: Inject Service JSON-LD on the 6 product pillar pages

**Files:**
- Modify: `src/app/[locale]/solar-systems/page.tsx`
- Modify: `src/app/[locale]/solar-free/page.tsx`
- Modify: `src/app/[locale]/solar-direct/page.tsx`
- Modify: `src/app/[locale]/battery-storage/page.tsx`
- Modify: `src/app/[locale]/heat-pumps/page.tsx`
- Modify: `src/app/[locale]/charging-stations/page.tsx`

- [ ] **Step 1: For each page, import `JsonLd` and `buildServiceJsonLd`, call it with page-specific arguments, and render a `<JsonLd>` inside the returned JSX (anywhere, it's a `<script>`)**

Example for `solar-systems/page.tsx`:

```tsx
import { JsonLd } from '@/components/seo/JsonLd'
import { buildServiceJsonLd } from '@/lib/seo/structured-data'

// inside the component's return, as the first child:
<JsonLd
  data={buildServiceJsonLd({
    name: 'Solaranlagen Installation',
    description:
      'Photovoltaikanlagen für Einfamilienhäuser in der Deutschschweiz. Planung, Installation und Inbetriebnahme.',
    url: 'https://freestate.ch/solaranlagen',
    serviceType: 'Solar Energy Installation',
  })}
/>
```

Apply page-specific text for each pillar:
- `solar-free` → name: `'Solar-Abo (PPA)'`, serviceType: `'Solar Power Purchase Agreement'`, url: `https://freestate.ch/solar-free`, description: `'Solar-Abo Modell ohne Eigeninvestition. Monatliche Rate statt Kauf.'`
- `solar-direct` → name: `'Solar-Direct'`, serviceType: `'Solar Direct Purchase'`, url: `https://freestate.ch/solar-direct`, description: `'Direkter Kauf einer Solaranlage mit transparentem Festpreis.'`
- `battery-storage` → name: `'Batteriespeicher Installation'`, serviceType: `'Battery Storage Installation'`, url: `https://freestate.ch/batteriespeicher`, description: `'Stromspeicher für Photovoltaikanlagen.'`
- `heat-pumps` → name: `'Wärmepumpen Installation'`, serviceType: `'Heat Pump Installation'`, url: `https://freestate.ch/waermepumpen`, description: `'Luft/Wasser und Sole/Wasser Wärmepumpen.'`
- `charging-stations` → name: `'Ladestationen für Elektroautos'`, serviceType: `'EV Charging Station Installation'`, url: `https://freestate.ch/ladestationen`, description: `'Wallbox für zuhause, bidirektionales Laden verfügbar.'`

- [ ] **Step 2: Build**

```bash
pnpm build 2>&1 | tail -3
```

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/solar-systems/page.tsx src/app/[locale]/solar-free/page.tsx src/app/[locale]/solar-direct/page.tsx src/app/[locale]/battery-storage/page.tsx src/app/[locale]/heat-pumps/page.tsx src/app/[locale]/charging-stations/page.tsx
git commit -m "feat(seo): inject Service JSON-LD on product pillar pages"
```

### Task 9.3: Inject Article + BreadcrumbList on blog post pages

**Files:**
- Modify: `src/app/[locale]/blog/[slug]/page.tsx`

- [ ] **Step 1: Import the builders and component**

Add near the top:

```typescript
import { JsonLd } from '@/components/seo/JsonLd'
import {
  buildArticleJsonLd,
  buildBreadcrumbListJsonLd,
} from '@/lib/seo/structured-data'
```

- [ ] **Step 2: Render the two JSON-LD scripts at the top of the JSX returned by `BlogPostPage`**

Inside the component, just above the `<article>`:

```tsx
<JsonLd
  data={buildArticleJsonLd({
    headline: tr.title,
    url: `https://freestate.ch/blog/${post.slug}`,
    image: post.coverImageUrl ?? undefined,
    authorName: `${post.author.firstName} ${post.author.lastName}`,
    datePublished: post.publishedAt ?? new Date().toISOString(),
    description: tr.excerpt ?? tr.title,
  })}
/>
<JsonLd
  data={buildBreadcrumbListJsonLd([
    { name: 'Home', url: 'https://freestate.ch/' },
    { name: 'Blog', url: 'https://freestate.ch/blog' },
    { name: tr.title, url: `https://freestate.ch/blog/${post.slug}` },
  ])}
/>
```

- [ ] **Step 3: Build**

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/blog/[slug]/page.tsx
git commit -m "feat(seo): inject Article + BreadcrumbList JSON-LD on blog posts"
```

### Task 9.4: Inject BreadcrumbList on all non-root pages

For each non-root public page, render a `BreadcrumbList` matching the URL hierarchy. This is mechanical but adds high-value structured data signal.

Create a helper first:

**Files:**
- Modify: `src/lib/seo/structured-data.ts`
- Modify: `src/lib/seo/__tests__/structured-data.test.ts`

- [ ] **Step 1: Add a helper `buildBreadcrumbsFromPath(segments)` that creates breadcrumb items from URL segments**

Write a failing test and implementation:

Append test:

```typescript
import { buildBreadcrumbsFromPath } from '../structured-data'

describe('buildBreadcrumbsFromPath', () => {
  it('builds from segments', () => {
    const jsonLd = buildBreadcrumbsFromPath([
      { name: 'Home', href: '/' },
      { name: 'Solaranlagen', href: '/solar-systems' },
      { name: 'Einfamilienhaus', href: '/solar-systems/single-family' },
    ])
    expect(jsonLd.itemListElement).toHaveLength(3)
  })
})
```

Append implementation:

```typescript
export function buildBreadcrumbsFromPath(
  segments: { name: string; href: string }[]
) {
  return buildBreadcrumbListJsonLd(
    segments.map(s => ({
      name: s.name,
      url: s.href === '/' ? `${siteConfig.url}/` : `${siteConfig.url}${s.href}`,
    }))
  )
}
```

- [ ] **Step 2: Run tests**

```bash
pnpm test -- src/lib/seo/__tests__/structured-data.test.ts
```

Expected: PASS.

- [ ] **Step 3: Inject breadcrumb JSON-LD on each non-root page**

For each page listed in Task 7's table (excluding home), add:

```tsx
import { JsonLd } from '@/components/seo/JsonLd'
import { buildBreadcrumbsFromPath } from '@/lib/seo/structured-data'
```

and render at the top of the component:

```tsx
<JsonLd
  data={buildBreadcrumbsFromPath([
    { name: 'Home', href: '/' },
    { name: '<SEGMENT_NAME>', href: '<PATHNAME_KEY>' },
  ])}
/>
```

For 3-segment pages (e.g. `/heat-pumps/cost`):

```tsx
<JsonLd
  data={buildBreadcrumbsFromPath([
    { name: 'Home', href: '/' },
    { name: 'Wärmepumpen', href: '/heat-pumps' },
    { name: 'Kosten', href: '/heat-pumps/cost' },
  ])}
/>
```

Use the DE name for the breadcrumb label for now (Phase 2 will internationalize via `t('breadcrumb.<key>')`).

- [ ] **Step 4: Build**

```bash
pnpm build 2>&1 | tail -3
```

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/ src/lib/seo/
git commit -m "feat(seo): inject BreadcrumbList JSON-LD on all non-root pages"
```

### Task 9.5: Inject FAQPage on `/faq` page

**Files:**
- Modify: `src/app/[locale]/faq/page.tsx`

- [ ] **Step 1: Read the current FAQ content to identify the Q&A array**

```bash
head -100 src/app/[locale]/faq/page.tsx
```

Identify the source of questions + answers (likely from `messages/*.json` FAQ namespace).

- [ ] **Step 2: Build the FAQ items array from the `faq` namespace and render a `<JsonLd>`**

Example (adapt to actual data source):

```tsx
import { JsonLd } from '@/components/seo/JsonLd'
import { buildFAQPageJsonLd } from '@/lib/seo/structured-data'
import { getTranslations, getMessages } from 'next-intl/server'

// inside the component:
const messages = await getMessages()
const faqBlock = (messages as any).faq?.items ?? []
const faqItems = faqBlock.map((item: any) => ({
  question: item.question,
  answer: item.answer,
}))

<JsonLd data={buildFAQPageJsonLd(faqItems)} />
```

Adapt shape to the actual `messages/<locale>.json` `faq` structure.

- [ ] **Step 3: Build + Rich Results Test verify**

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/faq/page.tsx
git commit -m "feat(seo): inject FAQPage JSON-LD on FAQ page"
```

---

# Group 10 — Sitemap and Robots

### Task 10.1: Dynamic sitemap.ts with hreflang alternates

**Files:**
- Create: `src/app/sitemap.ts`
- Create: `src/app/__tests__/sitemap.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/app/__tests__/sitemap.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest'

vi.mock('@/services/blog.service', () => ({
  blogService: {
    listPublished: async () => ({ success: true, data: [], meta: { total: 0, page: 1, limit: 1000, totalPages: 0 } }),
  },
}))

import sitemap from '../sitemap'

describe('sitemap', () => {
  it('includes the home page with all locale alternates', async () => {
    const entries = await sitemap()
    const home = entries.find(e => e.url === 'https://freestate.ch/')
    expect(home).toBeDefined()
    expect(home?.alternates?.languages).toBeDefined()
    expect(Object.keys(home!.alternates!.languages!).sort()).toEqual([
      'de',
      'en',
      'fr',
      'it',
      'x-default',
    ])
  })

  it('includes the localized pathname for about-us', async () => {
    const entries = await sitemap()
    const urls = entries.map(e => e.url)
    expect(urls).toContain('https://freestate.ch/ueber-uns')
  })

  it('does not include admin or dashboard paths', async () => {
    const entries = await sitemap()
    const urls = entries.map(e => e.url)
    for (const url of urls) {
      expect(url).not.toContain('/admin')
      expect(url).not.toContain('/dashboard')
    }
  })
})
```

- [ ] **Step 2: Run — expect fail**

- [ ] **Step 3: Implement sitemap.ts**

Create `src/app/sitemap.ts`:

```typescript
import type { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'
import { siteConfig } from '@/lib/seo/site-config'
import { buildCanonicalUrl, buildHreflangAlternates } from '@/lib/seo/metadata'
import { blogService } from '@/services/blog.service'
import type { SiteLocale } from '@/lib/seo/site-config'

const PUBLIC_PATHS: (keyof typeof routing.pathnames)[] = [
  '/',
  '/solar-systems',
  '/solar-free',
  '/solar-direct',
  '/battery-storage',
  '/heat-pumps',
  '/heat-pumps/products',
  '/heat-pumps/cost',
  '/heat-pumps/how-it-works',
  '/heat-pumps/heat-pumps-with-solar-system',
  '/heat-pumps/service',
  '/charging-stations',
  '/charging-stations/apartment-building',
  '/charging-stations/single-family-home',
  '/charging-stations/bidirectional-charging-station',
  '/commercial',
  '/commercial/solar-systems',
  '/commercial/solar-systems/how-large-plants-works',
  '/commercial/solar-systems/project-development',
  '/commercial/solar-systems/solar-carport',
  '/commercial/solar-systems/contracting',
  '/commercial/charging-stations',
  '/commercial/charging-stations/apartment-building',
  '/commercial/charging-stations/fast-charging-stations',
  '/commercial/charging-stations/bidirectional-charging-station',
  '/commercial/charging-stations/company',
  '/commercial/solar-free',
  '/commercial/solar-free/industry-commercial',
  '/commercial/solar-free/solar-free-multi-family',
  '/commercial/solar-free/farmhouses',
  '/commercial/solar-free/public-buildings',
  '/commercial/calculator',
  '/cost',
  '/amortization',
  '/solar-calculator',
  '/calculator',
  '/about-us',
  '/team',
  '/history',
  '/careers',
  '/faq',
  '/portfolio',
  '/service',
  '/blog',
  '/contact',
  '/energy-storage',
  '/repowering',
  '/solar-system-carport',
  '/how-it-works',
  '/media',
  '/investors',
  '/impressum',
  '/agb',
  '/privacy-policy',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = []

  for (const pathname of PUBLIC_PATHS) {
    for (const locale of siteConfig.locales) {
      const url = buildCanonicalUrl({ pathname, locale: locale as SiteLocale })
      entries.push({
        url,
        lastModified: now,
        changeFrequency: pathname === '/' ? 'weekly' : 'monthly',
        priority: pathname === '/' ? 1 : 0.7,
        alternates: {
          languages: buildHreflangAlternates(pathname),
        },
      })
    }
  }

  const blogPosts = await fetchAllBlogPosts()
  for (const post of blogPosts) {
    const url = `${siteConfig.url}/blog/${post.slug}`
    entries.push({
      url,
      lastModified: post.updatedAt ? new Date(post.updatedAt) : now,
      changeFrequency: 'monthly',
      priority: 0.6,
    })
  }

  return entries
}

async function fetchAllBlogPosts() {
  const result = await blogService.listPublished(1, 1000)
  return result.data ?? []
}
```

- [ ] **Step 4: Run tests**

```bash
pnpm test -- src/app/__tests__/sitemap.test.ts
```

Expected: PASS.

- [ ] **Step 5: Build + curl sitemap.xml**

```bash
pnpm build && pnpm start &
sleep 3
curl -s http://localhost:3000/sitemap.xml | head -30
kill %1
```

Expected: well-formed XML containing `<loc>https://freestate.ch/</loc>`, `<xhtml:link rel="alternate" hreflang="...">` entries.

- [ ] **Step 6: Commit**

```bash
git add src/app/sitemap.ts src/app/__tests__/sitemap.test.ts
git commit -m "feat(seo): add dynamic sitemap with hreflang alternates"
```

### Task 10.2: robots.ts

**Files:**
- Create: `src/app/robots.ts`
- Create: `src/app/__tests__/robots.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/app/__tests__/robots.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import robots from '../robots'

describe('robots', () => {
  it('points at the sitemap', () => {
    const r = robots()
    expect(r.sitemap).toBe('https://freestate.ch/sitemap.xml')
  })

  it('disallows admin, dashboard, auth, api paths', () => {
    const r = robots()
    const rules = Array.isArray(r.rules) ? r.rules : [r.rules]
    const disallows = rules.flatMap(rule =>
      Array.isArray(rule.disallow) ? rule.disallow : [rule.disallow]
    )
    expect(disallows).toContain('/admin/')
    expect(disallows).toContain('/dashboard/')
    expect(disallows).toContain('/api/')
  })

  it('allows public paths by default (wildcard)', () => {
    const r = robots()
    const rules = Array.isArray(r.rules) ? r.rules : [r.rules]
    expect(rules.some(rule => rule.userAgent === '*')).toBe(true)
  })
})
```

- [ ] **Step 2: Run — expect fail**

- [ ] **Step 3: Implement**

Create `src/app/robots.ts`:

```typescript
import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/seo/site-config'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/dashboard/',
          '/login',
          '/register',
          '/forgot-password',
          '/set-password',
          '/verify-email',
          '/api/',
          '/*?preview=true',
          '/*?draft=true',
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  }
}
```

- [ ] **Step 4: Run tests**

```bash
pnpm test -- src/app/__tests__/robots.test.ts
```

Expected: PASS.

- [ ] **Step 5: Build + curl robots.txt**

```bash
pnpm build && pnpm start &
sleep 3
curl -s http://localhost:3000/robots.txt
kill %1
```

Expected output includes:
- `User-agent: *`
- `Disallow: /admin/`
- `Sitemap: https://freestate.ch/sitemap.xml`

- [ ] **Step 6: Commit**

```bash
git add src/app/robots.ts src/app/__tests__/robots.test.ts
git commit -m "feat(seo): add robots.txt blocking admin/dashboard/auth/api"
```

---

# Group 11 — Image Optimization

### Task 11.1: Remove `unoptimized` from blog pages

**Files:**
- Modify: `src/app/[locale]/blog/page.tsx`
- Modify: `src/app/[locale]/blog/[slug]/page.tsx`

- [ ] **Step 1: Remove `unoptimized` attribute from all `<Image>` tags in both files**

Search-and-remove every occurrence of the `unoptimized` prop in both files:

```bash
grep -n "unoptimized" src/app/[locale]/blog/page.tsx src/app/[locale]/blog/[slug]/page.tsx
```

Expected: currently 3 occurrences (2 in list page, 1 in detail page). Edit each location, removing the `unoptimized` prop (and trailing whitespace) from the `<Image>` usage. After editing:

```bash
grep -n "unoptimized" src/app/[locale]/blog/page.tsx src/app/[locale]/blog/[slug]/page.tsx
```

Expected: (empty — no matches).

- [ ] **Step 2: Confirm remote image hostname allowed**

`next.config.ts` already allows `pub-4c6192458b6640b4882edb8106c3751f.r2.dev`. Good.

- [ ] **Step 3: Dev test — confirm image still renders**

```bash
pnpm dev
# Browse http://localhost:3000/blog (if there are posts) and confirm images load
```

If the image 404s, the remotePatterns may need a path restriction — verify by clicking an image and checking Network tab.

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/blog/page.tsx src/app/[locale]/blog/[slug]/page.tsx
git commit -m "perf(seo): remove unoptimized flag from blog images"
```

### Task 11.2: Audit + fix all `<Image>` alt attributes on public pages

**Files:**
- Modify: all public `page.tsx` files with `<Image>` usage

- [ ] **Step 1: Find all `<Image>` usage in public pages**

```bash
grep -rn '<Image' src/app/[locale]/ --include="*.tsx" | grep -v "(admin)" | grep -v "(protected)" | grep -v "(auth)"
```

- [ ] **Step 2: For each hit, verify the `alt` attribute is keyword-aware and descriptive, not empty or filename-based**

Problem patterns to fix:
- `alt=""` — replace with a descriptive keyword-inclusive string
- `alt="image"` / `alt="photo"` — replace
- `alt={post.title}` for hero images — OK (descriptive)
- Missing `alt` — add (TS will complain but runtime won't)

For SEO, every hero image on a money page should use the primary keyword in its alt, e.g., `alt="Solaranlage auf Einfamilienhaus in der Schweiz"`.

- [ ] **Step 3: Build**

```bash
pnpm build 2>&1 | tail -3
```

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/
git commit -m "fix(seo): keyword-aware alt text on public page images"
```

### Task 11.3: Priority hero images on LCP-critical pages

**Files:**
- Modify: `src/components/Hero.tsx` and equivalent hero components on pillar pages

- [ ] **Step 1: Identify LCP element for homepage and each pillar page**

Run Lighthouse locally; LCP is typically the first large hero image.

- [ ] **Step 2: For each LCP `<Image>`, add `priority` + `fetchPriority="high"`**

Example:
```tsx
<Image
  src="/images/hero.png"
  alt="..."
  priority
  fetchPriority="high"
  ...
/>
```

- [ ] **Step 3: Verify Lighthouse LCP < 2.5s on homepage**

```bash
pnpm build && pnpm start &
sleep 3
npx lighthouse http://localhost:3000/ --only-categories=performance --preset=desktop --output=json --quiet | python3 -c 'import sys,json; r=json.load(sys.stdin); print("LCP:", r["audits"]["largest-contentful-paint"]["displayValue"])'
kill %1
```

Expected: LCP < 2.5s.

- [ ] **Step 4: Commit**

```bash
git add src/components/
git commit -m "perf(seo): priority and fetchPriority on LCP hero images"
```

---

# Group 12 — Core Web Vitals Pass

### Task 12.1: Run Lighthouse on top 10 pages and capture baseline

**Files:**
- Create: `docs/seo/cwv-2026-04.md`

- [ ] **Step 1: Run Lighthouse on each top page, capture scores**

```bash
pnpm build && pnpm start &
sleep 3
URLS=(
  http://localhost:3000/
  http://localhost:3000/solaranlagen
  http://localhost:3000/solar-free
  http://localhost:3000/batteriespeicher
  http://localhost:3000/waermepumpen
  http://localhost:3000/ladestationen
  http://localhost:3000/kosten
  http://localhost:3000/solarrechner
  http://localhost:3000/portfolio
  http://localhost:3000/blog
)
for url in "${URLS[@]}"; do
  npx lighthouse "$url" --only-categories=performance,seo,accessibility --preset=mobile --output=json --quiet > "/tmp/lh-$(echo $url | sed 's/[^a-zA-Z0-9]/_/g').json"
done
kill %1
```

- [ ] **Step 2: Write a summary doc with the scores**

Create `docs/seo/cwv-2026-04.md`:

```markdown
# Core Web Vitals Snapshot — 2026-04

Mobile, Lighthouse CLI, `pnpm start` locally.

| URL | Perf | SEO | LCP | INP | CLS |
|---|---|---|---|---|---|
| / | ___ | ___ | ___ | ___ | ___ |
| /solaranlagen | ___ | ___ | ___ | ___ | ___ |
| /solar-free | ___ | ___ | ___ | ___ | ___ |
... (fill from JSON outputs)
```

- [ ] **Step 3: Fix any page scoring < 90 Perf**

Common culprits:
- Unsized images → add `width`/`height` or `fill` + container `position: relative`
- Render-blocking JS → `defer` or `strategy="lazyOnload"` on non-critical scripts
- Heavy components on homepage (maps, tiptap) → dynamic import with `ssr: false` if truly non-critical

- [ ] **Step 4: Commit**

```bash
git add docs/seo/cwv-2026-04.md src/
git commit -m "perf(seo): baseline CWV and apply first-pass fixes"
```

### Task 12.1b: Preconnect to R2 image bucket

**Files:**
- Modify: `src/app/[locale]/layout.tsx`

- [ ] **Step 1: Add `<link rel="preconnect">` to the R2 hostname in the `<head>`**

Inside the `<head>` of `LocaleLayout`, before `<JsonLd />` blocks:

```tsx
<link rel="preconnect" href="https://pub-4c6192458b6640b4882edb8106c3751f.r2.dev" crossOrigin="anonymous" />
<link rel="dns-prefetch" href="https://pub-4c6192458b6640b4882edb8106c3751f.r2.dev" />
```

- [ ] **Step 2: Build + verify in rendered HTML**

```bash
pnpm build && pnpm start &
sleep 3
curl -s http://localhost:3000/ | grep -E 'preconnect|dns-prefetch'
kill %1
```

Expected: both tags appear.

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/layout.tsx
git commit -m "perf(seo): preconnect to R2 image bucket"
```

### Task 12.2: Lazy-load heavy optional dependencies

**Files:**
- Modify: wherever `@googlemaps/js-api-loader`, `ol` (OpenLayers), `gsap`, `tiptap` are used in public pages

- [ ] **Step 1: Find where heavy libs are imported**

```bash
grep -rn "@googlemaps\|from 'ol'\|from 'gsap'\|@tiptap" src/app/[locale]/ src/components/ --include="*.tsx" --include="*.ts"
```

- [ ] **Step 2: For each public page that imports a heavy lib only for one component, switch to dynamic import**

Example pattern:

```tsx
import dynamic from 'next/dynamic'

const SolarMap = dynamic(() => import('@/components/SolarMap'), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-gray-100 animate-pulse" />,
})
```

Apply to components that render maps, rich-text editors, or animation-only components.

- [ ] **Step 3: Re-run Lighthouse on affected pages**

- [ ] **Step 4: Commit**

```bash
git add src/
git commit -m "perf(seo): lazy-load heavy dependencies on public pages"
```

---

# Group 13 — GEO (llms.txt) + Analytics Verification

### Task 13.1: Add `llms.txt` at root

**Files:**
- Create: `public/llms.txt`

- [ ] **Step 1: Write the file**

Create `public/llms.txt`:

```
# Free State AG

> Free State AG ist ein Schweizer Anbieter für Photovoltaikanlagen, Batteriespeicher, Wärmepumpen und Ladestationen. Kaufen oder als Solar-Abo ohne Eigeninvestition. Tätig in 19 Kantonen der Deutschschweiz.

## Produkte und Leistungen

- [Solaranlagen](https://freestate.ch/solaranlagen): Photovoltaikanlagen für Einfamilienhäuser und Mehrfamilienhäuser
- [Solar-Abo](https://freestate.ch/solar-free): Solaranlage ohne Eigeninvestition, monatliche Rate statt Kauf
- [Batteriespeicher](https://freestate.ch/batteriespeicher): Stromspeicher ab 5 kWh
- [Wärmepumpen](https://freestate.ch/waermepumpen): Luft/Wasser und Sole/Wasser
- [Ladestationen](https://freestate.ch/ladestationen): Wallbox für Zuhause und bidirektionales Laden
- [Gewerbe](https://freestate.ch/gewerbe): Lösungen für Unternehmen, Landwirtschaft und öffentliche Gebäude

## Firmeninformationen

- [Über uns](https://freestate.ch/ueber-uns)
- [Team](https://freestate.ch/team)
- [Geschichte](https://freestate.ch/geschichte)
- [Karriere](https://freestate.ch/karriere)
- [Kontakt](https://freestate.ch/kontakt)
- [Impressum](https://freestate.ch/impressum)

## Ressourcen

- [Solarrechner](https://freestate.ch/solarrechner)
- [Kosten](https://freestate.ch/kosten)
- [Amortisation](https://freestate.ch/amortisation)
- [FAQ](https://freestate.ch/faq)
- [Blog](https://freestate.ch/blog)
- [Referenzen](https://freestate.ch/portfolio)
```

- [ ] **Step 2: Verify it serves**

```bash
pnpm dev
curl -s http://localhost:3000/llms.txt | head -5
```

- [ ] **Step 3: Commit**

```bash
git add public/llms.txt
git commit -m "feat(seo): add llms.txt for AI search engines"
```

### Task 13.2: Confirm production analytics is on

Stakeholder task. Document the steps.

**Files:**
- Modify: `docs/seo/verification-checklist.md` (created in next task)

- [ ] **Step 1: Stakeholder logs into Vercel (or wherever prod is hosted) and confirms/sets env:**
  - `NEXT_PUBLIC_ANALYTICS_ENABLED=true`
  - `NEXT_PUBLIC_GTM_ID=GTM-MF4MHZRP`
  - `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=<from GSC or empty if using DNS>`

- [ ] **Step 2: Redeploy**

- [ ] **Step 3: Verify GTM fires on production using Google Tag Assistant Chrome extension**

- [ ] **Step 4: Verify real-time events in GA4**

- [ ] **Step 5: Commit no code; update baseline doc if numbers shifted**

### Task 13.3: Verify GSC domain property and submit sitemap

Stakeholder task.

- [ ] **Step 1: In GSC, confirm `freestate.ch` is added as a domain property (not just URL-prefix)**

- [ ] **Step 2: Submit sitemap: `https://freestate.ch/sitemap.xml`**

- [ ] **Step 3: Use URL Inspection on the homepage, request indexing**

- [ ] **Step 4: Verify "Sitemaps" report shows Success within 24h**

### Task 13.4: Add Bing Webmaster Tools + submit same sitemap

Stakeholder task.

- [ ] **Step 1: At https://www.bing.com/webmasters add `freestate.ch` (can import from GSC)**

- [ ] **Step 2: Submit sitemap: `https://freestate.ch/sitemap.xml`**

- [ ] **Step 3: Done**

### Task 13.5: UTM conventions doc

**Files:**
- Create: `docs/seo/utm-conventions.md`

- [ ] **Step 1: Write the doc**

```markdown
# UTM Conventions

Consistent UTM tagging so GA4 campaign reports aren't polluted.

## Format

All outbound links with UTM params follow this structure:

`?utm_source=<source>&utm_medium=<medium>&utm_campaign=<campaign>&utm_content=<content>&utm_term=<term>`

## Values

### utm_source
- `newsletter` — email newsletters
- `linkedin` — LinkedIn organic or ads
- `instagram`
- `facebook`
- `google` — Google Ads (future)
- `print` — print flyer QR codes
- `partner-<partnername>` — co-branded partner materials

### utm_medium
- `email`
- `social` — organic social
- `cpc` — paid search
- `paid-social` — paid social
- `referral` — partner referral
- `print` — offline

### utm_campaign
Use kebab-case, descriptive, with quarter: `solar-abo-q2-2026`, `home-owner-pv-q3-2026`, `recruitment-2026`

### utm_content
Optional. Identify the specific creative: `email-banner-top`, `story-swipeup`, `flyer-v2`.

## Rules

- UTM params are **never** used on internal links (use `?ref=` or skip entirely — internal UTMs break GA4 session attribution).
- Always lowercase.
- No spaces; use `-` to separate words.
- Campaign names include the quarter so historical reports stay clean.

## Implementation

GA4 will auto-collect UTMs. No custom code needed.
```

- [ ] **Step 2: Commit**

```bash
git add docs/seo/utm-conventions.md
git commit -m "docs(seo): add UTM conventions"
```

### Task 13.6: Verification checklist doc

**Files:**
- Create: `docs/seo/verification-checklist.md`

- [ ] **Step 1: Write the doc**

```markdown
# SEO Verification Checklist — Phase 1

Run these manual checks after Phase 1 ship. Anything failing blocks Phase 2 start.

## Technical

- [ ] `curl -sI https://freestate.ch/` returns 200
- [ ] `curl -sI https://freestate.ch/sitemap.xml` returns 200 and `Content-Type: application/xml`
- [ ] `curl -s https://freestate.ch/robots.txt` lists Disallow: /admin/ and Sitemap
- [ ] `curl -s https://freestate.ch/llms.txt` returns the content
- [ ] View source of `/` shows `<html lang="de">`
- [ ] View source of `/en` shows `<html lang="en">`
- [ ] View source of `/` shows 3 JSON-LD scripts (Organization, LocalBusiness, WebSite)
- [ ] View source of `/` shows `<link rel="canonical" href="https://freestate.ch/">` and 5 hreflang entries

## Google Rich Results Test
(https://search.google.com/test/rich-results)

- [ ] `/` — Organization, LocalBusiness, WebSite, Breadcrumb (Breadcrumb expected on non-root so maybe N/A) pass
- [ ] `/solaranlagen` — Service + Breadcrumb pass
- [ ] `/solar-free` — Service + Breadcrumb pass
- [ ] `/blog/<any-published-slug>` — Article + Breadcrumb pass

## Google Search Console
- [ ] Domain property `freestate.ch` verified
- [ ] Sitemap submitted and status "Success"
- [ ] URL Inspection on `/`, `/solaranlagen`, `/solar-free` all show "URL is on Google" (or requested indexing)
- [ ] Coverage report shows 0 server errors, 0 redirect errors
- [ ] No manual actions

## Analytics
- [ ] GTM real-time shows events on production
- [ ] GA4 real-time shows sessions
- [ ] Cookie consent banner blocks analytics until accepted (dev tools check)

## Lighthouse (mobile)
- [ ] Homepage Perf ≥ 90, SEO = 100, A11y ≥ 95
- [ ] /solaranlagen same
- [ ] /solar-free same

## GEO spot-check
- [ ] Ask ChatGPT: "Welche Firma bietet Solar-Abo in der Schweiz an?" — Free State AG should appear (or at minimum, within 3-4 weeks post-indexing)
- [ ] Ask Perplexity: same
- [ ] Manually check https://perplexity.ai/ for citations to freestate.ch on 3 tracked queries
```

- [ ] **Step 2: Commit**

```bash
git add docs/seo/verification-checklist.md
git commit -m "docs(seo): add Phase 1 verification checklist"
```

---

# Group 14 — Final Integration Verification

### Task 14.1: Full test suite passes

- [ ] **Step 1: Run all tests**

```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 2: Run type-check**

```bash
pnpm exec tsc --noEmit
```

Expected: exit code 0.

- [ ] **Step 3: Run lint**

```bash
pnpm lint
```

Expected: exit code 0 (warnings acceptable, errors not).

- [ ] **Step 4: Run full production build**

```bash
pnpm build
```

Expected: build succeeds.

- [ ] **Step 5: If anything failed, fix inline before moving on**

### Task 14.2: Deploy to production (stakeholder)

- [ ] **Step 1: Merge Phase 1 branch to `main` (or the prod branch)**

- [ ] **Step 2: Confirm Vercel / host builds and deploys successfully**

- [ ] **Step 3: Run verification checklist from Task 13.6 against production URL**

- [ ] **Step 4: Update `docs/seo/baseline-2026-04.md` with post-deploy GSC and Lighthouse numbers (set of T+1 day metrics)**

### Task 14.3: Submit re-indexing request for top 10 pages in GSC

Stakeholder task — triggers Google to re-crawl with new metadata.

- [ ] **Step 1: In GSC, URL Inspection → Request Indexing on:**
  - `https://freestate.ch/`
  - `https://freestate.ch/solaranlagen`
  - `https://freestate.ch/solar-free`
  - `https://freestate.ch/batteriespeicher`
  - `https://freestate.ch/waermepumpen`
  - `https://freestate.ch/ladestationen`
  - `https://freestate.ch/kosten`
  - `https://freestate.ch/solarrechner`
  - `https://freestate.ch/ueber-uns`
  - `https://freestate.ch/blog`

- [ ] **Step 2: Wait 3-10 days**

- [ ] **Step 3: Confirm in GSC Coverage report that pages are indexed under new titles/descriptions**

---

# Phase 1 Exit Criteria

All must be checked before we start Phase 2.

- [ ] All test suite tasks pass in CI (or at least locally)
- [ ] Production deploy successful with no 500s, 404s on public paths
- [ ] Verification checklist (Task 13.6) fully green
- [ ] 10 top pages re-indexed in GSC under new titles
- [ ] Stakeholder confirms GTM + GA4 receiving production events
- [ ] Baseline `docs/seo/baseline-2026-04.md` has post-deploy T+1-day numbers captured for comparison at month 1, 3, 6, 12
- [ ] No manual actions in GSC

Once all checked, we start Phase 2 (On-page content rewrite + GBP + directory citations) as a separate plan.
