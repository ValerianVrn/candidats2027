import { describe, expect, it } from 'vitest';
import { candidateSchema } from './schemas';

const src = { url: 'https://www.lemonde.fr/a', outlet: 'Le Monde', title: 't', date: '2026-11-21' };
const base = {
  slug: 'a-b',
  firstName: 'A',
  lastName: 'B',
  genre: 'm',
  status: 'retire',
  statusSources: [src],
  party: null,
  officialDomains: [],
  qualified2022: null,
  parrainages: null,
  role: 'Député',
  portrait: null,
  declaration: { date: '2026-01-01', videoUrl: null, sources: [src] },
  programme: [],
  meetings: [],
  risques: [],
  lastChecked: '2026-11-22',
};

describe('candidateSchema', () => {
  it('requires a dated withdrawal for withdrawn candidates', () => {
    expect(candidateSchema.safeParse(base).success).toBe(false);
    expect(
      candidateSchema.safeParse({ ...base, withdrawal: { date: '2026-11-21', sources: [src] } }).success,
    ).toBe(true);
  });

  it('defaults the withdrawal to null for other candidates', () => {
    const parsed = candidateSchema.parse({ ...base, status: 'declare' });
    expect(parsed.withdrawal).toBeNull();
  });
});
