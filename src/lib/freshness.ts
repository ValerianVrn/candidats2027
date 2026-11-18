/**
 * How fresh the site really is. The header must not claim more than what was checked: the site-wide time
 * (site.json) only counts when every active profile was checked that same day; otherwise the oldest profile
 * check is shown.
 */

/** Calendar day (YYYY-MM-DD) of an ISO date-time, in Paris time. */
export function parisDay(iso: string): string {
  return new Date(iso).toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' });
}

export interface Verification {
  /** True when every profile was checked on the day of the last run. */
  complete: boolean;
  /** Day everything had been checked by (YYYY-MM-DD). */
  day: string;
  /** Precise time of the last complete check, or null when the last run was partial. */
  at: string | null;
}

export function verification(profileDays: readonly string[], siteLastChecked: string): Verification {
  const siteDay = parisDay(siteLastChecked);
  const oldest = profileDays.length ? profileDays.toSorted()[0]! : siteDay;
  if (oldest >= siteDay) return { complete: true, day: siteDay, at: siteLastChecked };
  return { complete: false, day: oldest, at: null };
}
