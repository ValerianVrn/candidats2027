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
- One-off contributions only (the election is a few months away): the donor chooses the amount, 5 € suggested,
  from 2 € (the fixed fee makes smaller gifts pointless) to 100 € (the cap, enforced by Stripe).
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
- Entry points: `/financement`, the bottom of the Journal, a « Soutenir le site » block at the bottom of the home
  page (after all candidates and the ad slot), and a footer link on every page except candidate profiles and the
  quiz. Never on a candidate profile, the quiz or the candidate detail drawer: no donation request next to a
  candidate. (Widened on 2026-11-26 at the owner's request: the call was too hard to find.)
- `src/data/funding.json` is owner-only: the diff guard blocks any automated change to it, and a push touching it
  deploys through the `production` environment (owner approval), never `production-data`.

## Consequences

- Contributions are company income, subject to corporate tax and generally outside VAT (no counterpart). This
  is to be confirmed by the owner's accountant, and the lawyer review covers the texts.
- The rules guard against a campaign indirectly funding a site that presents itself as neutral (the reverse of
  Code électoral L52-8).
