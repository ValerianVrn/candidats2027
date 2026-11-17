/**
 * Prints whether the current branch's changes (vs a base ref) may be auto-merged.
 *   node scripts/diff-guard.ts [base=origin/develop]
 * Exit 0 = auto-merge allowed, 2 = needs a human (reasons printed), 1 = error.
 */
import { execFileSync } from 'node:child_process';
import { differsOnlyByCheckDate, evaluateChanges, parseNameStatus } from '../src/lib/diff-guard.ts';

const base = process.argv[2] ?? 'origin/develop';
const out = execFileSync('git', ['diff', '--name-status', `${base}...HEAD`], { encoding: 'utf8' });
const changes = parseNameStatus(out);
const show = (ref: string, path: string) => {
  try {
    return execFileSync('git', ['show', `${ref}:${path}`], { encoding: 'utf8' });
  } catch {
    return null;
  }
};
const mergeBase = execFileSync('git', ['merge-base', base, 'HEAD'], { encoding: 'utf8' }).trim();
const onlyCheckDates = new Set(
  changes
    .filter((c) => c.status === 'M' && c.path.startsWith('src/data/candidates/'))
    .filter((c) => {
      const before = show(mergeBase, c.path);
      const after = show('HEAD', c.path);
      return before !== null && after !== null && differsOnlyByCheckDate(before, after);
    })
    .map((c) => c.path),
);
const result = evaluateChanges(changes, onlyCheckDates);
console.log(JSON.stringify(result, null, 2));
process.exit(result.autoMerge ? 0 : 2);
