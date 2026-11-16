import { z } from 'astro/zod';
import { quizSchema, type QuizQuestion } from './quiz-schema.ts';
import { quizIsReady } from './quiz.ts';
import { activeCandidates } from './data';
import { THEME_IDS } from './themes.ts';
import quizJson from '../data/quiz.json';

const parsed = quizSchema.safeParse(quizJson);
if (!parsed.success) throw new Error(`Invalid data in src/data/quiz.json:\n${z.prettifyError(parsed.error)}`);

const known = new Set(activeCandidates.map((c) => c.slug));
for (const q of parsed.data.questions) {
  for (const slug of Object.keys(q.positions)) {
    if (!known.has(slug))
      throw new Error(`quiz.json: question "${q.id}" has a position for unknown candidate "${slug}"`);
  }
}

/** Questions in theme order. */
export const questions: QuizQuestion[] = parsed.data.questions.toSorted(
  (a, b) => THEME_IDS.indexOf(a.theme) - THEME_IDS.indexOf(b.theme),
);

/** Candidates the quiz can compare (those with at least one known position). */
export const quizCandidates = activeCandidates.filter((c) => questions.some((q) => q.positions[c.slug]));

export const quizReady = quizIsReady(
  questions,
  activeCandidates.map((c) => c.slug),
);

/** Compact payload for the browser (no sources: those are rendered in the page). */
export const clientPayload = {
  questions: questions.map((q) => ({
    id: q.id,
    type: q.type,
    options: q.options.map((o) => ({ id: o.id })),
    positions: Object.fromEntries(Object.entries(q.positions).map(([s, p]) => [s, { option: p.option }])),
  })),
};
