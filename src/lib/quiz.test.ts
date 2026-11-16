import { describe, expect, it } from 'vitest';
import {
  agreement,
  decodeAnswers,
  encodeAnswers,
  MIN_COVERAGE,
  quizIsReady,
  scoreCandidates,
  shuffle,
  type Answer,
  type ScoringQuestion,
} from './quiz';

const opts = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `o${i}` }));

function q(id: string, type: 'scale' | 'choice', positions: Record<string, string>): ScoringQuestion {
  return {
    id,
    type,
    options: opts(5),
    positions: Object.fromEntries(Object.entries(positions).map(([s, o]) => [s, { option: o }])),
  };
}

describe('agreement', () => {
  it('scales with distance on ordered questions', () => {
    const question = q('a', 'scale', {});
    expect(agreement(question, 'o0', 'o0')).toBe(1);
    expect(agreement(question, 'o0', 'o1')).toBe(0.75);
    expect(agreement(question, 'o0', 'o4')).toBe(0);
  });

  it('is all-or-nothing on choice questions', () => {
    const question = q('a', 'choice', {});
    expect(agreement(question, 'o1', 'o1')).toBe(1);
    expect(agreement(question, 'o1', 'o2')).toBe(0);
  });
});

describe('scoreCandidates', () => {
  const questions = Array.from({ length: 8 }, (_, i) =>
    q(`q${i}`, 'scale', { alice: 'o0', bob: 'o4', ...(i < 3 ? { carol: 'o0' } : {}) }),
  );
  const all = (option: string | null, important = false): Record<string, Answer> =>
    Object.fromEntries(questions.map((x) => [x.id, { option, important }]));

  it('ranks the closest candidate first', () => {
    const r = scoreCandidates(questions, all('o0'), ['bob', 'alice']);
    expect(r.map((x) => [x.slug, x.score])).toEqual([
      ['alice', 100],
      ['bob', 0],
    ]);
  });

  it('withholds a score below the minimum coverage', () => {
    const r = scoreCandidates(questions, all('o0'), ['carol']);
    expect(r[0]).toEqual({ slug: 'carol', score: null, coverage: 3 });
    expect(MIN_COVERAGE).toBeGreaterThan(3);
  });

  it('ignores skipped questions (« Sans avis »)', () => {
    const answers = all('o0');
    answers.q0 = { option: null, important: false };
    expect(scoreCandidates(questions, answers, ['alice'])[0]!.coverage).toBe(7);
  });

  it('counts important questions twice', () => {
    const qs = [
      q('x', 'choice', { a: 'o0' }),
      ...Array.from({ length: 6 }, (_, i) => q(`y${i}`, 'choice', { a: 'o1' })),
    ];
    const answers: Record<string, Answer> = Object.fromEntries(
      qs.map((x) => [x.id, { option: 'o0', important: false }]),
    );
    expect(scoreCandidates(qs, answers, ['a'])[0]!.score).toBe(Math.round((1 / 7) * 100));
    answers.x = { option: 'o0', important: true };
    expect(scoreCandidates(qs, answers, ['a'])[0]!.score).toBe(Math.round((2 / 8) * 100));
  });

  it('breaks ties alphabetically by name, never by data order', () => {
    const r = scoreCandidates(questions, all('o2'), ['bob', 'alice'], {
      alice: 'Zoé Martin',
      bob: 'Anne Durand',
    });
    expect(r.map((x) => x.slug)).toEqual(['bob', 'alice']);
  });
});

describe('quizIsReady', () => {
  it('needs enough questions and enough covered candidates', () => {
    const qs = Array.from({ length: 8 }, (_, i) =>
      q(`q${i}`, 'scale', Object.fromEntries(['a', 'b', 'c', 'd', 'e', 'f'].map((s) => [s, 'o0']))),
    );
    expect(quizIsReady(qs, ['a', 'b', 'c', 'd', 'e', 'f'])).toBe(true);
    expect(quizIsReady(qs, ['a', 'b', 'c', 'd', 'e'])).toBe(false);
    expect(quizIsReady(qs.slice(0, 7), ['a', 'b', 'c', 'd', 'e', 'f'])).toBe(false);
  });
});

describe('answers encoding', () => {
  it('round-trips', () => {
    const answers: Record<string, Answer> = {
      energie: { option: 'relance', important: true },
      retraites: { option: null, important: false },
    };
    expect(decodeAnswers(encodeAnswers(answers))).toEqual(answers);
  });

  it('ignores malformed parts', () => {
    expect(decodeAnswers('ok.yes,<script>,bad')).toEqual({ ok: { option: 'yes', important: false } });
  });
});

describe('shuffle', () => {
  it('keeps every item', () => {
    const items = [1, 2, 3, 4, 5];
    let seed = 1;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    expect(shuffle([...items], rnd).toSorted()).toEqual(items);
  });
});
