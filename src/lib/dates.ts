const TZ = 'Europe/Paris';

const dayFmt = new Intl.DateTimeFormat('fr-FR', {
  timeZone: TZ,
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const shortFmt = new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, day: 'numeric', month: 'short' });
const timeFmt = new Intl.DateTimeFormat('fr-FR', { timeZone: TZ, hour: '2-digit', minute: '2-digit' });

/** Parses YYYY-MM-DD as noon UTC so the calendar day is stable in Europe/Paris. */
function parseDay(isoDay: string): Date {
  return new Date(`${isoDay}T12:00:00Z`);
}

/** « 16 novembre 2026 » */
export function formatDay(isoDay: string): string {
  return dayFmt.format(parseDay(isoDay));
}

/** « 16 nov. » */
export function formatShortDay(isoDay: string): string {
  return shortFmt.format(parseDay(isoDay));
}

/** « 16 novembre 2026 à 07:12 » (Paris time) */
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${dayFmt.format(d)} à ${timeFmt.format(d)}`;
}

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  /** True once the target is reached. */
  done: boolean;
}

/** Whole days, hours and minutes remaining until `target` (never negative). */
export function countdown(target: Date, now: Date): Countdown {
  const ms = target.getTime() - now.getTime();
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, done: true };
  const totalMinutes = Math.floor(ms / 60_000);
  return {
    days: Math.floor(totalMinutes / 1440),
    hours: Math.floor((totalMinutes % 1440) / 60),
    minutes: totalMinutes % 60,
    done: false,
  };
}

/** « il y a 3 h », « il y a 12 min », « il y a 2 j » */
export function relativeAgo(past: Date, now: Date): string {
  const minutes = Math.max(0, Math.floor((now.getTime() - past.getTime()) / 60_000));
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  return `il y a ${Math.floor(hours / 24)} j`;
}

/** True when `now` falls inside one of the electoral silence windows. */
export function inSilence(windows: { start: string; end: string }[], now: Date): boolean {
  const t = now.getTime();
  return windows.some((w) => t >= new Date(w.start).getTime() && t < new Date(w.end).getTime());
}
