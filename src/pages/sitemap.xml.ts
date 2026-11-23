import type { APIRoute } from 'astro';
import { candidates, changelog, events, site as siteData } from '../lib/data';
import { THEME_IDS } from '../lib/themes';
import { parisDay } from '../lib/freshness';
import { sitemapXml } from '../lib/seo';

/** Every public page, with the date its content was last checked or changed. */
export const GET: APIRoute = ({ site }) => {
  const checked = parisDay(siteData.lastChecked);
  const lastChange = changelog[0]?.date ?? checked;
  const lastEvent =
    events
      .flatMap((e) => e.sources.map((s) => s.date))
      .toSorted()
      .at(-1) ?? lastChange;
  const pages = [
    { path: '/', lastmod: checked },
    { path: '/candidats', lastmod: checked },
    { path: '/programmes', lastmod: checked },
    ...THEME_IDS.map((t) => ({ path: `/programmes/${t}`, lastmod: checked })),
    { path: '/calendrier', lastmod: lastEvent },
    { path: '/quiz', lastmod: lastChange },
    { path: '/journal', lastmod: lastChange },
    { path: '/methode', lastmod: null },
    { path: '/financement', lastmod: null },
    { path: '/ia', lastmod: null },
    { path: '/mentions-legales', lastmod: null },
    { path: '/confidentialite', lastmod: null },
    // Withdrawn candidates too: their pages stay online and are searched for after the withdrawal.
    ...candidates.map((c) => ({ path: `/candidat/${c.slug}`, lastmod: c.lastChecked })),
  ];
  return new Response(sitemapXml(site!, pages), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
