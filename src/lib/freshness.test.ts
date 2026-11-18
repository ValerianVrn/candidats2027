import { describe, expect, it } from 'vitest';
import { parisDay, verification } from './freshness';

describe('parisDay', () => {
  it('uses Paris time', () => {
    expect(parisDay('2026-11-17T23:30:00Z')).toBe('2026-11-18');
    expect(parisDay('2026-11-18T07:30:00+01:00')).toBe('2026-11-18');
  });
});

describe('verification', () => {
  it('is complete when every profile was checked on the day of the last run', () => {
    expect(verification(['2026-11-18', '2026-11-18'], '2026-11-18T07:30:00+01:00')).toEqual({
      complete: true,
      day: '2026-11-18',
      at: '2026-11-18T07:30:00+01:00',
    });
  });

  it('falls back to the oldest profile check after a partial run', () => {
    expect(verification(['2026-11-18', '2026-11-16', '2026-11-17'], '2026-11-18T07:30:00+01:00')).toEqual({
      complete: false,
      day: '2026-11-16',
      at: null,
    });
  });
});
