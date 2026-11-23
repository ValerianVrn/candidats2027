import { describe, expect, it } from 'vitest';
import { programmeByTheme, themeCounts } from './programmes';
import type { Candidate } from './schemas';

const src = [{ url: 'https://www.afp.com/a', outlet: 'AFP', title: 't', date: '2026-11-16' }];
const make = (slug: string, lastName: string, themes: string[]) =>
  ({
    slug,
    firstName: 'A',
    lastName,
    programme: themes.map((theme) => ({ theme, text: `${slug} ${theme}`, sources: src })),
  }) as unknown as Candidate;

const list = [
  make('z', 'Zola', ['retraites', 'retraites']),
  make('b', 'Bernard', []),
  make('d', 'Dupont', ['sante']),
];

describe('programmeByTheme', () => {
  it('lists candidates with proposals by last name, and the others separately', () => {
    const { entries, without } = programmeByTheme(list, 'retraites');
    expect(entries.map((e) => e.candidate.slug)).toEqual(['z']);
    expect(entries[0]!.items).toHaveLength(2);
    expect(without.map((c) => c.slug)).toEqual(['b', 'd']);
  });
});

describe('themeCounts', () => {
  it('counts proposals and candidates per theme', () => {
    const counts = themeCounts(list);
    expect(counts.find((c) => c.theme === 'retraites')).toEqual({
      theme: 'retraites',
      proposals: 2,
      candidates: 1,
    });
    expect(counts.find((c) => c.theme === 'energie')).toEqual({
      theme: 'energie',
      proposals: 0,
      candidates: 0,
    });
  });
});
