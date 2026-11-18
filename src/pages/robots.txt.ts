import type { APIRoute } from 'astro';

/** robots.txt with the sitemap's absolute URL (the dev build replaces it with « Disallow: / »). */
export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', site).href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
