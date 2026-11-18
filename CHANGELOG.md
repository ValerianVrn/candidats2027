# Changelog

All notable changes to this project are documented here. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
versioning: [SemVer](https://semver.org/).

Daily content updates are not listed here; they appear on the site's public "Journal" page (`src/data/changelog.json`).

## [Unreleased]

### Added

- AdSense: `ads.txt` for the site's publisher account; the publisher id is set on the production environments, so
  the ad script (with Google's consent message) loads on the home page and the journal only.

## [1.1.0] - 2026-11-18

### Fixed

- Browser icon: the site's own « 27 » icon with a tricolour bar replaces the Astro logo (SVG, ICO and Apple touch
  icon, rendered from the SVG by `scripts/favicons.ts`).

## [1.0.1] - 2026-11-18

### Changed

- Daily routine goes live (ADR 0005): content updates ship as data hotfixes from `main` with a patch tag, and deploy
  to production through the `production-data` environment without approval.

## [1.0.0] - 2026-11-18

First public release, on https://liste-candidats-2027.fr.

### Fixed

- Legal notice and privacy policy: contact address on the site's own domain (`contact@liste-candidats-2027.fr`).
- Candidate pages: the « Tous les candidats » link (which reopened the home page) becomes a breadcrumb « Accueil ›
  Liste des candidats › Nom », the same trail as the structured data.
- « Vérifié il y a … » stays honest: the routine only advances it after reviewing every profile. The Journal
  shows the last check, the last change and the days checked without change (`site.json → checks`). Each
  routine PR now carries the run's full summary as a daily log.
- Daily routine: reviews all candidates in batches of 8 and checks its list before publishing (it had stopped
  after 13 of 44); the link check no longer fails on DNS errors from the cloud sandbox, only on 404/410.
- Candidate details: the tabs (Programme, Agenda, Déclaration, Procédures) now switch content. The cramped side
  panel is replaced by a wide drawer (native dialog) with a fixed header and tabs, a thin scroll bar for the
  content only, and the status under the name; the cloud uses the full page width.
- Daily routine: GitHub actions through the GitHub tools that work in the cloud (gh is not authenticated there),
  push check before research, every candidate reviewed every day (« news first »), full candidate list in the
  run summary; the diff guard ignores profiles whose only change is the daily `lastChecked` date.
- David Lisnard's portrait removed until a photo with a verified free licence is found (copyright precaution).
- Countdown: the two-line label is centred next to the day count instead of starting on its baseline.
- Legal notice: publisher details (SASU, SIREN, registered office, publication director, contact).
- Constellation cards could overlap each other or cover the filters: each card now has its own grid cell (6 or
  4 columns depending on the available width), names wrap on 2 lines, and the details panel stays on top.
- Missing spaces before some links (footer, Méthode).

### Added

- Share cards (Open Graph, 1200 × 630): one per candidate (portrait, name, party, status) and one for the site,
  rendered at build time with `sharp` (now a direct dependency).
- SEO: visible home H1 and intro, « Liste des candidats à la présidentielle 2027 » page (`/candidats`), search-friendly
  titles and descriptions, schema.org JSON-LD (WebSite, ItemList, Person, BreadcrumbList), `sitemap.xml` and a
  `robots.txt` pointing to it; the site URL comes from `SITE_URL` at build time.
- Televised debates and major broadcasts (`src/data/events.json`, two sources each): shown in each participant's
  Agenda (with sourced absences) and as « Dernier / Prochain débat » on the home page. First entry: the TF1/LCI
  debate of 16 November 2026.
- Quiz: retirement is now a question of direction (advance, keep, raise the age, or no legal age: contribution
  length only), a new question on pension capitalisation, and explicit thresholds on public spending
  (100 Md€ or 200 000 public posts over the term); 47 sourced positions.
- « Comparer les positions » on `/quiz` while the scored quiz is closed: theme by theme, each answer with the
  candidates who hold it (sourced) and « Non renseigné », no score.
- « Qui finance ce site ? » page (`/financement`), linked from the footer: funding by ads only, placements,
  blocked political ads, no money from candidates or parties.
- Project scaffolding: Astro, TypeScript, Prettier, Vitest, CI, Dependabot.
- Site shell in the « Constellation » design: floating card cloud with filters, candidate detail panel
  (bottom sheet on mobile), candidate pages, journal, countdown, click-to-load videos, numbered citations.
- Daily routine follows gitflow (ADR 0005): data branch into `develop` before launch, then hotfix from `main`
  with a patch tag, a GitHub Release and a merge-back; prod deploy picks `production-data` for content-only pushes.
- Daily update routine prompt (`docs/daily-update-prompt.md`) and diff guard deciding which automated
  changes may merge without a human.
- Ads (AdSense + Google certified consent message), off until configured; only on the home page and the
  journal, never on the quiz or candidate pages (ADR 0004).
- Legal notice (LCEN, right of reply) and privacy policy pages; the prod deploy is blocked until the
  publisher details are filled in. Launch checklist in `docs/launch-checklist.md`.
- Azure hosting: dev and prod Static Web Apps (Bicep), OIDC deploy workflows, prod gated by owner approval.
- Quiz questions (12 themes) and the first 34 sourced positions of the main candidates; research rules in
  `docs/quiz-research-brief.md`. The quiz opens automatically once enough positions are known.
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
