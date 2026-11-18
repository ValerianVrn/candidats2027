# 0004: Ads placement and consent

- Status: accepted
- Date: 2026-11-16

## Context

The site is financed by ads, but it covers an election, shows a quiz that reveals political opinions (GDPR
art. 9), and must not look like it favours anyone. Paid political advertising is banned in the six months before
the election (Code électoral L52-1) and regulated by EU regulation 2024/900.

## Decision

- Google AdSense, with consent collected by Google's certified CMP (« Privacy & messaging », TCF v2.2). The ad
  script is only included on pages that show ads.
- At most two placements, each with a fixed reserved height and an « Annonce » label: below the candidate cloud
  on the home page, and in the journal. Never on the quiz, never on candidate pages, never next to a portrait.
- Political, religious and election-related ad categories are blocked in the AdSense account.
- Ads are off unless `PUBLIC_ADSENSE_CLIENT` and the slot ids are set at build time (GitHub `production`
  environment variables); dev never shows ads.

- The public page `/financement` explains to readers how the site is funded and where ads appear; keep it in
  sync with these placements.

## Consequences

- No ad code can read quiz answers (they never leave the quiz page, which loads no ad script).
- Revenue is limited by design; the site stays readable and neutral.
