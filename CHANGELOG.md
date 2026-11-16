# Changelog

All notable changes to this project are documented here. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
versioning: [SemVer](https://semver.org/).

Daily content updates are not listed here; they appear on the site's public "Journal" page (`src/data/changelog.json`).

## [Unreleased]

### Added

- Project scaffolding: Astro, TypeScript, Prettier, Vitest, CI, Dependabot.
- Site shell in the « Constellation » design: floating card cloud with filters, candidate detail panel
  (bottom sheet on mobile), candidate pages, journal, countdown, click-to-load videos, numbered citations.
- Daily update routine prompt (`docs/daily-update-prompt.md`) and diff guard deciding which automated
  changes may merge without a human.
- Ads (AdSense + Google certified consent message), off until configured; only on the home page and the
  journal, never on the quiz or candidate pages (ADR 0004).
- Legal notice (LCEN, right of reply) and privacy policy pages; the prod deploy is blocked until the
  publisher details are filled in. Launch checklist in `docs/launch-checklist.md`.
- Azure hosting: dev and prod Static Web Apps (Bicep), OIDC deploy workflows, prod gated by owner approval.
- Data schemas (Zod) validated at build time, with placeholder example data.
