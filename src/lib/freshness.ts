/** Calendar day (YYYY-MM-DD) of an ISO date-time, in Paris time. */
export function parisDay(iso: string): string {
  return new Date(iso).toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' });
}
