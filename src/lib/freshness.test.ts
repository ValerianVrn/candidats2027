import { describe, expect, it } from 'vitest';
import { parisDay } from './freshness';

describe('parisDay', () => {
  it('uses Paris time', () => {
    expect(parisDay('2026-11-17T23:30:00Z')).toBe('2026-11-18');
    expect(parisDay('2026-11-18T07:30:00+01:00')).toBe('2026-11-18');
  });
});
