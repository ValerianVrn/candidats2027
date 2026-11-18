# Launch checklist (owner + Claude, before the first release)

Production stays empty until every item is done.

## Owner

- [x] Fill in `src/lib/publisher.ts` (company name, legal form, SIRET, address, publication director, contact email).
      The prod deploy runs `npm test` with `RELEASE=1` and fails while any field is empty.
- [x] Buy the domain (`liste-candidats-2027.fr`, DNS at OVH) and set the records.
- [ ] Create the AdSense account for the company; add the site; in « Privacy & messaging », create the GDPR
      consent message (Google-certified CMP) with a « Refuser » button as visible as « Accepter ».
- [ ] In AdSense « Blocking controls » → « Sensitive categories », block **Politics**, **Religion** and anything
      election-related; keep it blocked until after the election (Code électoral L52-1, EU reg. 2024/900).
- [ ] Have a lawyer review the legal notice, the privacy policy and `/financement`.
- [ ] Professional / media liability insurance for the SASU.
- [ ] Make sure `contact@liste-candidats-2027.fr` is read regularly (rights of reply, data requests).
- [x] Approve the first `production` deployment in GitHub.

## Claude (with the owner's approval for each step)

- [ ] Switch prod to the Standard plan if traffic justifies it (ADR 0003).
- [x] Attach the custom domain to `swa-candidats2027-prod` (both `liste-candidats-2027.fr` and `www`, the bare
      domain as default) and set `SITE_URL`. Still to do with AdSense: add `ads.txt`.
- [ ] Set the AdSense publisher id in the build (`PUBLIC_ADSENSE_CLIENT`) and check that no ad or Google
      request happens before consent.
- [x] Domain chosen by the owner: **liste-candidats-2027.fr** (bought 2026-11-18), attached to `swa-candidats2027-prod`
      (TXT validation). DNS at OVH: `A @ → 51.124.91.155` (the SWA `stableInboundIP`), no AAAA,
      `CNAME www → nice-forest-04f91d203.5.azurestaticapps.net`; then add `www` as a second custom domain.
- [x] Set the `SITE_URL` variable of the GitHub `production` environment to `https://liste-candidats-2027.fr`
      (canonical URLs, sitemap, share cards).
- [x] Google Search Console and Bing Webmaster Tools: verify the domain (DNS record) and submit `/sitemap.xml`.
- [x] Run `npm run check-links` on the release candidate.
- [x] Create the GitHub environment `production-data` (deployments from `main` only, no reviewer, same variables
      as `production`) and an Azure federated credential for it on the prod identity
      (`repo:ValerianVrn@78210211/candidats2027@1459747661:environment:production-data`).
- [x] After the owner's first release is tagged `v1.0.0`: `config/routine.json` set to `"live"` on 2026-11-18 at the owner's request (ADR 0005).
