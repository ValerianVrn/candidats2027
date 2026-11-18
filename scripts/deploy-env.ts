/**
 * Picks the GitHub environment for a prod deploy of the push `before..after` on main (ADR 0005):
 * `production-data` (no approval) only when the routine is live and the push changes nothing but content,
 * `production` (owner approval) otherwise.
 *   node scripts/deploy-env.ts <before-sha> <after-sha>
 * Prints the environment name, and writes `environment=<name>` to $GITHUB_OUTPUT when set.
 */
import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';
import { isDataOnly, parseNameStatus } from '../src/lib/diff-guard.ts';

const [before, after] = process.argv.slice(2);
let environment = 'production';
const phase = (JSON.parse(readFileSync('config/routine.json', 'utf8')) as { phase?: string }).phase;
if (phase === 'live' && before && after && !/^0+$/.test(before)) {
  const out = execFileSync('git', ['diff', '--name-status', before, after], { encoding: 'utf8' });
  if (isDataOnly(parseNameStatus(out))) environment = 'production-data';
}
console.log(environment);
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `environment=${environment}\n`);
