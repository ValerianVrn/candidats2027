import type { APIRoute, GetStaticPaths } from 'astro';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import sharp from 'sharp';
import { activeCandidates, familleOf, fullName, partyOf } from '../../lib/data';
import { FAMILLE_LABEL, statusLabel } from '../../lib/labels';
import { candidateCardSvg } from '../../lib/og';
import type { Candidate } from '../../lib/schemas';

/** One share card per candidate, rendered at build time: /og/<slug>.png */
export const getStaticPaths = (() =>
  activeCandidates.map((candidate) => ({
    params: { slug: candidate.slug },
    props: { candidate },
  }))) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const c = (props as { candidate: Candidate }).candidate;
  let portrait: string | null = null;
  if (c.portrait) {
    const file = await readFile(join(process.cwd(), 'src', 'assets', 'portraits', c.portrait.file));
    const png = await sharp(file).resize(680, 680, { fit: 'cover', position: 'top' }).png().toBuffer();
    portrait = `data:image/png;base64,${png.toString('base64')}`;
  }
  const party = partyOf(c);
  const svg = candidateCardSvg({
    name: fullName(c),
    party: party ? party.name : FAMILLE_LABEL[familleOf(c)],
    famille: familleOf(c),
    status: statusLabel(c),
    statusKind: c.status,
    portrait,
    initials: `${c.firstName[0] ?? ''}${c.lastName[0] ?? ''}`.toUpperCase(),
  });
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
