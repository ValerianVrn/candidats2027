# Changelog

All notable changes to this project are documented here. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
versioning: [SemVer](https://semver.org/).

Daily content updates are not listed here; they appear on the site's public "Journal" page (`src/data/changelog.json`).

## [Unreleased]

### Added

- Project scaffolding: Astro, TypeScript, Prettier, Vitest, CI, Dependabot.
- Site shell in the « Constellation » design: floating card cloud with filters, candidate detail panel
  (bottom sheet on mobile), candidate pages, journal, countdown, click-to-load videos, numbered citations.
- Ads (AdSense + Google certified consent message), off until configured; only on the home page and the
  journal, never on the quiz or candidate pages (ADR 0004).
- Legal notice (LCEN, right of reply) and privacy policy pages; the prod deploy is blocked until the
  publisher details are filled in. Launch checklist in `docs/launch-checklist.md`.
- Azure hosting: dev and prod Static Web Apps (Bicep), OIDC deploy workflows, prod gated by owner approval.
- Proximity quiz: one question per screen, scoring in the browser only, per-theme sources, shareable result
  in the URL fragment, « Voir sur la carte » lens; quiz positions need two sources (check-data). Closed until
  enough candidates have known positions.
- Seed data: 44 sourced candidate profiles (36 declared, 8 potential), 29 parties classified by the Interior
  Ministry grid, declaration date precision, risk nature (legal / tax / political) and closed procedures.
- Content guardrails (`check-data`): source allowlist, two independent sources for status and legal risks,
  Commons-only portraits, optional link check; run in CI.
- Published main-cloud criterion, « Autres candidatures » row, Méthode and IA pages, correction issue form.
- Official election dates (18 April and 2 May 2027) and electoral silence windows.
- Data schemas (Zod) validated at build time, with placeholder example data.
