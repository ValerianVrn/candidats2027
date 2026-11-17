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

export function evaluateChanges(changes: readonly FileChange[]): GuardResult {
  const reasons: string[] = [];
  for (const c of changes) {
    const inData = c.path.startsWith(DATA_PREFIX) || c.path.startsWith(PORTRAIT_PREFIX);
    if (!inData) reasons.push(`changes a file outside the data: ${c.path}`);
    if (c.status.startsWith('D') || c.status.startsWith('R')) reasons.push(`deletes or renames ${c.path}`);
  }
  const candidateFiles = changes.filter((c) => c.path.startsWith(`${DATA_PREFIX}candidates/`));
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
