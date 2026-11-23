/**
 * Campaign chronology: every dated fact the data holds (declarations, withdrawals, debates and broadcasts,
 * meetings, election dates), whatever day the routine found it. Feeds /calendrier and the home page's
 * « Dernièrement » line. Pure, unit tested.
 */
import type { CampaignEvent, Candidate, Election, Source } from './schemas.ts';

export type ChronoKind = 'declaration' | 'retrait' | 'debat' | 'emission' | 'meeting' | 'scrutin' | 'etape';

/** Filter groups shown as chips on /calendrier. */
export const CHRONO_GROUP: Record<ChronoKind, 'candidatures' | 'debats' | 'meetings' | 'scrutin'> = {
  declaration: 'candidatures',
  retrait: 'candidatures',
  debat: 'debats',
  emission: 'debats',
  meeting: 'meetings',
  scrutin: 'scrutin',
  etape: 'scrutin',
};

export interface ChronoItem {
  /** Stable id (anchors, keys). */
  id: string;
  /** YYYY-MM-DD */
  date: string;
  /** `month`: only the month is known; `before`: happened by `date` at the latest. */
  precision: 'day' | 'month' | 'before';
  /** HH:MM (Paris) when known. */
  time: string | null;
  kind: ChronoKind;
  text: string;
  /** Candidates involved, for links. */
  slugs: string[];
  sources: Source[];
}

const name = (c: Candidate) => `${c.firstName} ${c.lastName}`;

/** All dated items, split into upcoming (date ≥ today, soonest first) and past (most recent first). */
export function buildChronology(
  candidates: readonly Candidate[],
  events: readonly CampaignEvent[],
  election: Election,
  today: string,
): { upcoming: ChronoItem[]; past: ChronoItem[] } {
  const items: ChronoItem[] = [];
  for (const c of candidates) {
    if (c.declaration) {
      items.push({
        id: `declaration-${c.slug}`,
        date: c.declaration.date,
        precision: c.declaration.datePrecision,
        time: null,
        kind: 'declaration',
        text: `${name(c)} déclare sa candidature`,
        slugs: [c.slug],
        sources: c.declaration.sources,
      });
    }
    if (c.withdrawal) {
      items.push({
        id: `retrait-${c.slug}`,
        date: c.withdrawal.date,
        precision: 'day',
        time: null,
        kind: 'retrait',
        text: `${name(c)} retire sa candidature`,
        slugs: [c.slug],
        sources: c.withdrawal.sources,
      });
    }
    c.meetings.forEach((m, i) =>
      items.push({
        id: `meeting-${c.slug}-${m.date}-${i}`,
        date: m.date,
        precision: 'day',
        time: null,
        kind: 'meeting',
        text: `${name(c)} : ${m.title}, ${m.city}`,
        slugs: [c.slug],
        sources: m.sources,
      }),
    );
  }
  for (const e of events) {
    items.push({
      id: e.id,
      date: e.date,
      precision: 'day',
      time: e.time,
      kind: e.kind,
      text: `${e.kind === 'debat' ? 'Débat' : 'Émission'} « ${e.title} » (${e.channels.join(', ')})`,
      slugs: e.participants,
      sources: e.sources,
    });
  }
  election.milestones.forEach((m, i) =>
    items.push({
      id: `etape-${m.date}-${i}`,
      date: m.date,
      precision: 'day',
      time: null,
      kind: 'etape',
      text: m.label,
      slugs: [],
      sources: m.sources,
    }),
  );
  for (const [round, iso] of [
    ['Premier tour', election.firstRound],
    ['Second tour', election.secondRound],
  ] as const) {
    items.push({
      id: `scrutin-${iso.slice(0, 10)}`,
      date: iso.slice(0, 10),
      precision: 'day',
      time: null,
      kind: 'scrutin',
      text: `${round} de l'élection présidentielle`,
      slugs: [],
      sources: election.sources,
    });
  }
  const upcoming = items
    .filter((i) => i.date >= today && i.precision !== 'before')
    .toSorted((a, b) => a.date.localeCompare(b.date) || (a.time ?? '').localeCompare(b.time ?? ''));
  const past = items
    .filter((i) => i.date < today || i.precision === 'before')
    .toSorted((a, b) => b.date.localeCompare(a.date) || (b.time ?? '').localeCompare(a.time ?? ''));
  return { upcoming, past };
}

/** « novembre 2026 » (for month headings). */
export function monthLabel(isoDay: string): string {
  return new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${isoDay}T12:00:00Z`),
  );
}

/** Items grouped by calendar month, keeping their order. */
export function byMonth(items: readonly ChronoItem[]): { month: string; items: ChronoItem[] }[] {
  const groups: { month: string; items: ChronoItem[] }[] = [];
  for (const item of items) {
    const month = monthLabel(item.date);
    const last = groups.at(-1);
    if (last && last.month === month) last.items.push(item);
    else groups.push({ month, items: [item] });
  }
  return groups;
}
