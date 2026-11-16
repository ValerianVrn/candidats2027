# 0002: Claude merges its own work; data is auto-promoted after launch

- Status: accepted
- Date: 2026-11-16

## Context

The owner does not want to review daily content updates, but keeps control of code releases and production.

## Decision

- Claude merges its own `feature/*` / `fix/*` PRs into `develop` once the `build` check is green.
- Every push to `develop` deploys to the **dev** environment.
- Code reaches `main` only through an owner-created release; deploying `main` to **prod** requires the owner's
  approval in the GitHub `production` environment.
- After launch, the daily routine's data-only PRs (changes limited to `src/data/**`) that pass all guardrails are
  merged into `develop` and `main`; for those commits the prod deploy needs no manual approval.
- Guardrails (CI): mandatory sources from an allowlist, two sources for sensitive changes, link checks, and a
  diff guard that stops auto-merge (label `needs-human`) on unusually large or destructive changes.

## Consequences

- Content can go live without a human reading it, so accuracy relies on the guardrails, the wording rules in
  `CLAUDE.md`, the public correction channel and the public changelog.
- A bad update is fixed by a new commit (revert), never by rewriting history.
