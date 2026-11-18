# Launch checklist (owner + Claude, before the first release)

Production stays empty until every item is done.

## Owner

- [x] Fill in `src/lib/publisher.ts` (company name, legal form, SIRET, address, publication director, contact email).
      The prod deploy runs `npm test` with `RELEASE=1` and fails while any field is empty.
- [ ] Buy the domain (e.g. `candidats2027.fr`) and give Claude access to its DNS zone, or set the records yourself.
- [ ] Create the AdSense account for the company; add the site; in « Privacy & messaging », create the GDPR
      consent message (Google-certified CMP) with a « Refuser » button as visible as « Accepter ».
- [ ] In AdSense « Blocking controls » → « Sensitive categories », block **Politics**, **Religion** and anything
      election-related; keep it blocked until after the election (Code électoral L52-1, EU reg. 2024/900).
- [ ] Have a lawyer review the legal notice, the privacy policy and `/financement`.
- [ ] Professional / media liability insurance for the SASU.
- [ ] Make sure `contact@valerian-verona.fr` is read regularly (rights of reply, data requests).
- [ ] Approve the first `production` deployment in GitHub.

## Claude (with the owner's approval for each step)

- [ ] Switch prod to the Standard plan if traffic justifies it (ADR 0003).
- [ ] Attach the custom domain to `swa-candidats2027-prod`, set `site` in `astro.config.mjs`, add `ads.txt`.
- [ ] Set the AdSense publisher id in the build (`PUBLIC_ADSENSE_CLIENT`) and check that no ad or Google
      request happens before consent.
- [ ] Set the `SITE_URL` variable of the GitHub `production` environment to the domain (canonical URLs, sitemap).
- [ ] Google Search Console and Bing Webmaster Tools: verify the domain (DNS record) and submit `/sitemap.xml`.
- [ ] Run `npm run check-links` on the release candidate.
- [ ] Create the GitHub environment `production-data` (deployments from `main` only, no reviewer, same variables
      as `production`) and an Azure federated credential for it on the prod identity
      (`repo:ValerianVrn@78210211/candidats2027@1459747661:environment:production-data`).
- [ ] After the owner's first release is tagged `v1.0.0`: the owner sets `config/routine.json` to `"live"` (ADR 0005).
