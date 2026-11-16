# 0001: Static Astro site with JSON content

- Status: accepted
- Date: 2026-11-16

## Context

The site must be very fast, visual, cheap to host, and updated daily by an AI agent working through Git
commits. There is no user-generated content and no login.

## Decision

- Astro with static output. Interactivity (floating cards, detail panel, countdown, quiz) is written as small
  vanilla TypeScript scripts; no UI framework.
- All content lives as JSON files in `src/data/`, validated at build time by Zod schemas in content collections.
  An invalid edit fails the build, so it cannot be deployed.
- Hosting on Azure Static Web Apps; one app per environment (dev, prod).

## Consequences

- No server, no database, no runtime cost beyond static hosting.
- Every content change is a reviewable, revertible Git diff, which is what the daily agent produces.
- Anything requiring server-side state (accounts, stored quiz results) is out of scope by design.
