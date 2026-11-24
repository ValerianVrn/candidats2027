import { describe, expect, it } from 'vitest';
import { hasActiveProcedure, statusLabel } from './labels';

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

describe('hasActiveProcedure', () => {
  const r = (nature: 'judiciaire' | 'fiscal' | 'politique', active: boolean) => ({
    id: 'x',
    nature,
    active,
    title: 't',
    statutJuridique: 's',
    resume: 'r',
    impact: 'i',
    sources: [],
    updatedAt: '2026-11-17',
  });
  it('ignores political uncertainties and closed procedures', () => {
    expect(hasActiveProcedure({ risques: [r('politique', true), r('judiciaire', false)] })).toBe(false);
    expect(hasActiveProcedure({ risques: [r('fiscal', true)] })).toBe(true);
  });
});

describe('statusLabel for withdrawals', () => {
  it('distinguishes a withdrawn candidacy from an evoked one ruled out', () => {
    expect(statusLabel({ status: 'retire', genre: 'f', declaration: { date: '2026-01-01' } })).toBe(
      'Retirée',
    );
    expect(statusLabel({ status: 'retire', genre: 'm', declaration: null })).toBe('A renoncé');
    expect(statusLabel({ status: 'retire', genre: 'm' })).toBe('Retiré');
  });
});
