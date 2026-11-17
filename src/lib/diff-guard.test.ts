import { describe, expect, it } from 'vitest';
import { differsOnlyByCheckDate, evaluateChanges, isDataOnly, parseNameStatus } from './diff-guard';

describe('evaluateChanges', () => {
  it('allows a small data-only update', () => {
    const r = evaluateChanges([
      { status: 'M', path: 'src/data/candidates/a.json' },
      { status: 'A', path: 'src/data/candidates/b.json' },
      { status: 'A', path: 'src/assets/portraits/b.jpg' },
      { status: 'M', path: 'src/data/changelog.json' },
      { status: 'M', path: 'src/data/site.json' },
    ]);
    expect(r).toEqual({ autoMerge: true, reasons: [] });
  });

  it.each([
    [[{ status: 'M', path: 'src/pages/index.astro' }], 'outside the data'],
    [[{ status: 'M', path: 'config/sources-allowlist.json' }], 'outside the data'],
    [[{ status: 'M', path: '.github/workflows/ci.yml' }], 'outside the data'],
    [[{ status: 'D', path: 'src/data/candidates/a.json' }], 'deletes'],
    [[{ status: 'M', path: 'src/data/parties.json' }], 'parties.json'],
    [[{ status: 'M', path: 'src/data/election.json' }], 'election.json'],
    [
      Array.from({ length: 6 }, (_, i) => ({ status: 'M', path: `src/data/candidates/c${i}.json` })),
      'candidate files',
    ],
  ])('blocks %#', (changes, reason) => {
    const r = evaluateChanges(changes);
    expect(r.autoMerge).toBe(false);
    expect(r.reasons.join(' ')).toContain(reason);
  });
});

describe('parseNameStatus', () => {
  it('reads git output including renames', () => {
    expect(parseNameStatus('M\tsrc/data/a.json\nR100\told.json\tnew.json\n')).toEqual([
      { status: 'M', path: 'src/data/a.json' },
      { status: 'R100', path: 'new.json' },
    ]);
  });
});

describe('isDataOnly', () => {
  it('accepts data and portraits only', () => {
    expect(
      isDataOnly([
        { status: 'M', path: 'src/data/candidates/a.json' },
        { status: 'A', path: 'src/assets/portraits/a.jpg' },
      ]),
    ).toBe(true);
  });

  it.each([
    [[]],
    [[{ status: 'M', path: '.github/workflows/deploy-prod.yml' }]],
    [
      [
        { status: 'M', path: 'src/data/quiz.json' },
        { status: 'M', path: 'src/lib/quiz.ts' },
      ],
    ],
    [[{ status: 'M', path: 'config/routine.json' }]],
  ])('rejects anything else %#', (changes) => {
    expect(isDataOnly(changes)).toBe(false);
  });
});

describe('daily check dates', () => {
  it('ignores profiles where only lastChecked changed', () => {
    const changes = Array.from({ length: 44 }, (_, i) => ({
      status: 'M',
      path: `src/data/candidates/c${i}.json`,
    }));
    const onlyDates = new Set(changes.slice(0, 41).map((c) => c.path));
    expect(evaluateChanges(changes, onlyDates).autoMerge).toBe(true);
    expect(evaluateChanges(changes, new Set(changes.slice(0, 30).map((c) => c.path))).autoMerge).toBe(false);
  });

  it('detects a change limited to lastChecked', () => {
    const before = JSON.stringify({ slug: 'a', status: 'declare', lastChecked: '2026-11-17' });
    expect(
      differsOnlyByCheckDate(
        before,
        JSON.stringify({ slug: 'a', status: 'declare', lastChecked: '2026-11-18' }),
      ),
    ).toBe(true);
    expect(
      differsOnlyByCheckDate(
        before,
        JSON.stringify({ slug: 'a', status: 'retire', lastChecked: '2026-11-18' }),
      ),
    ).toBe(false);
    expect(differsOnlyByCheckDate(before, 'not json')).toBe(false);
  });
});
