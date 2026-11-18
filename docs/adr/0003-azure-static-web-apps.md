# 0003: Azure Static Web Apps, one app per environment

- Status: accepted
- Date: 2026-11-16

## Context

The owner hosts on Azure (pay-as-you-go). The site is static. Claude merges into `develop` on its own, so the
"nothing reaches production without the owner's consent" rule must be enforced by permissions, not by convention.

## Decision

- One resource group `rg-candidats2027` (West Europe) with two Static Web Apps, defined in `infra/main.bicep`:
  `swa-candidats2027-dev` and `swa-candidats2027-prod`. Both start on the **Free** plan.
- Two Entra app registrations, federated with GitHub OIDC (no stored secret):
  - `candidats2027-github-dev`: trusts the GitHub environment `development` (deployable from `develop` only);
    Contributor on the dev SWA only.
  - `candidats2027-github-prod`: trusts the GitHub environment `production` (deployable from `main` only, owner
    approval required); Contributor on the prod SWA only.
- Workflows: `deploy-dev.yml` (push to `develop`) and `deploy-prod.yml` (push to `main`) call the reusable
  `deploy.yml`, which builds, logs in with OIDC, fetches the SWA deployment token at run time and uploads `dist/`.
- The dev build is marked `noindex` (header + robots.txt).

## Why not one SWA with a staging environment

Azure permissions apply to the whole Static Web App. A single app would let the identity that deploys dev also
deploy prod; two apps keep the production gate technical.

## Consequences

- Free plan: no SLA and a hard cap of 100 GB of bandwidth per month (the site stops being served beyond it).
  Switch prod to Standard (`prodSku=Standard`, ~9 $/month, paid overage) before the campaign peak or when traffic
  grows: `az deployment group create -g rg-candidats2027 -f infra/main.bicep -p prodSku=Standard`.
- The owner's GitHub approval is the production gate. Claude acts with the owner's GitHub credentials, so the
  gate protects against accidents and workflow changes; Claude never approves production deployments.
- After launch, auto-promoting data-only changes to prod will need an additional, narrowly scoped path (see
  ADR 0002); it is not set up yet.
