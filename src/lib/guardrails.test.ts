import { describe, expect, it } from 'vitest';
import { checkCandidate, checkEvent, checkQuiz, matchDomain } from './guardrails';
import { isFeatured } from './criteria';
import type { Candidate, Party } from './schemas';

const allowlist = { media: ['lemonde.fr', 'franceinfo.fr', 'afp.com'], official: ['gouv.fr'] };
const src = (url: string) => ({ url, outlet: 'X', date: '2026-11-01' });

function candidate(overrides: Partial<Candidate> = {}): Candidate {
  return {
    slug: 'a-b',
    firstName: 'A',
    lastName: 'B',
    genre: 'f',
    status: 'declare',
    statusSources: [src('https://www.lemonde.fr/1'), src('https://www.franceinfo.fr/2')],
    party: null,
    officialDomains: ['ab2027.fr'],
    role: 'Députée',
    portrait: null,
    declaration: {
      date: '2026-09-01',
      datePrecision: 'day',
      videoUrl: 'https://www.youtube.com/watch?v=abcdefghijk',
      sources: [src('https://afp.com/3')],
    },
    qualified2022: null,
    parrainages: null,
    programme: [{ theme: 'energie', text: 'Propose…', sources: [src('https://ab2027.fr/programme')] }],
    meetings: [],
    risques: [],
    lastChecked: '2026-11-16',
    ...overrides,
  };
}

describe('matchDomain', () => {
  it('matches subdomains but not look-alikes', () => {
    expect(matchDomain('https://la1ere.franceinfo.fr/x', ['franceinfo.fr'])).toBe('franceinfo.fr');
    expect(matchDomain('https://www.elections.interieur.gouv.fr/x', ['gouv.fr'])).toBe('gouv.fr');
    expect(matchDomain('https://notlemonde.fr/x', ['lemonde.fr'])).toBeNull();
    expect(matchDomain('https://lemonde.fr.evil.com/x', ['lemonde.fr'])).toBeNull();
  });
});

describe('checkCandidate', () => {
  it('accepts a valid candidate (official domain allowed for programme)', () => {
    expect(checkCandidate(candidate(), 'f', allowlist, new Set())).toEqual([]);
  });

  it('rejects sources outside the allowlist', () => {
    const issues = checkCandidate(
      candidate({
        declaration: {
          date: '2026-09-01',
          datePrecision: 'day',
          videoUrl: null,
          sources: [src('https://blog.example.com/x')],
        },
      }),
      'f',
      allowlist,
      new Set(),
    );
    expect(issues.map((i) => i.path)).toContain('declaration.sources[0]');
  });

  it('does not accept the candidate own site for the status', () => {
    const issues = checkCandidate(
      candidate({ statusSources: [src('https://lemonde.fr/1'), src('https://ab2027.fr/annonce')] }),
      'f',
      allowlist,
      new Set(),
    );
    expect(issues.some((i) => i.path === 'statusSources')).toBe(true);
  });

  it('requires two different outlets for status and risks', () => {
    const issues = checkCandidate(
      candidate({
        statusSources: [src('https://www.lemonde.fr/1'), src('https://www.lemonde.fr/2')],
        risques: [
          {
            id: 'r',
            nature: 'judiciaire',
            active: true,
            title: 't',
            statutJuridique: 's',
            resume: 'r',
            impact: 'i',
            sources: [src('https://afp.com/1')],
            updatedAt: '2026-11-16',
          },
        ],
      }),
      'f',
      allowlist,
      new Set(),
    );
    expect(issues.map((i) => i.path)).toEqual(
      expect.arrayContaining(['statusSources', 'risques[0].sources']),
    );
  });

  it('rejects unknown parties, non-Commons portraits and unknown video hosts', () => {
    const issues = checkCandidate(
      candidate({
        party: 'nope',
        portrait: {
          file: 'a-b.jpg',
          author: 'x',
          licence: 'Tous droits réservés',
          sourceUrl: 'https://example.com/a.jpg',
        },
        declaration: {
          date: '2026-09-01',
          datePrecision: 'day',
          videoUrl: 'https://evil.example/v',
          sources: [src('https://afp.com/3')],
        },
      }),
      'f',
      allowlist,
      new Set(),
    );
    expect(issues.map((i) => i.path)).toEqual(
      expect.arrayContaining(['party', 'portrait.sourceUrl', 'portrait.licence', 'declaration.videoUrl']),
    );
  });
});

