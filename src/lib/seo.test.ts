import { describe, expect, it } from 'vitest';
import {
  breadcrumbLd,
  eventLd,
  itemListLd,
  personLd,
  profilePageLd,
  serializeLd,
  sitemapXml,
  websiteLd,
} from './seo';

const site = new URL('https://exemple.fr');

describe('JSON-LD builders', () => {
  it('builds absolute URLs', () => {
    expect(websiteLd(site, 'Candidats 2027', 'd').url).toBe('https://exemple.fr/');
    const list = itemListLd(site, 'Liste', [{ name: 'A B', path: '/candidat/a-b' }]);
    expect(list.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'A B', url: 'https://exemple.fr/candidat/a-b' },
    ]);
    expect(breadcrumbLd(site, [{ name: 'Accueil', path: '/' }]).itemListElement).toHaveLength(1);
  });

  it('only includes party and image when known', () => {
    const p = personLd(site, {
      givenName: 'A',
      familyName: 'B',
      path: '/x',
      jobTitle: 'Maire',
      party: null,
      image: null,
    });
    expect(p).not.toHaveProperty('affiliation');
    expect(p).not.toHaveProperty('image');
    const q = personLd(site, {
      givenName: 'A',
      familyName: 'B',
      path: '/x',
      jobTitle: 'Maire',
      party: 'P',
      image: '/i.webp',
    });
    expect(q.affiliation).toEqual({ '@type': 'Organization', name: 'P' });
    expect(q.image).toBe('https://exemple.fr/i.webp');
  });

  it('cannot break out of the script tag', () => {
    expect(serializeLd({ name: '</script><script>alert(1)</script>' })).not.toContain('</script>');
  });
});

describe('sitemapXml', () => {
  it('lists absolute, escaped URLs with optional lastmod', () => {
    const xml = sitemapXml(site, [
      { path: '/', lastmod: '2026-11-18' },
      { path: '/a?b=1&c=2', lastmod: null },
    ]);
    expect(xml).toContain('<loc>https://exemple.fr/</loc><lastmod>2026-11-18</lastmod>');
    expect(xml).toContain('<loc>https://exemple.fr/a?b=1&amp;c=2</loc></url>');
  });
});

describe('profilePageLd and eventLd', () => {
  it('wraps the person with its check date', () => {
    const p = personLd(site, {
      givenName: 'A',
      familyName: 'B',
      path: '/x',
      jobTitle: 'j',
      party: null,
      image: null,
    });
    const page = profilePageLd(p, '2026-11-22');
    expect(page['@type']).toBe('ProfilePage');
    expect(page.dateModified).toBe('2026-11-22');
    expect((page.mainEntity as Record<string, unknown>)['@context']).toBeUndefined();
  });

  it('describes a broadcast debate with its participants', () => {
    const e = eventLd(site, {
      name: 'Débat',
      startDate: '2026-11-16T20:20:00+01:00',
      description: 'd',
      path: '/calendrier',
      place: 'TF1, LCI',
      broadcast: true,
      performers: [{ name: 'A B', path: '/candidat/a-b' }],
    });
    expect(e.location).toEqual({ '@type': 'VirtualLocation', name: 'TF1, LCI' });
    expect(e.performer).toEqual([{ '@type': 'Person', name: 'A B', url: 'https://exemple.fr/candidat/a-b' }]);
  });
});
