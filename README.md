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
infra/            Azure Bicep (Static Web Apps)
public/staticwebapp.config.json   SWA headers, 404, caching
```

## Deployment

| Environment | Azure Static Web App     | Deployed by                                         | URL                                                 |
| ----------- | ------------------------ | --------------------------------------------------- | --------------------------------------------------- |
| dev         | `swa-candidats2027-dev`  | every push to `develop` (`deploy-dev.yml`)          | https://kind-wave-0e4cc6003.6.azurestaticapps.net   |
| prod        | `swa-candidats2027-prod` | push to `main` + owner approval (`deploy-prod.yml`) | https://nice-forest-04f91d203.5.azurestaticapps.net |

Infrastructure is in `infra/main.bicep` (resource group `rg-candidats2027`). Authentication uses GitHub OIDC;
no secret is stored. Details and how to change plans: [ADR 0003](docs/adr/0003-azure-static-web-apps.md).

## Workflow

`main` = production, `develop` = integration (default). Feature branches from `develop`, PRs into `develop`.
See [CLAUDE.md](CLAUDE.md) for conventions and [docs/adr](docs/adr) for decisions.
