# Homepage Motion System — Design

**Date:** 2026-07-10
**Scope:** Homepage only (`src/app/[locale]/page.tsx`). Other pages are a later, separate effort.
**Status:** Approved for planning.

## Goal

Add smooth, subtle, premium scroll animations to the homepage that fit a Swiss
clean-energy brand: calm, trustworthy, "quietly engineered." Motion supports the
content and never performs. Explicitly "not too much."

## Decisions (locked)

- **Motion character:** Subtle & premium — fade + gentle rise, soft easing, short durations.
- **Scroll:** Native browser scroll. No Lenis / smooth-scroll library.
- **Build approach:** One reusable `<Reveal>` component driving a single shared motion language, built on the existing GSAP + `@gsap/react` + ScrollTrigger convention already used in `SolarSystemsQualityTimeline`.
- **Accents included:** Hero entrance on load; subtle hover polish on cards/buttons.
- **Accents excluded (v1):** Stat count-up (no dedicated stat band on the page), image parallax, masked text wipes.

## Existing conventions to follow

- GSAP is already a dependency (`gsap`, `@gsap/react`). ScrollTrigger already used.
- Established pattern (`SolarSystemsQualityTimeline.tsx`): `'use client'`, `gsap.registerPlugin(ScrollTrigger)`, `useGSAP(() => {...}, { scope: ref })`, refs.
- No new dependencies required.
- Project rules: no code comments; no Tailwind `leading-*` utilities.

## 1. Motion language (shared config)

A single config module is the one place the "feel" is defined and tuned:

- Reveal transform: `opacity 0 → 1`, `translateY 24px → 0`
- Easing: `power2.out`
- Base duration: `0.6s`
- Stagger between siblings: `0.08s`
- ScrollTrigger start: `top 85%`, plays **once** (`toggleActions` does not reverse; no re-trigger on scroll-up)
- Reduced motion: when `prefers-reduced-motion: reduce`, all reveals resolve immediately to final state (no transforms, no delay)

Rationale: centralizing tokens keeps 14 sections visually consistent and globally
tunable, which is what makes the result read as "designed" rather than a pile of effects.

## 2. Core building block: `<Reveal>`

A thin `'use client'` component set:

- `<Reveal>` — wraps a block; fades + rises it on scroll-in.
- `<Reveal.Stagger>` — wraps a group (e.g. a card grid); direct children animate in sequence using the stagger token.
- Props: `delay`, `distance`, optional `preset` for minor per-section variation, `as` for the rendered element.
- Sections remain **server components**; only the `<Reveal>` wrapper is client-side. This preserves SSR and performance.
- No-flash guard: initial hidden state is applied via GSAP after mount (or via a CSS class that GSAP clears), so SSR content is never permanently invisible if JS is slow or disabled. Content must be visible without JS.

## 3. Section-by-section rollout (top to bottom)

| Section | Component | Treatment |
|---|---|---|
| Hero | `Hero` | One-time entrance on load: headline → subtext → CTA → pills rise in sequence (stagger). The single "performance" moment. |
| Experience timeline | `ExperienceTimeline` | Heading reveal; 4 cards stagger left→right; connector line draws in as cards appear. |
| Promo | `home/PromoSection` | Heading reveal; promo cards stagger. |
| Solar models | `SolarModels` | Heading reveal; model cards stagger. |
| Package catalog | `home/PackageCatalogSection` | Heading reveal; package cards stagger. |
| Why FreeState | `WhyFreeState` | Heading + CTA reveal; 3 feature columns stagger. |
| Path to energy | `PathToEnergy` | Heading reveal; steps stagger in sequence. |
| FusionSolar app | `FusionSolarApp` | Text column and app imagery reveal together. |
| Battery / Heat pumps / EV charging | `ProductShowcase` (shared) | Handled once: text + numbered steps stagger, image fades in from its side. One change covers three sections. |
| Your benefits | `YourBenefits` | Heading reveal; benefit items stagger. |
| Customer stories | `CustomerStories` | Section heading reveals; the Embla carousel keeps its own existing motion. |
| Reviews | `Reviews` | Section heading reveals; Embla carousel unchanged. |
| Partners | `OurPartners` | Heading reveal; logos fade in as a soft group. |

Principle: every section uses the same fade + rise + stagger. The only bespoke
moments are the Hero entrance and the timeline line-draw.

## 4. Hover polish

Shared, tokenized, **desktop pointer only** (disabled for touch and reduced-motion):

- Cards: `translateY -4px` + softened shadow, `0.3s`.
- Card images: `scale 1.03` inside a clipped/`overflow-hidden` frame — no layout shift.
- Buttons/links: standardize transition timing to match the motion language.

## 5. Testing & verification

- Reduced-motion path: content fully visible, no transforms, no delays.
- No CLS from initial hidden states; no-flash guard verified.
- Live browser verification: drive the real homepage, scroll through, confirm each section reveals correctly and once.
- Keyboard and anchor navigation unaffected by ScrollTrigger.

## 6. Out of scope (v1)

Lenis / smooth scroll, masked text wipes, parallax, stat count-ups, per-section
bespoke timelines. Reserved for later and only per-page if wanted.

## Success criteria

- Every homepage section reveals with the shared fade + rise (+ stagger where grouped) on first scroll-in, once.
- Hero entrance plays on load.
- Hover polish present on cards/buttons on desktop.
- `prefers-reduced-motion` disables all motion cleanly with content visible.
- No new dependencies; sections stay server components except thin client wrappers.
- No console errors; no layout shift; verified live in the browser.
