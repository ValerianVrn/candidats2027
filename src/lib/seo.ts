/**
 * Search-engine helpers: schema.org JSON-LD builders and the sitemap. Pure functions, unit tested.
 * Structured data only states what the page shows (no ratings, no opinions).
 */

export type JsonLd = Record<string, unknown>;

const CONTEXT = 'https://schema.org';

export function websiteLd(site: URL, name: string, description: string): JsonLd {
  return { '@context': CONTEXT, '@type': 'WebSite', name, url: site.href, inLanguage: 'fr-FR', description };
}

export function itemListLd(site: URL, name: string, items: { name: string; path: string }[]): JsonLd {
  return {
    '@context': CONTEXT,
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      url: new URL(it.path, site).href,
    })),
  };
}

export function personLd(
  site: URL,
  p: {
    givenName: string;
    familyName: string;
    path: string;
    jobTitle: string;
    party: string | null;
    image: string | null;
  },
): JsonLd {
  return {
    '@context': CONTEXT,
    '@type': 'Person',
    name: `${p.givenName} ${p.familyName}`,
    givenName: p.givenName,
    familyName: p.familyName,
    jobTitle: p.jobTitle,
    url: new URL(p.path, site).href,
    ...(p.party ? { affiliation: { '@type': 'Organization', name: p.party } } : {}),
    ...(p.image ? { image: new URL(p.image, site).href } : {}),
  };
}

/** Profile page around a Person. `dateModified` must be a full ISO date-time with offset (Google rejects a bare day). */
export function profilePageLd(person: JsonLd, dateModified: string): JsonLd {
  const { '@context': _ctx, ...mainEntity } = person;
  return { '@context': CONTEXT, '@type': 'ProfilePage', dateModified, mainEntity };
}

/**
 * A dated event (election round, televised debate). Only facts the page shows: name, start, place or channels,
 * participants. No ticketing or rating fields.
 */
export function eventLd(
  site: URL,
  e: {
    name: string;
    /** ISO date or date-time. */
    startDate: string;
    /** ISO date-time, when known (e.g. polls closing). */
    endDate?: string;
    /** Image path (share card). */
    image: string;
    description: string;
    /** Page that shows the event. */
    path: string;
    /** Physical place (e.g. « France ») or, for a broadcast, the channels. */
    place: string;
    broadcast: boolean;
    performers: { name: string; path: string }[];
  },
): JsonLd {
  return {
    '@context': CONTEXT,
    '@type': 'Event',
    name: e.name,
    startDate: e.startDate,
    ...(e.endDate ? { endDate: e.endDate } : {}),
    eventStatus: 'https://schema.org/EventScheduled',
    description: e.description,
    image: [new URL(e.image, site).href],
    url: new URL(e.path, site).href,
    eventAttendanceMode: e.broadcast
      ? 'https://schema.org/OnlineEventAttendanceMode'
      : 'https://schema.org/OfflineEventAttendanceMode',
    location: e.broadcast
      ? { '@type': 'VirtualLocation', name: e.place }
      : {
          '@type': 'Place',
          name: e.place,
          address: { '@type': 'PostalAddress', addressCountry: 'FR' },
        },
    ...(e.performers.length
      ? {
          performer: e.performers.map((p) => ({
            '@type': 'Person',
            name: p.name,
            url: new URL(p.path, site).href,
          })),
        }
      : {}),
  };
}

export function breadcrumbLd(site: URL, crumbs: { name: string; path: string }[]): JsonLd {
  return {
    '@context': CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: new URL(c.path, site).href,
    })),
  };
}

/**
 * Canonical path: no trailing slash except the root. The host (Static Web Apps, `trailingSlash: never`) redirects
 * `/x/` to `/x`, and a canonical URL that redirects is reported by Search Console as « Page with redirect ».
 */
export function canonicalPath(pathname: string): string {
  const p = pathname.replace(/\/+$/, '');
  return p === '' ? '/' : p;
}

/** Serialises JSON-LD for a <script> tag (no « </script> » breakout). */
export function serializeLd(data: JsonLd | JsonLd[]): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export interface SitemapEntry {
  path: string;
  /** YYYY-MM-DD */
  lastmod: string | null;
}

export function sitemapXml(site: URL, entries: SitemapEntry[]): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const urls = entries
    .map(
      (e) =>
        `  <url><loc>${esc(new URL(e.path, site).href)}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}</url>`,
    )
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