it('accepts declaration videos posted on X', () => {
  const issues = checkCandidate(
    candidate({
      declaration: {
        date: '2026-11-09',
        datePrecision: 'day',
        videoUrl: 'https://x.com/someone/status/123',
        sources: [src('https://afp.com/3')],
      },
    }),
    'f',
    allowlist,
    new Set(),
  );
  expect(issues).toEqual([]);
});

describe('isFeatured', () => {
  const party = (assemblee: boolean): Party => ({
    id: 'p',
    name: 'P',
    short: 'P',
    famille: 'centre',
    classificationSources: [src('https://lemonde.fr/1')],
    representation: {
      assemblee,
      senat: false,
      parlementEuropeen: false,
      sources: [src('https://lemonde.fr/1')],
    },
  });
  it('applies the three published criteria', () => {
    expect(isFeatured(candidate(), null)).toBe(false);
    expect(isFeatured(candidate(), party(false))).toBe(false);
    expect(isFeatured(candidate(), party(true))).toBe(true);
    expect(isFeatured(candidate({ qualified2022: { sources: [src('https://lemonde.fr/1')] } }), null)).toBe(
      true,
    );
    expect(isFeatured(candidate({ parrainages: { count: 99, date: '2027-02-01', sources: [] } }), null)).toBe(
      false,
    );
    expect(
      isFeatured(candidate({ parrainages: { count: 100, date: '2027-02-01', sources: [] } }), null),
    ).toBe(true);
  });
});

describe('checkQuiz', () => {
  const q = (
    positions: Record<
      string,
      { option: string; kind: 'programme' | 'declaration'; sources: ReturnType<typeof src>[] }
    >,
  ) => ({
    questions: [
      {
        id: 'energie',
        theme: 'energie' as const,
        text: 'Q ?',
        type: 'scale' as const,
        options: [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
          { id: 'c', label: 'C' },
        ],
        positions,
      },
    ],
  });
  const cands = new Map([['a-b', candidate()]]);

  it('accepts two outlets, one of them the candidate site', () => {
    const quiz = q({
      'a-b': {
        option: 'a',
        kind: 'programme',
        sources: [src('https://ab2027.fr/p'), src('https://lemonde.fr/1')],
      },
    });
    expect(checkQuiz(quiz, allowlist, cands)).toEqual([]);
  });

  it('rejects a single source and unknown candidates', () => {
    const quiz = q({
      'a-b': { option: 'a', kind: 'programme', sources: [src('https://lemonde.fr/1')] },
      nobody: {
        option: 'b',
        kind: 'declaration',
        sources: [src('https://lemonde.fr/1'), src('https://afp.com/2')],
      },
    });
    expect(checkQuiz(quiz, allowlist, cands).map((i) => i.path)).toEqual([
      'energie.positions.a-b.sources',
      'energie.positions.nobody',
    ]);
  });
});

describe('checkEvent', () => {
  const event = (sources: ReturnType<typeof src>[], participants = ['a-b']) => ({
    id: 'debat',
    kind: 'debat' as const,
    date: '2026-11-16',
    time: '20:20',
    title: 'Débat',
    channels: ['TF1'],
    summary: 'Débat.',
    participants,
    absents: [],
    replayUrl: null,
    sources,
  });
  it('needs two outlets and known candidates', () => {
    expect(
      checkEvent(event([src('https://lemonde.fr/1'), src('https://afp.com/2')]), allowlist, new Set(['a-b'])),
    ).toEqual([]);
    expect(checkEvent(event([src('https://lemonde.fr/1')]), allowlist, new Set(['a-b'])).length).toBe(1);
    expect(
      checkEvent(
        event([src('https://lemonde.fr/1'), src('https://afp.com/2')], ['x']),
        allowlist,
        new Set(['a-b']),
      ).length,
    ).toBe(1);
  });
});
