# Roadmap: ideas kept for later

Decided with the owner on 2026-11-26. Not scheduled; each item becomes its own plan when picked.

## Audience measurement (done 2026-11-26: Cloudflare Web Analytics, see `docs/services.md`)

- **Cloudflare Web Analytics**: free, no cookie, no IP kept, no cross-site tracking. That falls under the CNIL
  exemption, so no consent banner change is needed. It gives page views, visits, top pages, referrers, countries
  and devices.
  - Owner: free Cloudflare account → Web Analytics → add `liste-candidats-2027.fr` (JS snippet) → send the token.
  - Code: `PUBLIC_CF_ANALYTICS_TOKEN` loaded in `Base.astro` (production only); privacy policy « Mesure
    d'audience » rewritten.
  - Not chosen: Google Analytics (cookies, consent), Azure Application Insights (cookies), Plausible (paid),
    Matomo (needs a server).

## Ideas from 2027presidentielle.fr (survey of 2026-11-26)

| Idea                                                                                                                                                                  | Verdict                                                                                                                      |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Popularity ranking, reader « supports » counter, polls page                                                                                                           | **No**: contrary to neutrality and the « no polls » rule (law of 1977); a click ranking is manipulable and reads like a poll |
| « Guide de l'électeur »: registration (deadline 12 March 2027), proxy vote, polling station, the 500 sponsorships; sourced from service-public.fr / interieur.gouv.fr | Yes: useful and strong SEO. Do first, with the FAQ                                                                           |
| FAQ (« Quand a lieu la présidentielle 2027 ? », « Combien de candidats ? »…), answers computed from the data                                                          | Yes (SEO). Same PR as the guide                                                                                              |
| Shareable image per candidate: « Partager » button, existing 1200×630 card plus a 1080×1920 story format                                                              | Yes: cheap, drives traffic                                                                                                   |
| Search box on `/candidats` (name, party)                                                                                                                              | Yes, small. Same PR as sharing                                                                                               |
| Official links on profiles (campaign site from `officialDomains`)                                                                                                     | Yes, tiny                                                                                                                    |
| Date of birth and age on profiles                                                                                                                                     | Optional: needs a source per candidate (not Wikipedia); the routine could fill it over time                                  |
| Status taxonomy table on `/methode`                                                                                                                                   | Small: statuses are described already, a table would be clearer                                                              |
