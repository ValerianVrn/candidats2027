/**
 * Validates all content in src/data/ against the schemas and the guardrails.
 *
 *   node scripts/check-data.ts            schema + allowlist + two-source rules
 *   node scripts/check-data.ts --links    also checks that every cited URL still exists
 *
 * Exits with code 1 on any error. Link check: 404/410 and unknown hosts are errors; other failures
 * (403 from sites that block bots, timeouts) are only reported as warnings.
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'astro/zod';
import {
  candidateSchema,
  changelogSchema,
  electionSchema,
  eventSchema,
  partySchema,
  siteSchema,
  type Candidate,
  type Party,
} from '../src/lib/schemas.ts';
import {
  checkCandidate,
  checkEvent,
  checkParty,
  checkQuiz,
  type Allowlist,
  type Issue,
} from '../src/lib/guardrails.ts';
import { quizSchema } from '../src/lib/quiz-schema.ts';

const root = join(import.meta.dirname, '..');
const dataDir = join(root, 'src', 'data');
const readJson = (p: string): unknown => JSON.parse(readFileSync(p, 'utf8'));
const issues: Issue[] = [];
const urls = new Set<string>();

function parse<T>(schema: z.ZodType<T>, value: unknown, file: string): T | null {
  const r = schema.safeParse(value);
  if (!r.success) {
    issues.push({ file, path: '', message: z.prettifyError(r.error) });
    return null;
  }
  return r.data;
}

function collectUrls(value: unknown): void {
  if (Array.isArray(value)) value.forEach(collectUrls);
  else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      if (k === 'url' && typeof v === 'string') urls.add(v);
      else collectUrls(v);
    }
  }
}

const allowlist = readJson(join(root, 'config', 'sources-allowlist.json')) as Allowlist;

const parties = (readJson(join(dataDir, 'parties.json')) as unknown[])
  .map((p) => parse(partySchema, p, 'parties.json'))
  .filter((p): p is Party => p !== null);
parties.forEach((p) => issues.push(...checkParty(p, 'parties.json', allowlist)));
const partyIds = new Set(parties.map((p) => p.id));
if (partyIds.size !== parties.length)
  issues.push({ file: 'parties.json', path: '', message: 'duplicate party id' });
collectUrls(parties);

const candDir = join(dataDir, 'candidates');
const candidates: Candidate[] = [];
for (const name of readdirSync(candDir).filter((f) => f.endsWith('.json'))) {
  const file = `candidates/${name}`;
  const raw = readJson(join(candDir, name));
  const c = parse(candidateSchema, raw, file);
  if (!c) continue;
  if (`${c.slug}.json` !== name)
    issues.push({ file, path: 'slug', message: 'slug must match the file name' });
  if (c.portrait && !existsSync(join(root, 'src', 'assets', 'portraits', c.portrait.file))) {
    issues.push({ file, path: 'portrait.file', message: `missing src/assets/portraits/${c.portrait.file}` });
  }
  issues.push(...checkCandidate(c, file, allowlist, partyIds));
  candidates.push(c);
  collectUrls(c);
}

const election = parse(electionSchema, readJson(join(dataDir, 'election.json')), 'election.json');
if (election) {
  collectUrls(election);
  const allow = [...allowlist.media, ...allowlist.official];
  for (const s of election.sources) {
    const host = new URL(s.url).hostname;
    if (!allow.some((d) => host === d || host.endsWith(`.${d}`))) {
      issues.push({
        file: 'election.json',
        path: 'sources',
        message: `source not on the allowlist: ${host}`,
      });
    }
  }
}
parse(siteSchema, readJson(join(dataDir, 'site.json')), 'site.json');
const eventList = parse(z.array(eventSchema), readJson(join(dataDir, 'events.json')), 'events.json');
if (eventList) {
  const slugSet = new Set(candidates.map((c) => c.slug));
  const ids = new Set<string>();
  for (const e of eventList) {
    if (ids.has(e.id)) issues.push({ file: 'events.json', path: e.id, message: 'duplicate event id' });
    ids.add(e.id);
    issues.push(...checkEvent(e, allowlist, slugSet));
  }
  collectUrls(eventList);
}
const quiz = parse(quizSchema, readJson(join(dataDir, 'quiz.json')), 'quiz.json');
if (quiz) {
  issues.push(...checkQuiz(quiz, allowlist, new Map(candidates.map((c) => [c.slug, c]))));
  collectUrls(quiz);
}
const changelog = parse(changelogSchema, readJson(join(dataDir, 'changelog.json')), 'changelog.json');
if (changelog) collectUrls(changelog);

const warnings: string[] = [];
if (process.argv.includes('--links')) {
  const list = [...urls];
  const results = await Promise.all(
    list.map(async (url) => {
      try {
        const res = await fetch(url, {
          method: 'GET',
          redirect: 'follow',
          signal: AbortSignal.timeout(15_000),
          headers: { 'user-agent': 'Mozilla/5.0 (compatible; Candidats2027-linkcheck/1.0)' },
        });
        await res.body?.cancel();
        return { url, status: res.status, error: null as string | null };
      } catch (e) {
        const cause = (e as { cause?: { code?: string } }).cause?.code ?? (e as Error).name;
        return { url, status: 0, error: cause };
      }
    }),
  );
  for (const r of results) {
    if (r.status === 404 || r.status === 410 || r.error === 'ENOTFOUND') {
      issues.push({ file: '(links)', path: r.url, message: r.error ?? `HTTP ${r.status}` });
    } else if (r.error || r.status >= 400) {
      warnings.push(`${r.url}: ${r.error ?? `HTTP ${r.status}`} (unverifiable, not blocking)`);
    }
  }
  console.log(`Checked ${list.length} links.`);
}

for (const w of warnings) console.warn(`warn  ${w}`);
for (const i of issues) console.error(`error ${i.file}${i.path ? ` → ${i.path}` : ''}: ${i.message}`);
console.log(
  `${candidates.length} candidates, ${parties.length} parties, ${urls.size} cited URLs: ` +
    `${issues.length} error(s), ${warnings.length} warning(s).`,
);
process.exit(issues.length ? 1 : 0);
