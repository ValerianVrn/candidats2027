import type { APIRoute } from 'astro';
import sharp from 'sharp';
import { activeCandidates, election } from '../../lib/data';
import { formatDay } from '../../lib/dates';
import { homeCardSvg } from '../../lib/og';

/** Default share card for every page that has no candidate-specific one. */
export const GET: APIRoute = async () => {
  const declared = activeCandidates.filter((c) => c.status === 'declare' || c.status === 'officiel').length;
  const potential = activeCandidates.filter((c) => c.status === 'potentiel').length;
  const svg = homeCardSvg(declared, potential, formatDay(election.firstRound.slice(0, 10)));
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
