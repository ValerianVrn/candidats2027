# Candidats 2027: project instructions

French-language static site about the 2027 French presidential election. Code, commits and docs in English;
**all user-facing text in French**.

## Stack and commands

- Astro (static) + TypeScript (strict). Interactive parts are small vanilla TS `<script>` islands, no UI framework.
- `npm run dev` (use `astro dev --background` / `astro dev stop` when running it from an agent).
- `npm run verify` runs what CI runs: `format:check`, `typecheck`, `test`, `build`. Run it before every commit.
- Node version: `.nvmrc`.

## Layout

- `src/pages/`: routes. `src/components/`: Astro components. `src/lib/`: pure, unit-tested TS.
- `src/data/`: all content as JSON (see `src/content.config.ts` for schemas).
- `docs/adr/`: decisions. `docs/daily-update-prompt.md`: the daily routine's instructions.

## Workflow (project-specific exceptions to the global rules)

- Claude may merge its own `feature/*` / `fix/*` PRs into `develop` once CI (`build`) is green (merge commit).
- Releases (`develop` → `main`) and production deploys are the owner's call. Never push code to `main`.
- After launch only: data-only PRs (changes limited to `src/data/**`) that pass every guardrail may be merged
  into `main` by the daily routine. See ADR 0002.

## Content rules (the content is published without human review)

- Every fact must cite at least one source from the allowlist; status changes, legal risks and quiz positions
  need two independent sources.
- Neutral wording, no adjectives or opinions, nothing a source does not say.
- Presumption of innocence: use the exact procedural status reported by the sources
  (« mis en examen », « condamné en première instance, appel en cours », …).
- Equal treatment of all candidates. No polls; never aggregate or publish quiz results.

## Gotchas

- Astro 7: content collections live in `src/content.config.ts` and use loaders from `astro/loaders`; Zod comes
  from `astro/zod`.
