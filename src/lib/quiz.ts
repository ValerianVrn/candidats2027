/**
 * Quiz scoring. Runs in the reader's browser only: answers are never sent or stored.
 * Method (published on /methode#quiz):
 *  - per question, agreement ∈ [0, 1]: `scale` → 1 − distance / (options − 1); `choice` → 1 if same option;
 *  - a question counts only if the reader answered it AND the candidate's position is known;
 *  - « important » doubles the question's weight;
 *  - proximity = weighted mean agreement; below MIN_COVERAGE questions, no score is shown.
 */

export const MIN_COVERAGE = 6;

/** Minimal question shape needed for scoring (the full one is in quiz-schema.ts). */
export interface ScoringQuestion {
  id: string;
  type: 'scale' | 'choice';
  options: readonly { id: string }[];
  positions: Readonly<Record<string, { option: string }>>;
}

export interface Answer {
  /** Chosen option id, or null for « Sans avis ». */
  option: string | null;
  important: boolean;
}

export interface CandidateScore {
  slug: string;
  /** 0–100, or null when coverage is below MIN_COVERAGE. */
  score: number | null;
  /** Number of questions that counted. */
  coverage: number;
}

export function agreement(q: ScoringQuestion, answer: string, position: string): number {
  if (q.type === 'choice') return answer === position ? 1 : 0;
  const ia = q.options.findIndex((o) => o.id === answer);
  const ip = q.options.findIndex((o) => o.id === position);
  if (ia < 0 || ip < 0) return 0;
  return 1 - Math.abs(ia - ip) / (q.options.length - 1);
}

export function scoreCandidates(
  questions: readonly ScoringQuestion[],
  answers: Readonly<Record<string, Answer>>,
  slugs: readonly string[],
  names: Readonly<Record<string, string>> = {},
): CandidateScore[] {
  const results = slugs.map((slug) => {
    let sum = 0;
    let weights = 0;
    let coverage = 0;
    for (const q of questions) {
      const a = answers[q.id];
      const p = q.positions[slug];
      if (!a || a.option === null || !p) continue;
      const w = a.important ? 2 : 1;
      sum += w * agreement(q, a.option, p.option);
      weights += w;
      coverage++;
    }
    const score = coverage >= MIN_COVERAGE && weights > 0 ? Math.round((sum / weights) * 100) : null;
    return { slug, score, coverage };
  });
  const label = (s: string) => names[s] ?? s;
  return results.sort((a, b) => {
    if (a.score === null && b.score === null) return label(a.slug).localeCompare(label(b.slug), 'fr');
    if (a.score === null) return 1;
    if (b.score === null) return -1;
    return b.score - a.score || label(a.slug).localeCompare(label(b.slug), 'fr');
  });
}

/** Share of questions on which a candidate has a known position (0–1). */
export function positionCoverage(questions: readonly ScoringQuestion[], slug: string): number {
  if (questions.length === 0) return 0;
  return questions.filter((q) => q.positions[slug]).length / questions.length;
}

/** The quiz opens once at least `minCandidates` candidates are covered on ≥ `minShare` of the questions. */
export function quizIsReady(
  questions: readonly ScoringQuestion[],
  slugs: readonly string[],
  minCandidates = 6,
  minShare = 0.7,
): boolean {
  return (
    questions.length >= 8 &&
    slugs.filter((s) => positionCoverage(questions, s) >= minShare).length >= minCandidates
  );
}

/** Unbiased in-place shuffle (Fisher–Yates) with an injectable random source. */
export function shuffle<T>(items: T[], random: () => number = Math.random): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [items[i], items[j]] = [items[j]!, items[i]!];
  }
  return items;
}

/** Encodes answers for the URL fragment (never sent to a server): `q1.opt!,q2.-,…` (`!` = important, `-` = skipped). */
export function encodeAnswers(answers: Readonly<Record<string, Answer>>): string {
  return Object.entries(answers)
    .map(([q, a]) => `${q}.${a.option ?? '-'}${a.important ? '!' : ''}`)
    .join(',');
}

export function decodeAnswers(text: string): Record<string, Answer> {
  const out: Record<string, Answer> = {};
  for (const part of text.split(',')) {
    const m = /^([a-z0-9-]+)\.([a-z0-9-]+|-)(!)?$/.exec(part);
    if (!m) continue;
    out[m[1]!] = { option: m[2] === '-' ? null : m[2]!, important: m[3] === '!' };
  }
  return out;
}
