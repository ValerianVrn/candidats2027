import { describe, expect, it } from 'vitest';
import { donationUrl } from './donations';
import { fundingSchema } from './schemas';

describe('donationUrl', () => {
  it('accepts Stripe payment links only', () => {
    expect(donationUrl('https://buy.stripe.com/abc123')).toBe('https://buy.stripe.com/abc123');
    expect(donationUrl('https://donate.stripe.com/x')).toBe('https://donate.stripe.com/x');
    expect(donationUrl('http://buy.stripe.com/abc')).toBeNull();
    expect(donationUrl('https://buy.stripe.com.evil.fr/abc')).toBeNull();
    expect(donationUrl('https://paypal.me/someone')).toBeNull();
    expect(donationUrl('')).toBeNull();
    expect(donationUrl(undefined)).toBeNull();
    expect(donationUrl('not a url')).toBeNull();
  });
});

describe('fundingSchema', () => {
  it('starts empty and accepts monthly totals and costs', () => {
    expect(fundingSchema.parse({})).toEqual({ received: [], costs: [] });
    const f = fundingSchema.parse({
      received: [{ month: '2026-12', contributions: 7, totalEur: 35 }],
      costs: [{ item: 'Nom de domaine', amountEur: 10, per: 'an' }],
    });
    expect(f.received[0]!.totalEur).toBe(35);
  });

  it('rejects a malformed month', () => {
    expect(
      fundingSchema.safeParse({ received: [{ month: '2026-13', contributions: 1, totalEur: 5 }] }).success,
    ).toBe(false);
  });
});
