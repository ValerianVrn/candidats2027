/**
 * Programme proposals grouped by theme, for the « Programmes » pages. Same ordering rule as the rest of the
 * site (last name, no ranking); candidates without a sourced proposal on the theme are listed too, so every
 * candidate is treated the same.
 */
import type { Candidate } from './schemas.ts';
import { THEME_IDS, type Theme } from './themes.ts';

export type ProgrammeItem = Candidate['programme'][number];

export interface ThemeEntry {
  candidate: Candidate;
  items: ProgrammeItem[];
}

const byName = (a: Candidate, b: Candidate) =>
  `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`, 'fr');

/** Candidates with proposals on `theme` (with those proposals), and the others. */
export function programmeByTheme(
  candidates: readonly Candidate[],
  theme: Theme,
): { entries: ThemeEntry[]; without: Candidate[] } {
  const entries: ThemeEntry[] = [];
  const without: Candidate[] = [];
  for (const candidate of candidates.toSorted(byName)) {
    const items = candidate.programme.filter((p) => p.theme === theme);
    if (items.length) entries.push({ candidate, items });
    else without.push(candidate);
  }
  return { entries, without };
}

/** Number of proposals and of candidates per theme, in display order. */
export function themeCounts(
  candidates: readonly Candidate[],
): { theme: Theme; proposals: number; candidates: number }[] {
  return THEME_IDS.map((theme) => {
    const withTheme = candidates.filter((c) => c.programme.some((p) => p.theme === theme));
    return {
      theme,
      proposals: candidates.reduce((n, c) => n + c.programme.filter((p) => p.theme === theme).length, 0),
      candidates: withTheme.length,
    };
  });
}
