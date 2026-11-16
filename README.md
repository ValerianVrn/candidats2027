# Candidats 2027

A fast, visual, French-language site presenting the declared and potential candidates for the 2027 French
presidential election: floating portrait cards, sourced program summaries, meetings, declaration videos,
legal risks, a countdown, a neutral "proximité" quiz and a public changelog.

Content is researched and updated daily by an AI agent (Claude) from cited sources, under automated guardrails.

## Stack

- [Astro](https://astro.build) (static output) + TypeScript, vanilla TS islands
- Data as JSON in `src/data/`, validated by Zod content collections
- Vitest for unit tests
- Hosting: Azure Static Web Apps (dev + prod), deployed by GitHub Actions

## Getting started

Requires Node 24+ (see `.nvmrc`).

```bash
npm ci
npm run dev        # http://localhost:4321
```

## Commands

| Command                | What it does                                     |
| ---------------------- | ------------------------------------------------ |
| `npm run dev`          | Dev server                                       |
| `npm run build`        | Static build into `dist/`                        |
| `npm run preview`      | Serve the build locally                          |
| `npm run typecheck`    | `astro check` (TypeScript + Astro)               |
| `npm test`             | Unit tests (Vitest)                              |
| `npm run format`       | Format with Prettier                             |
| `npm run format:check` | Check formatting                                 |
| `npm run verify`       | Everything CI runs (format, types, tests, build) |

## Layout

```
src/pages/        routes (home, candidate pages, quiz, journal, legal pages)
src/components/   Astro components
src/lib/          pure TS logic (quiz scoring, dates)
src/data/         JSON content (candidates, parties, election, quiz, changelog)
docs/adr/         architecture decision records
```

## Workflow

`main` = production, `develop` = integration (default). Feature branches from `develop`, PRs into `develop`.
See [CLAUDE.md](CLAUDE.md) for conventions and [docs/adr](docs/adr) for decisions.
