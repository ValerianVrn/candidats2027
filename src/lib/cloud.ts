/**
 * Deterministic layout of the floating card cloud.
 *
 * Positions carry no political meaning on purpose: cards are not ordered by political family
 * (that is what the explicit, sourced « Paysage » view is for). Official and declared candidates
 * take the cells nearest the centre, potential ones drift towards the edges.
 *
 * Overlap is impossible by construction: every card gets its own cell of a grid, horizontal positions
 * are the cell centres (no horizontal jitter), and the organic look only comes from a vertical stagger of
 * odd columns plus a small vertical jitter, both bounded so a card never leaves its column slot.
 * The CSS turns cells into pixels: CELL_MIN_WIDTH ≥ card width, ROW_HEIGHT ≥ card height + jitter.
 */

export interface CloudInput {
  slug: string;
  /** Lower ranks sit closer to the centre. */
  rank: number;
}

export interface CloudPosition {
  slug: string;
  col: number;
  /** Row, including the stagger and jitter (fractional), measured in row heights from the top. */
  row: number;
  /** Animation phase in seconds (negative delay), so cards do not float in sync. */
  phase: number;
}

export interface CloudLayout {
  cols: number;
  /** Total height in row heights (includes the stagger overflow of the last row). */
  height: number;
  positions: CloudPosition[];
}

/** Narrowest cell the CSS allows for a layout (px); cards are at most this wide. */
export const CELL_MIN_WIDTH = 150;
/** Row height (px); cards are at most CARD_MAX_HEIGHT tall. */
export const ROW_HEIGHT = 200;
export const CARD_MAX_HEIGHT = 168;
/** Vertical stagger of odd columns and max jitter, in rows. */
export const STAGGER = 0.45;
export const JITTER = 0.08;

/** FNV-1a hash mapped to [0, 1). */
export function hash01(text: string, salt = 0): number {
  let h = 0x811c9dc5 ^ salt;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) / 0x1_0000_0000;
}

export function layoutCloud(items: readonly CloudInput[], cols: number): CloudLayout {
  const n = items.length;
  if (n === 0) return { cols, height: 0, positions: [] };
  const c = Math.max(1, Math.min(cols, n));
  const rows = Math.ceil(n / c);

  // Cells sorted by distance to the centre, in pixel-like units (cells are roughly 1 : 1.3).
  const cells: { col: number; row: number; d: number }[] = [];
  for (let col = 0; col < c; col++) {
    for (let row = 0; row < rows; row++) {
      const dx = (col + 0.5 - c / 2) * CELL_MIN_WIDTH;
      const dy = (row + 0.5 - rows / 2) * ROW_HEIGHT;
      cells.push({ col, row, d: Math.hypot(dx, dy) + hash01(`${col}:${row}`) });
    }
  }
  cells.sort((a, b) => a.d - b.d);

  const ordered = [...items].sort((a, b) => a.rank - b.rank || hash01(a.slug) - hash01(b.slug));
  const positions = ordered.map((item, i) => {
    const cell = cells[i]!;
    const stagger = cell.col % 2 === 1 && rows > 1 ? STAGGER : 0;
    const jitter = hash01(item.slug, 2) * JITTER;
    return {
      slug: item.slug,
      col: cell.col,
      row: cell.row + stagger + jitter,
      phase: -Math.round(hash01(item.slug, 3) * 70) / 10,
    };
  });
  const staggered = positions.some((p) => p.col % 2 === 1) && rows > 1;
  return { cols: c, height: rows + (staggered ? STAGGER : 0) + JITTER, positions };
}
