# 0005: Daily data updates follow gitflow (hotfix from main after launch)

- Status: accepted
- Date: 2026-11-17
- Supersedes: the "data-only PR develop → main" part of ADR 0002

## Context

The daily routine must update content without the owner, follow gitflow, and never ship code that is waiting in
`develop` for the owner's next release. `develop` and `main` are protected: changes only through PRs with a green
`build` check.

## Decision

- **Before launch** (`config/routine.json` → `"phase": "pre-launch"`): `data/daily-YYYY-MM-DD` from `develop`,
  PR into `develop`, merged by the routine when `npm run diff-guard` passes. Dev deploys.
- **After launch** (`"phase": "live"`, set by the owner): gitflow hotfix.
  1. `hotfix/data-YYYY-MM-DD` from `main`, PR into `main`, merged when the diff guard passes.
  2. Next patch tag (`vX.Y.Z+1`) on the merge commit and a GitHub Release with the day's journal entry. The
     version lives in tags only; major and minor numbers are the owner's code releases.
  3. Merge-back PR `main` → `develop`; a conflict stops the routine (`needs-human`).
- `deploy-prod.yml` classifies each push to `main` with `scripts/deploy-env.ts`: content-only pushes (while
  `live`) deploy through the `production-data` environment, without approval; everything else through
  `production`, with the owner's approval. Each environment has its own Azure federated credential.

## Consequences

- Code never reaches prod with a data update: a hotfix branch from `main` contains no unreleased code.
- About one patch release per day with changes; the Releases page doubles as a public update log.
- The routine and Claude act with the owner's GitHub credentials and the ruleset requires no approval, so keeping
  code off `main` relies on PRs, CI, the diff guard and the rules in `CLAUDE.md`. Deploying code to prod still
  requires the owner's approval of `production`, since `production-data` only opens for content-only pushes.
