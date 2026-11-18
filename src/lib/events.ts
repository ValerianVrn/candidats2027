import type { CampaignEvent } from './schemas.ts';

/** How long a past debate stays on the home page (days). */
export const RECENT_DAYS = 21;

/**
 * The debate to feature on the home page: the next announced one (today or later), otherwise the most recent
 * one from the last RECENT_DAYS days, otherwise none.
 */
export function homeDebate(
  events: readonly CampaignEvent[],
  today: string,
): { event: CampaignEvent; upcoming: boolean } | null {
  const debates = events.filter((e) => e.kind === 'debat');
  const next = debates.filter((e) => e.date >= today).toSorted((a, b) => a.date.localeCompare(b.date))[0];
  if (next) return { event: next, upcoming: true };
  const limit = new Date(`${today}T12:00:00Z`);
  limit.setUTCDate(limit.getUTCDate() - RECENT_DAYS);
  const since = limit.toISOString().slice(0, 10);
  const last = debates
    .filter((e) => e.date < today && e.date >= since)
    .toSorted((a, b) => b.date.localeCompare(a.date))[0];
  return last ? { event: last, upcoming: false } : null;
}
