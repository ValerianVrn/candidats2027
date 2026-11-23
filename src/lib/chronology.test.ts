import { describe, expect, it } from 'vitest';
import { buildChronology, byMonth, monthLabel } from './chronology';
import type { CampaignEvent, Candidate, Election } from './schemas';

const src = [{ url: 'https://www.lemonde.fr/a', outlet: 'Le Monde', title: 't', date: '2026-11-01' }];

const cand = (slug: string, over: Partial<Candidate> = {}) =>
  ({
    slug,
    firstName: 'A',
    lastName: slug.toUpperCase(),
    declaration: null,
    withdrawal: null,
    meetings: [],
    ...over,
  }) as unknown as Candidate;

const election = {
  firstRound: '2027-04-18T08:00:00+02:00',
  secondRound: '2027-05-02T08:00:00+02:00',
  sources: src,
  milestones: [{ date: '2027-03-12', label: 'Date limite d’inscription', sources: src }],
  silence: [],
} as Election;

const debate = {
  id: 'debat-1',
  kind: 'debat',
  date: '2026-11-16',
  time: '20:20',
  title: 'Quelle société ?',
  channels: ['TF1', 'LCI'],
  summary: 's',
  participants: ['x'],
  absents: [],
  replayUrl: null,
  sources: src,
} as CampaignEvent;

const list = [
  cand('x', {
    declaration: { date: '2026-09-01', datePrecision: 'day', videoUrl: null, sources: src },
    meetings: [{ date: '2026-12-06', city: 'Paris', title: 'Meeting de lancement', sources: src }],
  }),
  cand('y', {
    status: 'retire',
    declaration: { date: '2026-01-01', datePrecision: 'month', videoUrl: null, sources: src },
    withdrawal: { date: '2026-11-21', sources: src },
  }),
  cand('z', { declaration: { date: '2026-12-01', datePrecision: 'before', videoUrl: null, sources: src } }),
];

describe('buildChronology', () => {
  const { upcoming, past } = buildChronology(list, [debate], election, '2026-11-23');

  it('lists past facts, most recent first', () => {
    expect(past.map((i) => i.kind)).toEqual([
      'declaration',
      'retrait',
      'debat',
      'declaration',
      'declaration',
    ]);
    expect(past[0]!.precision).toBe('before');
    expect(past[1]!.text).toBe('A Y retire sa candidature');
    expect(past[2]!.text).toBe('Débat « Quelle société ? » (TF1, LCI)');
  });

  it('lists upcoming dates soonest first, with the rounds and milestones', () => {
    expect(upcoming.map((i) => i.kind)).toEqual(['meeting', 'etape', 'scrutin', 'scrutin']);
    expect(upcoming[2]!.text).toBe("Premier tour de l'élection présidentielle");
  });

  it('only shows a withdrawal when it is dated', () => {
    const undated = buildChronology([cand('w', { status: 'retire' })], [], election, '2026-11-23');
    expect(undated.past.some((i) => i.kind === 'retrait')).toBe(false);
  });
});

describe('byMonth', () => {
  it('groups consecutive items by month', () => {
    const { past } = buildChronology(list, [debate], election, '2026-11-23');
    expect(byMonth(past).map((g) => g.month)).toEqual([
      'décembre 2026',
      'novembre 2026',
      'septembre 2026',
      'janvier 2026',
    ]);
    expect(monthLabel('2027-04-18')).toBe('avril 2027');
  });
});
