/**
 * Decides whether an automated content change may be merged without a human (pure function).
 * Used by scripts/diff-guard.ts in the daily routine. See ADR 0002.
 */

export interface FileChange {
  /** git status letter: A(dded), M(odified), D(eleted), R(enamed)… */
  status: string;
  path: string;
}

export interface GuardResult {
  autoMerge: boolean;
  reasons: string[];
}

export const MAX_CANDIDATE_FILES = 5;

const DATA_PREFIX = 'src/data/';
const PORTRAIT_PREFIX = 'src/assets/portraits/';

/**
 * @param onlyCheckDates paths whose only change is a `lastChecked` date: they don't count towards the
 *   candidate-file limit (the routine refreshes every profile's date daily).
 */
export function evaluateChanges(
  changes: readonly FileChange[],
  onlyCheckDates: ReadonlySet<string> = new Set(),
): GuardResult {
  const reasons: string[] = [];
  for (const c of changes) {
    const inData = c.path.startsWith(DATA_PREFIX) || c.path.startsWith(PORTRAIT_PREFIX);
    if (!inData) reasons.push(`changes a file outside the data: ${c.path}`);
    if (c.status.startsWith('D') || c.status.startsWith('R')) reasons.push(`deletes or renames ${c.path}`);
  }
  const candidateFiles = changes.filter(
    (c) => c.path.startsWith(`${DATA_PREFIX}candidates/`) && !onlyCheckDates.has(c.path),
  );
  if (candidateFiles.length > MAX_CANDIDATE_FILES) {
    reasons.push(`touches ${candidateFiles.length} candidate files (max ${MAX_CANDIDATE_FILES})`);
  }
  if (changes.some((c) => c.path === `${DATA_PREFIX}parties.json`)) {
    reasons.push('changes parties.json (classification and main-cloud criterion)');
  }
  if (changes.some((c) => c.path === `${DATA_PREFIX}election.json`)) {
    reasons.push('changes election.json (official dates)');
  }
  return { autoMerge: reasons.length === 0, reasons };
}

/** Parses `git diff --name-status` output. */
export function parseNameStatus(output: string): FileChange[] {
  return output
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const parts = l.split('\t');
      return { status: parts[0]!, path: parts[parts.length - 1]! };
    });
}

/**
 * True when every changed file is content (data or portraits). Used to pick the prod deploy environment:
 * data-only pushes to main may deploy without the owner's approval (ADR 0005), anything else may not.
 */
export function isDataOnly(changes: readonly FileChange[]): boolean {
  return (
    changes.length > 0 &&
    changes.every((c) => c.path.startsWith(DATA_PREFIX) || c.path.startsWith(PORTRAIT_PREFIX))
  );
}

/** True when two JSON texts differ only by their `lastChecked` field. */
export function differsOnlyByCheckDate(before: string, after: string): boolean {
  try {
    const a = JSON.parse(before) as Record<string, unknown>;
    const b = JSON.parse(after) as Record<string, unknown>;
    delete a.lastChecked;
    delete b.lastChecked;
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}
