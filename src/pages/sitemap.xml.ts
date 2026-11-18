import type { APIRoute } from 'astro';
import { activeCandidates, changelog, site as siteData } from '../lib/data';
import { parisDay } from '../lib/freshness';
import { sitemapXml } from '../lib/seo';

/** Every public page, with the date its content was last checked or changed. */
export const GET: APIRoute = ({ site }) => {
  const checked = parisDay(siteData.lastChecked);
  const lastChange = changelog[0]?.date ?? checked;
  const pages = [
    { path: '/', lastmod: checked },
    { path: '/candidats', lastmod: checked },
    { path: '/quiz', lastmod: lastChange },
    { path: '/journal', lastmod: lastChange },
    { path: '/methode', lastmod: null },
    { path: '/financement', lastmod: null },
    { path: '/ia', lastmod: null },
    { path: '/mentions-legales', lastmod: null },
    { path: '/confidentialite', lastmod: null },
    ...activeCandidates.map((c) => ({ path: `/candidat/${c.slug}`, lastmod: c.lastChecked })),
  ];
  return new Response(sitemapXml(site!, pages), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
