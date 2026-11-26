import { describe, expect, it } from 'vitest';
import { cfToken } from './analytics';

describe('cfToken', () => {
  it('accepts only a 32-character hex token', () => {
    expect(cfToken('27a1467b36e440f48c4148316f8cdc1d')).toBe('27a1467b36e440f48c4148316f8cdc1d');
    expect(cfToken('27A1467B36E440F48C4148316F8CDC1D')).toBeNull();
    expect(cfToken('27a1467b36e440f48c4148316f8cdc1')).toBeNull();
    expect(cfToken('"><script>')).toBeNull();
    expect(cfToken('')).toBeNull();
    expect(cfToken(undefined)).toBeNull();
  });
});
