import { describe, expect, it } from 'vitest';
import { CARD_MAX_HEIGHT, CELL_MIN_WIDTH, hash01, layoutCloud, ROW_HEIGHT } from './cloud';

const make = (n: number) => Array.from({ length: n }, (_, i) => ({ slug: `candidat-${i}`, rank: i % 3 }));

describe('layoutCloud', () => {
  it('is deterministic', () => {
    expect(layoutCloud(make(15), 6)).toEqual(layoutCloud(make(15), 6));
  });

  it.each([1, 3, 7, 15, 20, 31, 45])('never overlaps two cards (%i cards, 6 and 4 columns)', (n) => {
    for (const cols of [6, 4]) {
      const { positions, height } = layoutCloud(make(n), cols);
      // Card boxes in px at the narrowest allowed cell width.
      const boxes = positions.map((p) => ({
        x: p.col * CELL_MIN_WIDTH,
        y: p.row * ROW_HEIGHT,
      }));
      for (let i = 0; i < boxes.length; i++) {
        const a = boxes[i]!;
        // Inside the stage.
        expect(a.y).toBeGreaterThanOrEqual(0);
        expect(a.y + CARD_MAX_HEIGHT).toBeLessThanOrEqual(height * ROW_HEIGHT);
        for (let j = i + 1; j < boxes.length; j++) {
          const b = boxes[j]!;
          const overlapX = Math.abs(a.x - b.x) < CELL_MIN_WIDTH;
          const overlapY = Math.abs(a.y - b.y) < CARD_MAX_HEIGHT;
          expect(overlapX && overlapY, `${positions[i]!.slug} / ${positions[j]!.slug}`).toBe(false);
        }
      }
    }
  });

  it('puts lower ranks closer to the centre on average', () => {
    const items = make(18);
    const { positions, cols } = layoutCloud(items, 6);
    const dist = (slug: string) => {
      const p = positions.find((q) => q.slug === slug)!;
      return Math.hypot((p.col + 0.5 - cols / 2) * CELL_MIN_WIDTH, (p.row - 1.5) * ROW_HEIGHT);
    };
    const avg = (rank: number) => {
      const group = items.filter((i) => i.rank === rank);
      return group.reduce((s, i) => s + dist(i.slug), 0) / group.length;
    };
    expect(avg(0)).toBeLessThan(avg(2));
  });

  it('handles an empty list and fewer cards than columns', () => {
    expect(layoutCloud([], 6).positions).toEqual([]);
    expect(layoutCloud(make(2), 6).cols).toBe(2);
  });
});

describe('hash01', () => {
  it('maps to [0, 1) and depends on the salt', () => {
    const a = hash01('marine', 1);
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThan(1);
    expect(hash01('marine', 2)).not.toBe(a);
  });
});
