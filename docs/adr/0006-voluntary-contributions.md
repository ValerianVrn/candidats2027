# 0006: Voluntary contributions

- Status: accepted
- Date: 2026-11-26

## Context

The site is financed by two ad slots (ADR 0004), not yet approved by AdSense. The owner wants readers to be
able to support the site as well. The publisher is a SASU (a commercial company), and the site claims strict
neutrality during an election.

## Decision

- Contributions **besides** the ads, through a **Stripe Payment Link**, a page hosted by Stripe. Stripe has the
  lowest fees of the options compared (1.5 % + 0.25 € per EU card payment); the site handles no payment data.
- Suggested amounts 3, 5 or 10 €, one-off or monthly; minimum 2 € because of the fixed fee.
- Rules shown on `/financement`, the legal notice and the privacy policy:
  - received by the SASU;
  - **no tax receipt**: a company is not a public-interest body;
  - **no counterpart** and no influence on content;
  - **private individuals only**: no candidate, party, campaign team, elected official acting as such, or
    company;
  - **100 € per person per month at most**;
  - refund on request within 30 days, or automatically when the rule is broken;
  - monthly totals published, names never published.
- The link comes from the build variable `PUBLIC_DONATION_URL` (Stripe hosts only). Empty means nothing about
  contributions is shown.
- Monthly totals and, optionally, actual costs are entered by the owner in `src/data/funding.json`. Nothing is
  estimated.
- Entry points: the footer, `/financement` and the bottom of the Journal. Never on candidate pages, the quiz or
  the detail drawer.

## Consequences

- Contributions are company income, subject to corporate tax and generally outside VAT (no counterpart). This
  is to be confirmed by the owner's accountant, and the lawyer review covers the texts.
- The rules guard against a campaign indirectly funding a site that presents itself as neutral (the reverse of
  Code électoral L52-8).
