import { describe, expect, it } from 'vitest';
import { statusLabel } from './labels';

describe('statusLabel', () => {
  it.each([
    ['declare', 'f', 'Déclarée'],
    ['declare', 'm', 'Déclaré'],
    ['potentiel', 'f', 'Potentielle'],
    ['potentiel', 'm', 'Potentiel'],
    ['officiel', 'f', 'Officielle'],
    ['retire', 'f', 'Retirée'],
  ] as const)('%s / %s → %s', (status, genre, expected) => {
    expect(statusLabel({ status, genre })).toBe(expected);
  });
});
