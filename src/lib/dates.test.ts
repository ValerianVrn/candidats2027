import { describe, expect, it } from 'vitest';
import { countdown, formatDateTime, formatDay, inSilence, relativeAgo } from './dates';

describe('countdown', () => {
  it('splits the remaining time into days, hours and minutes', () => {
    const now = new Date('2026-11-16T09:00:00+01:00');
    const target = new Date('2026-11-18T12:30:00+01:00');
    expect(countdown(target, now)).toEqual({ days: 2, hours: 3, minutes: 30, done: false });
  });

  it('never goes negative once the target has passed', () => {
    const now = new Date('2027-05-01T00:00:00Z');
    expect(countdown(new Date('2027-04-01T00:00:00Z'), now)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      done: true,
    });
  });
});

describe('relativeAgo', () => {
  const now = new Date('2026-11-16T12:00:00Z');
  it.each([
    ['2026-11-16T11:59:40Z', "à l'instant"],
    ['2026-11-16T11:48:00Z', 'il y a 12 min'],
    ['2026-11-16T09:00:00Z', 'il y a 3 h'],
    ['2026-11-14T10:00:00Z', 'il y a 2 j'],
  ])('%s → %s', (past, expected) => {
    expect(relativeAgo(new Date(past), now)).toBe(expected);
  });
});

describe('French formatting', () => {
  it('formats calendar days in French', () => {
    expect(formatDay('2026-11-16')).toBe('16 novembre 2026');
  });

  it('formats date-times in Paris time', () => {
    expect(formatDateTime('2026-11-16T06:12:00Z')).toBe('16 novembre 2026 à 07:12');
  });
});

describe('inSilence', () => {
  const windows = [{ start: '2027-04-10T00:00:00+02:00', end: '2027-04-11T20:00:00+02:00' }];
  it('is true inside a window and false outside', () => {
    expect(inSilence(windows, new Date('2027-04-10T12:00:00+02:00'))).toBe(true);
    expect(inSilence(windows, new Date('2027-04-11T20:00:00+02:00'))).toBe(false);
    expect(inSilence(windows, new Date('2027-04-09T23:59:00+02:00'))).toBe(false);
  });
});
