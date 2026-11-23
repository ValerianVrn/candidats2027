/**
 * Content guardrails (pure functions, no I/O). Run by scripts/check-data.ts in CI.
 * The site publishes without human review, so these rules block a merge when broken.
 */
import type { CampaignEvent, Candidate, Party, Source } from './schemas.ts';
import type { Quiz } from './quiz-schema.ts';

export interface Allowlist {
  media: string[];
  official: string[];
}

export interface Issue {
  file: string;
  path: string;
  message: string;
}

/** Hosts accepted for declaration videos (they are not sources). */
const VIDEO_HOSTS = ['youtube.com', 'youtu.be', 'dailymotion.com', 'vimeo.com', 'x.com', 'twitter.com'];
const PORTRAIT_LICENCE = /^(CC0|Public domain|Domaine public|CC BY(-SA)? \d\.\d( [A-Z]{2,})?|CC BY(-SA)?)$/i;

function hostOf(url: string): string {
  return new URL(url).hostname.toLowerCase().replace(/^www\./, '');
}

/** The allowlisted domain a URL belongs to (subdomains included), or null. */
export function matchDomain(url: string, domains: readonly string[]): string | null {
  const host = hostOf(url);
  for (const d of domains) {
    if (host === d || host.endsWith(`.${d}`)) return d;
  }
  return null;
}

interface CheckContext {
  allow: string[];
  issues: Issue[];
}

function checkSources(
  ctx: CheckContext,
  file: string,
  path: string,
  sources: readonly Source[],
  opts: { extraDomains?: string[]; minIndependent?: number } = {},
): void {
  const domains = [...ctx.allow, ...(opts.extraDomains ?? [])];
  const matched = new Set<string>();
  sources.forEach((s, i) => {
    const d = matchDomain(s.url, domains);
    if (!d) {
      ctx.issues.push({
        file,
        path: `${path}[${i}]`,
        message: `source not on the allowlist: ${hostOf(s.url)}`,
      });
    } else {
      matched.add(d);
    }
  });
  const min = opts.minIndependent ?? 1;
  if (matched.size < min) {
    ctx.issues.push({
      file,
      path,
      message: `needs ${min} independent allowlisted sources (different outlets), has ${matched.size}`,
    });
  }
}

export function checkCandidate(
  c: Candidate,
  file: string,
  allowlist: Allowlist,
  partyIds: Set<string>,
): Issue[] {
  const ctx: CheckContext = { allow: [...allowlist.media, ...allowlist.official], issues: [] };
  const own = c.officialDomains;

  checkSources(ctx, file, 'statusSources', c.statusSources, { minIndependent: 2 });
  if (c.party !== null && !partyIds.has(c.party)) {
    ctx.issues.push({ file, path: 'party', message: `unknown party "${c.party}"` });
  }
  if (c.declaration) {
    checkSources(ctx, file, 'declaration.sources', c.declaration.sources);
    const v = c.declaration.videoUrl;
    if (v && !matchDomain(v, [...VIDEO_HOSTS, ...own, ...ctx.allow])) {
      ctx.issues.push({ file, path: 'declaration.videoUrl', message: `unexpected video host ${hostOf(v)}` });
    }
  }
  if (c.withdrawal) {
    checkSources(ctx, file, 'withdrawal.sources', c.withdrawal.sources, { minIndependent: 2 });
  }
  if (c.qualified2022) checkSources(ctx, file, 'qualified2022.sources', c.qualified2022.sources);
  if (c.parrainages) checkSources(ctx, file, 'parrainages.sources', c.parrainages.sources);
  c.programme.forEach((p, i) =>
    checkSources(ctx, file, `programme[${i}].sources`, p.sources, { extraDomains: own }),
  );
  c.meetings.forEach((m, i) =>
    checkSources(ctx, file, `meetings[${i}].sources`, m.sources, { extraDomains: own }),
  );
  c.risques.forEach((r, i) =>
    checkSources(ctx, file, `risques[${i}].sources`, r.sources, { minIndependent: 2 }),
  );

  if (c.portrait) {
    if (matchDomain(c.portrait.sourceUrl, ['commons.wikimedia.org']) === null) {
      ctx.issues.push({
        file,
        path: 'portrait.sourceUrl',
        message: 'portraits must come from Wikimedia Commons',
      });
    }
    if (!PORTRAIT_LICENCE.test(c.portrait.licence.trim())) {
      ctx.issues.push({
        file,
        path: 'portrait.licence',
        message: `licence not accepted: "${c.portrait.licence}"`,
      });
    }
  }
  const ids = c.risques.map((r) => r.id);
  if (new Set(ids).size !== ids.length)
    ctx.issues.push({ file, path: 'risques', message: 'duplicate risque id' });
  return ctx.issues;
}

export function checkParty(p: Party, file: string, allowlist: Allowlist): Issue[] {
  const ctx: CheckContext = { allow: [...allowlist.media, ...allowlist.official], issues: [] };
  checkSources(ctx, file, `${p.id}.classificationSources`, p.classificationSources);
  checkSources(ctx, file, `${p.id}.representation.sources`, p.representation.sources);
  return ctx.issues;
}

/** Quiz positions: known candidate, two independent sources (allowlist or the candidate's own site). */
export function checkQuiz(
  quiz: Quiz,
  allowlist: Allowlist,
  candidates: ReadonlyMap<string, Candidate>,
): Issue[] {
  const ctx: CheckContext = { allow: [...allowlist.media, ...allowlist.official], issues: [] };
  const file = 'quiz.json';
  const ids = new Set<string>();
  for (const q of quiz.questions) {
    if (ids.has(q.id)) ctx.issues.push({ file, path: q.id, message: 'duplicate question id' });
    ids.add(q.id);
    for (const [slug, p] of Object.entries(q.positions)) {
      const c = candidates.get(slug);
      if (!c) {
        ctx.issues.push({ file, path: `${q.id}.positions.${slug}`, message: 'unknown candidate' });
        continue;
      }
      checkSources(ctx, file, `${q.id}.positions.${slug}.sources`, p.sources, {
        extraDomains: c.officialDomains,
        minIndependent: 2,
      });
    }
  }
  return ctx.issues;
}

/** Debates and broadcasts: two independent outlets, known candidates only. */
export function checkEvent(e: CampaignEvent, allowlist: Allowlist, slugs: ReadonlySet<string>): Issue[] {
  const ctx: CheckContext = { allow: [...allowlist.media, ...allowlist.official], issues: [] };
  const file = 'events.json';
  checkSources(ctx, file, `${e.id}.sources`, e.sources, { minIndependent: 2 });
  for (const slug of [...e.participants, ...e.absents.map((a) => a.slug)]) {
    if (!slugs.has(slug)) ctx.issues.push({ file, path: `${e.id}`, message: `unknown candidate "${slug}"` });
  }
  return ctx.issues;
}
