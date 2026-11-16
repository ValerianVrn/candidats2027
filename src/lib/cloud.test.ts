import { describe, expect, it } from 'vitest';
import { hash01, layoutCloud } from './cloud';

const items = Array.from({ length: 18 }, (_, i) => ({ slug: `c-${i}`, rank: i < 8 ? 0 : 1 }));

describe('layoutCloud', () => {
  it('is deterministic', () => {
    expect(layoutCloud(items)).toEqual(layoutCloud(items));
  });

  it('keeps every card inside the stage', () => {
    for (const p of layoutCloud(items)) {
      expect(p.x).toBeGreaterThanOrEqual(6);
      expect(p.x).toBeLessThanOrEqual(94);
      expect(p.y).toBeGreaterThanOrEqual(10);
      expect(p.y).toBeLessThanOrEqual(86);
    }
  });

  it('gives each card its own cell', () => {
    const positions = layoutCloud(items);
    expect(new Set(positions.map((p) => p.slug)).size).toBe(items.length);
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const a = positions[i]!;
        const b = positions[j]!;
        // Cards never land on top of each other (distance in a rough 2.2:1 stage).
        expect(Math.hypot((a.x - b.x) * 2.2, a.y - b.y)).toBeGreaterThan(8);
      }
    }
  });

  it('puts lower ranks closer to the centre on average', () => {
    const positions = layoutCloud(items);
    const dist = (slug: string) => {
      const p = positions.find((q) => q.slug === slug)!;
      return Math.hypot((p.x - 50) * 2.2, p.y - 50);
    };
    const avg = (rank: number) => {
      const group = items.filter((i) => i.rank === rank);
      return group.reduce((s, i) => s + dist(i.slug), 0) / group.length;
    };
    expect(avg(0)).toBeLessThan(avg(1));
  });

  it('handles an empty list', () => {
    expect(layoutCloud([])).toEqual([]);
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
