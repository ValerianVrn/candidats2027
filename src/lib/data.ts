import { z } from 'astro/zod';
import {
  candidateSchema,
  changelogSchema,
  electionSchema,
  eventSchema,
  partySchema,
  siteSchema,
  type CampaignEvent,
  type Candidate,
  type Famille,
  type Party,
} from './schemas';
import electionJson from '../data/election.json';
import partiesJson from '../data/parties.json';
import changelogJson from '../data/changelog.json';
import siteJson from '../data/site.json';
import eventsJson from '../data/events.json';
import { isFeatured } from './criteria';

function parse<T>(schema: z.ZodType<T>, value: unknown, where: string): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid data in ${where}:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

export const election = parse(electionSchema, electionJson, 'src/data/election.json');
export const site = parse(siteSchema, siteJson, 'src/data/site.json');
export const changelog = parse(changelogSchema, changelogJson, 'src/data/changelog.json').toSorted((a, b) =>
  b.date.localeCompare(a.date),
);
export const parties: Party[] = parse(z.array(partySchema), partiesJson, 'src/data/parties.json');
const partyById = new Map(parties.map((p) => [p.id, p]));

const candidateFiles = import.meta.glob('../data/candidates/*.json', { eager: true, import: 'default' });

export const candidates: Candidate[] = Object.entries(candidateFiles)
  .map(([path, json]) => {
    const c = parse(candidateSchema, json, path);
    const fileSlug = path
      .split('/')
      .pop()!
      .replace(/\.json$/, '');
    if (c.slug !== fileSlug) throw new Error(`${path}: slug "${c.slug}" must match the file name`);
    if (c.party !== null && !partyById.has(c.party)) throw new Error(`${path}: unknown party "${c.party}"`);
    return c;
  })
  .toSorted((a, b) => a.lastName.localeCompare(b.lastName, 'fr'));

export function partyOf(c: Candidate): Party | null {
  return c.party === null ? null : (partyById.get(c.party) ?? null);
}

export function familleOf(c: Candidate): Famille {
  return partyOf(c)?.famille ?? 'divers';
}

export const fullName = (c: Candidate) => `${c.firstName} ${c.lastName}`;

/** Candidates still in the race (withdrawn ones are only listed in the journal). */
export const activeCandidates = candidates.filter((c) => c.status !== 'retire');

/** Main cloud vs « Autres candidatures », by the published criterion (src/lib/criteria.ts). */
export const featuredCandidates = activeCandidates.filter((c) => isFeatured(c, partyOf(c)));
export const otherCandidates = activeCandidates.filter((c) => !isFeatured(c, partyOf(c)));

/** Debates and major broadcasts, newest first. */
export const events: CampaignEvent[] = parse(z.array(eventSchema), eventsJson, 'src/data/events.json')
  .map((e) => {
    for (const slug of [...e.participants, ...e.absents.map((a) => a.slug)]) {
      if (!candidates.some((c) => c.slug === slug)) {
        throw new Error(`src/data/events.json: event "${e.id}" names unknown candidate "${slug}"`);
      }
    }
    return e;
  })
  .toSorted((a, b) => b.date.localeCompare(a.date));

/** Events a candidate took part in or declined. */
export function eventsOf(slug: string): { event: CampaignEvent; absent: { note: string } | null }[] {
  return events
    .filter((e) => e.participants.includes(slug) || e.absents.some((a) => a.slug === slug))
    .map((e) => ({ event: e, absent: e.absents.find((a) => a.slug === slug) ?? null }));
}
