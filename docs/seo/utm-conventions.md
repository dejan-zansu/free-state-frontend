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
