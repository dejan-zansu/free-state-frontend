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

- [ ] `/` — Organization, LocalBusiness, WebSite all pass
- [ ] `/solaranlagen` — Service pass
- [ ] `/solar-free` — Service pass
- [ ] `/solar-direct` — Service pass
- [ ] `/batteriespeicher` — Service pass
- [ ] `/waermepumpen` — Service pass
- [ ] `/ladestationen` — Service pass
- [ ] `/faq` — FAQPage pass
- [ ] `/blog/<any-published-slug>` — Article + Breadcrumb pass

## Google Search Console
- [ ] Domain property `freestate.ch` verified
- [ ] Sitemap submitted and status "Success"
- [ ] URL Inspection on `/`, `/solaranlagen`, `/solar-free` all show "URL is on Google" (or requested indexing)
- [ ] Coverage report shows 0 server errors, 0 redirect errors
- [ ] No manual actions

## Analytics
- [ ] `NEXT_PUBLIC_ANALYTICS_ENABLED=true` in production env
- [ ] GTM real-time shows events on production
- [ ] GA4 real-time shows sessions
- [ ] Cookie consent banner blocks analytics until accepted (dev tools check)

## Lighthouse (mobile, production URL)
- [ ] Homepage Perf ≥ 90, SEO = 100, A11y ≥ 95
- [ ] /solaranlagen same
- [ ] /solar-free same
- [ ] /batteriespeicher same

## Image optimization
- [ ] Blog list and blog detail images serve AVIF via `next/image` (check Network tab → image requests have `content-type: image/avif`)
- [ ] No remaining `unoptimized` prop on public-page images (calculator flow exempt)

## Core Web Vitals (from CrUX / GSC after 28 days)
- [ ] LCP < 2.5s (mobile)
- [ ] INP < 200ms
- [ ] CLS < 0.1

## GEO spot-check (after indexing, T+4-6 weeks)
- [ ] Ask ChatGPT: "Welche Firma bietet Solar-Abo in der Schweiz an?" — Free State AG appears
- [ ] Ask Perplexity: same
- [ ] Check https://perplexity.ai/ citations for freestate.ch on 3 tracked queries
