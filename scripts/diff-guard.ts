/**
 * Prints whether the current branch's changes (vs a base ref) may be auto-merged.
 *   node scripts/diff-guard.ts [base=origin/develop]
 * Exit 0 = auto-merge allowed, 2 = needs a human (reasons printed), 1 = error.
 */
import { execFileSync } from 'node:child_process';
import { evaluateChanges, parseNameStatus } from '../src/lib/diff-guard.ts';

const base = process.argv[2] ?? 'origin/develop';
const out = execFileSync('git', ['diff', '--name-status', `${base}...HEAD`], { encoding: 'utf8' });
const result = evaluateChanges(parseNameStatus(out));
console.log(JSON.stringify(result, null, 2));
process.exit(result.autoMerge ? 0 : 2);
