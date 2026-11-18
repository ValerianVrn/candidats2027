import { z } from 'astro/zod';
import { sourceSchema } from './schemas.ts';
import { THEME_IDS } from './themes.ts';

const sources = z.array(sourceSchema).min(1);

export const quizOptionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  label: z.string().min(1),
});

export const quizPositionSchema = z.object({
  /** Option id that matches the candidate's stated position. */
  option: z.string(),
  /** « programme » (official programme) or « declaration » (public statement). */
  kind: z.enum(['programme', 'declaration']),
  sources,
});

export const quizQuestionSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    theme: z.enum(THEME_IDS),
    /** Short label for theme chips (« 35 heures »), defaults to the theme name. */
    short: z.string().min(1).max(24).optional(),
    text: z.string().min(1),
    /**
     * `scale`: options are ordered (first → last), so neighbouring answers partly agree.
     * `choice`: unordered options, only an exact match agrees.
     */
    type: z.enum(['scale', 'choice']),
    options: z.array(quizOptionSchema).min(3).max(5),
    positions: z.record(z.string(), quizPositionSchema),
  })
  .superRefine((q, ctx) => {
    const ids = new Set(q.options.map((o) => o.id));
    if (ids.size !== q.options.length)
      ctx.addIssue({ code: 'custom', path: ['options'], message: 'duplicate option id' });
    for (const [slug, p] of Object.entries(q.positions)) {
      if (!ids.has(p.option)) {
        ctx.addIssue({ code: 'custom', path: ['positions', slug], message: `unknown option "${p.option}"` });
      }
    }
  });

export const quizSchema = z.object({ questions: z.array(quizQuestionSchema) });

export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type Quiz = z.infer<typeof quizSchema>;
