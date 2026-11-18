/**
 * Share cards (Open Graph, 1200 × 630): SVG templates, rasterised to PNG at build time by sharp
 * (src/pages/og/*). Pure functions so the layout and text escaping are unit tested.
 */
import type { Famille } from './schemas.ts';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

/** Family colours, same as the site's CSS tokens. */
export const FAMILLE_COLOR: Record<Famille, string> = {
  'extreme-gauche': '#e2445c',
  gauche: '#f49aa8',
  centre: '#f5c04a',
  droite: '#7fa6ff',
  'extreme-droite': '#3e5bd8',
  divers: '#a3acc2',
};

const FONT = "'DejaVu Sans', 'Segoe UI', Arial, sans-serif";

export function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Splits a name over at most two lines so it fits the card. */
export function nameLines(name: string, maxChars = 18): string[] {
  if (name.length <= maxChars) return [name];
  const words = name.split(' ');
  let first = '';
  for (const w of words) {
    if ((first ? `${first} ${w}` : w).length > maxChars && first) break;
    first = first ? `${first} ${w}` : w;
  }
  const rest = name.slice(first.length).trim();
  return rest ? [first, rest] : [first];
}

function frame(content: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${OG_WIDTH}" height="${OG_HEIGHT}" viewBox="0 0 ${OG_WIDTH} ${OG_HEIGHT}">
  <defs>
    <radialGradient id="glow" cx="35%" cy="45%" r="75%">
      <stop offset="0" stop-color="#1c2858"/><stop offset="1" stop-color="#0b1020"/>
    </radialGradient>
    <clipPath id="circle"><circle cx="280" cy="315" r="170"/></clipPath>
  </defs>
  <rect width="${OG_WIDTH}" height="${OG_HEIGHT}" fill="url(#glow)"/>
  <rect x="0" y="0" width="400" height="10" fill="#3d6bff"/>
  <rect x="400" y="0" width="400" height="10" fill="#f4f6fb"/>
  <rect x="800" y="0" width="400" height="10" fill="#ff4d5e"/>
  ${content}
  <text x="80" y="585" font-family="${FONT}" font-size="26" fill="#a3acc2">Candidats 2027 · programmes, agenda, débats et procédures, avec sources</text>
</svg>`;
}

export interface CandidateCard {
  name: string;
  /** Party name, or « Sans étiquette ». */
  party: string;
  famille: Famille;
  /** « Déclarée », « Potentiel »… */
  status: string;
  /** Drives the badge colour, as on the site (declared green, potential grey, withdrawn pink). */
  statusKind: 'declare' | 'officiel' | 'potentiel' | 'retire';
  /** Portrait as a data URI (PNG/JPEG), or null for initials. */
  portrait: string | null;
  initials: string;
}

export function candidateCardSvg(c: CandidateCard): string {
  const ring = FAMILLE_COLOR[c.famille];
  const lines = nameLines(c.name);
  const nameY = lines.length === 1 ? 300 : 265;
  const photo = c.portrait
    ? `<image href="${c.portrait}" x="110" y="145" width="340" height="340" preserveAspectRatio="xMidYMin slice" clip-path="url(#circle)"/>`
    : `<circle cx="280" cy="315" r="170" fill="#26326a"/><text x="280" y="350" text-anchor="middle" font-family="${FONT}" font-size="110" font-weight="700" fill="#e8ecf6">${escapeXml(c.initials)}</text>`;
  const statusWidth = 40 + c.status.length * 19;
  const badge = {
    declare: ['#173a2a', '#6fe3a5'],
    officiel: ['#173a2a', '#6fe3a5'],
    potentiel: ['#222b4f', '#c9d0e0'],
    retire: ['#2b1d24', '#f0a3b4'],
  }[c.statusKind];
  return frame(`${photo}
  <circle cx="280" cy="315" r="174" fill="none" stroke="${ring}" stroke-width="8"/>
  <text x="520" y="190" font-family="${FONT}" font-size="26" font-weight="700" letter-spacing="3" fill="#9db8ff">PRÉSIDENTIELLE 2027</text>
  ${lines.map((l, i) => `<text x="520" y="${nameY + i * 76}" font-family="${FONT}" font-size="68" font-weight="700" fill="#ffffff">${escapeXml(l)}</text>`).join('\n  ')}
  <text x="520" y="${nameY + lines.length * 76 - 10}" font-family="${FONT}" font-size="32" fill="#c9d0e0">${escapeXml(c.party)}</text>
  <rect x="520" y="${nameY + lines.length * 76 + 20}" rx="22" width="${statusWidth}" height="44" fill="${badge[0]}"/>
  <text x="${520 + statusWidth / 2}" y="${nameY + lines.length * 76 + 50}" text-anchor="middle" font-family="${FONT}" font-size="24" font-weight="700" fill="${badge[1]}">${escapeXml(c.status)}</text>`);
}

export function homeCardSvg(declared: number, potential: number, firstRound: string): string {
  return frame(`<text x="80" y="200" font-family="${FONT}" font-size="28" font-weight="700" letter-spacing="3" fill="#9db8ff">PRÉSIDENTIELLE 2027</text>
  <text x="80" y="290" font-family="${FONT}" font-size="76" font-weight="700" fill="#ffffff">Qui sont les candidats ?</text>
  <text x="80" y="370" font-family="${FONT}" font-size="36" fill="#c9d0e0">${declared} candidats déclarés · ${potential} candidatures évoquées</text>
  <text x="80" y="430" font-family="${FONT}" font-size="36" fill="#c9d0e0">Premier tour le ${escapeXml(firstRound)}</text>`);
}
