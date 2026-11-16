import { z } from 'astro/zod';
import { THEME_IDS } from './themes.ts';

/** Absolute https URL (no other protocol is ever rendered as a link). */
export const httpsUrl = z.url({ protocol: /^https$/ });

/** ISO calendar date, e.g. 2026-11-16. */
export const isoDate = z.iso.date();
/** ISO date-time with an explicit offset, e.g. 2026-11-16T07:12:00+01:00. */
export const isoDateTime = z.iso.datetime({ offset: true });

export const sourceSchema = z.object({
  url: httpsUrl,
  /** Publisher as shown to readers, e.g. "Le Monde", "AFP", "Conseil constitutionnel". */
  outlet: z.string().min(1),
  title: z.string().min(1).optional(),
  /** Publication date of the source. */
  date: isoDate,
});
export type Source = z.infer<typeof sourceSchema>;

const sources = z.array(sourceSchema).min(1, 'every fact needs at least one source');

export const FAMILLES = ['extreme-gauche', 'gauche', 'centre', 'droite', 'extreme-droite', 'divers'] as const;
export const familleSchema = z.enum(FAMILLES);
export type Famille = z.infer<typeof familleSchema>;

export const STATUSES = ['potentiel', 'declare', 'officiel', 'retire'] as const;
export const statusSchema = z.enum(STATUSES);
export type Status = z.infer<typeof statusSchema>;

export const partySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  short: z.string().min(1),
  famille: familleSchema,
  /** Where the family classification comes from (e.g. the Interior Ministry's nuances grid). */
  classificationSources: sources,
  /** Whether the party currently has at least one member in each assembly (main-cloud criterion). */
  representation: z.object({
    assemblee: z.boolean(),
    senat: z.boolean(),
    parlementEuropeen: z.boolean(),
    sources,
  }),
});
export type Party = z.infer<typeof partySchema>;

export const portraitSchema = z.object({
  /** File name in src/assets/portraits/. */
  file: z.string().regex(/^[a-z0-9-]+\.(jpe?g|png|webp)$/),
  author: z.string().min(1),
  licence: z.string().min(1),
  /** Wikimedia Commons file page. */
  sourceUrl: httpsUrl,
});

export const sourcedText = z.object({ text: z.string().min(1), sources });

export const programmeItemSchema = z.object({
  theme: z.enum(THEME_IDS),
  text: z.string().min(1),
  sources,
});

export const meetingSchema = z.object({
  date: isoDate,
  city: z.string().min(1),
  title: z.string().min(1),
  sources,
});

export const risqueSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  /** Exact procedural status as reported, e.g. « condamnée en première instance, appel en cours ». */
  statutJuridique: z.string().min(1),
  resume: z.string().min(1),
  /** What it could change for the candidacy. */
  impact: z.string().min(1),
  sources,
  updatedAt: isoDate,
});

export const candidateSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9-]+$/),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    /** Grammatical gender, used only to agree French labels (« déclarée » / « déclaré »). */
    genre: z.enum(['f', 'm']),
    status: statusSchema,
    /** Sources supporting the current status. */
    statusSources: sources,
    /** Party id from parties.json that officially supports the candidate, or null. */
    party: z.string().nullable(),
    /** Official campaign or personal website domains (e.g. "exemple2027.fr"), allowed as sources for this candidate. */
    officialDomains: z.array(z.string().regex(/^[a-z0-9.-]+\.[a-z]{2,}$/)),
    /** Set when the candidate obtained the 500 sponsorships at the 2022 presidential election. */
    qualified2022: z.object({ sources }).nullable(),
    /** Latest validated sponsorship count published by the Conseil constitutionnel (from early 2027). */
    parrainages: z.object({ count: z.number().int().min(0), date: isoDate, sources }).nullable(),
    /** Current role, e.g. « Député de la Somme ». */
    role: z.string().min(1),
    portrait: portraitSchema.nullable(),
    declaration: z
      .object({
        date: isoDate,
        /** Video of the declaration, when there is one. */
        videoUrl: httpsUrl.nullable(),
        sources,
      })
      .nullable(),
    programme: z.array(programmeItemSchema),
    meetings: z.array(meetingSchema),
    risques: z.array(risqueSchema),
    lastChecked: isoDate,
  })
  .superRefine((c, ctx) => {
    if ((c.status === 'declare' || c.status === 'officiel') && c.declaration === null) {
      ctx.addIssue({
        code: 'custom',
        path: ['declaration'],
        message: 'declared candidates need a declaration',
      });
    }
  });
export type Candidate = z.infer<typeof candidateSchema>;

export const electionSchema = z.object({
  firstRound: isoDateTime,
  secondRound: isoDateTime,
  sources,
  /** Other key dates (sponsorship deadline, official list…). */
  milestones: z.array(z.object({ date: isoDate, label: z.string().min(1), sources })),
  /** Electoral silence windows: no publication between start and end. */
  silence: z.array(z.object({ start: isoDateTime, end: isoDateTime })),
});
export type Election = z.infer<typeof electionSchema>;

export const siteSchema = z.object({
  /** Last time the daily routine checked the news, changes or not. */
  lastChecked: isoDateTime,
});

export const changelogEntrySchema = z.object({
  date: isoDate,
  summary: z.string().min(1),
  changes: z.array(z.object({ candidate: z.string().nullable(), text: z.string().min(1) })),
  sources: z.array(sourceSchema),
});
export const changelogSchema = z.array(changelogEntrySchema);
export type ChangelogEntry = z.infer<typeof changelogEntrySchema>;
