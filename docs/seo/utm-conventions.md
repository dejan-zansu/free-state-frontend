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
- `paid_social` — Meta paid ads (locked value with underscore, see "Paid ads (Meta)" below)
- `referral` — partner referral
- `print` — offline

### utm_campaign
Use kebab-case, descriptive, with quarter: `solar-abo-q2-2026`, `home-owner-pv-q3-2026`, `recruitment-2026`

### utm_content
Optional. Identify the specific creative: `email-banner-top`, `story-swipeup`, `flyer-v2`.

## Paid ads (Meta) — fixed convention

Every Meta ad destination URL carries exactly this parameter template:

`?utm_source=meta&utm_medium=paid_social&utm_campaign={{campaign.name}}&utm_id={{campaign.id}}&utm_term={{adset.id}}&utm_content={{ad.id}}`

- `{{campaign.name}}`, `{{campaign.id}}`, `{{adset.id}}` and `{{ad.id}}` are **Meta dynamic URL parameters**: paste them literally, Meta substitutes the real values when the ad is delivered. Never hand-type campaign names or IDs.
- The IDs (`utm_id` = campaign, `utm_term` = ad set, `utm_content` = ad) are the **join keys** between a lead in our database and the ads-insights data. Hand-typed values break the join; the template never changes per ad.
- `utm_medium=paid_social` (underscore) is a locked value — backend attribution and reporting group on this exact string, so the kebab-case rule below does not apply to it.
- One template for every ad, including boosted posts. Which ad drove the visit comes from the substituted IDs, not from manual `utm_content` labels.

## Rules

- UTM params are **never** used on internal links (use `?ref=` or skip entirely — internal UTMs break GA4 session attribution).
- Always lowercase.
- No spaces; use `-` to separate words.
- Campaign names include the quarter so historical reports stay clean.

## Implementation

GA4 auto-collects UTMs — no custom code needed for GA4 reports.

In addition, the site captures UTM parameters, referrer, landing page and ad click IDs (`fbclid`, `gclid`) client-side on arrival and attaches them to any lead/enquiry the visitor later submits, which is what makes the per-ad join keys above matter.
