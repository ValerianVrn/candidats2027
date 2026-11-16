/**
 * Deterministic layout of the floating card cloud.
 *
 * Positions carry no political meaning on purpose: cards are not ordered by political family
 * (that is what the explicit, sourced « Paysage » view is for). Official and declared candidates
 * take the cells nearest the centre, potential ones drift towards the edges, and a hash of the
 * slug adds jitter so the cloud looks organic yet stays identical between builds.
 */

export interface CloudInput {
  slug: string;
  /** Lower ranks sit closer to the centre. */
  rank: number;
}

export interface CloudPosition {
  slug: string;
  /** Centre of the card, in % of the cloud width. */
  x: number;
  /** Centre of the card, in % of the cloud height. */
  y: number;
  /** Animation phase in seconds (negative delay), so cards do not float in sync. */
  phase: number;
}

/** FNV-1a hash mapped to [0, 1). */
export function hash01(text: string, salt = 0): number {
  let h = 0x811c9dc5 ^ salt;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) / 0x1_0000_0000;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function layoutCloud(items: readonly CloudInput[], aspect = 2.2): CloudPosition[] {
  const n = items.length;
  if (n === 0) return [];
  const cols = Math.max(1, Math.ceil(Math.sqrt(n * aspect)));
  const rows = Math.max(1, Math.ceil(n / cols));

  // Cells sorted by distance to the centre (in a space where cells are roughly square).
  const cells: { col: number; row: number; d: number }[] = [];
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < rows; row++) {
      const dx = (col + 0.5) / cols - 0.5;
      const dy = ((row + 0.5) / rows - 0.5) / aspect;
      cells.push({ col, row, d: Math.hypot(dx, dy) + hash01(`${col}:${row}`) * 0.02 });
    }
  }
  cells.sort((a, b) => a.d - b.d);

  const ordered = [...items].sort((a, b) => a.rank - b.rank || hash01(a.slug) - hash01(b.slug));

  return ordered.map((item, i) => {
    const cell = cells[i]!;
    const stagger = cell.col % 2 === 1 ? 0.25 : -0.25;
    const jx = (hash01(item.slug, 1) - 0.5) * 0.45;
    const jy = (hash01(item.slug, 2) - 0.5) * 0.4 + (rows > 1 ? stagger : 0);
    return {
      slug: item.slug,
      x: clamp(((cell.col + 0.5 + jx) / cols) * 100, 6, 94),
      y: clamp(((cell.row + 0.5 + jy) / rows) * 100, 10, 86),
      phase: -Math.round(hash01(item.slug, 3) * 70) / 10,
    };
  });
}
