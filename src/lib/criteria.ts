import type { Candidate, Party } from './schemas.ts';

/** Minimum validated sponsorships (published by the Conseil constitutionnel) to join the main cloud. */
export const PARRAINAGES_THRESHOLD = 100;

/**
 * Main-cloud criterion, published on /methode. A candidate is featured if any of:
 * 1. officially supported by a party with at least one member of the Assemblée, the Sénat or the Parlement européen;
 * 2. obtained the 500 sponsorships at the 2022 presidential election;
 * 3. has at least PARRAINAGES_THRESHOLD validated sponsorships for 2027.
 */
export function isFeatured(c: Candidate, party: Party | null): boolean {
  const r = party?.representation;
  const parliamentary = !!r && (r.assemblee || r.senat || r.parlementEuropeen);
  return parliamentary || c.qualified2022 !== null || (c.parrainages?.count ?? 0) >= PARRAINAGES_THRESHOLD;
}
